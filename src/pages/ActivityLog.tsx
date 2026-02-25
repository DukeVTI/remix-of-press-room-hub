import { useSeo } from "@/hooks/useSeo";

export default function ActivityLog() {
  useSeo({
    title: "Admin Activity Log",
    description: "Audit trail of all admin actions and moderation events.",
    noindex: true,
  });
  return (
    <div className="min-h-screen flex flex-col items-center justify-center">
      <h1 className="text-2xl font-bold mb-4">Admin Activity Log</h1>
      <p className="text-muted-foreground mb-8">Track all admin actions and moderation events for accountability.</p>
      {/* TODO: Implement audit log table and filters */}
    </div>
  );
}
