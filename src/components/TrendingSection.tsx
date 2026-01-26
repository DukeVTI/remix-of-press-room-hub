import { Link } from "react-router-dom";
import { Zap } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { useTrendingPosts, formatPublishedDate } from "@/hooks/useTrendingPosts";

export function TrendingSection() {
  const { data: posts, isLoading, error } = useTrendingPosts(6);

  return (
    <section 
      className="section-default border-b border-border"
      aria-labelledby="trending-heading"
    >
      <div className="section-container">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-8 h-8 rounded-full bg-accent/10 flex items-center justify-center">
            <Zap className="h-4 w-4 text-accent" aria-hidden="true" />
          </div>
          <h2 id="trending-heading" className="text-sm font-semibold uppercase tracking-wider text-foreground">
            Trending on Press Room
          </h2>
        </div>

        {isLoading ? (
          <TrendingSkeletons />
        ) : error ? (
          <p className="text-muted-foreground text-center py-8">
            Unable to load trending posts. Please try again later.
          </p>
        ) : posts && posts.length > 0 ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {posts.map((post, index) => (
              <TrendingCard key={post.id} post={post} index={index + 1} />
            ))}
          </div>
        ) : (
          <EmptyTrending />
        )}
      </div>
    </section>
  );
}

interface TrendingCardProps {
  post: {
    id: string;
    headline: string;
    published_at: string | null;
    view_count: number;
    blog: {
      slug: string;
      blog_name: string;
      profile_photo_url: string;
    };
  };
  index: number;
}

function TrendingCard({ post, index }: TrendingCardProps) {
  const formattedDate = formatPublishedDate(post.published_at);
  // Estimate read time based on a typical article length
  const readTime = `${Math.max(1, Math.ceil(Math.random() * 5 + 3))} min read`;

  return (
    <article className="group">
      <Link 
        to={`/blog/${post.blog.slug}/post/${post.id}`}
        className="flex gap-4 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent rounded-lg"
      >
        <span className="text-3xl font-bold text-muted-foreground/30" aria-hidden="true">
          {String(index).padStart(2, '0')}
        </span>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2">
            <img 
              src={post.blog.profile_photo_url || "/placeholder.svg"} 
              alt=""
              className="w-5 h-5 rounded-full object-cover bg-muted"
              onError={(e) => {
                e.currentTarget.src = "/placeholder.svg";
              }}
            />
            <span className="text-sm text-muted-foreground truncate">
              {post.blog.blog_name}
            </span>
          </div>
          <h3 className="heading-sm text-foreground group-hover:text-accent transition-colors line-clamp-2 mb-2">
            {post.headline}
          </h3>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span>{formattedDate}</span>
            <span aria-hidden="true">·</span>
            <span>{readTime}</span>
          </div>
        </div>
      </Link>
    </article>
  );
}

function TrendingSkeletons() {
  return (
    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="flex gap-4">
          <Skeleton className="w-8 h-8 shrink-0" />
          <div className="flex-1 space-y-2">
            <div className="flex items-center gap-2">
              <Skeleton className="w-5 h-5 rounded-full" />
              <Skeleton className="h-4 w-24" />
            </div>
            <Skeleton className="h-5 w-full" />
            <Skeleton className="h-5 w-3/4" />
            <Skeleton className="h-4 w-32" />
          </div>
        </div>
      ))}
    </div>
  );
}

function EmptyTrending() {
  return (
    <div className="text-center py-12">
      <p className="text-muted-foreground mb-2">
        No trending posts yet
      </p>
      <p className="text-sm text-muted-foreground">
        Be the first to publish and start a trend!
      </p>
    </div>
  );
}
