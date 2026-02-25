import React, { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { PRPHeader } from "@/components/ui/prp-header";
import { Footer } from "@/components/Footer";
import { useSeo } from "@/hooks/useSeo";

export default function VerifyEmail() {
  useSeo({
    title: "Verify Your Email",
    description: "Verify your email address to complete your Press Room Publisher account setup.",
    noindex: true,
  });
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [status, setStatus] = useState<"pending" | "success" | "error">("pending");

  useEffect(() => {
    const verify = async () => {
      const accessToken = searchParams.get("access_token");
      if (!accessToken) {
        setStatus("error");
        return;
      }
      // Supabase auto-verifies on redirect, so just check session
      const { data: { session } } = await supabase.auth.getSession();
      if (session && session.user.email_confirmed_at) {
        setStatus("success");
        toast({ title: "Email verified!", description: "Your email is now verified.", variant: "default" });
        setTimeout(() => navigate("/dashboard"), 2000);
      } else {
        setStatus("error");
      }
    };
    verify();
    // eslint-disable-next-line
  }, []);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <PRPHeader isAuthenticated={false} />
      <main className="flex-1 flex flex-col items-center justify-center px-4 py-12">
        <div className="card-premium max-w-md w-full p-8 animate-fade-in flex flex-col gap-6 items-center">
          {status === "pending" && <h1 className="display-lg text-center">Verifying your email...</h1>}
          {status === "success" && (
            <>
              <h1 className="display-lg text-accent text-center">Email Verified!</h1>
              <p className="body-md text-muted-foreground text-center">Redirecting to your dashboard...</p>
            </>
          )}
          {status === "error" && (
            <>
              <h1 className="display-lg text-destructive text-center">Verification Failed</h1>
              <p className="body-md text-muted-foreground text-center">Invalid or expired verification link.</p>
              <Button className="w-full btn-accent text-lg py-6 rounded-full shadow-md" onClick={() => navigate("/login")}>Go to Login</Button>
            </>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
