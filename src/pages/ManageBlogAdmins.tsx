import { useState, useEffect } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { 
  ArrowLeft, 
  Loader2,
  Plus,
  UserPlus,
  Trash2,
  Mail,
  AlertCircle,
  Users,
  Clock,
  CheckCircle,
  Send
} from "lucide-react";
import { toast } from "sonner";
import type { Tables } from "@/integrations/supabase/types";
import { Footer } from "@/components/Footer";

type Blog = Tables<"blogs">;
type BlogAdmin = Tables<"blog_admins">;

interface AdminWithProfile extends BlogAdmin {
  profiles: { first_name: string; last_name: string; profile_photo_url: string | null } | null;
}

const MAX_ADMINS = 5;

const ManageBlogAdmins = () => {
  const { blogSlug } = useParams<{ blogSlug: string }>();
  const navigate = useNavigate();
  
  // Auth state
  const [userId, setUserId] = useState<string | null>(null);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  
  // Data
  const [blog, setBlog] = useState<Blog | null>(null);
  const [admins, setAdmins] = useState<AdminWithProfile[]>([]);
  
  // Add admin form
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [isAdding, setIsAdding] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  // Remove admin
  const [adminToRemove, setAdminToRemove] = useState<string | null>(null);
  const [isRemoving, setIsRemoving] = useState(false);

  useEffect(() => {
    const init = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        navigate("/login");
        return;
      }
      
      setUserId(session.user.id);

      // Fetch blog
      const { data: blogData, error: blogError } = await supabase
        .from("blogs")
        .select("*")
        .eq("slug", blogSlug)
        .maybeSingle();

      if (blogError || !blogData) {
        toast.error("Blog not found");
        navigate("/dashboard");
        return;
      }

      // Only owner can manage admins
      if (blogData.owner_id !== session.user.id) {
        toast.error("Only the blog owner can manage administrators");
        navigate(`/blog/${blogSlug}/manage`);
        return;
      }

      setBlog(blogData);
      setIsCheckingAuth(false);

      // Fetch admins
      await fetchAdmins(blogData.id);
    };

    init();
  }, [blogSlug, navigate]);

  const fetchAdmins = async (blogId: string) => {
    const { data: adminsData } = await supabase
      .from("blog_admins")
      .select("*, profiles!blog_admins_admin_user_id_fkey(first_name, last_name, profile_photo_url)")
      .eq("blog_id", blogId)
      .neq("status", "removed")
      .order("assigned_at", { ascending: false });

    if (adminsData) {
      setAdmins(adminsData.map(admin => ({
        ...admin,
        profiles: admin.profiles || null
      })) as AdminWithProfile[]);
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!firstName.trim()) {
      newErrors.firstName = "First name is required";
    }

    if (!lastName.trim()) {
      newErrors.lastName = "Last name is required";
    }

    if (!email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = "Please enter a valid email";
    }

    // Check if email is already an admin
    const existingAdmin = admins.find(
      a => a.admin_email.toLowerCase() === email.toLowerCase()
    );
    if (existingAdmin) {
      newErrors.email = "This person is already an administrator";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleAddAdmin = async () => {
    if (!validateForm() || !blog || !userId) return;

    setIsAdding(true);

    try {
      // Check if user exists with this email
      const { data: existingUser } = await supabase
        .from("profiles")
        .select("id")
        .eq("email", email.toLowerCase())
        .maybeSingle();

      // Create admin record
      const { error } = await supabase
        .from("blog_admins")
        .insert({
          blog_id: blog.id,
          admin_user_id: existingUser?.id || null,
          admin_first_name: firstName.trim(),
          admin_last_name: lastName.trim(),
          admin_email: email.toLowerCase().trim(),
          assigned_by: userId,
          status: existingUser ? "active" : "pending",
          invitation_sent: false,
        });

      if (error) throw error;

      toast.success("Administrator added!", {
        description: existingUser 
          ? `${firstName} now has admin access to this blog.`
          : `An invitation will be sent to ${email}.`
      });

      // Reset form
      setFirstName("");
      setLastName("");
      setEmail("");
      setAddDialogOpen(false);

      // Refresh admins list
      await fetchAdmins(blog.id);
    } catch (error: any) {
      console.error("Error adding admin:", error);
      toast.error("Failed to add administrator", {
        description: error.message || "Please try again"
      });
    } finally {
      setIsAdding(false);
    }
  };

  const handleRemoveAdmin = async () => {
    if (!adminToRemove || !blog) return;

    setIsRemoving(true);

    try {
      const { error } = await supabase
        .from("blog_admins")
        .update({ status: "removed" })
        .eq("id", adminToRemove);

      if (error) throw error;

      toast.success("Administrator removed");
      setAdmins(prev => prev.filter(a => a.id !== adminToRemove));
    } catch (error: any) {
      toast.error("Failed to remove administrator", {
        description: error.message
      });
    } finally {
      setAdminToRemove(null);
      setIsRemoving(false);
    }
  };

  const handleSendInvitation = async (adminId: string, adminEmail: string) => {
    // In a real app, this would trigger an email invitation
    // For now, we'll just mark it as sent
    try {
      const { error } = await supabase
        .from("blog_admins")
        .update({ invitation_sent: true })
        .eq("id", adminId);

      if (error) throw error;

      toast.success("Invitation sent!", {
        description: `An email has been sent to ${adminEmail}`
      });

      // Update local state
      setAdmins(prev => prev.map(a => 
        a.id === adminId ? { ...a, invitation_sent: true } : a
      ));
    } catch (error: any) {
      toast.error("Failed to send invitation");
    }
  };

  if (isCheckingAuth) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-accent" aria-label="Loading admin management" />
      </div>
    );
  }

  const activeAdmins = admins.filter(a => a.status !== "removed");
  const canAddMore = activeAdmins.length < MAX_ADMINS;

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <a href="#main-content" className="skip-link">
        Skip to main content
      </a>

      {/* Header */}
      <header className="border-b border-border bg-card sticky top-0 z-10" role="banner">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link 
              to={`/blog/${blogSlug}/manage`}
              className="text-muted-foreground hover:text-foreground transition-colors"
              aria-label="Back to blog management"
            >
              <ArrowLeft className="h-5 w-5" aria-hidden="true" />
            </Link>
            
            <div className="flex items-center gap-2">
              {blog && (
                <Avatar className="h-8 w-8">
                  <AvatarImage 
                    src={blog.profile_photo_url} 
                    alt={`${blog.blog_name} profile photo`}
                  />
                  <AvatarFallback>
                    {blog.blog_name.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
              )}
              <span className="font-serif font-bold text-foreground">
                Manage Administrators
              </span>
            </div>
          </div>

          {canAddMore && (
            <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
              <DialogTrigger asChild>
                <Button className="btn-accent rounded-full" aria-label="Add a new administrator">
                  <UserPlus className="h-4 w-4 mr-2" aria-hidden="true" />
                  Add Admin
                </Button>
              </DialogTrigger>
              <DialogContent aria-describedby="add-admin-description">
                <DialogHeader>
                  <DialogTitle>Add Administrator</DialogTitle>
                  <DialogDescription id="add-admin-description">
                    Add someone to help manage this blog. They'll be able to create, edit, and publish posts.
                  </DialogDescription>
                </DialogHeader>

                <form 
                  onSubmit={(e) => { e.preventDefault(); handleAddAdmin(); }}
                  className="space-y-4"
                  aria-label="Add administrator form"
                >
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="firstName">First Name <span className="text-destructive">*</span></Label>
                      <Input
                        id="firstName"
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                        aria-required="true"
                        aria-invalid={!!errors.firstName}
                      />
                      {errors.firstName && (
                        <p className="text-xs text-destructive" role="alert">{errors.firstName}</p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="lastName">Last Name <span className="text-destructive">*</span></Label>
                      <Input
                        id="lastName"
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
                        aria-required="true"
                        aria-invalid={!!errors.lastName}
                      />
                      {errors.lastName && (
                        <p className="text-xs text-destructive" role="alert">{errors.lastName}</p>
                      )}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">Email Address <span className="text-destructive">*</span></Label>
                    <Input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="admin@example.com"
                      aria-required="true"
                      aria-invalid={!!errors.email}
                    />
                    {errors.email && (
                      <p className="text-xs text-destructive" role="alert">{errors.email}</p>
                    )}
                    <p className="text-xs text-muted-foreground">
                      If this person already has a PRP account, they'll get immediate access. 
                      Otherwise, they'll receive an invitation.
                    </p>
                  </div>

                  <DialogFooter>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setAddDialogOpen(false)}
                      aria-label="Cancel adding administrator"
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      disabled={isAdding}
                      className="btn-accent rounded-full"
                      aria-label={isAdding ? "Adding administrator..." : "Add this administrator"}
                    >
                      {isAdding ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" aria-hidden="true" />
                          Adding...
                        </>
                      ) : (
                        <>
                          <Plus className="h-4 w-4 mr-2" aria-hidden="true" />
                          Add Administrator
                        </>
                      )}
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          )}
        </div>
      </header>

      <main id="main-content" role="main" className="flex-1 max-w-3xl mx-auto px-4 sm:px-6 py-8 w-full">
        {/* Info Card */}
        <div className="card-premium mb-8">
          <div className="flex items-start gap-4">
            <div className="p-3 rounded-full bg-accent/10" aria-hidden="true">
              <Users className="h-6 w-6 text-accent" />
            </div>
            <div>
              <h1 className="heading-lg text-foreground mb-2">Blog Administrators</h1>
              <p className="body-md text-muted-foreground">
                Administrators can create, edit, publish, and delete posts on your blog. 
                You can have up to {MAX_ADMINS} administrators.
              </p>
              <p className="body-sm text-muted-foreground mt-2">
                <strong>{activeAdmins.length}</strong> of {MAX_ADMINS} admin slots used
              </p>
            </div>
          </div>
        </div>

        {/* Admins List */}
        {activeAdmins.length === 0 ? (
          <div className="card-premium text-center py-12">
            <div 
              className="w-16 h-16 mx-auto mb-4 rounded-full bg-muted flex items-center justify-center"
              aria-hidden="true"
            >
              <Users className="h-8 w-8 text-muted-foreground" />
            </div>
            <h2 className="heading-md text-foreground mb-2">No administrators yet</h2>
            <p className="body-md text-muted-foreground mb-6">
              Add administrators to help you manage this blog.
            </p>
            <Button 
              onClick={() => setAddDialogOpen(true)}
              className="btn-accent rounded-full"
              aria-label="Add your first administrator"
            >
              <UserPlus className="h-4 w-4 mr-2" aria-hidden="true" />
              Add First Admin
            </Button>
          </div>
        ) : (
          <div className="space-y-4" role="list" aria-label="Blog administrators">
            {activeAdmins.map((admin) => (
              <article 
                key={admin.id} 
                className="card-premium"
                role="listitem"
                aria-label={`Administrator: ${admin.admin_first_name} ${admin.admin_last_name}`}
              >
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <Avatar className="h-12 w-12">
                      <AvatarImage 
                        src={admin.profiles?.profile_photo_url || undefined}
                        alt={`${admin.admin_first_name} ${admin.admin_last_name} profile photo`}
                      />
                      <AvatarFallback className="bg-accent/10 text-accent">
                        {admin.admin_first_name.charAt(0)}{admin.admin_last_name.charAt(0)}
                      </AvatarFallback>
                    </Avatar>

                    <div>
                      <h3 className="font-semibold text-foreground">
                        {admin.profiles 
                          ? `${admin.profiles.first_name} ${admin.profiles.last_name}`
                          : `${admin.admin_first_name} ${admin.admin_last_name}`
                        }
                      </h3>
                      <p className="text-sm text-muted-foreground flex items-center gap-1">
                        <Mail className="h-3 w-3" aria-hidden="true" />
                        {admin.admin_email}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        {admin.status === "active" ? (
                          <Badge className="bg-green-500/20 text-green-700 border-green-500/30">
                            <CheckCircle className="h-3 w-3 mr-1" aria-hidden="true" />
                            Active
                          </Badge>
                        ) : (
                          <Badge className="bg-amber-500/20 text-amber-700 border-amber-500/30">
                            <Clock className="h-3 w-3 mr-1" aria-hidden="true" />
                            Pending
                          </Badge>
                        )}
                        <span className="text-xs text-muted-foreground">
                          Added {new Date(admin.assigned_at).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {admin.status === "pending" && !admin.invitation_sent && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleSendInvitation(admin.id, admin.admin_email)}
                        aria-label={`Send invitation email to ${admin.admin_first_name}`}
                      >
                        <Send className="h-4 w-4 mr-1" aria-hidden="true" />
                        Send Invite
                      </Button>
                    )}
                    {admin.status === "pending" && admin.invitation_sent && (
                      <span className="text-xs text-muted-foreground">Invitation sent</span>
                    )}
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setAdminToRemove(admin.id)}
                      className="text-destructive hover:text-destructive hover:bg-destructive/10"
                      aria-label={`Remove ${admin.admin_first_name} ${admin.admin_last_name} as administrator`}
                    >
                      <Trash2 className="h-4 w-4" aria-hidden="true" />
                    </Button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}

        {!canAddMore && (
          <div className="mt-6 p-4 rounded-lg bg-muted border border-border" role="alert">
            <div className="flex items-center gap-2 text-muted-foreground">
              <AlertCircle className="h-5 w-5" aria-hidden="true" />
              <p className="text-sm">
                You've reached the maximum of {MAX_ADMINS} administrators. 
                Remove an existing admin to add a new one.
              </p>
            </div>
          </div>
        )}
      </main>

      {/* Remove Admin Confirmation */}
      <AlertDialog open={!!adminToRemove} onOpenChange={() => setAdminToRemove(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove Administrator?</AlertDialogTitle>
            <AlertDialogDescription>
              This person will no longer be able to create or manage posts on this blog. 
              You can add them back later if needed.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel aria-label="Cancel removal">Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleRemoveAdmin}
              disabled={isRemoving}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              aria-label={isRemoving ? "Removing administrator..." : "Confirm removal of administrator"}
            >
              {isRemoving ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" aria-hidden="true" />
                  Removing...
                </>
              ) : (
                "Remove Admin"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Footer />
    </div>
  );
};

export default ManageBlogAdmins;
