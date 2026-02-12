import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

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
    const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
    if (!RESEND_API_KEY) throw new Error("RESEND_API_KEY not configured");

    const { email, firstName, celebrationType, yearsOnPlatform } = await req.json();

    if (!email || !firstName || !celebrationType) {
      return new Response(
        JSON.stringify({ error: "Missing required fields" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const isBirthday = celebrationType === "birthday";
    const subject = isBirthday
      ? `🎂 Happy Birthday, ${firstName}! The PRP Family Celebrates You`
      : `🎉 Happy ${yearsOnPlatform}-Year Anniversary on Press Room Publisher!`;

    const heroEmoji = isBirthday ? "🎂" : "🎉";
    const heroTitle = isBirthday
      ? `Happy Birthday, ${firstName}!`
      : `Happy ${yearsOnPlatform}-Year Anniversary, ${firstName}!`;

    const bodyText = isBirthday
      ? `The entire Press Room Publisher community is celebrating with you today! Your dedication to impactful storytelling inspires everyone around you. May this new year bring even more powerful stories, engaged readers, and meaningful connections through your publications.`
      : `Today marks <strong>${yearsOnPlatform} year${yearsOnPlatform > 1 ? "s" : ""}</strong> since you joined Press Room Publisher. Your voice matters, your stories count, and your contributions make the world a better-informed place. Thank you for being an integral part of the PRP family!`;

    const closingLine = isBirthday
      ? "Here's to another remarkable year of impactful publishing! 🥂"
      : "Here's to many more years of fearless, factual publishing! 🚀";

    const html = `
<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"></head>
<body style="margin:0;padding:0;background-color:#f8f5f0;font-family:'Georgia',serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f8f5f0;padding:40px 20px;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="background-color:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">
        <!-- Header -->
        <tr>
          <td style="background:linear-gradient(135deg,#1a1a2e 0%,#16213e 100%);padding:40px 40px 30px;text-align:center;">
            <div style="font-size:64px;margin-bottom:16px;">${heroEmoji}</div>
            <h1 style="color:#ffffff;font-size:28px;font-weight:700;margin:0;line-height:1.3;">${heroTitle}</h1>
            <p style="color:#c9a96e;font-size:14px;margin:12px 0 0;letter-spacing:1px;text-transform:uppercase;">Press Room Publisher</p>
          </td>
        </tr>
        <!-- Body -->
        <tr>
          <td style="padding:40px;">
            <p style="color:#2d2d2d;font-size:16px;line-height:1.8;margin:0 0 20px;">${bodyText}</p>
            <p style="color:#2d2d2d;font-size:16px;line-height:1.8;margin:0 0 20px;">${closingLine}</p>
            <p style="color:#2d2d2d;font-size:16px;line-height:1.8;margin:0;">Your followers have been notified too — expect some love coming your way!</p>
          </td>
        </tr>
        <!-- Footer -->
        <tr>
          <td style="background-color:#f8f5f0;padding:30px 40px;text-align:center;border-top:1px solid #e5e0d8;">
            <p style="color:#666;font-size:13px;margin:0;">The Press Room Publisher Team</p>
            <p style="color:#999;font-size:11px;margin:8px 0 0;">Your Digital Pen Firepower Is Active</p>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;

    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: "Press Room Publisher <noreply@prp.broadcasterscommunity.com>",
        to: [email],
        subject,
        html,
      }),
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(`Resend error: ${JSON.stringify(data)}`);
    }

    return new Response(JSON.stringify({ success: true, id: data.id }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Celebration email error:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
