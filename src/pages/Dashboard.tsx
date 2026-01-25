import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Plus, Loader2, Users, FileText, ChevronRight, PenLine } from "lucide-react";
import type { Tables } from "@/integrations/supabase/types";
import { PRPHeader } from "@/components/ui/prp-header";
import { Footer } from "@/components/Footer";
interface Profile {
  first_name: string;
  last_name: string;
  screen_name: string | null;
}

type Blog = Tables<"blogs">;

interface BlogWithCategory extends Blog {
  blog_categories: { name: string } | null;
  _postCount?: number;
}

const Dashboard = () => {
  const { user, isLoading: authLoading, signOut } = useAuth({ requireAuth: true });
  const [profile, setProfile] = useState<Profile | null>(null);
  const [blogs, setBlogs] = useState<BlogWithCategory[]>([]);
  const [isLoadingData, setIsLoadingData] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      if (!user) return;

      // Fetch profile
      const { data: profileData } = await supabase
        .from("profiles")
        .select("first_name, last_name, screen_name")
        .eq("id", user.id)
        .maybeSingle();

      setProfile(profileData);

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

  if (authLoading || isLoadingData) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-accent" aria-label="Loading dashboard" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <a href="#main-content" className="skip-link">
        Skip to main content
      </a>

      {/* Header - Using consistent PRPHeader */}
      <PRPHeader isAuthenticated={true} />

      <main id="main-content" className="flex-1 section-container py-12">
        {/* Welcome Section */}
        <section className="mb-12" aria-labelledby="welcome-heading">
          <h1 id="welcome-heading" className="display-lg text-foreground mb-2">
            Welcome back, {profile?.first_name || "Publisher"}
          </h1>
          {profile?.screen_name && (
            <p className="body-md text-muted-foreground">@{profile.screen_name}</p>
          )}
        </section>

        {/* My Blogs Section */}
        <section aria-labelledby="blogs-heading">
          <div className="flex items-center justify-between mb-8">
            <h2 id="blogs-heading" className="heading-xl text-foreground">Your publications</h2>
            <Link to="/blogs/create">
              <Button className="btn-accent rounded-full" aria-label="Create a new blog">
                <Plus className="h-5 w-5 mr-2" aria-hidden="true" />
                New publication
              </Button>
            </Link>
          </div>

          {blogs.length === 0 ? (
            /* Empty State */
            <div className="card-premium text-center py-16">
              <div 
                className="w-20 h-20 mx-auto mb-6 rounded-full bg-accent/10 flex items-center justify-center"
                aria-hidden="true"
              >
                <PenLine className="h-10 w-10 text-accent" />
              </div>
              <h3 className="heading-lg text-foreground mb-3">Start your first publication</h3>
              <p className="body-md text-muted-foreground mb-6 max-w-md mx-auto">
                Create your first publication to start sharing stories and building your audience.
              </p>
              <Link to="/blogs/create">
                <Button className="btn-accent rounded-full" aria-label="Create your first publication">
                  Create your publication
                </Button>
              </Link>
            </div>
          ) : (
            /* Blogs List */
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3" role="list" aria-label="Your blogs">
              {blogs.map((blog) => (
                <Link 
                  key={blog.id} 
                  to={`/blog/${blog.slug}/manage`}
                  className="block"
                >
                  <article 
                    className="card-interactive h-full"
                    role="listitem"
                  >
                    <div className="flex items-start gap-4">
                      <Avatar className="h-14 w-14 border-2 border-accent/20 flex-shrink-0">
                        <AvatarImage 
                          src={blog.profile_photo_url} 
                          alt={`${blog.blog_name} profile photo`}
                        />
                        <AvatarFallback className="bg-accent/10 text-accent text-lg">
                          {blog.blog_name.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <h3 className="heading-sm text-foreground truncate">
                            {blog.blog_name}
                          </h3>
                          <ChevronRight className="h-5 w-5 text-muted-foreground flex-shrink-0" aria-hidden="true" />
                        </div>

                        {blog.blog_categories && (
                          <Badge variant="secondary" className="mt-1 text-xs">
                            {blog.blog_categories.name}
                          </Badge>
                        )}

                        {blog.status === "hidden" && (
                          <Badge variant="outline" className="mt-1 ml-2 text-xs text-muted-foreground">
                            Hidden
                          </Badge>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-4 mt-4 pt-4 border-t border-border text-sm text-muted-foreground">
                      <span className="flex items-center gap-1" aria-label={`${formatNumber(blog.follower_count)} followers`}>
                        <Users className="h-4 w-4" aria-hidden="true" />
                        {formatNumber(blog.follower_count)}
                      </span>
                      <span className="flex items-center gap-1" aria-label={`${blog._postCount || 0} posts`}>
                        <FileText className="h-4 w-4" aria-hidden="true" />
                        {blog._postCount || 0}
                      </span>
                    </div>
                  </article>
                </Link>
              ))}
            </div>
          )}
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default Dashboard;
