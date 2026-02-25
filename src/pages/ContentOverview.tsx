import { useSeo } from "@/hooks/useSeo";

export default function ContentOverview() {
  useSeo({
    title: "Content Overview",
    description: "Monitor and manage all posts, comments, and flagged content.",
    noindex: true,
  });
  return (
    <div className="min-h-screen flex flex-col items-center justify-center">
      <h1 className="text-2xl font-bold mb-4">Content Overview</h1>
      <p className="text-muted-foreground mb-8">Monitor all posts, comments, and flagged content across the platform.</p>
      {/* TODO: Implement content feed and moderation actions */}
    </div>
  );
}
