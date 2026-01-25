import React, { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { PRPHeader } from "@/components/ui/prp-header";
import { Footer } from "@/components/Footer";
import { ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      if (error) throw error;
      setSent(true);
      toast({
        title: "Check your email!",
        description: "A password reset link has been sent to your email.",
        variant: "default",
      });
    } catch (err: any) {
      toast({
        title: "Error",
        description: err.message || "Failed to send reset email.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <PRPHeader isAuthenticated={false} />
      <main className="flex-1 flex flex-col items-center justify-center px-4 py-12">
        <Link to="/login" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-8">
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          <span>Back to login</span>
        </Link>
        <div className="card-premium max-w-md w-full p-8 animate-fade-in">
          <h1 className="display-lg text-foreground mb-2 text-center">Forgot your password?</h1>
          <p className="body-md text-muted-foreground mb-6 text-center">
            Enter your email and we'll send you a link to reset your password.
          </p>
          <form
            onSubmit={handleSubmit}
            className="space-y-6"
            aria-label="Forgot Password Form"
          >
            <div className="space-y-2">
              <label htmlFor="email" className="text-base font-medium">Email address</label>
              <Input
                id="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="you@email.com"
                aria-label="Email address"
                className="input-modern"
                disabled={loading || sent}
              />
            </div>
            <Button
              type="submit"
              className="w-full btn-accent text-lg py-6 rounded-full shadow-md"
              disabled={loading || sent || !email}
              aria-label="Send password reset email"
            >
              {loading ? "Sending..." : sent ? "Email Sent" : "Send Reset Link"}
            </Button>
            {sent && (
              <div className="text-green-600 text-sm mt-2 text-center" aria-live="polite">
                If your email is registered, you'll receive a reset link shortly.
              </div>
            )}
          </form>
        </div>
      </main>

      <Footer />
    </div>
  );
}
