import React, { useState } from "react";
import { useSearchParams, useNavigate, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { PRPHeader } from "@/components/ui/prp-header";
import { Footer } from "@/components/Footer";
import { ArrowLeft } from "lucide-react";

export default function ResetPassword() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const accessToken = searchParams.get("access_token");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 8) {
      toast({ title: "Password too short", description: "Minimum 8 characters.", variant: "destructive" });
      return;
    }
    if (password !== confirm) {
      toast({ title: "Passwords do not match", variant: "destructive" });
      return;
    }
    setLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({ password });
      if (error) throw error;
      setSuccess(true);
      toast({ title: "Password updated!", description: "You can now log in.", variant: "default" });
      setTimeout(() => navigate("/login"), 2000);
    } catch (err: any) {
      toast({ title: "Error", description: err.message || "Failed to reset password.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  if (!accessToken) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <PRPHeader isAuthenticated={false} />
        <main className="flex-1 flex flex-col items-center justify-center px-4 py-12">
          <div className="card-premium max-w-md w-full p-8 animate-fade-in">
            <h1 className="display-lg text-foreground mb-2 text-center">Invalid or expired link</h1>
            <p className="body-md text-muted-foreground text-center mb-4">Please request a new password reset link.</p>
            <Link to="/forgot-password" className="w-full block">
              <Button className="w-full btn-accent text-lg py-6 rounded-full shadow-md">Request Reset Link</Button>
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <PRPHeader isAuthenticated={false} />
      <main className="flex-1 flex flex-col items-center justify-center px-4 py-12">
        <Link to="/login" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-8">
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          <span>Back to login</span>
        </Link>
        <div className="card-premium max-w-md w-full p-8 animate-fade-in">
          <h1 className="display-lg text-foreground mb-2 text-center">Reset your password</h1>
          <form
            onSubmit={handleSubmit}
            className="space-y-6"
            aria-label="Reset Password Form"
          >
            <div className="space-y-2">
              <label htmlFor="password" className="text-base font-medium">New password</label>
              <Input
                id="password"
                type="password"
                required
                minLength={8}
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="New password"
                aria-label="New password"
                className="input-modern"
                disabled={loading || success}
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="confirm" className="text-base font-medium">Confirm password</label>
              <Input
                id="confirm"
                type="password"
                required
                minLength={8}
                value={confirm}
                onChange={e => setConfirm(e.target.value)}
                placeholder="Confirm password"
                aria-label="Confirm password"
                className="input-modern"
                disabled={loading || success}
              />
            </div>
            <Button
              type="submit"
              className="w-full btn-accent text-lg py-6 rounded-full shadow-md"
              disabled={loading || success || !password || !confirm}
              aria-label="Reset password"
            >
              {loading ? "Resetting..." : success ? "Password Updated" : "Reset Password"}
            </Button>
          </form>
        </div>
      </main>

      <Footer />
    </div>
  );
}
