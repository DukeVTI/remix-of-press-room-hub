import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  ArrowLeft,
  Loader2,
  Calendar,
  Cake,
  BookOpen,
  Heart,
  User,
  FileQuestion
} from "lucide-react";
import type { Tables } from "@/integrations/supabase/types";
import { PRPHeader } from "@/components/ui/prp-header";
import { Footer } from "@/components/Footer";
import { useSeo, useStructuredData } from "@/hooks/useSeo";

type Blog = Tables<"blogs">;

// Public profile fields only — excludes email, email_verified, has_seen_welcome (PII)
type PublicProfile = Pick<Tables<"profiles">,
  | "id" | "first_name" | "last_name" | "middle_name" | "screen_name"
  | "profile_photo_url" | "profile_photo_alt" | "bio" | "hobbies"
  | "date_of_birth" | "created_at" | "account_status" | "is_verified"
>;

interface BlogWithCategory extends Blog {
  blog_categories: { name: string } | null;
}

const PublisherProfile = () => {
  const { blogSlug } = useParams<{ blogSlug: string }>();
  
  const [blog, setBlog] = useState<Blog | null>(null);
  const [publisher, setPublisher] = useState<PublicProfile | null>(null);
  const [publisherBlogs, setPublisherBlogs] = useState<BlogWithCategory[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Dynamic SEO based on publisher
  useSeo({
    title: publisher ? `${publisher.first_name} ${publisher.last_name}` : "Publisher Profile",
    description: publisher ? (publisher.bio || `View ${publisher.first_name} ${publisher.last_name}'s profile and publications on Press Room Publisher.`) : "Publisher profile on Press Room Publisher.",
    image: publisher?.profile_photo_url,
    type: "profile",
    author: publisher ? `${publisher.first_name} ${publisher.last_name}` : undefined,
  });

  // Structured data for publisher
  useStructuredData(publisher ? {
    "@context": "https://schema.org",
    "@type": "Person",
    "name": `${publisher.first_name} ${publisher.last_name}`,
    "description": publisher.bio,
    "image": publisher.profile_photo_url,
    "owns": publisherBlogs.map(blog => ({
      "@type": "Blog",
      "name": blog.blog_name,
      "url": `https://press-pen-pro.lovable.app/blog/${blog.slug}`,
    })),
  } : null);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    const init = async () => {
      // Check auth
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        setUserId(session.user.id);
      }

      // Fetch blog details
      const { data: blogData, error: blogError } = await supabase
        .from("blogs")
        .select("*")
        .eq("slug", blogSlug)
        .eq("status", "active")
        .maybeSingle();

      if (blogError || !blogData) {
        setIsLoading(false);
        return;
      }

      setBlog(blogData);

      // Fetch publisher profile — only non-sensitive public fields (no email, no full DOB)
      const { data: profileData } = await supabase
        .from("profiles")
        .select("id, first_name, last_name, middle_name, screen_name, profile_photo_url, profile_photo_alt, bio, hobbies, date_of_birth, created_at, account_status, is_verified")
        .eq("id", blogData.owner_id)
        .maybeSingle();

      if (profileData) {
        setPublisher(profileData);

        // Fetch all public blogs by this publisher
        const { data: blogsData } = await supabase
          .from("blogs")
          .select(`
            *,
            blog_categories(name)
          `)
          .eq("owner_id", profileData.id)
          .eq("status", "active")
          .order("created_at", { ascending: false });

        if (blogsData) {
          setPublisherBlogs(blogsData as BlogWithCategory[]);
        }
      }

      setIsLoading(false);
    };

    init();
  }, [blogSlug]);

  const formatBirthday = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "long",
      day: "numeric"
    });
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long"
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-accent" aria-label="Loading publisher profile" />
      </div>
    );
  }

  if (!blog || !publisher) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <PRPHeader isAuthenticated={!!userId} />

        <main id="main-content" className="flex-1 section-container py-16 text-center">
          <div 
            className="w-20 h-20 mx-auto mb-6 rounded-full bg-muted flex items-center justify-center"
            aria-hidden="true"
          >
            <FileQuestion className="h-10 w-10 text-muted-foreground" />
          </div>
          <h1 className="display-lg text-foreground mb-4">Publisher not found</h1>
          <p className="body-md text-muted-foreground mb-8">
            The publisher profile you're looking for doesn't exist.
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

      <main id="main-content" role="main" className="flex-1 max-w-3xl mx-auto px-4 sm:px-6 py-12 w-full">
        {/* Publisher Header */}
        <section className="text-center mb-12" aria-labelledby="publisher-heading">
          <Avatar className="h-32 w-32 mx-auto mb-6 border-4 border-accent">
            <AvatarImage 
              src={publisher.profile_photo_url || undefined} 
              alt={(publisher as any).profile_photo_alt || `${publisher.first_name} ${publisher.last_name} profile photo`}
            />
            <AvatarFallback className="text-3xl bg-accent text-accent-foreground">
              {publisher.first_name.charAt(0)}{publisher.last_name.charAt(0)}
            </AvatarFallback>
          </Avatar>

          <h1 id="publisher-heading" className="display-lg text-foreground mb-2">
            {publisher.first_name} {publisher.middle_name ? `${publisher.middle_name} ` : ""}{publisher.last_name}
          </h1>

          {publisher.screen_name && (
            <p className="text-lg text-accent mb-4">
              @{publisher.screen_name}
            </p>
          )}

          <div className="flex flex-wrap items-center justify-center gap-4 text-muted-foreground">
            {publisher.is_verified && (
              <Badge variant="secondary" className="bg-green-500/20 text-green-600">
                Verified Publisher
              </Badge>
            )}
            <span className="flex items-center gap-1">
              <Calendar className="h-4 w-4" aria-hidden="true" />
              <span>Joined {formatDate(publisher.created_at)}</span>
            </span>
            <span className="flex items-center gap-1">
              <Cake className="h-4 w-4" aria-hidden="true" />
              <span>Birthday: {formatBirthday(publisher.date_of_birth)}</span>
            </span>
          </div>
        </section>

        {/* Bio */}
        {publisher.bio && (
          <section className="card-premium mb-8" aria-labelledby="bio-heading">
            <h2 id="bio-heading" className="heading-md text-foreground mb-4 flex items-center gap-2">
              <User className="h-5 w-5 text-accent" aria-hidden="true" />
              About
            </h2>
            <p className="body-lg text-muted-foreground leading-relaxed">
              {publisher.bio}
            </p>
          </section>
        )}

        {/* Hobbies */}
        {publisher.hobbies && (
          <section className="card-premium mb-8" aria-labelledby="hobbies-heading">
            <h2 id="hobbies-heading" className="heading-md text-foreground mb-4 flex items-center gap-2">
              <Heart className="h-5 w-5 text-accent" aria-hidden="true" />
              Hobbies & Interests
            </h2>
            <p className="body-md text-muted-foreground">
              {publisher.hobbies}
            </p>
          </section>
        )}

        {/* Publisher's Blogs */}
        <section aria-labelledby="blogs-heading">
          <h2 id="blogs-heading" className="heading-md text-foreground mb-6 flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-accent" aria-hidden="true" />
            Publications by {publisher.first_name} ({publisherBlogs.length})
          </h2>

          {publisherBlogs.length === 0 ? (
            <p className="body-md text-muted-foreground text-center py-8">
              No public blogs yet.
            </p>
          ) : (
            <div className="grid gap-4">
              {publisherBlogs.map((b) => (
                <Link
                  key={b.id}
                  to={`/blog/${b.slug}`}
                  className="card-premium hover:shadow-lg transition-shadow flex items-center gap-4"
                  aria-label={`Visit ${b.blog_name}`}
                >
                  <Avatar className="h-16 w-16 flex-shrink-0">
                    <AvatarImage 
                      src={b.profile_photo_url} 
                      alt={b.profile_photo_alt || `${b.blog_name} profile photo`}
                    />
                    <AvatarFallback>
                      {b.blog_name.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-serif font-bold text-foreground truncate">
                        {b.blog_name}
                      </h3>
                      {b.slug === blogSlug && (
                        <Badge variant="outline" className="text-xs">
                          Current
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground line-clamp-1">
                      {b.description}
                    </p>
                    <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                      <span>{b.blog_categories?.name}</span>
                      <span>{b.follower_count} followers</span>
                    </div>
                  </div>
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

export default PublisherProfile;
