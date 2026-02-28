import { useEffect, useState, useCallback } from "react";
import { useSeo } from "@/hooks/useSeo";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { AdminEmptyState } from "@/components/admin/AdminEmptyState";
import { supabase } from "@/integrations/supabase/client";
import { ClipboardList, Search, Download, Filter } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { format, formatDistanceToNow } from "date-fns";
import { cn } from "@/lib/utils";

interface ActivityRecord {
  id: string;
  action_type: string;
  target_type: string;
  target_id: string;
  details: Record<string, unknown> | null;
  created_at: string;
  admin_id: string;
}

const ACTION_COLORS: Record<string, string> = {
  resolve: "bg-emerald-500/15 text-emerald-300 border-emerald-500/30",
  dismiss: "bg-slate-500/15 text-slate-300 border-slate-500/30",
  warn: "bg-amber-500/15 text-amber-300 border-amber-500/30",
  suspend: "bg-rose-500/15 text-rose-300 border-rose-500/30",
  escalate: "bg-purple-500/15 text-purple-300 border-purple-500/30",
  delete: "bg-rose-600/15 text-rose-400 border-rose-600/30",
  feature: "bg-amber-500/15 text-amber-300 border-amber-500/30",
  verify: "bg-blue-500/15 text-blue-300 border-blue-500/30",
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
    let q = supabase.from("admin_activity_log").select("*").order("created_at", { ascending: false }).limit(200);
    if (actionFilter !== "all") q = q.eq("action_type", actionFilter);
    if (targetFilter !== "all") q = q.eq("target_type", targetFilter);
    const { data } = await q;
    setLogs(data as ActivityRecord[] ?? []);
    setLoading(false);
  }, [actionFilter, targetFilter]);

  useEffect(() => { load(); }, [load]);

  const filtered = logs.filter((l) =>
    search === "" ||
    l.action_type.includes(search.toLowerCase()) ||
    l.target_type.includes(search.toLowerCase()) ||
    l.target_id.includes(search)
  );

  const exportCsv = () => {
    const header = "ID,Action,Target Type,Target ID,Date\n";
    const rows = filtered.map((l) =>
      `${l.id},${l.action_type},${l.target_type},${l.target_id},"${format(new Date(l.created_at), "yyyy-MM-dd HH:mm:ss")}"`
    ).join("\n");
    const blob = new Blob([header + rows], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `admin-activity-log-${format(new Date(), "yyyy-MM-dd")}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const uniqueActions = Array.from(new Set(logs.map((l) => l.action_type)));
  const uniqueTargets = Array.from(new Set(logs.map((l) => l.target_type)));

  return (
    <AdminLayout title="Activity Log" breadcrumbs={[{ label: "Activity Log" }]}>
      {/* Filters + Export */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <Input
            placeholder="Search by action, target, or IDΓÇª"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 bg-slate-900 border-slate-700 text-slate-200 placeholder:text-slate-500 focus:border-indigo-500"
          />
        </div>
        <Select value={actionFilter} onValueChange={setActionFilter}>
          <SelectTrigger className="w-36 bg-slate-900 border-slate-700 text-slate-300">
            <Filter className="w-3.5 h-3.5 mr-2 text-slate-500" />
            <SelectValue placeholder="Action" />
          </SelectTrigger>
          <SelectContent className="bg-slate-900 border-slate-700 text-slate-200">
            <SelectItem value="all">All Actions</SelectItem>
            {uniqueActions.map((a) => <SelectItem key={a} value={a} className="capitalize">{a}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={targetFilter} onValueChange={setTargetFilter}>
          <SelectTrigger className="w-36 bg-slate-900 border-slate-700 text-slate-300">
            <SelectValue placeholder="Target" />
          </SelectTrigger>
          <SelectContent className="bg-slate-900 border-slate-700 text-slate-200">
            <SelectItem value="all">All Targets</SelectItem>
            {uniqueTargets.map((t) => <SelectItem key={t} value={t} className="capitalize">{t}</SelectItem>)}
          </SelectContent>
        </Select>
        <Button
          onClick={exportCsv}
          variant="ghost"
          className="border border-slate-700 text-slate-300 hover:bg-slate-800 hover:text-white gap-2 flex-shrink-0"
        >
          <Download className="w-4 h-4" /> Export CSV
        </Button>
      </div>

      {/* Stats */}
      <div className="flex items-center gap-2 mb-4">
        <span className="text-slate-400 text-sm">
          Showing <strong className="text-slate-200">{filtered.length}</strong> of{" "}
          <strong className="text-slate-200">{logs.length}</strong> records
        </span>
      </div>

      {/* Table */}
      <div className="rounded-xl border border-slate-800 bg-slate-900/60 overflow-hidden">
        <div className="grid grid-cols-[100px_120px_1fr_180px_160px] gap-4 px-4 py-3 border-b border-slate-800 text-xs font-medium text-slate-500 uppercase tracking-wider">
          <span>Action</span>
          <span>Target Type</span>
          <span>Target ID</span>
          <span>Date</span>
          <span>Ago</span>
        </div>

        {loading ? (
          <div className="divide-y divide-slate-800">
            {Array.from({ length: 10 }).map((_, i) => (
              <div key={i} className="h-12 px-4 flex items-center gap-4 animate-pulse">
                <div className="w-16 h-5 bg-slate-800 rounded-full" />
                <div className="w-20 h-4 bg-slate-800 rounded" />
                <div className="flex-1 h-4 bg-slate-800 rounded" />
                <div className="w-32 h-4 bg-slate-800 rounded" />
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <AdminEmptyState
            icon={ClipboardList}
            title="No activity found"
            description="No admin actions have been logged yet, or no results match your filters."
            className="rounded-none border-0"
          />
        ) : (
          <div className="divide-y divide-slate-800/60">
            {filtered.map((log) => (
              <div
                key={log.id}
                className="grid grid-cols-[100px_120px_1fr_180px_160px] gap-4 px-4 py-3 items-center hover:bg-slate-800/30 transition-colors"
              >
                <span
                  className={cn(
                    "inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border capitalize w-fit",
                    ACTION_COLORS[log.action_type] ?? "bg-slate-500/15 text-slate-300 border-slate-500/30"
                  )}
                >
                  {log.action_type}
                </span>
                <span className="text-slate-300 text-xs capitalize">{log.target_type}</span>
                <span className="text-slate-500 text-xs font-mono truncate">{log.target_id}</span>
                <span className="text-slate-400 text-xs">{format(new Date(log.created_at), "MMM d, yyyy HH:mm")}</span>
                <span className="text-slate-500 text-xs">{formatDistanceToNow(new Date(log.created_at), { addSuffix: true })}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Timeline hint */}
      {!loading && filtered.length > 0 && (
        <p className="text-slate-600 text-xs mt-3 text-center">
          Activity log is append-only and cannot be modified.
        </p>
      )}
    </AdminLayout>
  );
}
