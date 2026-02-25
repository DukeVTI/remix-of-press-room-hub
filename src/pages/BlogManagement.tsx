import { useSeo } from "@/hooks/useSeo";

export default function BlogManagement() {
  useSeo({
    title: "Blog Management",
    description: "Feature, verify, or moderate blogs and categories.",
    noindex: true,
  });
  return (
    <div className="min-h-screen flex flex-col items-center justify-center">
      <h1 className="text-2xl font-bold mb-4">Blog Management</h1>
      <p className="text-muted-foreground mb-8">Manage all blogs, categories, and featured publications.</p>
      {/* TODO: Implement blog directory and category management */}
    </div>
  );
}
