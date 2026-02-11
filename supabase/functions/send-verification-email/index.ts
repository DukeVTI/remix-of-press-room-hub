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
    const { email, firstName, verificationUrl } = await req.json();

    if (!email || !firstName || !verificationUrl) {
      throw new Error("Missing required fields: email, firstName, verificationUrl");
    }

    const emailResponse = await resend.emails.send({
      from: "Press Room Publisher <noreply@prp.broadcasterscommunity.com>",
      to: [email],
      subject: "Verify Your Email — Press Room Publisher",
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
      One Last Thing, ${firstName}... ✉️
    </h2>
    <p style="color:#3f3f46;font-size:16px;line-height:1.7;margin:0 0 16px;">
      Before you hit the press room floor, we need to verify your email address. Think of it as your press credentials — can't get past the velvet rope without them.
    </p>
    <p style="color:#3f3f46;font-size:16px;line-height:1.7;margin:0 0 32px;">
      It only takes a click:
    </p>

    <div style="text-align:center;margin:0 0 32px;">
      <a href="${verificationUrl}" style="display:inline-block;background-color:#18181b;color:#ffffff;text-decoration:none;padding:14px 40px;border-radius:50px;font-size:16px;font-weight:600;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">
        Verify My Email →
      </a>
    </div>

    <div style="background-color:#fafafa;border-radius:12px;padding:20px;margin:0 0 24px;">
      <p style="color:#71717a;font-size:14px;line-height:1.6;margin:0;">
        <strong>Why verify?</strong> Email verification helps us keep the community secure and ensures you receive important updates about your account and the blogs you follow.
      </p>
    </div>

    <p style="color:#a1a1aa;font-size:13px;line-height:1.5;margin:0;">
      If the button doesn't work, copy and paste this link into your browser:<br/>
      <span style="color:#3f3f46;word-break:break-all;">${verificationUrl}</span>
    </p>
  </div>

  <!-- Footer -->
  <div style="background-color:#fafafa;padding:24px 40px;border-top:1px solid #e4e4e7;text-align:center;">
    <p style="color:#71717a;font-size:14px;margin:0 0 4px;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">
      Almost there,
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

    console.log("Verification email sent:", emailResponse);

    return new Response(JSON.stringify(emailResponse), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (error: any) {
    console.error("Error in send-verification-email:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  }
};

serve(handler);
