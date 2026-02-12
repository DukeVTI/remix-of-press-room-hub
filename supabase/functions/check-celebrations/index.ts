import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, serviceRoleKey);

    // 1. Expire old celebration posts
    await supabase
      .from("celebration_posts")
      .update({ status: "expired" })
      .eq("status", "active")
      .lt("expires_at", new Date().toISOString());

    // 2. Get today's month/day
    const now = new Date();
    const currentMonth = now.getMonth() + 1;
    const currentDay = now.getDate();

    // 3. Fetch all profiles
    const { data: profiles, error: profilesError } = await supabase
      .from("profiles")
      .select("id, first_name, last_name, email, date_of_birth, created_at")
      .eq("account_status", "active");

    if (profilesError) throw profilesError;
    if (!profiles || profiles.length === 0) {
      return new Response(JSON.stringify({ message: "No profiles found" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const celebrationResults: { birthdays: number; anniversaries: number } = {
      birthdays: 0,
      anniversaries: 0,
    };

    for (const profile of profiles) {
      const dob = new Date(profile.date_of_birth);
      const createdAt = new Date(profile.created_at);
      const isBirthday =
        dob.getMonth() + 1 === currentMonth && dob.getDate() === currentDay;
      const isAnniversary =
        createdAt.getMonth() + 1 === currentMonth &&
        createdAt.getDate() === currentDay &&
        // Skip if account was created today (same year)
        createdAt.getFullYear() < now.getFullYear();

      if (!isBirthday && !isAnniversary) continue;

      // Get all blogs for this user
      const { data: blogs } = await supabase
        .from("blogs")
        .select("id, blog_name")
        .eq("owner_id", profile.id)
        .eq("status", "active");

      if (!blogs || blogs.length === 0) continue;

      const expiresAt = new Date(now.getTime() + 24 * 60 * 60 * 1000).toISOString();

      for (const blog of blogs) {
        if (isBirthday) {
          // Check for existing birthday celebration today
          const todayStart = new Date(now);
          todayStart.setHours(0, 0, 0, 0);
          const { data: existing } = await supabase
            .from("celebration_posts")
            .select("id")
            .eq("blog_id", blog.id)
            .eq("user_id", profile.id)
            .eq("celebration_type", "birthday")
            .gte("created_at", todayStart.toISOString())
            .maybeSingle();

          if (!existing) {
            const message = `Happy Birthday, ${profile.first_name}! 🎂 The entire Press Room Publisher community celebrates with you today. May your stories continue to inspire, inform, and ignite change. Here's to another remarkable year of impactful publishing!`;

            await supabase.from("celebration_posts").insert({
              blog_id: blog.id,
              user_id: profile.id,
              celebration_type: "birthday",
              post_content: message,
              expires_at: expiresAt,
              status: "active",
            });
            celebrationResults.birthdays++;
          }
        }

        if (isAnniversary) {
          const yearsOnPlatform = now.getFullYear() - createdAt.getFullYear();
          const todayStart = new Date(now);
          todayStart.setHours(0, 0, 0, 0);
          const { data: existing } = await supabase
            .from("celebration_posts")
            .select("id")
            .eq("blog_id", blog.id)
            .eq("user_id", profile.id)
            .eq("celebration_type", "account_anniversary")
            .gte("created_at", todayStart.toISOString())
            .maybeSingle();

          if (!existing) {
            const yearText = yearsOnPlatform === 1 ? "1 year" : `${yearsOnPlatform} years`;
            const message = `Congratulations, ${profile.first_name}! 🎉 Today marks ${yearText} since you joined Press Room Publisher. Your voice matters, your stories count, and your contributions make the world a better-informed place. Thank you for being part of the PRP family!`;

            await supabase.from("celebration_posts").insert({
              blog_id: blog.id,
              user_id: profile.id,
              celebration_type: "account_anniversary",
              post_content: message,
              expires_at: expiresAt,
              status: "active",
            });
            celebrationResults.anniversaries++;
          }
        }
      }

      // Send celebration email
      const celebrationType = isBirthday ? "birthday" : "account_anniversary";
      const yearsOnPlatform = now.getFullYear() - createdAt.getFullYear();

      try {
        await fetch(`${supabaseUrl}/functions/v1/send-celebration-email`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${serviceRoleKey}`,
          },
          body: JSON.stringify({
            email: profile.email,
            firstName: profile.first_name,
            celebrationType,
            yearsOnPlatform,
          }),
        });
      } catch (emailErr) {
        console.error("Failed to send celebration email:", emailErr);
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        ...celebrationResults,
        message: `Created ${celebrationResults.birthdays} birthday and ${celebrationResults.anniversaries} anniversary celebrations`,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error in check-celebrations:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
