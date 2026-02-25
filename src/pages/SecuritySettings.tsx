import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  ArrowLeft, 
  Loader2,
  Shield,
  Eye,
  EyeOff,
  AlertCircle,
  CheckCircle,
  Key
} from "lucide-react";
import { toast } from "sonner";
import { Footer } from "@/components/Footer";
import { useSeo } from "@/hooks/useSeo";

const SecuritySettings = () => {
  useSeo({
    title: "Security Settings",
    description: "Manage your Press Room Publisher account security. Change your password and configure security preferences.",
    keywords: ["security", "password", "account security"],
    noindex: true,
  });
  const navigate = useNavigate();
  
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  
  // Password form
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    const init = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        navigate("/login");
        return;
      }
      
      setUserEmail(session.user.email ?? null);
      setIsLoading(false);
    };

    init();
  }, [navigate]);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!currentPassword) {
      newErrors.currentPassword = "Current password is required";
    }

    if (!newPassword) {
      newErrors.newPassword = "New password is required";
    } else if (newPassword.length < 8) {
      newErrors.newPassword = "Password must be at least 8 characters";
    } else if (!/[A-Z]/.test(newPassword)) {
      newErrors.newPassword = "Password must contain at least one uppercase letter";
    } else if (!/[a-z]/.test(newPassword)) {
      newErrors.newPassword = "Password must contain at least one lowercase letter";
    } else if (!/[0-9]/.test(newPassword)) {
      newErrors.newPassword = "Password must contain at least one number";
    }

    if (!confirmPassword) {
      newErrors.confirmPassword = "Please confirm your new password";
    } else if (newPassword !== confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    if (currentPassword === newPassword && currentPassword) {
      newErrors.newPassword = "New password must be different from current password";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsUpdating(true);

    try {
      // Step 1: Verify current password by re-authenticating
      if (!userEmail) throw new Error("Unable to verify identity. Please sign in again.");
      const { error: reAuthError } = await supabase.auth.signInWithPassword({
        email: userEmail,
        password: currentPassword,
      });
      if (reAuthError) {
        setErrors({ currentPassword: "Current password is incorrect" });
        setIsUpdating(false);
        return;
      }

      // Step 2: Update to new password
      const { error } = await supabase.auth.updateUser({
        password: newPassword
      });

      if (error) throw error;

      toast.success("Password updated successfully!", {
        description: "Your password has been changed."
      });

      // Clear form
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setErrors({});

      // Navigate back to settings
      navigate("/settings");
    } catch (error: any) {
      console.error("Error updating password:", error);
      
      if (error.message?.includes("incorrect") || error.message?.includes("invalid")) {
        setErrors({ currentPassword: "Current password is incorrect" });
      } else {
        toast.error("Failed to update password", {
          description: error.message || "Please try again"
        });
      }
    } finally {
      setIsUpdating(false);
    }
  };

  // Password strength indicator
  const getPasswordStrength = (password: string): { level: number; text: string; color: string } => {
    if (!password) return { level: 0, text: "", color: "" };
    
    let strength = 0;
    if (password.length >= 8) strength++;
    if (password.length >= 12) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/[a-z]/.test(password)) strength++;
    if (/[0-9]/.test(password)) strength++;
    if (/[^A-Za-z0-9]/.test(password)) strength++;

    if (strength <= 2) return { level: 1, text: "Weak", color: "bg-destructive" };
    if (strength <= 4) return { level: 2, text: "Medium", color: "bg-amber-500" };
    return { level: 3, text: "Strong", color: "bg-green-500" };
  };

  const passwordStrength = getPasswordStrength(newPassword);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-accent" aria-label="Loading security settings" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <a href="#main-content" className="skip-link">
        Skip to main content
      </a>

      {/* Header */}
      <header className="border-b border-border bg-card sticky top-0 z-10" role="banner">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4 flex items-center gap-4">
          <Link 
            to="/settings"
            className="text-muted-foreground hover:text-foreground transition-colors"
            aria-label="Back to settings"
          >
            <ArrowLeft className="h-5 w-5" aria-hidden="true" />
          </Link>
          <div className="flex items-center gap-2">
            <Shield className="h-6 w-6 text-accent" aria-hidden="true" />
            <span className="font-serif text-lg font-bold text-foreground">Security Settings</span>
          </div>
        </div>
      </header>

      <main id="main-content" role="main" className="flex-1 max-w-xl mx-auto px-4 sm:px-6 py-8 w-full">
        <section className="card-premium" aria-labelledby="password-heading">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 rounded-full bg-accent/10" aria-hidden="true">
              <Key className="h-6 w-6 text-accent" />
            </div>
            <div>
              <h1 id="password-heading" className="heading-lg text-foreground">Change Password</h1>
              <p className="text-sm text-muted-foreground">Update your account password</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6" aria-label="Change password form">
            {/* Current Password */}
            <div className="space-y-2">
              <Label htmlFor="currentPassword">
                Current Password <span className="text-destructive">*</span>
              </Label>
              <div className="relative">
                <Input
                  id="currentPassword"
                  type={showCurrentPassword ? "text" : "password"}
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="input-modern pr-10"
                  aria-required="true"
                  aria-invalid={!!errors.currentPassword}
                  aria-describedby={errors.currentPassword ? "currentPassword-error" : undefined}
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  aria-label={showCurrentPassword ? "Hide current password" : "Show current password"}
                >
                  {showCurrentPassword ? (
                    <EyeOff className="h-5 w-5" aria-hidden="true" />
                  ) : (
                    <Eye className="h-5 w-5" aria-hidden="true" />
                  )}
                </button>
              </div>
              {errors.currentPassword && (
                <p id="currentPassword-error" className="text-sm text-destructive flex items-center gap-1" role="alert">
                  <AlertCircle className="h-4 w-4" aria-hidden="true" />
                  {errors.currentPassword}
                </p>
              )}
            </div>

            {/* New Password */}
            <div className="space-y-2">
              <Label htmlFor="newPassword">
                New Password <span className="text-destructive">*</span>
              </Label>
              <div className="relative">
                <Input
                  id="newPassword"
                  type={showNewPassword ? "text" : "password"}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="input-modern pr-10"
                  aria-required="true"
                  aria-invalid={!!errors.newPassword}
                  aria-describedby="newPassword-requirements"
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  aria-label={showNewPassword ? "Hide new password" : "Show new password"}
                >
                  {showNewPassword ? (
                    <EyeOff className="h-5 w-5" aria-hidden="true" />
                  ) : (
                    <Eye className="h-5 w-5" aria-hidden="true" />
                  )}
                </button>
              </div>

              {/* Password Strength Indicator */}
              {newPassword && (
                <div className="space-y-2">
                  <div className="flex gap-1">
                    {[1, 2, 3].map((level) => (
                      <div
                        key={level}
                        className={`h-1 flex-1 rounded-full ${
                          level <= passwordStrength.level ? passwordStrength.color : "bg-muted"
                        }`}
                        aria-hidden="true"
                      />
                    ))}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Password strength: <span className="font-medium">{passwordStrength.text}</span>
                  </p>
                </div>
              )}

              <div id="newPassword-requirements" className="text-xs text-muted-foreground space-y-1">
                <p className="flex items-center gap-1">
                  {newPassword.length >= 8 ? (
                    <CheckCircle className="h-3 w-3 text-green-500" aria-hidden="true" />
                  ) : (
                    <AlertCircle className="h-3 w-3" aria-hidden="true" />
                  )}
                  At least 8 characters
                </p>
                <p className="flex items-center gap-1">
                  {/[A-Z]/.test(newPassword) ? (
                    <CheckCircle className="h-3 w-3 text-green-500" aria-hidden="true" />
                  ) : (
                    <AlertCircle className="h-3 w-3" aria-hidden="true" />
                  )}
                  One uppercase letter
                </p>
                <p className="flex items-center gap-1">
                  {/[a-z]/.test(newPassword) ? (
                    <CheckCircle className="h-3 w-3 text-green-500" aria-hidden="true" />
                  ) : (
                    <AlertCircle className="h-3 w-3" aria-hidden="true" />
                  )}
                  One lowercase letter
                </p>
                <p className="flex items-center gap-1">
                  {/[0-9]/.test(newPassword) ? (
                    <CheckCircle className="h-3 w-3 text-green-500" aria-hidden="true" />
                  ) : (
                    <AlertCircle className="h-3 w-3" aria-hidden="true" />
                  )}
                  One number
                </p>
              </div>

              {errors.newPassword && (
                <p className="text-sm text-destructive flex items-center gap-1" role="alert">
                  <AlertCircle className="h-4 w-4" aria-hidden="true" />
                  {errors.newPassword}
                </p>
              )}
            </div>

            {/* Confirm Password */}
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">
                Confirm New Password <span className="text-destructive">*</span>
              </Label>
              <div className="relative">
                <Input
                  id="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="input-modern pr-10"
                  aria-required="true"
                  aria-invalid={!!errors.confirmPassword}
                  aria-describedby={errors.confirmPassword ? "confirmPassword-error" : undefined}
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  aria-label={showConfirmPassword ? "Hide confirm password" : "Show confirm password"}
                >
                  {showConfirmPassword ? (
                    <EyeOff className="h-5 w-5" aria-hidden="true" />
                  ) : (
                    <Eye className="h-5 w-5" aria-hidden="true" />
                  )}
                </button>
              </div>
              {confirmPassword && newPassword === confirmPassword && (
                <p className="text-sm text-green-600 flex items-center gap-1">
                  <CheckCircle className="h-4 w-4" aria-hidden="true" />
                  Passwords match
                </p>
              )}
              {errors.confirmPassword && (
                <p id="confirmPassword-error" className="text-sm text-destructive flex items-center gap-1" role="alert">
                  <AlertCircle className="h-4 w-4" aria-hidden="true" />
                  {errors.confirmPassword}
                </p>
              )}
            </div>

            {/* Submit Buttons */}
            <div className="flex items-center gap-4 pt-4">
              <Button
                type="submit"
                disabled={isUpdating}
                className="btn-accent rounded-full flex-1"
                aria-label={isUpdating ? "Updating password..." : "Update your password"}
              >
                {isUpdating ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" aria-hidden="true" />
                    Updating...
                  </>
                ) : (
                  "Update Password"
                )}
              </Button>

              <Link to="/settings">
                <Button
                  type="button"
                  variant="outline"
                  className="rounded-full"
                  aria-label="Cancel and go back to settings"
                >
                  Cancel
                </Button>
              </Link>
            </div>
          </form>
        </section>

        {/* Forgot Password */}
        <div className="text-center mt-6">
          <p className="text-sm text-muted-foreground">
            Forgot your current password?{" "}
            <Link to="/forgot-password" className="text-accent hover:underline">
              Reset it here
            </Link>
          </p>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default SecuritySettings;
