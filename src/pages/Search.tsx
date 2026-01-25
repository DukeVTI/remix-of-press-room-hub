import { useState, useEffect } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PRPHeader } from "@/components/ui/prp-header";
import { Footer } from "@/components/Footer";
import { 
  Newspaper, 
  Search as SearchIcon,
  Loader2,
  Users,
  FileText,
  Calendar,
  Eye,
  ThumbsUp,
  ArrowRight
} from "lucide-react";
import type { Tables } from "@/integrations/supabase/types";

type Blog = Tables<"blogs">;
type Post = Tables<"posts">;

interface BlogWithCategory extends Blog {
  blog_categories: { name: string } | null;
}

interface PostWithBlog extends Post {
  blogs: { blog_name: string; slug: string; profile_photo_url: string } | null;
}

const Search = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialQuery = searchParams.get("q") || "";
  
  const [query, setQuery] = useState(initialQuery);
  const [searchQuery, setSearchQuery] = useState(initialQuery);
  const [activeTab, setActiveTab] = useState("blogs");
  const [isLoading, setIsLoading] = useState(false);
  const [blogs, setBlogs] = useState<BlogWithCategory[]>([]);
  const [posts, setPosts] = useState<PostWithBlog[]>([]);
  const [userId, setUserId] = useState<string | null>(null);
  const [hasSearched, setHasSearched] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        setUserId(session.user.id);
      }
    };
    checkAuth();

    // Load initial blogs when page loads
    loadInitialBlogs();
  }, []);

  useEffect(() => {
    if (searchQuery) {
      performSearch(searchQuery);
    }
  }, [searchQuery]);

  const loadInitialBlogs = async () => {
    setIsLoading(true);
    try {
      // Load recent/featured blogs
      const { data: blogsData } = await supabase
        .from("blogs")
        .select("*, blog_categories(name)")
        .eq("status", "active")
        .order("follower_count", { ascending: false })
        .limit(20);

      if (blogsData) {
        setBlogs(blogsData as BlogWithCategory[]);
      }

      // Load recent posts
      const { data: postsData } = await supabase
        .from("posts")
        .select("*, blogs!inner(blog_name, slug, profile_photo_url)")
        .eq("status", "published")
        .order("published_at", { ascending: false })
        .limit(20);

      if (postsData) {
        setPosts(postsData as PostWithBlog[]);
      }
    } catch (error) {
      console.error("Error loading initial data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const performSearch = async (q: string) => {
    if (!q.trim()) return;

    setIsLoading(true);
    setHasSearched(true);
    const searchTerm = q.trim().toLowerCase();

    try {
      // Search blogs - use ilike with proper escaping
      const { data: blogsData, error: blogsError } = await supabase
        .from("blogs")
        .select("*, blog_categories(name)")
        .eq("status", "active")
        .or(`blog_name.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%`)
        .order("follower_count", { ascending: false })
        .limit(20);

      if (blogsError) {
        console.error("Blogs search error:", blogsError);
      }

      if (blogsData) {
        setBlogs(blogsData as BlogWithCategory[]);
      } else {
        setBlogs([]);
      }

      // Search posts
      const { data: postsData, error: postsError } = await supabase
        .from("posts")
        .select("*, blogs!inner(blog_name, slug, profile_photo_url)")
        .eq("status", "published")
        .or(`headline.ilike.%${searchTerm}%,subtitle.ilike.%${searchTerm}%,content.ilike.%${searchTerm}%`)
        .order("published_at", { ascending: false })
        .limit(20);

      if (postsError) {
        console.error("Posts search error:", postsError);
      }

      if (postsData) {
        setPosts(postsData as PostWithBlog[]);
      } else {
        setPosts([]);
      }
    } catch (error) {
      console.error("Search error:", error);
      setBlogs([]);
      setPosts([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      setSearchParams({ q: query.trim() });
      setSearchQuery(query.trim());
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric"
    });
  };

  const formatNumber = (num: number) => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + "M";
    }
    if (num >= 1000) {
      return (num / 1000).toFixed(1) + "K";
    }
    return num.toString();
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <a href="#main-content" className="skip-link">
        Skip to main content
      </a>

      {/* Header */}
      <PRPHeader isAuthenticated={!!userId} />

      <main id="main-content" role="main" className="flex-1 section-container py-8 max-w-4xl mx-auto">
        {/* Search Form */}
        <section className="mb-8" aria-labelledby="search-heading">
          <h1 id="search-heading" className="display-lg text-foreground mb-6 text-center">
            Explore stories
          </h1>

          <form onSubmit={handleSearch} className="max-w-2xl mx-auto" role="search">
            <div className="relative">
              <SearchIcon 
                className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" 
                aria-hidden="true" 
              />
              <Input
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search publications and stories..."
                className="input-modern pl-12 pr-24 py-6 text-lg"
                aria-label="Search query"
              />
              <Button
                type="submit"
                className="absolute right-2 top-1/2 -translate-y-1/2 btn-accent rounded-full"
                disabled={!query.trim() || isLoading}
                aria-label="Submit search"
              >
                {isLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                ) : (
                  "Search"
                )}
              </Button>
            </div>
          </form>
        </section>

        {/* Results Header */}
        {hasSearched && searchQuery && (
          <div className="mb-4">
            <p className="text-muted-foreground">
              Showing results for "<span className="font-medium text-foreground">{searchQuery}</span>"
            </p>
          </div>
        )}

        {!hasSearched && blogs.length > 0 && (
          <div className="mb-4">
            <h2 className="headline-sm text-foreground">Browse All</h2>
            <p className="text-sm text-muted-foreground">Discover blogs and posts on Press Room Publisher</p>
          </div>
        )}

        {/* Results */}
        {(hasSearched || blogs.length > 0 || posts.length > 0) && (
          <section aria-label="Search results">
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="w-full justify-start mb-6" aria-label="Result type filter">
                <TabsTrigger value="blogs" className="flex items-center gap-2">
                  <Newspaper className="h-4 w-4" aria-hidden="true" />
                  Blogs ({blogs.length})
                </TabsTrigger>
                <TabsTrigger value="posts" className="flex items-center gap-2">
                  <FileText className="h-4 w-4" aria-hidden="true" />
                  Posts ({posts.length})
                </TabsTrigger>
              </TabsList>

              <TabsContent value="blogs">
                {isLoading ? (
                  <div className="text-center py-12">
                    <Loader2 className="h-8 w-8 animate-spin text-accent mx-auto" aria-label="Loading blogs" />
                  </div>
                ) : blogs.length === 0 ? (
                  <div className="text-center py-12">
                    <Newspaper className="h-12 w-12 text-muted-foreground mx-auto mb-4" aria-hidden="true" />
                    <p className="text-muted-foreground">
                      {hasSearched 
                        ? `No blogs found for "${searchQuery}"` 
                        : "No blogs available yet. Be the first to create one!"}
                    </p>
                    {!hasSearched && (
                      <Link to="/register" className="mt-4 inline-block">
                        <Button className="btn-gold" aria-label="Get started creating a blog">
                          Get Started
                        </Button>
                      </Link>
                    )}
                  </div>
                ) : (
                  <div className="space-y-4" role="list" aria-label="Blog search results">
                    {blogs.map((blog) => (
                      <Link 
                        key={blog.id} 
                        to={`/blog/${blog.slug}`}
                        className="block"
                      >
                        <article 
                          className="editorial-card hover:border-accent/50 transition-colors"
                          role="listitem"
                        >
                          <div className="flex items-start gap-4">
                            <Avatar className="h-16 w-16 border-2 border-accent/20 flex-shrink-0">
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
                                <div>
                                  <h2 className="headline-sm text-foreground mb-1">
                                    {blog.blog_name}
                                  </h2>
                                  {blog.blog_categories && (
                                    <Badge variant="secondary" className="mb-2">
                                      {blog.blog_categories.name}
                                    </Badge>
                                  )}
                                </div>
                                <ArrowRight className="h-5 w-5 text-muted-foreground flex-shrink-0" aria-hidden="true" />
                              </div>

                              <p className="body-md text-muted-foreground line-clamp-2 mb-3">
                                {blog.description}
                              </p>

                              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                <span className="flex items-center gap-1">
                                  <Users className="h-4 w-4" aria-hidden="true" />
                                  {formatNumber(blog.follower_count)} followers
                                </span>
                                <span className="flex items-center gap-1">
                                  <Calendar className="h-4 w-4" aria-hidden="true" />
                                  Since {formatDate(blog.created_at)}
                                </span>
                              </div>
                            </div>
                          </div>
                        </article>
                      </Link>
                    ))}
                  </div>
                )}
              </TabsContent>

              <TabsContent value="posts">
                {isLoading ? (
                  <div className="text-center py-12">
                    <Loader2 className="h-8 w-8 animate-spin text-accent mx-auto" aria-label="Loading posts" />
                  </div>
                ) : posts.length === 0 ? (
                  <div className="text-center py-12">
                    <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" aria-hidden="true" />
                    <p className="text-muted-foreground">
                      {hasSearched 
                        ? `No posts found for "${searchQuery}"` 
                        : "No posts published yet."}
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4" role="list" aria-label="Post search results">
                    {posts.map((post) => (
                      <Link 
                        key={post.id} 
                        to={`/blog/${post.blogs?.slug}/post/${post.id}`}
                        className="block"
                      >
                        <article 
                          className="editorial-card hover:border-accent/50 transition-colors"
                          role="listitem"
                        >
                          <div className="flex items-start gap-4">
                            <Avatar className="h-12 w-12 border border-border flex-shrink-0">
                              <AvatarImage 
                                src={post.blogs?.profile_photo_url} 
                                alt={`${post.blogs?.blog_name} profile photo`}
                              />
                              <AvatarFallback className="bg-muted text-muted-foreground">
                                {post.blogs?.blog_name?.charAt(0).toUpperCase()}
                              </AvatarFallback>
                            </Avatar>

                            <div className="flex-1 min-w-0">
                              <p className="text-sm text-accent mb-1">
                                {post.blogs?.blog_name}
                              </p>
                              <h2 className="headline-sm text-foreground mb-1 line-clamp-2">
                                {post.headline}
                              </h2>
                              {post.subtitle && (
                                <p className="body-md text-muted-foreground line-clamp-1 mb-2">
                                  {post.subtitle}
                                </p>
                              )}
                              <p className="text-sm text-muted-foreground mb-3">
                                By {post.byline}
                              </p>

                              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                <span className="flex items-center gap-1">
                                  <Calendar className="h-4 w-4" aria-hidden="true" />
                                  {formatDate(post.published_at)}
                                </span>
                                <span className="flex items-center gap-1">
                                  <Eye className="h-4 w-4" aria-hidden="true" />
                                  {formatNumber(post.view_count)} views
                                </span>
                                <span className="flex items-center gap-1">
                                  <ThumbsUp className="h-4 w-4" aria-hidden="true" />
                                  {formatNumber(post.approval_count)} approvals
                                </span>
                              </div>
                            </div>
                          </div>
                        </article>
                      </Link>
                    ))}
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </section>
        )}

        {/* Initial State */}
        {!searchQuery && (
          <section className="text-center py-12" aria-label="Search suggestions">
            <div 
              className="w-20 h-20 mx-auto mb-6 rounded-full bg-accent/10 flex items-center justify-center"
              aria-hidden="true"
            >
              <SearchIcon className="h-10 w-10 text-accent" />
            </div>
            <h2 className="heading-lg text-foreground mb-3">
              Discover stories that matter
            </h2>
            <p className="body-md text-muted-foreground max-w-md mx-auto">
              Search for publications by name or topic, or find stories about subjects you're interested in.
            </p>
          </section>
        )}
      </main>

      <Footer />
    </div>
  );
};

export default Search;
