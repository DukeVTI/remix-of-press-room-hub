import { useEffect, useState } from "react";
import { useSeo } from "@/hooks/useSeo";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { AdminStatCard } from "@/components/admin/AdminStatCard";
import { supabase } from "@/integrations/supabase/client";
import { useAdminAuth } from "@/hooks/useAdminAuth";
import { AdminBadge } from "@/components/admin/AdminBadge";
import {
  Users, BookOpen, FileText, Flag, Activity, AlertTriangle, ArrowRight,
} from "lucide-react";
import { Link } from "react-router-dom";
import { formatDistanceToNow } from "date-fns";
import { cn } from "@/lib/utils";

interface Stats {
  users: number;
  blogs: number;
  posts: number;
  pendingReports: number;
}

interface RecentActivity {
  id: string;
  action_type: string;
  target_type: string;
  created_at: string;
}

export default function AdminDashboard() {
  useSeo({ title: "Admin Dashboard", description: "Platform admin overview.", noindex: true });
  const { adminRole } = useAdminAuth();
  const [stats, setStats] = useState<Stats | null>(null);
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadDashboard() {
      const [
        { count: users },
        { count: blogs },
        { count: posts },
        { count: pendingReports },
        { data: activity },
      ] = await Promise.all([
        supabase.from("profiles").select("*", { count: "exact", head: true }),
        supabase.from("blogs").select("*", { count: "exact", head: true }),
        supabase.from("posts").select("*", { count: "exact", head: true }).eq("status", "published"),
        supabase.from("reports").select("*", { count: "exact", head: true }).eq("status", "pending"),
        supabase
          .from("admin_activity_log")
          .select("id, action_type, target_type, created_at")
          .order("created_at", { ascending: false })
          .limit(8),
      ]);
      setStats({ users: users ?? 0, blogs: blogs ?? 0, posts: posts ?? 0, pendingReports: pendingReports ?? 0 });
      setRecentActivity(activity ?? []);
      setLoading(false);
    }
    loadDashboard();
  }, []);

  const ACTION_LABEL: Record<string, string> = {
    resolve: "Resolved report",
    dismiss: "Dismissed report",
    warn: "Warned user",
    suspend: "Suspended user",
    escalate: "Escalated report",
    delete: "Deleted content",
    feature: "Featured blog",
    verify: "Verified blog",
  };

  return (
    <AdminLayout title="Dashboard">
      {/* Welcome strip */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 mb-1">Platform Overview</h1>
          <p className="text-gray-500 text-sm">Welcome back. Here's what's happening on the platform.</p>
        </div>
        <AdminBadge role={adminRole} />
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-8">
        <AdminStatCard label="Total Users" value={stats?.users ?? 0} icon={Users} accent="green" loading={loading} />
        <AdminStatCard label="Total Blogs" value={stats?.blogs ?? 0} icon={BookOpen} accent="blue" loading={loading} />
        <AdminStatCard label="Published Posts" value={stats?.posts ?? 0} icon={FileText} accent="purple" loading={loading} />
        <AdminStatCard
          label="Pending Reports"
          value={stats?.pendingReports ?? 0}
          icon={Flag}
          accent={stats?.pendingReports ? "rose" : "amber"}
          loading={loading}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Activity */}
        <div className="lg:col-span-2 rounded-xl border border-gray-200 bg-white p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Activity className="w-4 h-4 text-green-500" />
              <h2 className="text-gray-800 font-semibold text-sm">Recent Activity</h2>
            </div>
            <Link
              to="/admin/activity-log"
              className="text-xs text-green-600 hover:text-green-700 flex items-center gap-1"
            >
              View all <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
          {loading ? (
            <div className="space-y-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="h-10 bg-gray-100 rounded-lg animate-pulse" />
              ))}
            </div>
          ) : recentActivity.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 text-gray-400">
              <Activity className="w-8 h-8 mb-2 opacity-40" />
              <p className="text-sm">No activity yet</p>
            </div>
          ) : (
            <div className="space-y-1">
              {recentActivity.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between py-2.5 px-3 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <span className="w-2 h-2 rounded-full bg-green-500 flex-shrink-0" />
                    <span className="text-gray-700 text-sm">
                      {ACTION_LABEL[item.action_type] ?? item.action_type}{" "}
                      <span className="text-gray-400">on {item.target_type}</span>
                    </span>
                  </div>
                  <span className="text-gray-400 text-xs whitespace-nowrap">
                    {formatDistanceToNow(new Date(item.created_at), { addSuffix: true })}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div className="rounded-xl border border-gray-200 bg-white p-5">
          <h2 className="text-gray-800 font-semibold text-sm mb-4">Quick Actions</h2>
          <div className="space-y-1">
            {[
              { label: "Review Pending Reports", href: "/admin/reports", icon: Flag, color: "text-rose-500" },
              { label: "Manage Users", href: "/admin/users", icon: Users, color: "text-blue-500" },
              { label: "Content Overview", href: "/admin/content", icon: FileText, color: "text-green-600" },
              { label: "Blog Management", href: "/admin/blogs", icon: BookOpen, color: "text-purple-500" },
              { label: "View Analytics", href: "/admin/analytics", icon: Activity, color: "text-amber-500" },
            ].map(({ label, href, icon: Icon, color }) => (
              <Link
                key={href}
                to={href}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm",
                  "text-gray-600 hover:text-gray-900 hover:bg-gray-50 transition-all duration-150 group"
                )}
              >
                <Icon className={cn("w-4 h-4", color)} />
                {label}
                <ArrowRight className="w-3.5 h-3.5 ml-auto opacity-0 group-hover:opacity-100 transition-opacity text-gray-400" />
              </Link>
            ))}
          </div>

          {/* Alerts banner */}
          {stats?.pendingReports ? (
            <div className="mt-4 flex items-start gap-2 p-3 rounded-lg bg-rose-50 border border-rose-200">
              <AlertTriangle className="w-4 h-4 text-rose-500 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-rose-700 text-xs font-medium">
                  {stats.pendingReports} pending report{stats.pendingReports !== 1 ? "s" : ""} need review
                </p>
                <Link
                  to="/admin/reports"
                  className="text-rose-600 hover:text-rose-700 text-xs underline"
                >
                  Review now →
                </Link>
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </AdminLayout>
  );
}
