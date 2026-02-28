import { useEffect, useState, useCallback } from "react";
import { useSeo } from "@/hooks/useSeo";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { AdminEmptyState } from "@/components/admin/AdminEmptyState";
import { supabase } from "@/integrations/supabase/client";
import { ClipboardList, Search, Download, Filter } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { format, formatDistanceToNow } from "date-fns";
import { cn } from "@/lib/utils";

interface ActivityRecord {
  id: string; action_type: string; target_type: string; target_id: string;
  details: Record<string, unknown> | null; created_at: string;
  admin_id: string; admin_name: string; admin_email: string;
}

const ACTION_COLORS: Record<string, string> = {
  resolve: "bg-green-50 text-green-700 border-green-200",
  dismiss: "bg-gray-100 text-gray-600 border-gray-200",
  warn: "bg-amber-50 text-amber-700 border-amber-200",
  suspend: "bg-rose-50 text-rose-700 border-rose-200",
  escalate: "bg-purple-50 text-purple-700 border-purple-200",
  delete: "bg-rose-50 text-rose-600 border-rose-100",
  feature: "bg-amber-50 text-amber-700 border-amber-200",
  verify: "bg-blue-50 text-blue-700 border-blue-200",
  invite: "bg-indigo-50 text-indigo-700 border-indigo-200",
  promote: "bg-purple-50 text-purple-700 border-purple-200",
};

export default function ActivityLog() {
  useSeo({ title: "Admin Activity Log", description: "Audit trail of all admin actions.", noindex: true });
  const [logs, setLogs] = useState<ActivityRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [actionFilter, setActionFilter] = useState("all");
  const [targetFilter, setTargetFilter] = useState("all");

  const load = useCallback(async () => {
    setLoading(true);
    let q = (supabase as any).from("admin_activity_log").select("*").order("created_at", { ascending: false }).limit(200);
    if (actionFilter !== "all") q = q.eq("action_type", actionFilter);
    if (targetFilter !== "all") q = q.eq("target_type", targetFilter);
    const { data: logData } = await q;
    if (!logData || logData.length === 0) { setLogs([]); setLoading(false); return; }

    const adminIds: string[] = Array.from(new Set((logData as any[]).map((l: any) => l.admin_id).filter(Boolean)));
    const adminMap: Record<string, { name: string; email: string }> = {};
    if (adminIds.length > 0) {
      const { data: adminRows } = await (supabase as any).from("platform_admins").select("id, profiles(full_name, email)").in("id", adminIds);
      (adminRows ?? []).forEach((a: any) => {
        const p = Array.isArray(a.profiles) ? a.profiles[0] : a.profiles;
        adminMap[a.id] = { name: p?.full_name ?? "Unknown Admin", email: p?.email ?? "" };
      });
    }
    setLogs((logData as any[]).map((l: any) => ({ ...l, admin_name: adminMap[l.admin_id]?.name ?? "Unknown Admin", admin_email: adminMap[l.admin_id]?.email ?? "" })));
    setLoading(false);
  }, [actionFilter, targetFilter]);

  useEffect(() => { load(); }, [load]);

  const filtered = logs.filter((l) =>
    search === "" || [l.action_type, l.target_type, l.target_id, l.admin_name, l.admin_email]
      .some((s) => s.toLowerCase().includes(search.toLowerCase()))
  );

  const exportCsv = () => {
    const header = "ID,Admin,Action,Target Type,Target ID,Date\n";
    const rows = filtered.map((l) =>
      `${l.id},"${l.admin_name}",${l.action_type},${l.target_type},${l.target_id},"${format(new Date(l.created_at), "yyyy-MM-dd HH:mm:ss")}"`
    ).join("\n");
    const blob = new Blob([header + rows], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url;
    a.download = `admin-activity-log-${format(new Date(), "yyyy-MM-dd")}.csv`; a.click();
    URL.revokeObjectURL(url);
  };

  const uniqueActions = Array.from(new Set(logs.map((l) => l.action_type)));
  const uniqueTargets = Array.from(new Set(logs.map((l) => l.target_type)));

  return (
    <AdminLayout title="Activity Log" breadcrumbs={[{ label: "Activity Log" }]}>
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input placeholder="Search by admin, action, target…" value={search} onChange={(e) => setSearch(e.target.value)}
            className="pl-9 bg-white border-gray-200 text-gray-800 placeholder:text-gray-400 focus:border-green-500" />
        </div>
        <Select value={actionFilter} onValueChange={setActionFilter}>
          <SelectTrigger className="w-36 bg-white border-gray-200 text-gray-700">
            <Filter className="w-3.5 h-3.5 mr-2 text-gray-400" /><SelectValue placeholder="Action" />
          </SelectTrigger>
          <SelectContent className="bg-white border-gray-200 text-gray-800">
            <SelectItem value="all">All Actions</SelectItem>
            {uniqueActions.map((a) => <SelectItem key={a} value={a} className="capitalize">{a}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={targetFilter} onValueChange={setTargetFilter}>
          <SelectTrigger className="w-36 bg-white border-gray-200 text-gray-700"><SelectValue placeholder="Target" /></SelectTrigger>
          <SelectContent className="bg-white border-gray-200 text-gray-800">
            <SelectItem value="all">All Targets</SelectItem>
            {uniqueTargets.map((t) => <SelectItem key={t} value={t} className="capitalize">{t}</SelectItem>)}
          </SelectContent>
        </Select>
        <Button onClick={exportCsv} variant="ghost" className="border border-gray-200 text-gray-600 hover:bg-gray-50 gap-2 flex-shrink-0">
          <Download className="w-4 h-4" /> Export CSV
        </Button>
      </div>

      <div className="flex items-center gap-2 mb-4">
        <span className="text-gray-500 text-sm">
          Showing <strong className="text-gray-800">{filtered.length}</strong> of{" "}
          <strong className="text-gray-800">{logs.length}</strong> records
        </span>
      </div>

      <div className="rounded-xl border border-gray-200 bg-white overflow-hidden">
        <div className="grid grid-cols-[100px_200px_120px_1fr_160px] gap-4 px-4 py-3 border-b border-gray-100 text-xs font-medium text-gray-500 uppercase tracking-wider">
          <span>Action</span><span>Admin</span><span>Target Type</span><span>Target ID</span><span>Date</span>
        </div>
        {loading ? (
          <div className="divide-y divide-gray-100">
            {Array.from({ length: 10 }).map((_, i) => (
              <div key={i} className="h-14 px-4 flex items-center gap-4 animate-pulse">
                <div className="w-16 h-5 bg-gray-100 rounded-full" /><div className="w-8 h-8 bg-gray-100 rounded-full" />
                <div className="w-28 h-4 bg-gray-100 rounded" /><div className="flex-1 h-4 bg-gray-100 rounded" />
                <div className="w-32 h-4 bg-gray-100 rounded" />
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <AdminEmptyState icon={ClipboardList} title="No activity found" description="No admin actions have been logged yet." className="rounded-none border-0" />
        ) : (
          <div className="divide-y divide-gray-100">
            {filtered.map((log) => (
              <div key={log.id} className="grid grid-cols-[100px_200px_120px_1fr_160px] gap-4 px-4 py-3 items-center hover:bg-gray-50 transition-colors">
                <span className={cn("inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border capitalize w-fit",
                  ACTION_COLORS[log.action_type] ?? "bg-gray-100 text-gray-600 border-gray-200")}>
                  {log.action_type}
                </span>
                <div className="flex items-center gap-2 min-w-0">
                  <Avatar className="w-7 h-7 flex-shrink-0 border border-gray-200">
                    <AvatarFallback className="bg-green-600 text-white text-xs">{log.admin_name?.[0]?.toUpperCase() ?? "A"}</AvatarFallback>
                  </Avatar>
                  <div className="min-w-0">
                    <p className="text-gray-800 text-xs font-medium truncate">{log.admin_name}</p>
                    {log.admin_email && <p className="text-gray-400 text-xs truncate">{log.admin_email}</p>}
                  </div>
                </div>
                <span className="text-gray-700 text-xs capitalize">{log.target_type}</span>
                <span className="text-gray-400 text-xs font-mono truncate">{log.target_id}</span>
                <div>
                  <p className="text-gray-500 text-xs">{format(new Date(log.created_at), "MMM d, yyyy HH:mm")}</p>
                  <p className="text-gray-300 text-xs">{formatDistanceToNow(new Date(log.created_at), { addSuffix: true })}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      {!loading && filtered.length > 0 && (
        <p className="text-gray-400 text-xs mt-3 text-center">Activity log is append-only and cannot be modified.</p>
      )}
    </AdminLayout>
  );
}
