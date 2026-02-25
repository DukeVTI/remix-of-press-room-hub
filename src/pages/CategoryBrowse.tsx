import { useState, useEffect } from "react";
import { Link, useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  ArrowLeft,
  Loader2,
  Users,
  Calendar,
  Tag,
  ArrowRight,
  FileQuestion
} from "lucide-react";
import type { Tables } from "@/integrations/supabase/types";
import { PRPHeader } from "@/components/ui/prp-header";
import { Footer } from "@/components/Footer";
import { useSeo } from "@/hooks/useSeo";

type Blog = Tables<"blogs">;
type BlogCategory = Tables<"blog_categories">;

interface BlogWithCategory extends Blog {
  blog_categories: { name: string } | null;
}

const CategoryBrowse = () => {
  const { categorySlug } = useParams<{ categorySlug: string }>();
  
  const [category, setCategory] = useState<BlogCategory | null>(null);
  const [blogs, setBlogs] = useState<BlogWithCategory[]>([]);
  const [allCategories, setAllCategories] = useState<BlogCategory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);

  useSeo({
    title: category ? `${category.name} - Browse Category` : "Browse Category",
    description: category ? `Explore publications in the ${category.name} category on Press Room Publisher.` : "Browse publications by category on Press Room Publisher.",
    keywords: category ? [category.name, "category", "browse blogs", "publications"] : ["categories", "browse", "discover"],
  });

  useEffect(() => {
    const init = async () => {
      // Check auth
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        setUserId(session.user.id);
      }

      // Fetch all categories for sidebar
      const { data: categoriesData } = await supabase
        .from("blog_categories")
        .select("*")
        .order("name");

      if (categoriesData) {
        setAllCategories(categoriesData);
      }

      // Find the category by slug
      const targetCategory = categoriesData?.find(c => c.slug === categorySlug);
      
      if (!targetCategory) {
        setIsLoading(false);
        return;
      }

      setCategory(targetCategory);

      // Fetch blogs in this category
      const { data: blogsData } = await supabase
        .from("blogs")
        .select("*, blog_categories(name)")
        .eq("category_id", targetCategory.id)
        .eq("status", "active")
        .order("follower_count", { ascending: false });

      if (blogsData) {
        setBlogs(blogsData as BlogWithCategory[]);
      }

      setIsLoading(false);
    };

    init();
  }, [categorySlug]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short"
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

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-accent" aria-label="Loading category" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <PRPHeader isAuthenticated={!!userId} />

      <div className="flex-1 max-w-6xl mx-auto px-4 sm:px-6 py-8 w-full">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar - Categories List */}
          <aside className="lg:w-64 flex-shrink-0" aria-label="Categories navigation">
            <div className="card-premium sticky top-24 p-6">
              <h2 className="heading-md text-foreground mb-4 flex items-center gap-2">
                <Tag className="h-5 w-5 text-accent" aria-hidden="true" />
                Categories
              </h2>
              
              <nav aria-label="All categories">
                <ul className="space-y-1" role="list">
                  {allCategories.map((cat) => (
                    <li key={cat.id}>
                      <Link
                        to={`/category/${cat.slug}`}
                        className={`
                          block px-3 py-2 rounded-lg text-sm transition-colors
                          ${cat.slug === categorySlug 
                            ? "bg-accent text-accent-foreground font-medium" 
                            : "text-muted-foreground hover:text-foreground hover:bg-muted"}
                        `}
                        aria-current={cat.slug === categorySlug ? "page" : undefined}
                        aria-label={`Browse ${cat.name} blogs`}
                      >
                        {cat.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </nav>
            </div>
          </aside>

          {/* Main Content */}
          <main id="main-content" role="main" className="flex-1 min-w-0">
            {!category ? (
              <div className="text-center py-16">
                <div 
                  className="w-20 h-20 mx-auto mb-6 rounded-full bg-muted flex items-center justify-center"
                  aria-hidden="true"
                >
                  <FileQuestion className="h-10 w-10 text-muted-foreground" />
                </div>
                <h1 className="display-lg text-foreground mb-4">Category not found</h1>
                <p className="body-md text-muted-foreground mb-8">
                  The category you're looking for doesn't exist.
                </p>
                <Link to="/">
                  <Button className="btn-accent rounded-full" aria-label="Go back to homepage">
                    <ArrowLeft className="h-4 w-4 mr-2" aria-hidden="true" />
                    Back to home
                  </Button>
                </Link>
              </div>
            ) : (
              <>
                {/* Category Header */}
                <section className="mb-8" aria-labelledby="category-heading">
                  <Link 
                    to="/" 
                    className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-4"
                    aria-label="Back to home"
                  >
                    <ArrowLeft className="h-4 w-4" aria-hidden="true" />
                    All Categories
                  </Link>
                  
                  <h1 id="category-heading" className="display-lg text-foreground mb-2">
                    {category.name}
                  </h1>
                  <p className="body-lg text-muted-foreground">
                    {blogs.length} blog{blogs.length !== 1 ? "s" : ""} in this category
                  </p>
                </section>

                {/* Blogs List */}
                {blogs.length === 0 ? (
                  <div className="card-premium text-center py-12">
                    <div 
                      className="w-16 h-16 mx-auto mb-4 rounded-full bg-muted flex items-center justify-center"
                      aria-hidden="true"
                    >
                      <FileQuestion className="h-8 w-8 text-muted-foreground" />
                    </div>
                    <h2 className="heading-md text-foreground mb-2">No blogs yet</h2>
                    <p className="body-md text-muted-foreground mb-6">
                      Be the first to create a blog in this category!
                    </p>
                    <Link to="/register">
                      <Button className="btn-accent rounded-full" aria-label="Create a blog in this category">
                        Start Your Blog
                      </Button>
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-4" role="list" aria-label={`Blogs in ${category.name}`}>
                    {blogs.map((blog) => (
                      <Link 
                        key={blog.id} 
                        to={`/blog/${blog.slug}`}
                        className="block"
                      >
                        <article 
                          className="card-premium hover:border-accent/50 transition-colors"
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
                                  <h2 className="heading-md text-foreground mb-1">
                                    {blog.blog_name}
                                  </h2>
                                  {blog.is_verified && (
                                    <Badge variant="secondary" className="bg-green-500/20 text-green-700 mb-2">
                                      Verified
                                    </Badge>
                                  )}
                                </div>
                                <ArrowRight className="h-5 w-5 text-muted-foreground flex-shrink-0" aria-hidden="true" />
                              </div>

                              <p className="body-md text-muted-foreground line-clamp-2 mb-3">
                                {blog.description}
                              </p>

                              <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
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
              </>
            )}
          </main>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default CategoryBrowse;
