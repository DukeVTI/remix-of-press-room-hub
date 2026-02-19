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
  Calendar,
  Eye,
  ThumbsUp,
  BookOpen,
  TrendingUp,
  Clock
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
  const [activeTab, setActiveTab] = useState("publications");
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
      const { data: blogsData } = await supabase
        .from("blogs")
        .select("*, blog_categories(name)")
        .eq("status", "active")
        .order("follower_count", { ascending: false })
        .limit(20);

      if (blogsData) {
        setBlogs(blogsData as BlogWithCategory[]);
      }

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

  // Sanitize search term: strip characters that could break PostgREST filter syntax
  const sanitizeSearchTerm = (raw: string): string => {
    return raw
      .trim()
      .slice(0, 100) // hard length cap
      .replace(/[%_\\]/g, "\\$&") // escape LIKE wildcards
      .replace(/[(),'"]/g, "") // strip PostgREST filter-breaking chars
      .toLowerCase();
  };

  const performSearch = async (q: string) => {
    if (!q.trim()) return;

    setIsLoading(true);
    setHasSearched(true);
    const searchTerm = sanitizeSearchTerm(q);

    if (!searchTerm) {
      setBlogs([]);
      setPosts([]);
      setIsLoading(false);
      return;
    }

    try {
      const { data: blogsData } = await supabase
        .from("blogs")
        .select("*, blog_categories(name)")
        .eq("status", "active")
        .or(`blog_name.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%`)
        .order("follower_count", { ascending: false })
        .limit(20);

      setBlogs(blogsData ? (blogsData as BlogWithCategory[]) : []);

      const { data: postsData } = await supabase
        .from("posts")
        .select("*, blogs!inner(blog_name, slug, profile_photo_url)")
        .eq("status", "published")
        .or(`headline.ilike.%${searchTerm}%,subtitle.ilike.%${searchTerm}%,content.ilike.%${searchTerm}%`)
        .order("published_at", { ascending: false })
        .limit(20);

      setPosts(postsData ? (postsData as PostWithBlog[]) : []);
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
    if (num >= 1000000) return (num / 1000000).toFixed(1) + "M";
    if (num >= 1000) return (num / 1000).toFixed(1) + "K";
    return num.toString();
  };

  const getReadingTime = (content: string) => {
    const wordsPerMinute = 200;
    const words = content.split(/\s+/).length;
    const minutes = Math.ceil(words / wordsPerMinute);
    return `${minutes} min read`;
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <a href="#main-content" className="skip-link">
        Skip to main content
      </a>

      <PRPHeader isAuthenticated={!!userId} />

      <main id="main-content" role="main" className="flex-1">
        {/* Hero Search Section */}
        <section className="relative border-b border-border bg-gradient-to-b from-muted/30 to-background">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 py-16 sm:py-20">
            <div className="text-center mb-10">
              <h1 className="font-serif text-4xl sm:text-5xl font-bold text-foreground mb-4 tracking-tight">
                Explore Stories
              </h1>
              <p className="text-lg text-muted-foreground max-w-xl mx-auto">
                Discover publications and stories that inform, inspire, and engage.
              </p>
            </div>

            <form onSubmit={handleSearch} className="max-w-2xl mx-auto" role="search">
              <div className="relative group">
                <div className="absolute inset-0 bg-accent/5 rounded-2xl blur-xl group-focus-within:bg-accent/10 transition-colors" />
                <div className="relative flex items-center bg-card border border-border rounded-2xl shadow-sm overflow-hidden focus-within:border-accent/50 focus-within:ring-2 focus-within:ring-accent/20 transition-all">
                  <SearchIcon 
                    className="ml-5 h-5 w-5 text-muted-foreground flex-shrink-0" 
                    aria-hidden="true" 
                  />
                  <Input
                    type="search"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Search publications, stories, topics..."
                    className="flex-1 border-0 bg-transparent py-5 px-4 text-base placeholder:text-muted-foreground/60 focus-visible:ring-0 focus-visible:ring-offset-0"
                    aria-label="Search query"
                  />
                  <Button
                    type="submit"
                    className="m-2 rounded-xl bg-accent text-accent-foreground hover:bg-accent/90 px-6"
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
              </div>
            </form>
          </div>
        </section>

        {/* Results Section */}
        <section className="max-w-5xl mx-auto px-4 sm:px-6 py-10">
          {/* Results Header */}
          {hasSearched && searchQuery && (
            <div className="mb-8 pb-6 border-b border-border">
              <p className="text-sm uppercase tracking-wider text-muted-foreground mb-1">
                Search results for
              </p>
              <h2 className="font-serif text-2xl font-semibold text-foreground">
                "{searchQuery}"
              </h2>
            </div>
          )}

          {!hasSearched && (blogs.length > 0 || posts.length > 0) && (
            <div className="mb-8 pb-6 border-b border-border">
              <div className="flex items-center gap-2 text-sm uppercase tracking-wider text-muted-foreground mb-1">
                <TrendingUp className="h-4 w-4" />
                <span>Trending</span>
              </div>
              <h2 className="font-serif text-2xl font-semibold text-foreground">
                Discover What's Popular
              </h2>
            </div>
          )}

          {/* Tabs */}
          {(hasSearched || blogs.length > 0 || posts.length > 0) && (
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="w-full justify-start bg-transparent border-b border-border rounded-none p-0 h-auto mb-8" aria-label="Result type filter">
                <TabsTrigger 
                  value="publications" 
                  className="relative rounded-none border-b-2 border-transparent data-[state=active]:border-accent data-[state=active]:bg-transparent data-[state=active]:shadow-none px-1 pb-3 mr-6 text-base font-medium"
                >
                  <Newspaper className="h-4 w-4 mr-2 inline" aria-hidden="true" />
                  Publications
                  <span className="ml-2 text-xs text-muted-foreground">({blogs.length})</span>
                </TabsTrigger>
                <TabsTrigger 
                  value="stories" 
                  className="relative rounded-none border-b-2 border-transparent data-[state=active]:border-accent data-[state=active]:bg-transparent data-[state=active]:shadow-none px-1 pb-3 text-base font-medium"
                >
                  <BookOpen className="h-4 w-4 mr-2 inline" aria-hidden="true" />
                  Stories
                  <span className="ml-2 text-xs text-muted-foreground">({posts.length})</span>
                </TabsTrigger>
              </TabsList>

              {/* Publications Tab */}
              <TabsContent value="publications" className="mt-0">
                {isLoading ? (
                  <div className="flex items-center justify-center py-20">
                    <Loader2 className="h-8 w-8 animate-spin text-accent" aria-label="Loading publications" />
                  </div>
                ) : blogs.length === 0 ? (
                  <div className="text-center py-20">
                    <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-muted flex items-center justify-center">
                      <Newspaper className="h-8 w-8 text-muted-foreground" aria-hidden="true" />
                    </div>
                    <h3 className="font-serif text-xl font-semibold text-foreground mb-2">
                      No publications found
                    </h3>
                    <p className="text-muted-foreground max-w-sm mx-auto">
                      {hasSearched 
                        ? `We couldn't find any publications matching "${searchQuery}". Try a different search term.` 
                        : "No publications available yet. Be the first to create one!"}
                    </p>
                    {!hasSearched && (
                      <Link to="/register" className="mt-6 inline-block">
                        <Button className="bg-accent text-accent-foreground hover:bg-accent/90 rounded-full px-6">
                          Start Publishing
                        </Button>
                      </Link>
                    )}
                  </div>
                ) : (
                  <div className="grid gap-6 md:grid-cols-2" role="list" aria-label="Publication search results">
                    {blogs.map((blog) => (
                      <Link 
                        key={blog.id} 
                        to={`/blog/${blog.slug}`}
                        className="block group"
                      >
                        <article 
                          className="relative h-full p-6 bg-card border border-border rounded-xl transition-all duration-200 hover:border-accent/40 hover:shadow-lg hover:shadow-accent/5"
                          role="listitem"
                        >
                          <div className="flex items-start gap-4">
                            <Avatar className="h-14 w-14 border-2 border-border group-hover:border-accent/30 transition-colors flex-shrink-0">
                              <AvatarImage 
                                src={blog.profile_photo_url} 
                                alt={`${blog.blog_name} profile photo`}
                              />
                              <AvatarFallback className="bg-accent/10 text-accent font-serif text-lg">
                                {blog.blog_name.charAt(0).toUpperCase()}
                              </AvatarFallback>
                            </Avatar>

                            <div className="flex-1 min-w-0">
                              <h3 className="font-serif text-lg font-semibold text-foreground mb-1 group-hover:text-accent transition-colors line-clamp-1">
                                {blog.blog_name}
                              </h3>
                              {blog.blog_categories && (
                                <Badge variant="secondary" className="text-xs font-normal">
                                  {blog.blog_categories.name}
                                </Badge>
                              )}
                            </div>
                          </div>

                          <p className="mt-4 text-sm text-muted-foreground line-clamp-2 leading-relaxed">
                            {blog.description}
                          </p>

                          <div className="mt-4 pt-4 border-t border-border flex items-center gap-4 text-xs text-muted-foreground">
                            <span className="flex items-center gap-1.5">
                              <Users className="h-3.5 w-3.5" aria-hidden="true" />
                              {formatNumber(blog.follower_count)} followers
                            </span>
                            <span className="flex items-center gap-1.5">
                              <Calendar className="h-3.5 w-3.5" aria-hidden="true" />
                              Since {new Date(blog.created_at).getFullYear()}
                            </span>
                          </div>
                        </article>
                      </Link>
                    ))}
                  </div>
                )}
              </TabsContent>

              {/* Stories Tab */}
              <TabsContent value="stories" className="mt-0">
                {isLoading ? (
                  <div className="flex items-center justify-center py-20">
                    <Loader2 className="h-8 w-8 animate-spin text-accent" aria-label="Loading stories" />
                  </div>
                ) : posts.length === 0 ? (
                  <div className="text-center py-20">
                    <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-muted flex items-center justify-center">
                      <BookOpen className="h-8 w-8 text-muted-foreground" aria-hidden="true" />
                    </div>
                    <h3 className="font-serif text-xl font-semibold text-foreground mb-2">
                      No stories found
                    </h3>
                    <p className="text-muted-foreground max-w-sm mx-auto">
                      {hasSearched 
                        ? `We couldn't find any stories matching "${searchQuery}". Try a different search term.` 
                        : "No stories published yet."}
                    </p>
                  </div>
                ) : (
                  <div className="divide-y divide-border" role="list" aria-label="Story search results">
                    {posts.map((post) => (
                      <Link 
                        key={post.id} 
                        to={`/blog/${post.blogs?.slug}/post/${post.id}`}
                        className="block group"
                      >
                        <article 
                          className="py-6 transition-colors"
                          role="listitem"
                        >
                          <div className="flex gap-4">
                            <div className="flex-1 min-w-0">
                              {/* Publication info */}
                              <div className="flex items-center gap-2 mb-3">
                                <Avatar className="h-6 w-6 border border-border">
                                  <AvatarImage 
                                    src={post.blogs?.profile_photo_url} 
                                    alt={post.blogs?.blog_name}
                                  />
                                  <AvatarFallback className="text-xs bg-muted">
                                    {post.blogs?.blog_name?.charAt(0)}
                                  </AvatarFallback>
                                </Avatar>
                                <span className="text-sm font-medium text-foreground">
                                  {post.blogs?.blog_name}
                                </span>
                                <span className="text-muted-foreground">·</span>
                                <span className="text-sm text-muted-foreground">
                                  {post.byline}
                                </span>
                              </div>

                              {/* Headline */}
                              <h3 className="font-serif text-xl font-semibold text-foreground mb-2 group-hover:text-accent transition-colors line-clamp-2">
                                {post.headline}
                              </h3>

                              {/* Subtitle */}
                              {post.subtitle && (
                                <p className="text-muted-foreground line-clamp-2 mb-3">
                                  {post.subtitle}
                                </p>
                              )}

                              {/* Meta */}
                              <div className="flex items-center flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
                                <span className="flex items-center gap-1.5">
                                  <Calendar className="h-3.5 w-3.5" aria-hidden="true" />
                                  {formatDate(post.published_at)}
                                </span>
                                <span className="flex items-center gap-1.5">
                                  <Clock className="h-3.5 w-3.5" aria-hidden="true" />
                                  {getReadingTime(post.content)}
                                </span>
                                <span className="flex items-center gap-1.5">
                                  <Eye className="h-3.5 w-3.5" aria-hidden="true" />
                                  {formatNumber(post.view_count)}
                                </span>
                                <span className="flex items-center gap-1.5">
                                  <ThumbsUp className="h-3.5 w-3.5" aria-hidden="true" />
                                  {formatNumber(post.approval_count)}
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
          )}

          {/* Empty Initial State */}
          {!hasSearched && blogs.length === 0 && posts.length === 0 && !isLoading && (
            <div className="text-center py-20">
              <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-accent/10 flex items-center justify-center">
                <SearchIcon className="h-10 w-10 text-accent" />
              </div>
              <h2 className="font-serif text-2xl font-semibold text-foreground mb-3">
                Discover stories that matter
              </h2>
              <p className="text-muted-foreground max-w-md mx-auto">
                Search for publications by name or topic, or find stories about subjects you're interested in.
              </p>
            </div>
          )}
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default Search;