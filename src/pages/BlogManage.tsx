import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  ArrowLeft, 
  Plus, 
  Settings, 
  Users, 
  FileText,
  Eye,
  TrendingUp,
  Loader2,
  Edit,
  Trash2,
  MoreVertical,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import type { Tables } from "@/integrations/supabase/types";
import { useSeo } from "@/hooks/useSeo";
import { Footer } from "@/components/Footer";

type Blog = Tables<"blogs">;
type Post = Tables<"posts">;
type BlogAdmin = Tables<"blog_admins">;
type Profile = Tables<"profiles">;

interface BlogWithCategory extends Blog {
  blog_categories: { name: string } | null;
}

interface PostWithAuthor extends Post {
  profiles: { first_name: string; last_name: string } | null;
}

interface AdminWithProfile extends BlogAdmin {
  profiles: { first_name: string; last_name: string } | null;
}

const BlogManage = () => {
  const { blogSlug } = useParams<{ blogSlug: string }>();
  const navigate = useNavigate();
  
  useSeo({
    title: "Manage Blog",
    description: "Manage your blog posts, drafts, analytics, and settings.",
    noindex: true,
  });
  
  const [userId, setUserId] = useState<string | null>(null);
  const [blog, setBlog] = useState<BlogWithCategory | null>(null);
  const [posts, setPosts] = useState<PostWithAuthor[]>([]);
  const [admins, setAdmins] = useState<AdminWithProfile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isOwner, setIsOwner] = useState(false);
  const [postToDelete, setPostToDelete] = useState<string | null>(null);
  
  // Stats
  const [stats, setStats] = useState({
    totalPosts: 0,
    publishedPosts: 0,
    draftPosts: 0,
    totalViews: 0,
    totalReactions: 0,
    totalComments: 0,
  });

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
        .select("*, blog_categories(name)")
        .eq("slug", blogSlug)
        .maybeSingle();

      if (blogError || !blogData) {
        toast.error("Blog not found");
        navigate("/dashboard");
        return;
      }

      // Check if user can manage this blog
      const { data: canManage } = await supabase.rpc("can_manage_blog", {
        _user_id: session.user.id,
        _blog_id: blogData.id,
      });

      if (!canManage) {
        toast.error("You don't have permission to manage this blog");
        navigate("/dashboard");
        return;
      }

      setIsOwner(blogData.owner_id === session.user.id);
      setBlog(blogData as BlogWithCategory);

      // Fetch posts
      const { data: postsData } = await supabase
        .from("posts")
        .select("*, profiles(first_name, last_name)")
        .eq("blog_id", blogData.id)
        .order("created_at", { ascending: false });

      if (postsData) {
        setPosts(postsData as PostWithAuthor[]);
        
        // Calculate stats
        const published = postsData.filter(p => p.status === "published");
        const drafts = postsData.filter(p => p.status === "draft");
        
        setStats({
          totalPosts: postsData.length,
          publishedPosts: published.length,
          draftPosts: drafts.length,
          totalViews: postsData.reduce((sum, p) => sum + (p.view_count || 0), 0),
          totalReactions: postsData.reduce((sum, p) => sum + (p.approval_count || 0) + (p.disapproval_count || 0), 0),
          totalComments: postsData.reduce((sum, p) => sum + (p.comment_count || 0), 0),
        });
      }

      // Fetch admins (only if owner)
      if (blogData.owner_id === session.user.id) {
        const { data: adminsData } = await supabase
          .from("blog_admins")
          .select("*, profiles!blog_admins_admin_user_id_fkey(first_name, last_name)")
          .eq("blog_id", blogData.id)
          .neq("status", "removed");

        if (adminsData) {
          setAdmins(adminsData.map(admin => ({
            ...admin,
            profiles: admin.profiles || null
          })) as AdminWithProfile[]);
        }
      }

      setIsLoading(false);
    };

    init();
  }, [blogSlug, navigate]);

  const handleDeletePost = async () => {
    if (!postToDelete) return;

    try {
      const { error } = await supabase
        .from("posts")
        .update({ status: "deleted" })
        .eq("id", postToDelete);

      if (error) throw error;

      setPosts(prev => prev.filter(p => p.id !== postToDelete));
      toast.success("Post deleted successfully");
    } catch (error: any) {
      toast.error("Failed to delete post", { description: error.message });
    } finally {
      setPostToDelete(null);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "published":
        return (
          <Badge className="bg-accent/20 text-accent-foreground border-accent/30">
            <CheckCircle className="h-3 w-3 mr-1" aria-hidden="true" />
            Published
          </Badge>
        );
      case "draft":
        return (
          <Badge className="bg-muted text-muted-foreground border-border">
            <Clock className="h-3 w-3 mr-1" aria-hidden="true" />
            Draft
          </Badge>
        );
      case "hidden":
        return (
          <Badge className="bg-secondary text-secondary-foreground border-border">
            <XCircle className="h-3 w-3 mr-1" aria-hidden="true" />
            Hidden
          </Badge>
        );
      default:
        return null;
    }
  };

  const getAdminStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return (
          <Badge className="bg-accent/20 text-accent-foreground border-accent/30">
            Active
          </Badge>
        );
      case "pending":
        return (
          <Badge className="bg-muted text-muted-foreground border-border">
            Pending
          </Badge>
        );
      default:
        return null;
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-accent" aria-label="Loading blog management" />
      </div>
    );
  }

  if (!blog) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-4" aria-hidden="true" />
          <h1 className="headline-md text-foreground mb-2">Blog Not Found</h1>
          <p className="body-md text-muted-foreground mb-4">The blog you're looking for doesn't exist.</p>
          <Link to="/dashboard">
            <Button className="btn-primary">Back to Dashboard</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <a href="#main-content" className="skip-link">
        Skip to main content
      </a>

      {/* Header */}
      <header className="border-b border-border bg-card sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link 
                to="/dashboard" 
                className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
                aria-label="Back to dashboard"
              >
                <ArrowLeft className="h-5 w-5" aria-hidden="true" />
              </Link>
              
              <div className="flex items-center gap-3">
                <img
                  src={blog.profile_photo_url}
                  alt={`${blog.blog_name} profile photo`}
                  className="w-10 h-10 rounded-full object-cover border-2 border-accent/20"
                />
                <div>
                  <h1 className="font-serif font-semibold text-foreground">{blog.blog_name}</h1>
                  <p className="text-xs text-muted-foreground">
                    {blog.blog_categories?.name || "Uncategorized"}
                  </p>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Link to={`/blog/${blog.slug}`} aria-label="View public blog page">
                <Button variant="outline" size="sm" className="rounded-full">
                  <Eye className="h-4 w-4 mr-2" aria-hidden="true" />
                  View Blog
                </Button>
              </Link>
              {isOwner && (
                <Link to={`/blog/${blog.slug}/edit`} aria-label="Edit blog settings">
                  <Button variant="outline" size="sm" className="rounded-full">
                    <Settings className="h-4 w-4 mr-2" aria-hidden="true" />
                    Settings
                  </Button>
                </Link>
              )}
            </div>
          </div>
        </div>
      </header>

      <main id="main-content" className="flex-1 max-w-6xl mx-auto px-4 sm:px-6 py-8 w-full">
        {/* Stats Overview */}
        <section className="mb-8" aria-labelledby="stats-heading">
          <h2 id="stats-heading" className="sr-only">Blog Statistics</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            <div className="card-premium text-center p-4">
              <p className="text-3xl font-bold text-foreground">{stats.totalPosts}</p>
              <p className="text-sm text-muted-foreground">Total Posts</p>
            </div>
            <div className="card-premium text-center p-4">
              <p className="text-3xl font-bold text-accent">{stats.publishedPosts}</p>
              <p className="text-sm text-muted-foreground">Published</p>
            </div>
            <div className="card-premium text-center p-4">
              <p className="text-3xl font-bold text-muted-foreground">{stats.draftPosts}</p>
              <p className="text-sm text-muted-foreground">Drafts</p>
            </div>
            <div className="card-premium text-center p-4">
              <p className="text-3xl font-bold text-foreground">{stats.totalViews.toLocaleString()}</p>
              <p className="text-sm text-muted-foreground">Total Views</p>
            </div>
            <div className="card-premium text-center p-4">
              <p className="text-3xl font-bold text-foreground">{stats.totalReactions}</p>
              <p className="text-sm text-muted-foreground">Reactions</p>
            </div>
            <div className="card-premium text-center p-4">
              <p className="text-3xl font-bold text-foreground">{blog.follower_count}</p>
              <p className="text-sm text-muted-foreground">Followers</p>
            </div>
          </div>
        </section>

        {/* Tabs */}
        <Tabs defaultValue="posts" className="space-y-6">
          <TabsList className="bg-muted p-1 rounded-lg">
            <TabsTrigger value="posts" className="flex items-center gap-2">
              <FileText className="h-4 w-4" aria-hidden="true" />
              Posts
            </TabsTrigger>
            {isOwner && (
              <TabsTrigger value="admins" className="flex items-center gap-2">
                <Users className="h-4 w-4" aria-hidden="true" />
                Administrators
              </TabsTrigger>
            )}
            <TabsTrigger value="analytics" className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4" aria-hidden="true" />
              Analytics
            </TabsTrigger>
          </TabsList>

          {/* Posts Tab */}
          <TabsContent value="posts" className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="heading-lg text-foreground">All Posts</h2>
              <Link to={`/blog/${blog.slug}/post/create`}>
                <Button className="btn-accent rounded-full" aria-label="Create new post">
                  <Plus className="h-5 w-5 mr-2" aria-hidden="true" />
                  New Post
                </Button>
              </Link>
            </div>

            {posts.length === 0 ? (
              <div className="card-premium text-center py-16">
                <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" aria-hidden="true" />
                <h3 className="heading-md text-foreground mb-2">No posts yet</h3>
                <p className="body-md text-muted-foreground mb-6">
                  Create your first post to start publishing content.
                </p>
                <Link to={`/blog/${blog.slug}/post/create`}>
                  <Button className="btn-accent rounded-full" aria-label="Create your first post">
                    Create Your First Post
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {posts.map((post) => (
                  <article
                    key={post.id}
                    className="card-premium flex items-start justify-between gap-4"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        {getStatusBadge(post.status)}
                        {post.is_pinned && (
                          <Badge variant="secondary">Pinned</Badge>
                        )}
                      </div>
                      <h3 className="font-display font-semibold text-foreground mb-1 truncate">
                        {post.headline}
                      </h3>
                      {post.subtitle && (
                        <p className="text-sm text-muted-foreground mb-2 truncate">
                          {post.subtitle}
                        </p>
                      )}
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <span>
                          By {post.profiles?.first_name} {post.profiles?.last_name}
                        </span>
                        <span>•</span>
                        <span>{new Date(post.created_at).toLocaleDateString()}</span>
                        <span>•</span>
                        <span>{post.view_count} views</span>
                        <span>•</span>
                        <span>{post.comment_count} comments</span>
                      </div>
                    </div>

                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button 
                          variant="ghost" 
                          size="icon"
                          aria-label={`Actions for ${post.headline}`}
                        >
                          <MoreVertical className="h-4 w-4" aria-hidden="true" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem asChild>
                          <Link 
                            to={`/blog/${blog.slug}/post/${post.id}/edit`}
                            className="flex items-center"
                          >
                            <Edit className="h-4 w-4 mr-2" aria-hidden="true" />
                            Edit
                          </Link>
                        </DropdownMenuItem>
                        {post.status === "published" && (
                          <DropdownMenuItem asChild>
                            <Link 
                              to={`/blog/${blog.slug}/post/${post.id}`}
                              className="flex items-center"
                            >
                              <Eye className="h-4 w-4 mr-2" aria-hidden="true" />
                              View
                            </Link>
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuItem 
                          className="text-destructive focus:text-destructive"
                          onClick={() => setPostToDelete(post.id)}
                        >
                          <Trash2 className="h-4 w-4 mr-2" aria-hidden="true" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </article>
                ))}
              </div>
            )}
          </TabsContent>

          {/* Admins Tab */}
          {isOwner && (
            <TabsContent value="admins" className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="headline-sm text-foreground">Blog Administrators</h2>
                  <p className="text-sm text-muted-foreground">
                    Up to 5 administrators can help manage your blog
                  </p>
                </div>
                {admins.length < 5 && (
                  <Link to={`/blog/${blog.slug}/admins`}>
                    <Button className="btn-gold" aria-label="Add administrator">
                      <Plus className="h-5 w-5 mr-2" aria-hidden="true" />
                      Add Admin
                    </Button>
                  </Link>
                )}
              </div>

              {admins.length === 0 ? (
                <div className="editorial-card text-center py-16">
                  <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" aria-hidden="true" />
                  <h3 className="headline-sm text-foreground mb-2">No administrators</h3>
                  <p className="body-md text-muted-foreground mb-6">
                    Add up to 5 administrators to help manage your blog.
                  </p>
                  <Link to={`/blog/${blog.slug}/admins`}>
                    <Button className="btn-primary" aria-label="Add your first administrator">
                      Add First Administrator
                    </Button>
                  </Link>
                </div>
              ) : (
                <div className="space-y-4">
                  {admins.map((admin) => (
                    <div
                      key={admin.id}
                      className="editorial-card flex items-center justify-between"
                    >
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-medium text-foreground">
                            {admin.admin_first_name} {admin.admin_last_name}
                          </span>
                          {getAdminStatusBadge(admin.status)}
                        </div>
                        <p className="text-sm text-muted-foreground">{admin.admin_email}</p>
                        <p className="text-xs text-muted-foreground">
                          Added {new Date(admin.assigned_at).toLocaleDateString()}
                        </p>
                      </div>
                      <Link to={`/blog/${blog.slug}/admins`}>
                        <Button variant="outline" size="sm" aria-label={`Manage ${admin.admin_first_name}`}>
                          Manage
                        </Button>
                      </Link>
                    </div>
                  ))}
                </div>
              )}
            </TabsContent>
          )}

          {/* Analytics Tab */}
          <TabsContent value="analytics" className="space-y-6">
            <h2 className="headline-sm text-foreground">Analytics Overview</h2>
            
            <div className="editorial-card text-center py-16">
              <TrendingUp className="h-12 w-12 text-muted-foreground mx-auto mb-4" aria-hidden="true" />
              <h3 className="headline-sm text-foreground mb-2">Coming Soon</h3>
              <p className="body-md text-muted-foreground">
                Detailed analytics and insights will be available in a future update.
              </p>
            </div>
          </TabsContent>
        </Tabs>
      </main>

      {/* Delete Post Confirmation Dialog */}
      <AlertDialog open={!!postToDelete} onOpenChange={() => setPostToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Post?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. The post will be permanently removed from your blog.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeletePost}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete Post
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Footer />
    </div>
  );
};

export default BlogManage;
