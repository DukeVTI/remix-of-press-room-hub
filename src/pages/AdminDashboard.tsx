import { useSeo } from "@/hooks/useSeo";

export default function AdminDashboard() {
  useSeo({
    title: "Admin Dashboard",
    description: "Platform-wide moderation, analytics, and management for Press Room Publisher.",
    noindex: true,
  });
  return (
    <div className="min-h-screen flex flex-col items-center justify-center">
      <h1 className="text-3xl font-bold mb-4">Platform Admin Dashboard</h1>
      <p className="text-muted-foreground mb-8">Welcome, platform administrator. Use the sidebar to access moderation, analytics, and management tools.</p>
      {/* TODO: Add cards for Reports, Users, Content, Blogs, Analytics, Activity Log */}
    </div>
  );
}
