import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Cake, Sparkles, X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface CelebrationPost {
  id: string;
  celebration_type: "birthday" | "account_anniversary";
  post_content: string;
  expires_at: string;
}

interface CelebrationBannerProps {
  blogId?: string;
  userId?: string;
  variant?: "blog" | "dashboard";
}

export const CelebrationBanner = ({ blogId, userId, variant = "blog" }: CelebrationBannerProps) => {
  const [celebration, setCelebration] = useState<CelebrationPost | null>(null);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    const fetchCelebration = async () => {
      let query = supabase
        .from("celebration_posts")
        .select("id, celebration_type, post_content, expires_at")
        .eq("status", "active")
        .gt("expires_at", new Date().toISOString())
        .order("created_at", { ascending: false })
        .limit(1);

      if (blogId) {
        query = query.eq("blog_id", blogId);
      }
      if (userId) {
        query = query.eq("user_id", userId);
      }

      const { data } = await query.maybeSingle();
      if (data) {
        setCelebration(data as CelebrationPost);
      }
    };

    if (blogId || userId) {
      fetchCelebration();
    }
  }, [blogId, userId]);

  if (!celebration || dismissed) return null;

  const isBirthday = celebration.celebration_type === "birthday";

  return (
    <div
      role="banner"
      aria-label={isBirthday ? "Birthday celebration" : "Anniversary celebration"}
      className={`relative overflow-hidden rounded-2xl border p-5 md:p-6 ${
        variant === "dashboard"
          ? "bg-gradient-to-r from-accent/10 via-accent/5 to-background border-accent/30"
          : "bg-gradient-to-r from-amber-50 via-yellow-50 to-orange-50 dark:from-accent/10 dark:via-accent/5 dark:to-background border-accent/30"
      }`}
    >
      {/* Decorative dots */}
      <div className="absolute top-2 right-8 w-2 h-2 rounded-full bg-accent/30 animate-pulse" aria-hidden="true" />
      <div className="absolute bottom-3 left-12 w-1.5 h-1.5 rounded-full bg-accent/20 animate-pulse" aria-hidden="true" />

      <div className="flex items-start gap-4">
        <div
          className="flex-shrink-0 w-12 h-12 rounded-xl bg-accent/20 flex items-center justify-center"
          aria-hidden="true"
        >
          {isBirthday ? (
            <Cake className="h-6 w-6 text-accent" />
          ) : (
            <Sparkles className="h-6 w-6 text-accent" />
          )}
        </div>

        <div className="flex-1 min-w-0">
          <p className="font-serif font-bold text-foreground text-base md:text-lg mb-1">
            {isBirthday ? "🎂 Birthday Celebration!" : "🎉 Anniversary Celebration!"}
          </p>
          <p className="text-sm md:text-base text-muted-foreground leading-relaxed">
            {celebration.post_content}
          </p>
        </div>

        <Button
          variant="ghost"
          size="icon"
          className="flex-shrink-0 h-8 w-8 rounded-full"
          onClick={() => setDismissed(true)}
          aria-label="Dismiss celebration banner"
        >
          <X className="h-4 w-4" aria-hidden="true" />
        </Button>
      </div>
    </div>
  );
};
