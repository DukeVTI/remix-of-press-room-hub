import { Newspaper, Users, Calendar, ArrowLeft, Loader2, Globe, Tag, FileText } from "lucide-react";
import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { Tables } from "@/integrations/supabase/types";
import { PRPHeader } from "@/components/ui/prp-header";

type Blog = Tables<"blogs">;

interface BlogWithDetails extends Blog {
  blog_categories: { name: string } | null;
  profiles: { first_name: string; last_name: string; screen_name: string | null } | null;
}

interface LanguageInfo {
  id: string;
  name: string;
}

const BlogAbout = () => {
  const { blogSlug } = useParams<{ blogSlug: string }>();
  
  const [blog, setBlog] = useState<BlogWithDetails | null>(null);
  const [languages, setLanguages] = useState<LanguageInfo[]>([]);
  const [postCount, setPostCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const init = async () => {
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

      // Fetch language names
      if (blogData.languages && blogData.languages.length > 0) {
        const { data: langData } = await supabase
          .from("blog_languages")
          .select("id, name")
          .in("id", blogData.languages);

        if (langData) {
          setLanguages(langData);
        }
      }

      // Get post count
      const { count } = await supabase
        .from("posts")
        .select("id", { count: "exact", head: true })
        .eq("blog_id", blogData.id)
        .eq("status", "published");

      setPostCount(count || 0);

      setIsLoading(false);
    };

    init();
  }, [blogSlug]);

  // Accepts a format string: 'MM/dd/yyyy' for numbers, default is 'long' (e.g., January 20, 2026)
  const formatDate = (dateString: string, format?: string) => {
    const date = new Date(dateString);
    if (format === 'MM/dd/yyyy') {
      const mm = String(date.getMonth() + 1).padStart(2, '0');
      const dd = String(date.getDate()).padStart(2, '0');
      const yyyy = date.getFullYear();
      return `${mm}/${dd}/${yyyy}`;
    }
    // Default: long format
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric"
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-accent" aria-label="Loading blog information" />
      </div>
    );
  }

  if (!blog) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <PRPHeader isAuthenticated={false} />
        <main id="main-content" className="flex-1 flex flex-col items-center justify-center px-4 py-16 text-center">
          <div className="card-premium max-w-lg w-full p-8 animate-fade-in">
            <h1 className="display-lg text-foreground mb-4">Blog Not Found</h1>
            <p className="body-md text-muted-foreground mb-8">
              The blog you're looking for doesn't exist or has been removed.
            </p>
            <Link to="/">
              <Button className="w-full btn-gold text-lg py-6 rounded-full shadow-md" aria-label="Go back to homepage">
                <ArrowLeft className="h-4 w-4 mr-2" aria-hidden="true" />
                Back to Home
              </Button>
            </Link>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <PRPHeader isAuthenticated={false} />
      <main id="main-content" role="main" className="flex-1 w-full bg-background">
        {/* Banner/Cover */}
        <div className="w-full h-48 md:h-64 bg-gradient-to-r from-pink-200/80 to-accent/30 flex items-end justify-center mb-0 relative border-b border-muted-foreground/10 shadow-md shadow-pink-100/40">
          {/* Optionally, use blog.cover_photo_url as background image */}
        </div>

        {/* Blog Header - Medium style */}
        <section className="flex flex-col items-center justify-center w-full max-w-3xl mx-auto px-4 -mt-24 mb-0 relative z-20">
          <div className="relative flex flex-col items-center">
            <Avatar className="h-32 w-32 border-4 border-white shadow-2xl bg-background -mt-12">
              <AvatarImage 
                src={blog.profile_photo_url} 
                alt={`${blog.blog_name} profile photo`}
              />
              <AvatarFallback className="text-4xl bg-accent text-accent-foreground">
                {blog.blog_name.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            {blog.is_verified && (
              <span className="absolute bottom-2 right-2 bg-green-500 text-white rounded-full px-2 py-0.5 text-xs shadow-md border-2 border-white">Verified</span>
            )}
          </div>
          <h1 id="about-heading" className="text-4xl md:text-5xl font-extrabold text-foreground font-serif leading-tight mt-4 mb-1 text-center">
            {blog.blog_name}
          </h1>
          <span className="text-lg text-muted-foreground mb-3 text-center">
            {blog.description || "A publication about ..."}
          </span>
          <div className="flex flex-wrap items-center justify-center gap-2 mb-3">
            <Badge variant="secondary" className="px-4 py-1 text-base font-medium rounded-full bg-muted-foreground/10 text-foreground">
              {blog.blog_categories?.name || "Uncategorized"}
            </Badge>
          </div>
          <div className="flex flex-row items-center justify-center gap-4 mb-4">
            <span className="text-base text-foreground font-semibold whitespace-nowrap"><span className="font-bold">{blog.follower_count}</span> followers</span>
            <span className="text-base text-muted-foreground whitespace-nowrap">· 1 editor</span>
            <Button className="rounded-full px-7 py-2 text-base font-semibold bg-foreground text-background shadow hover:bg-accent transition min-w-[110px]">Follow</Button>
          </div>
        </section>

        {/* Horizontal Nav Bar */}
        <nav className="w-full max-w-3xl mx-auto px-4 border-b border-muted-foreground/10 mb-10">
          <ul className="flex flex-row flex-wrap gap-2 md:gap-6 text-base font-semibold text-muted-foreground justify-center">
            <li><Link to={"/blog/" + blogSlug + "/about"} className="hover:text-accent focus:text-accent transition px-3 py-1 rounded-full">About</Link></li>
            <li><Link to={"/blog/" + blogSlug + "/posts"} className="hover:text-accent focus:text-accent transition px-3 py-1 rounded-full">Posts</Link></li>
            <li><Link to={"/blog/" + blogSlug + "/guidelines"} className="hover:text-accent focus:text-accent transition px-3 py-1 rounded-full">Guidelines</Link></li>
            <li><Link to={"/blog/" + blogSlug + "/editors"} className="hover:text-accent focus:text-accent transition px-3 py-1 rounded-full">Editors</Link></li>
          </ul>
        </nav>

        {/* Remove stats row for Medium style - stats are in header */}

        {/* Description - now after stats */}
        <section className="rounded-2xl border border-muted-foreground/5 bg-white mb-6 p-7 w-full max-w-3xl mx-auto animate-fade-in shadow-sm" aria-labelledby="description-heading">
          <h2 id="description-heading" className="headline-sm text-foreground mb-2 font-semibold">
            Description
          </h2>
          <p className="body-md text-muted-foreground leading-normal">
            {blog.description}
          </p>
        </section>

        {/* Languages */}
        {(languages.length > 0 || blog.custom_language) && (
          <section className="rounded-2xl border border-muted-foreground/5 bg-white mb-6 p-7 w-full max-w-3xl mx-auto animate-fade-in shadow-sm" aria-labelledby="languages-heading">
            <h2 id="languages-heading" className="headline-sm text-foreground mb-2 flex items-center gap-2 font-semibold">
              <Globe className="h-5 w-5 text-accent" aria-hidden="true" />
              Languages
            </h2>
            <div className="flex flex-wrap gap-2">
              {languages.map((lang) => (
                <Badge key={lang.id} variant="secondary" className="px-3 py-1 text-base font-medium">
                  {lang.name}
                </Badge>
              ))}
              {blog.custom_language && (
                <Badge variant="secondary" className="px-3 py-1 text-base font-medium">
                  {blog.custom_language}
                </Badge>
              )}
            </div>
          </section>
        )}

        {/* Publisher Link */}
        <section className="card-premium text-center p-5 w-full animate-fade-in" aria-label="Publisher information">
          <p className="body-md text-muted-foreground mb-3">
            Published by{" "}
            <Link 
              to={`/blog/${blogSlug}/publisher`}
              className="text-accent hover:underline font-medium"
            >
              {blog.profiles?.first_name} {blog.profiles?.last_name}
              {blog.profiles?.screen_name && ` (@${blog.profiles.screen_name})`}
            </Link>
          </p>
          <Link to={`/blog/${blogSlug}/publisher`}>
            <Button className="btn-gold text-base py-3 rounded-full shadow-md w-full max-w-xs mx-auto" aria-label="View full publisher profile">
              View Publisher Profile
            </Button>
          </Link>
        </section>
      </main>

      {/* Footer (optional, can use a shared Footer component if available) */}
    </div>
  );
};

export default BlogAbout;
