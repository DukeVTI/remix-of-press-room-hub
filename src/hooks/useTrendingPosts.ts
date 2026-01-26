import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface TrendingPost {
  id: string;
  headline: string;
  published_at: string | null;
  view_count: number;
  approval_count: number;
  blog: {
    slug: string;
    blog_name: string;
    profile_photo_url: string;
  };
}

export function useTrendingPosts(limit = 6) {
  return useQuery({
    queryKey: ["trending-posts", limit],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("posts")
        .select(`
          id,
          headline,
          published_at,
          view_count,
          approval_count,
          blog:blogs!inner (
            slug,
            blog_name,
            profile_photo_url
          )
        `)
        .eq("status", "published")
        .order("view_count", { ascending: false })
        .order("approval_count", { ascending: false })
        .limit(limit);

      if (error) throw error;
      
      // Transform the data to match our interface
      return (data || []).map((post) => ({
        ...post,
        blog: Array.isArray(post.blog) ? post.blog[0] : post.blog,
      })) as TrendingPost[];
    },
  });
}

// Helper to estimate read time (assuming ~200 words per minute, ~5 chars per word)
export function estimateReadTime(content?: string): string {
  if (!content) return "1 min read";
  const words = content.length / 5;
  const minutes = Math.max(1, Math.ceil(words / 200));
  return `${minutes} min read`;
}

// Format date for display
export function formatPublishedDate(dateString: string | null): string {
  if (!dateString) return "Recently";
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}
