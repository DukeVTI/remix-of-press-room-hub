import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Eye, EyeOff, ArrowLeft, Loader2 } from "lucide-react";
import { Footer } from "@/components/Footer";
import { useSeo } from "@/hooks/useSeo";

const Login = () => {
  useSeo({
    title: "Sign In to Your Account",
    description: "Sign in to Press Room Publisher to manage your blogs, create posts, and engage with the journalism community.",
    keywords: ["login", "sign in", "press room publisher", "blogging platform", "journalist login"],
  });
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const { data: signInData, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      // Check account status — block deactivated / suspended accounts
      if (signInData.session) {
        const { data: profileData } = await supabase
          .from("profiles")
          .select("account_status")
          .eq("id", signInData.session.user.id)
          .maybeSingle();

        if (profileData?.account_status === "deactivated") {
          await supabase.auth.signOut();
          toast({
            title: "Account deactivated",
            description: "Your account has been deactivated. Please contact support to reactivate it.",
            variant: "destructive",
          });
          return;
        }

        if (profileData?.account_status === "suspended") {
          await supabase.auth.signOut();
          toast({
            title: "Account suspended",
            description: "Your account has been suspended due to a policy violation. Please contact support.",
            variant: "destructive",
          });
          return;
        }
      }

      toast({
        title: "Welcome back!",
        description: "You have successfully signed in.",
      });

      navigate("/dashboard");
    } catch (error: any) {
      toast({
        title: "Sign in failed",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <a href="#login-form" className="skip-link">
        Skip to login form
      </a>

      {/* Minimal header - links back to main site, not a standalone nav */}
      <header className="border-b border-border py-3 px-4 sm:px-6 bg-background" role="banner">
        <div className="max-w-md mx-auto flex items-center justify-between">
          <a 
            href="https://pressroompublisher.broadcasterscommunity.com"
            className="flex items-center gap-2"
            aria-label="Back to Press Room Publisher main site"
          >
            <img 
              src="https://pressroompublisher.broadcasterscommunity.com/wp-content/uploads/2026/01/cropped-PRP-ICON_-transparetn-32x32.png"
              alt="Press Room Publisher logo"
              className="w-7 h-7"
            />
            <span className="font-serif text-base font-medium text-foreground hidden sm:block">Press Room Publisher</span>
          </a>
          <a
            href="https://pressroompublisher.broadcasterscommunity.com"
            className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
            aria-label="Go back to Press Room Publisher main website"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
            Main site
          </a>
        </div>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center px-4 py-12">

        <div className="card-premium max-w-md w-full p-8 animate-fade-in" id="login-form">
          <div className="text-center mb-8">
            <h1 className="display-lg text-foreground mb-2">Welcome Back</h1>
            <p className="body-md text-muted-foreground">
              Sign in to your Press Room Publisher account
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6" aria-label="Login form">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-base">Email Address</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                aria-required="true"
                className="input-modern"
                autoComplete="email"
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password" className="text-base">Password</Label>
                <Link 
                  to="/forgot-password" 
                  className="text-sm text-accent hover:underline"
                  aria-label="Forgot your password? Click to reset"
                >
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  aria-required="true"
                  className="input-modern pr-10"
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>

            <Button
              type="submit"
              size="lg"
              disabled={isLoading}
              className="w-full btn-accent text-lg py-6 rounded-full shadow-md"
              aria-label={isLoading ? "Signing in..." : "Sign in to your account"}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" aria-hidden="true" />
                  Signing In...
                </>
              ) : (
                "Sign In"
              )}
            </Button>

            <p className="text-center text-sm text-muted-foreground">
              Don't have an account?{" "}
              <Link to="/register" className="text-accent hover:underline font-medium">
                Create one here
              </Link>
            </p>
          </form>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Login;
