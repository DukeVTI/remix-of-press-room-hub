import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "https://esm.sh/resend@2.0.0";

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
    const { email, resetUrl } = await req.json();

    if (!email || !resetUrl) {
      throw new Error("Missing required fields: email, resetUrl");
    }

    const emailResponse = await resend.emails.send({
      from: "Press Room Publisher <noreply@prp.broadcasterscommunity.com>",
      to: [email],
      subject: "Reset Your Password — Press Room Publisher",
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
  </div>

  <!-- Content -->
  <div style="padding:40px;">
    <h2 style="color:#18181b;font-size:26px;margin:0 0 16px;font-weight:600;">
      Password Reset Request 🔐
    </h2>
    <p style="color:#3f3f46;font-size:16px;line-height:1.7;margin:0 0 16px;">
      We received a request to reset your password. No worries — even the best journalists misplace a key now and then.
    </p>
    <p style="color:#3f3f46;font-size:16px;line-height:1.7;margin:0 0 32px;">
      Click the button below to set a new password. This link will expire in <strong>1 hour</strong>.
    </p>

    <div style="text-align:center;margin:0 0 32px;">
      <a href="${resetUrl}" style="display:inline-block;background-color:#18181b;color:#ffffff;text-decoration:none;padding:14px 40px;border-radius:50px;font-size:16px;font-weight:600;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">
        Reset My Password →
      </a>
    </div>

    <div style="background-color:#fafafa;border-radius:12px;padding:20px;margin:0 0 24px;">
      <p style="color:#71717a;font-size:14px;line-height:1.6;margin:0;">
        <strong>Didn't request this?</strong> You can safely ignore this email. Your password won't change unless you click the link above.
      </p>
    </div>

    <p style="color:#a1a1aa;font-size:13px;line-height:1.5;margin:0;">
      If the button doesn't work, copy and paste this link into your browser:<br/>
      <span style="color:#3f3f46;word-break:break-all;">${resetUrl}</span>
    </p>
  </div>

  <!-- Footer -->
  <div style="background-color:#fafafa;padding:24px 40px;border-top:1px solid #e4e4e7;text-align:center;">
    <p style="color:#71717a;font-size:14px;margin:0 0 4px;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">
      Stay secure,
    </p>
    <p style="color:#3f3f46;font-size:14px;font-weight:600;margin:0;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">
      The Press Room Publisher Team
    </p>
  </div>
</div>
</body>
</html>
      `,
    });

    console.log("Password reset email sent:", emailResponse);

    return new Response(JSON.stringify(emailResponse), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (error: any) {
    console.error("Error in send-password-reset-email:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  }
};

serve(handler);
