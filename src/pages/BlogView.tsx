import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Users, Eye, ThumbsUp, MessageSquare, ArrowLeft, Loader2, Pin, Clock, User, FileQuestion, Share2 } from "lucide-react";
import type { Tables } from "@/integrations/supabase/types";
import { PRPHeader } from "@/components/ui/prp-header";
import { Footer } from "@/components/Footer";
import { CelebrationBanner } from "@/components/CelebrationBanner";
import { toast } from "sonner";
import { useSeo, useStructuredData } from "@/hooks/useSeo";

type Blog = Tables<"blogs">;
type Post = Tables<"posts">;

interface BlogWithDetails extends Blog {
  blog_categories: { name: string } | null;
  profiles: { first_name: string; last_name: string; screen_name: string | null } | null;
}

interface PostWithMedia extends Post {
  media: { id: string; file_url: string; description: string; media_type: string }[];
}

const BlogView = () => {
  const { blogSlug } = useParams<{ blogSlug: string }>();

  const [blog, setBlog] = useState<BlogWithDetails | null>(null);
  const [posts, setPosts] = useState<PostWithMedia[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isFollowing, setIsFollowing] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [followLoading, setFollowLoading] = useState(false);

  // Dynamic SEO for blog
  useSeo({
    title: blog ? blog.blog_name : "Blog",
    description: blog ? blog.description : "Explore this publication on Press Room Publisher.",
    image: blog?.profile_photo_url,
    type: "website",
    keywords: blog ? [blog.blog_name, "blog", "publication", blog.blog_categories?.name || ""].filter(Boolean) : [],
  });

  // Structured data for blog
  useStructuredData(blog ? {
    "@context": "https://schema.org",
    "@type": "Blog",
    "name": blog.blog_name,
    "description": blog.description,
    "url": `https://press-pen-pro.lovable.app/blog/${blog.slug}`,
    "image": blog.profile_photo_url,
    "author": blog.profiles ? {
      "@type": "Person",
      "name": `${blog.profiles.first_name} ${blog.profiles.last_name}`,
    } : undefined,
    "genre": blog.blog_categories?.name,
  } : null);

  useEffect(() => {
    const init = async () => {
      // Check if user is logged in
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        setUserId(session.user.id);
      }

      // Fetch blog details
      const { data: blogData, error: blogError } = await supabase
        .from("blogs")
        .select(`
          *,
          blog_categories(name),
          profiles(first_name, last_name, screen_name)
        `)
        .eq("slug", blogSlug)
        .eq("status", "active")
        .maybeSingle();

      if (blogError || !blogData) {
        setIsLoading(false);
        return;
      }

      setBlog(blogData as BlogWithDetails);

      // Check if user is following this blog
      if (session) {
        const { data: followData } = await supabase
          .from("follows")
          .select("id")
          .eq("follower_id", session.user.id)
          .eq("blog_id", blogData.id)
          .maybeSingle();

        setIsFollowing(!!followData);
      }

      // Fetch published posts with media
      const { data: postsData } = await supabase
        .from("posts")
        .select(`
          *,
          media(id, file_url, description, media_type)
        `)
        .eq("blog_id", blogData.id)
        .eq("status", "published")
        .order("is_pinned", { ascending: false })
        .order("published_at", { ascending: false });

      if (postsData) {
        setPosts(postsData as PostWithMedia[]);
      }

      setIsLoading(false);
    };

    init();
  }, [blogSlug]);

  const handleFollow = async () => {
    if (!userId || !blog) return;

    setFollowLoading(true);

    if (isFollowing) {
      await supabase
        .from("follows")
        .delete()
        .eq("follower_id", userId)
        .eq("blog_id", blog.id);

      setIsFollowing(false);
      setBlog(prev => prev ? { ...prev, follower_count: prev.follower_count - 1 } : null);
    } else {
      await supabase
        .from("follows")
        .insert({ follower_id: userId, blog_id: blog.id });

      setIsFollowing(true);
      setBlog(prev => prev ? { ...prev, follower_count: prev.follower_count + 1 } : null);
    }

    setFollowLoading(false);
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric"
    });
  };

  const copyToClipboard = (text: string) => {
    // Universal clipboard copy — works on HTTP/localhost without secure context
    if (navigator.clipboard) {
      navigator.clipboard.writeText(text).then(() => {
        toast.success("Link copied to clipboard!");
      }).catch(() => {
        legacyCopy(text);
      });
    } else {
      legacyCopy(text);
    }
  };

  const legacyCopy = (text: string) => {
    const el = document.createElement("textarea");
    el.value = text;
    el.style.position = "fixed";
    el.style.opacity = "0";
    document.body.appendChild(el);
    el.focus();
    el.select();
    try {
      document.execCommand("copy");
      toast.success("Link copied to clipboard!");
    } catch {
      toast.error("Could not copy. Please copy this URL manually: " + text);
    }
    document.body.removeChild(el);
  };

  const handleShareBlog = async () => {
    if (!blog) return;
    const url = window.location.href;
    const shareText = `Follow ${blog.blog_name} on Press Room Publisher!`;
    if (navigator.share) {
      try {
        await navigator.share({ title: blog.blog_name, text: shareText, url });
        return;
      } catch {
        // Fall through to clipboard if user cancelled or share failed
      }
    }
    copyToClipboard(url);
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

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-accent" aria-label="Loading blog" />
      </div>
    );
  }

  if (!blog) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <a href="#main-content" className="skip-link">
          Skip to main content
        </a>

        <PRPHeader isAuthenticated={!!userId} />

        <main id="main-content" className="flex-1 section-container py-16 text-center">
          <div
            className="w-20 h-20 mx-auto mb-6 rounded-full bg-muted flex items-center justify-center"
            aria-hidden="true"
          >
            <FileQuestion className="h-10 w-10 text-muted-foreground" />
          </div>
          <h1 className="display-lg text-foreground mb-4">Publication not found</h1>
          <p className="body-md text-muted-foreground mb-8">
            The publication you're looking for doesn't exist or has been removed.
          </p>
          <Link to="/">
            <Button className="btn-accent rounded-full" aria-label="Go back to homepage">
              <ArrowLeft className="h-4 w-4 mr-2" aria-hidden="true" />
              Back to home
            </Button>
          </Link>
        </main>

        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <PRPHeader isAuthenticated={!!userId} />

      <main id="main-content" role="main" className="flex-1">
        {/* Banner/Cover */}
        <div className="w-full h-48 md:h-64 bg-gradient-to-r from-muted to-accent/20 flex items-end justify-center mb-0 relative border-b border-border" />

        {/* Blog Hero Section - Medium style */}
        <section className="flex flex-col items-center justify-center w-full max-w-3xl mx-auto px-4 -mt-24 mb-0 relative z-20">
          <div className="relative flex flex-col items-center">
            <Avatar className="h-32 w-32 border-4 border-background shadow-xl bg-background -mt-12">
              <AvatarImage
                src={blog.profile_photo_url}
                alt={blog.profile_photo_alt || `${blog.blog_name} profile photo`}
              />
              <AvatarFallback className="text-4xl bg-accent text-accent-foreground">
                {blog.blog_name.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            {blog.is_verified && (
              <span className="absolute bottom-2 right-2 bg-accent text-accent-foreground rounded-full px-2 py-0.5 text-xs shadow-md border-2 border-background">Verified</span>
            )}
          </div>
          <h1 id="blog-heading" className="display-lg text-foreground mt-4 mb-1 text-center">
            {blog.blog_name}
          </h1>
          <span className="body-lg text-muted-foreground mb-3 text-center">
            {blog.description}
          </span>
          <div className="flex flex-wrap items-center justify-center gap-2 mb-3">
            <Badge variant="secondary" className="px-4 py-1 text-base font-medium rounded-full bg-muted-foreground/10 text-foreground">
              {blog.blog_categories?.name || "Uncategorized"}
            </Badge>
          </div>
          <div className="flex flex-row items-center justify-center gap-4 mb-4 flex-wrap">
            <span className="text-base text-foreground font-medium whitespace-nowrap"><span className="font-semibold">{formatNumber(blog.follower_count)}</span> followers</span>
            <span className="text-base text-muted-foreground whitespace-nowrap">· Since {formatDate(blog.created_at)}</span>
            {userId ? (
              <Button
                onClick={handleFollow}
                disabled={followLoading}
                className={isFollowing ? "btn-outline rounded-full" : "btn-accent rounded-full"}
                aria-label={isFollowing ? `Unfollow ${blog.blog_name}` : `Follow ${blog.blog_name}`}
              >
                {followLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                ) : (
                  <>
                    <Users className="h-4 w-4 mr-2" aria-hidden="true" />
                    {isFollowing ? "Following" : "Follow"}
                  </>
                )}
              </Button>
            ) : (
              <Link to="/login">
                <Button className="btn-accent rounded-full" aria-label="Sign in to follow this publication">
                  <Users className="h-4 w-4 mr-2" aria-hidden="true" />
                  Follow
                </Button>
              </Link>
            )}
            <Button
              variant="outline"
              size="sm"
              onClick={handleShareBlog}
              className="rounded-full"
              aria-label={`Share ${blog.blog_name} profile link`}
            >
              <Share2 className="h-4 w-4 mr-2" aria-hidden="true" />
              Share
            </Button>
          </div>
          <div className="flex flex-row flex-wrap gap-2 md:gap-6 text-base font-medium text-muted-foreground justify-center border-b border-border w-full pb-2 mb-8">
            <Link to={`/blog/${blogSlug}/posts`} className="hover:text-accent focus:text-accent transition px-3 py-1 rounded-full">Posts</Link>
            <Link to={`/blog/${blogSlug}/guidelines`} className="hover:text-accent focus:text-accent transition px-3 py-1 rounded-full">Guidelines</Link>
            <Link to={`/blog/${blogSlug}/editors`} className="hover:text-accent focus:text-accent transition px-3 py-1 rounded-full">Editors</Link>
          </div>
        </section>

        {/* Celebration Banner */}
        <div className="max-w-3xl mx-auto px-4 mb-6">
          <CelebrationBanner blogId={blog.id} variant="blog" />
        </div>

        {/* Posts Section */}
        <section
          className="section-default bg-background"
          aria-labelledby="posts-heading"
        >
          <div className="section-container">
            <h2 id="posts-heading" className="heading-xl text-foreground mb-8">
              Latest stories
            </h2>

            {posts.length === 0 ? (
              <div className="card-premium text-center py-16">
                <div
                  className="w-16 h-16 mx-auto mb-4 rounded-full bg-muted flex items-center justify-center"
                  aria-hidden="true"
                >
                  <FileQuestion className="h-8 w-8 text-muted-foreground" />
                </div>
                <h3 className="heading-md text-foreground mb-2">No stories yet</h3>
                <p className="body-md text-muted-foreground">
                  This blog hasn't published any posts yet. Check back soon!
                </p>
              </div>
            ) : (
              <div className="grid gap-6">
                {posts.map((post) => (
                  <article
                    key={post.id}
                    className="editorial-card hover:shadow-lg transition-shadow"
                  >
                    <Link
                      to={`/blog/${blogSlug}/post/${post.id}`}
                      className="block"
                      aria-label={`Read article: ${post.headline}`}
                    >
                      <div className="flex flex-col md:flex-row gap-6">
                        {/* Post Thumbnail */}
                        {post.media && post.media.length > 0 && post.media[0].media_type === "image" && (
                          <div className="md:w-48 md:h-32 flex-shrink-0">
                            <img
                              src={post.media[0].file_url}
                              alt={post.media[0].description}
                              className="w-full h-48 md:h-32 object-cover rounded-lg"
                            />
                          </div>
                        )}

                        {/* Post Content */}
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            {post.is_pinned && (
                              <Badge variant="secondary" className="bg-accent/20 text-accent">
                                <Pin className="h-3 w-3 mr-1" aria-hidden="true" />
                                Pinned
                              </Badge>
                            )}
                          </div>

                          <h3 className="headline-sm text-foreground mb-2 hover:text-accent transition-colors">
                            {post.headline}
                          </h3>

                          {post.subtitle && (
                            <p className="body-md text-muted-foreground mb-3 line-clamp-2">
                              {post.subtitle}
                            </p>
                          )}

                          <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <User className="h-4 w-4" aria-hidden="true" />
                              <span>{post.byline}</span>
                            </span>
                            <span className="flex items-center gap-1">
                              <Clock className="h-4 w-4" aria-hidden="true" />
                              <time dateTime={post.published_at || ""}>
                                {formatDate(post.published_at)}
                              </time>
                            </span>
                          </div>

                          <div className="flex flex-wrap items-center gap-4 mt-3 text-sm text-muted-foreground">
                            <span
                              className="flex items-center gap-1"
                              aria-label={`${post.view_count} views`}
                            >
                              <Eye className="h-4 w-4" aria-hidden="true" />
                              <span>{formatNumber(post.view_count)}</span>
                            </span>
                            <span
                              className="flex items-center gap-1"
                              aria-label={`${post.approval_count} approvals`}
                            >
                              <ThumbsUp className="h-4 w-4" aria-hidden="true" />
                              <span>{formatNumber(post.approval_count)}</span>
                            </span>
                            <span
                              className="flex items-center gap-1"
                              aria-label={`${post.comment_count} comments`}
                            >
                              <MessageSquare className="h-4 w-4" aria-hidden="true" />
                              <span>{formatNumber(post.comment_count)}</span>
                            </span>
                          </div>
                        </div>
                      </div>
                    </Link>
                  </article>
                ))}
              </div>
            )}
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default BlogView;
