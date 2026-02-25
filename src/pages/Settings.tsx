import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { PRPHeader } from "@/components/ui/prp-header";
import { Footer } from "@/components/Footer";
import { useSeo } from "@/hooks/useSeo";
import { 
  Loader2,
  User,
  Shield,
  Bell,
  Eye,
  Trash2,
  LogOut,
  ChevronRight
} from "lucide-react";
import { toast } from "sonner";

const Settings = () => {
  useSeo({
    title: "Account Settings",
    description: "Manage your Press Room Publisher account settings, preferences, and privacy options.",
    keywords: ["settings", "account settings", "preferences"],
    noindex: true,
  });
  
  const navigate = useNavigate();
  
  const [userId, setUserId] = useState<string | null>(null);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isDeactivating, setIsDeactivating] = useState(false);

  useEffect(() => {
    const init = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        navigate("/login");
        return;
      }
      
      setUserId(session.user.id);
      setUserEmail(session.user.email || null);
      setIsLoading(false);
    };

    init();
  }, [navigate]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    toast.success("Signed out successfully");
    navigate("/");
  };

  const handleDeactivateAccount = async () => {
    if (!userId) return;

    setIsDeactivating(true);

    try {
      // Update account status to deactivated
      const { error } = await supabase
        .from("profiles")
        .update({ account_status: "deactivated" })
        .eq("id", userId);

      if (error) throw error;

      // Sign out
      await supabase.auth.signOut();

      toast.success("Account deactivated", {
        description: "Your account has been deactivated. You can reactivate it by signing in again."
      });

      navigate("/");
    } catch (error: any) {
      toast.error("Failed to deactivate account", {
        description: error.message
      });
    } finally {
      setIsDeactivating(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-accent" aria-label="Loading settings" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <a href="#main-content" className="skip-link">
        Skip to main content
      </a>

      {/* Header */}
      <PRPHeader isAuthenticated={true} />

      <main id="main-content" role="main" className="flex-1 section-container py-8 max-w-2xl mx-auto">
        <h1 className="display-lg text-foreground mb-8">Settings</h1>

        {/* Account Section */}
        <section className="card-premium mb-6" aria-labelledby="account-heading">
          <h2 id="account-heading" className="heading-md text-foreground mb-6 flex items-center gap-2">
            <User className="h-5 w-5 text-accent" aria-hidden="true" />
            Account
          </h2>

          <div className="space-y-4">
            <Link 
              to="/profile/edit"
              className="flex items-center justify-between p-4 rounded-lg border border-border hover:border-accent/50 transition-colors"
              aria-label="Edit your profile"
            >
              <div>
                <p className="font-medium text-foreground">Edit Profile</p>
                <p className="text-sm text-muted-foreground">Update your name, bio, and profile photo</p>
              </div>
              <ChevronRight className="h-5 w-5 text-muted-foreground" aria-hidden="true" />
            </Link>

            <div className="p-4 rounded-lg border border-border">
              <p className="font-medium text-foreground mb-1">Email Address</p>
              <p className="text-sm text-muted-foreground">{userEmail}</p>
              <p className="text-xs text-muted-foreground mt-1">
                Your email is never shown publicly
              </p>
            </div>
          </div>
        </section>

        {/* Security Section */}
        <section className="card-premium mb-6" aria-labelledby="security-heading">
          <h2 id="security-heading" className="heading-md text-foreground mb-6 flex items-center gap-2">
            <Shield className="h-5 w-5 text-accent" aria-hidden="true" />
            Security
          </h2>

          <div className="space-y-4">
            <Link 
              to="/settings/security"
              className="flex items-center justify-between p-4 rounded-lg border border-border hover:border-accent/50 transition-colors"
              aria-label="Change your password"
            >
              <div>
                <p className="font-medium text-foreground">Change Password</p>
                <p className="text-sm text-muted-foreground">Update your account password</p>
              </div>
              <ChevronRight className="h-5 w-5 text-muted-foreground" aria-hidden="true" />
            </Link>

            <div className="flex items-center justify-between p-4 rounded-lg border border-border">
              <div>
                <p className="font-medium text-foreground">Two-Factor Authentication</p>
                <p className="text-sm text-muted-foreground">Add an extra layer of security</p>
              </div>
              <span className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded">
                Coming Soon
              </span>
            </div>
          </div>
        </section>

        {/* Notifications Section */}
        <section className="card-premium mb-6" aria-labelledby="notifications-heading">
          <h2 id="notifications-heading" className="heading-md text-foreground mb-6 flex items-center gap-2">
            <Bell className="h-5 w-5 text-accent" aria-hidden="true" />
            Notifications
          </h2>

          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 rounded-lg border border-border">
              <div>
                <Label htmlFor="email-notifications" className="font-medium text-foreground cursor-pointer">
                  Email Notifications
                </Label>
                <p className="text-sm text-muted-foreground">Receive updates about your blogs</p>
              </div>
              <Switch 
                id="email-notifications"
                defaultChecked
                aria-label="Toggle email notifications"
              />
            </div>

            <div className="flex items-center justify-between p-4 rounded-lg border border-border">
              <div>
                <Label htmlFor="comment-notifications" className="font-medium text-foreground cursor-pointer">
                  Comment Notifications
                </Label>
                <p className="text-sm text-muted-foreground">Get notified when someone comments</p>
              </div>
              <Switch 
                id="comment-notifications"
                defaultChecked
                aria-label="Toggle comment notifications"
              />
            </div>

            <div className="flex items-center justify-between p-4 rounded-lg border border-border">
              <div>
                <Label htmlFor="follower-notifications" className="font-medium text-foreground cursor-pointer">
                  New Follower Notifications
                </Label>
                <p className="text-sm text-muted-foreground">Get notified when someone follows your blog</p>
              </div>
              <Switch 
                id="follower-notifications"
                defaultChecked
                aria-label="Toggle follower notifications"
              />
            </div>
          </div>
        </section>

        {/* Privacy Section */}
        <section className="card-premium mb-6" aria-labelledby="privacy-heading">
          <h2 id="privacy-heading" className="heading-md text-foreground mb-6 flex items-center gap-2">
            <Eye className="h-5 w-5 text-accent" aria-hidden="true" />
            Privacy
          </h2>

          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 rounded-lg border border-border">
              <div>
                <Label htmlFor="show-birthday" className="font-medium text-foreground cursor-pointer">
                  Show Birthday
                </Label>
                <p className="text-sm text-muted-foreground">Show month and day on your profile (year is always hidden)</p>
              </div>
              <Switch 
                id="show-birthday"
                defaultChecked
                aria-label="Toggle birthday visibility"
              />
            </div>
          </div>
        </section>

        <Separator className="my-8" />

        {/* Sign Out */}
        <section className="mb-6">
          <Button
            variant="outline"
            onClick={handleSignOut}
            className="w-full justify-start"
            aria-label="Sign out of your account"
          >
            <LogOut className="h-5 w-5 mr-3" aria-hidden="true" />
            Sign Out
          </Button>
        </section>

        {/* Danger Zone */}
        <section className="card-premium border-destructive/50" aria-labelledby="danger-heading">
          <h2 id="danger-heading" className="heading-md text-destructive mb-6 flex items-center gap-2">
            <Trash2 className="h-5 w-5" aria-hidden="true" />
            Danger Zone
          </h2>

          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                variant="outline"
                className="w-full justify-start border-destructive/50 text-destructive hover:bg-destructive/10"
                aria-label="Deactivate your account"
              >
                <Trash2 className="h-5 w-5 mr-3" aria-hidden="true" />
                Deactivate Account
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Deactivate Account?</AlertDialogTitle>
                <AlertDialogDescription>
                  This will deactivate your account and hide all your blogs and posts. 
                  You can reactivate your account by signing in again. Your data will not be deleted.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel aria-label="Cancel deactivation">Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleDeactivateAccount}
                  disabled={isDeactivating}
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  aria-label={isDeactivating ? "Deactivating account..." : "Confirm account deactivation"}
                >
                  {isDeactivating ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" aria-hidden="true" />
                      Deactivating...
                    </>
                  ) : (
                    "Deactivate Account"
                  )}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>

          <p className="text-xs text-muted-foreground mt-4">
            To permanently delete your account and all data, please contact support.
          </p>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default Settings;
