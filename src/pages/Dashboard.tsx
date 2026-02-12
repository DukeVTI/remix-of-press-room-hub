import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { 
  Plus, 
  Loader2, 
  Users, 
  FileText, 
  ChevronRight, 
  PenLine,
  TrendingUp,
  Eye,
  BookOpen,
  Sparkles,
  Calendar
} from "lucide-react";
import type { Tables } from "@/integrations/supabase/types";
import { PRPHeader } from "@/components/ui/prp-header";
import { Footer } from "@/components/Footer";
import { WelcomeModal } from "@/components/WelcomeModal";
import { CelebrationBanner } from "@/components/CelebrationBanner";

interface Profile {
  first_name: string;
  last_name: string;
  screen_name: string | null;
  profile_photo_url: string | null;
  profile_photo_alt: string | null;
  has_seen_welcome: boolean;
}

type Blog = Tables<"blogs">;

interface BlogWithCategory extends Blog {
  blog_categories: { name: string } | null;
  _postCount?: number;
}

const Dashboard = () => {
  const { user, isLoading: authLoading } = useAuth({ requireAuth: true });
  const [profile, setProfile] = useState<Profile | null>(null);
  const [blogs, setBlogs] = useState<BlogWithCategory[]>([]);
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [totalStats, setTotalStats] = useState({ followers: 0, posts: 0, views: 0 });
  const [showWelcomeModal, setShowWelcomeModal] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      if (!user) return;

      // Fetch profile
      const { data: profileData } = await supabase
        .from("profiles")
        .select("first_name, last_name, screen_name, profile_photo_url, profile_photo_alt, has_seen_welcome")
        .eq("id", user.id)
        .maybeSingle();

      setProfile(profileData);

      // Show welcome modal for new users
      if (profileData && !profileData.has_seen_welcome) {
        setShowWelcomeModal(true);
      }

      // Fetch user's blogs
      const { data: blogsData } = await supabase
        .from("blogs")
        .select("*, blog_categories(name)")
        .eq("owner_id", user.id)
        .neq("status", "deleted")
        .order("created_at", { ascending: false });

      if (blogsData) {
        // Fetch post counts for each blog
        const blogsWithCounts = await Promise.all(
          blogsData.map(async (blog) => {
            const { count } = await supabase
              .from("posts")
              .select("id", { count: "exact", head: true })
              .eq("blog_id", blog.id)
              .neq("status", "deleted");
            
            return { ...blog, _postCount: count || 0 };
          })
        );
        setBlogs(blogsWithCounts as BlogWithCategory[]);

        // Calculate totals
        const totalFollowers = blogsData.reduce((sum, b) => sum + b.follower_count, 0);
        const totalPosts = blogsWithCounts.reduce((sum, b) => sum + (b._postCount || 0), 0);
        setTotalStats({ followers: totalFollowers, posts: totalPosts, views: 0 });
      }

      setIsLoadingData(false);
    };

    loadData();
  }, [user]);

  const formatNumber = (num: number) => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + "M";
    }
    if (num >= 1000) {
      return (num / 1000).toFixed(1) + "K";
    }
    return num.toString();
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 18) return "Good afternoon";
    return "Good evening";
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric"
    });
  };

  if (authLoading || isLoadingData) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-10 w-10 animate-spin text-accent mx-auto mb-4" aria-label="Loading dashboard" />
          <p className="text-muted-foreground">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <a href="#main-content" className="skip-link">
        Skip to main content
      </a>

      <PRPHeader isAuthenticated={true} />

      <main id="main-content" className="flex-1">
        {/* Hero Welcome Section */}
        <section className="bg-gradient-to-br from-accent/5 via-background to-accent/10 border-b border-border">
          <div className="section-container py-12 md:py-16">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
              <div className="flex items-center gap-5">
                <Avatar className="h-20 w-20 md:h-24 md:w-24 border-4 border-background shadow-xl ring-2 ring-accent/20">
                  <AvatarImage 
                    src={profile?.profile_photo_url || undefined} 
                    alt={profile?.profile_photo_alt || "Your profile photo"}
                  />
                  <AvatarFallback className="bg-accent text-accent-foreground text-2xl md:text-3xl font-bold">
                    {profile?.first_name?.charAt(0) || "P"}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="text-muted-foreground text-sm md:text-base mb-1">
                    {getGreeting()},
                  </p>
                  <h1 className="text-2xl md:text-4xl font-serif font-bold text-foreground">
                    {profile?.first_name || "Publisher"}
                  </h1>
                  {profile?.screen_name && (
                    <p className="text-accent font-medium mt-1">@{profile.screen_name}</p>
                  )}
                </div>
              </div>

              <Link to="/blogs/create">
                <Button 
                  size="lg" 
                  className="btn-accent rounded-full shadow-lg hover:shadow-xl transition-all group"
                  aria-label="Create a new publication"
                >
                  <Plus className="h-5 w-5 mr-2 group-hover:rotate-90 transition-transform" aria-hidden="true" />
                  New publication
                </Button>
              </Link>
            </div>
          </div>
        </section>

        {/* Celebration Banner */}
        {user && (
          <div className="section-container pt-6">
            <CelebrationBanner userId={user.id} variant="dashboard" />
          </div>
        )}

        {/* Stats Overview */}
        {blogs.length > 0 && (
          <section className="section-container py-8" aria-label="Dashboard statistics">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-card rounded-2xl border border-border p-5 hover:shadow-md transition-shadow">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center">
                    <BookOpen className="h-5 w-5 text-accent" aria-hidden="true" />
                  </div>
                </div>
                <p className="text-2xl md:text-3xl font-bold text-foreground">{blogs.length}</p>
                <p className="text-sm text-muted-foreground">Publications</p>
              </div>

              <div className="bg-card rounded-2xl border border-border p-5 hover:shadow-md transition-shadow">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-xl bg-green-500/10 flex items-center justify-center">
                    <FileText className="h-5 w-5 text-green-600" aria-hidden="true" />
                  </div>
                </div>
                <p className="text-2xl md:text-3xl font-bold text-foreground">{totalStats.posts}</p>
                <p className="text-sm text-muted-foreground">Total Posts</p>
              </div>

              <div className="bg-card rounded-2xl border border-border p-5 hover:shadow-md transition-shadow">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center">
                    <Users className="h-5 w-5 text-blue-600" aria-hidden="true" />
                  </div>
                </div>
                <p className="text-2xl md:text-3xl font-bold text-foreground">{formatNumber(totalStats.followers)}</p>
                <p className="text-sm text-muted-foreground">Followers</p>
              </div>

              <div className="bg-card rounded-2xl border border-border p-5 hover:shadow-md transition-shadow">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center">
                    <TrendingUp className="h-5 w-5 text-purple-600" aria-hidden="true" />
                  </div>
                </div>
                <p className="text-2xl md:text-3xl font-bold text-foreground">{blogs.filter(b => b.is_verified).length}</p>
                <p className="text-sm text-muted-foreground">Verified</p>
              </div>
            </div>
          </section>
        )}

        {/* Publications Section */}
        <section className="section-container py-8 pb-16" aria-labelledby="blogs-heading">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 id="blogs-heading" className="text-xl md:text-2xl font-serif font-bold text-foreground">
                Your Publications
              </h2>
              <p className="text-muted-foreground text-sm mt-1">
                Manage and grow your audience
              </p>
            </div>
          </div>

          {blogs.length === 0 ? (
            /* Empty State - Enhanced */
            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-accent/5 via-card to-accent/10 border border-border p-8 md:p-16 text-center">
              <div className="absolute top-0 right-0 w-64 h-64 bg-accent/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
              <div className="absolute bottom-0 left-0 w-48 h-48 bg-accent/5 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />
              
              <div className="relative">
                <div 
                  className="w-24 h-24 mx-auto mb-8 rounded-2xl bg-gradient-to-br from-accent to-accent/80 flex items-center justify-center shadow-2xl"
                  aria-hidden="true"
                >
                  <PenLine className="h-12 w-12 text-accent-foreground" />
                </div>
                
                <h3 className="text-2xl md:text-3xl font-serif font-bold text-foreground mb-4">
                  Start your first publication
                </h3>
                <p className="text-muted-foreground mb-8 max-w-md mx-auto text-base md:text-lg">
                  Create your first publication to start sharing stories and building your audience.
                </p>
                
                <Link to="/blogs/create">
                  <Button 
                    size="lg" 
                    className="btn-accent rounded-full shadow-lg hover:shadow-xl transition-all px-8"
                    aria-label="Create your first publication"
                  >
                    <Sparkles className="h-5 w-5 mr-2" aria-hidden="true" />
                    Create your publication
                  </Button>
                </Link>
              </div>
            </div>
          ) : (
            /* Blogs List - Enhanced Cards */
            <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3" role="list" aria-label="Your publications">
              {blogs.map((blog) => (
                <Link 
                  key={blog.id} 
                  to={`/blog/${blog.slug}/manage`}
                  className="group block"
                >
                  <article 
                    className="relative h-full bg-card rounded-2xl border border-border p-6 transition-all duration-300 hover:shadow-xl hover:border-accent/30 hover:-translate-y-1"
                    role="listitem"
                  >
                    {/* Verified Badge */}
                    {blog.is_verified && (
                      <div className="absolute -top-2 -right-2 w-8 h-8 bg-green-500 rounded-full flex items-center justify-center shadow-lg">
                        <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      </div>
                    )}

                    <div className="flex items-start gap-4 mb-4">
                      <Avatar className="h-16 w-16 rounded-xl border-2 border-border group-hover:border-accent/30 transition-colors flex-shrink-0 shadow-md">
                        <AvatarImage 
                          src={blog.profile_photo_url} 
                          alt={blog.profile_photo_alt || `${blog.blog_name} profile photo`}
                        />
                        <AvatarFallback className="rounded-xl bg-gradient-to-br from-accent to-accent/80 text-accent-foreground text-xl font-bold">
                          {blog.blog_name.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>

                      <div className="flex-1 min-w-0">
                        <h3 className="font-serif font-bold text-lg text-foreground truncate group-hover:text-accent transition-colors">
                          {blog.blog_name}
                        </h3>

                        <div className="flex flex-wrap items-center gap-2 mt-2">
                          {blog.blog_categories && (
                            <Badge variant="secondary" className="text-xs rounded-full px-3">
                              {blog.blog_categories.name}
                            </Badge>
                          )}
                          {blog.status === "hidden" && (
                            <Badge variant="outline" className="text-xs text-muted-foreground rounded-full">
                              Hidden
                            </Badge>
                          )}
                        </div>
                      </div>

                      <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-accent group-hover:translate-x-1 transition-all flex-shrink-0" aria-hidden="true" />
                    </div>

                    {/* Description preview */}
                    <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
                      {blog.description}
                    </p>

                    {/* Stats Row */}
                    <div className="flex items-center gap-5 pt-4 border-t border-border text-sm">
                      <span className="flex items-center gap-1.5 text-muted-foreground" aria-label={`${formatNumber(blog.follower_count)} followers`}>
                        <Users className="h-4 w-4" aria-hidden="true" />
                        <span className="font-medium text-foreground">{formatNumber(blog.follower_count)}</span>
                        <span className="hidden sm:inline">followers</span>
                      </span>
                      <span className="flex items-center gap-1.5 text-muted-foreground" aria-label={`${blog._postCount || 0} posts`}>
                        <FileText className="h-4 w-4" aria-hidden="true" />
                        <span className="font-medium text-foreground">{blog._postCount || 0}</span>
                        <span className="hidden sm:inline">posts</span>
                      </span>
                    </div>

                    {/* Created date */}
                    <div className="flex items-center gap-1.5 mt-3 text-xs text-muted-foreground">
                      <Calendar className="h-3 w-3" aria-hidden="true" />
                      Created {formatDate(blog.created_at)}
                    </div>
                  </article>
                </Link>
              ))}

              {/* Add New Publication Card */}
              <Link 
                to="/blogs/create"
                className="group block"
              >
                <div className="h-full min-h-[280px] bg-gradient-to-br from-accent/5 to-accent/10 rounded-2xl border-2 border-dashed border-accent/30 p-6 flex flex-col items-center justify-center transition-all duration-300 hover:border-accent hover:bg-accent/10 hover:shadow-lg">
                  <div className="w-16 h-16 rounded-2xl bg-accent/20 flex items-center justify-center mb-4 group-hover:bg-accent/30 group-hover:scale-110 transition-all">
                    <Plus className="h-8 w-8 text-accent" aria-hidden="true" />
                  </div>
                  <p className="font-medium text-foreground text-center">Create new publication</p>
                  <p className="text-sm text-muted-foreground text-center mt-1">Add another blog to your portfolio</p>
                </div>
              </Link>
            </div>
          )}
        </section>
      </main>

      <Footer />

      {/* Welcome Modal for new subscribers */}
      <WelcomeModal
        open={showWelcomeModal}
        onClose={async () => {
          setShowWelcomeModal(false);
          // Mark as seen in database
          if (user) {
            await supabase
              .from("profiles")
              .update({ has_seen_welcome: true })
              .eq("id", user.id);
          }
        }}
        type="subscriber"
      />
    </div>
  );
};

export default Dashboard;