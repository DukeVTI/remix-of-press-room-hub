import { useSeo } from "@/hooks/useSeo";

export default function UserManagement() {
  useSeo({
    title: "User Management",
    description: "Suspend, verify, or manage user accounts across the platform.",
    noindex: true,
  });
  return (
    <div className="min-h-screen flex flex-col items-center justify-center">
      <h1 className="text-2xl font-bold mb-4">User Management</h1>
      <p className="text-muted-foreground mb-8">Search, filter, and manage all user accounts.</p>
      {/* TODO: Implement user directory and account actions */}
    </div>
  );
}
