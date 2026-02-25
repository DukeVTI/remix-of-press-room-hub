import { useSeo } from "@/hooks/useSeo";

export default function ReportsModeration() {
  useSeo({
    title: "Moderate Reports",
    description: "Review and resolve user reports for posts, comments, blogs, and users.",
    noindex: true,
  });
  return (
    <div className="min-h-screen flex flex-col items-center justify-center">
      <h1 className="text-2xl font-bold mb-4">Reports Moderation</h1>
      <p className="text-muted-foreground mb-8">Review, filter, and resolve all pending reports across the platform.</p>
      {/* TODO: Implement reports table and moderation actions */}
    </div>
  );
}
