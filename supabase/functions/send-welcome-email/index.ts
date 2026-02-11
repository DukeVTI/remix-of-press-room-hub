import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const resend = new Resend(Deno.env.get("RESEND_API_KEY"));
    const { email, firstName } = await req.json();

    if (!email || !firstName) {
      throw new Error("Missing required fields: email, firstName");
    }

    const emailResponse = await resend.emails.send({
      from: "Press Room Publisher <noreply@prp.broadcasterscommunity.com>",
      to: [email],
      subject: "Your Digital Pen is Ready — Welcome to Press Room Publisher",
      html: `
<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="margin:0;padding:0;background-color:#f4f4f5;font-family:Georgia,'Times New Roman',serif;">
<div style="max-width:600px;margin:0 auto;background-color:#ffffff;">
  <!-- Header -->
  <div style="background-color:#18181b;padding:32px 40px;text-align:center;">
    <h1 style="margin:0;color:#ffffff;font-size:22px;font-weight:700;letter-spacing:2px;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">
      PRESS ROOM PUBLISHER
    </h1>
    <p style="margin:8px 0 0;color:#a1a1aa;font-size:13px;letter-spacing:1px;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">
      WHERE STORIES FIND THEIR VOICE
    </p>
  </div>

  <!-- Content -->
  <div style="padding:40px;">
    <h2 style="color:#18181b;font-size:26px;margin:0 0 16px;font-weight:600;">
      Welcome aboard, ${firstName}! 🎉
    </h2>
    <p style="color:#3f3f46;font-size:16px;line-height:1.7;margin:0 0 16px;">
      Consider this your official press pass. You've just joined a community of sharp minds, bold voices, and people who believe the world needs more good writing — not less.
    </p>
    <p style="color:#3f3f46;font-size:16px;line-height:1.7;margin:0 0 24px;">
      Here's what you can do right away:
    </p>

    <div style="background-color:#fafafa;border-radius:12px;padding:24px;margin:0 0 24px;">
      <table style="width:100%;border-collapse:collapse;">
        <tr>
          <td style="padding:8px 12px 8px 0;vertical-align:top;font-size:20px;">💬</td>
          <td style="padding:8px 0;color:#3f3f46;font-size:15px;line-height:1.5;">
            <strong>Comment & React</strong> — Join the conversation on posts that move you
          </td>
        </tr>
        <tr>
          <td style="padding:8px 12px 8px 0;vertical-align:top;font-size:20px;">📡</td>
          <td style="padding:8px 0;color:#3f3f46;font-size:15px;line-height:1.5;">
            <strong>Follow Blogs</strong> — Stay in the loop with publishers you admire
          </td>
        </tr>
        <tr>
          <td style="padding:8px 12px 8px 0;vertical-align:top;font-size:20px;">🔗</td>
          <td style="padding:8px 0;color:#3f3f46;font-size:15px;line-height:1.5;">
            <strong>Share Stories</strong> — Spread the word when something deserves an audience
          </td>
        </tr>
        <tr>
          <td style="padding:8px 12px 8px 0;vertical-align:top;font-size:20px;">📰</td>
          <td style="padding:8px 0;color:#3f3f46;font-size:15px;line-height:1.5;">
            <strong>Create Your Blog</strong> — Ready to publish? Launch your own press room
          </td>
        </tr>
      </table>
    </div>

    <p style="color:#3f3f46;font-size:16px;line-height:1.7;margin:0 0 32px;">
      The newsroom is buzzing. Your seat is warm. Go make some headlines.
    </p>

    <div style="text-align:center;margin:0 0 32px;">
      <a href="https://press-pen-pro.lovable.app/dashboard" style="display:inline-block;background-color:#18181b;color:#ffffff;text-decoration:none;padding:14px 40px;border-radius:50px;font-size:16px;font-weight:600;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">
        Enter the Press Room →
      </a>
    </div>
  </div>

  <!-- Footer -->
  <div style="background-color:#fafafa;padding:24px 40px;border-top:1px solid #e4e4e7;text-align:center;">
    <p style="color:#71717a;font-size:14px;margin:0 0 4px;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">
      With ink and intention,
    </p>
    <p style="color:#3f3f46;font-size:14px;font-weight:600;margin:0;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">
      The Press Room Publisher Team
    </p>
    <p style="color:#a1a1aa;font-size:12px;margin:16px 0 0;">
      You received this because you created an account at Press Room Publisher.
    </p>
  </div>
</div>
</body>
</html>
      `,
    });

    console.log("Welcome email sent successfully:", emailResponse);

    return new Response(JSON.stringify(emailResponse), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (error: any) {
    console.error("Error in send-welcome-email:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  }
};

serve(handler);
