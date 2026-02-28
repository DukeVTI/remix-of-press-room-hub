import { useEffect, useState, useCallback } from "react";
import { useSeo } from "@/hooks/useSeo";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { AdminEmptyState } from "@/components/admin/AdminEmptyState";
import { AdminConfirmDialog } from "@/components/admin/AdminConfirmDialog";
import { supabase } from "@/integrations/supabase/client";
import { useAdminAuth } from "@/hooks/useAdminAuth";
import { toast } from "sonner";
import { Flag, Search, Filter, CheckCircle, XCircle, AlertTriangle, ArrowUp, Ban, ChevronDown, ChevronUp, ExternalLink, User, FileText, MessageSquare, BookOpen } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { formatDistanceToNow, format } from "date-fns";
import { cn } from "@/lib/utils";

type ReportStatus = "pending" | "reviewed" | "resolved";
type ReportedItemType = "post" | "comment" | "blog" | "user";

interface Report {
  id: string;
  reason_category: string;
  reported_item_type: ReportedItemType;
  reported_item_id: string;
  status: ReportStatus;
  created_at: string;
  custom_reason: string | null;
  admin_notes: string | null;
  reporter_id: string;
}

const STATUS_CONFIG: Record<ReportStatus, { label: string; color: string }> = {
  pending: { label: "Pending", color: "bg-amber-50 text-amber-700 border-amber-200" },
  reviewed: { label: "Reviewed", color: "bg-blue-50 text-blue-700 border-blue-200" },
  resolved: { label: "Resolved", color: "bg-green-50 text-green-700 border-green-200" },
};

const ITEM_TYPE_CONFIG: Record<ReportedItemType, { label: string; color: string }> = {
  post: { label: "Post", color: "bg-indigo-50 text-indigo-700 border-indigo-200" },
  comment: { label: "Comment", color: "bg-purple-50 text-purple-700 border-purple-200" },
  blog: { label: "Blog", color: "bg-blue-50 text-blue-700 border-blue-200" },
  user: { label: "User", color: "bg-rose-50 text-rose-700 border-rose-200" },
};

export default function ReportsModeration() {
  useSeo({ title: "Moderate Reports", description: "Review and resolve user reports.", noindex: true });
  const { adminRole } = useAdminAuth();
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  const [reportedContent, setReportedContent] = useState<{ title: string; excerpt: string; meta: string } | null>(null);
  const [contentLoading, setContentLoading] = useState(false);
  const [confirmAction, setConfirmAction] = useState<{ type: string; label: string; variant: "destructive" | "warning" | "default" } | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [sortAsc, setSortAsc] = useState(false);
  const [selected, setSelected] = useState<Set<string>>(new Set());

  const load = useCallback(async () => {
    setLoading(true);
    let q = supabase.from("reports").select("*").order("created_at", { ascending: sortAsc });
    if (statusFilter !== "all") q = q.eq("status", statusFilter as any);
    if (typeFilter !== "all") q = q.eq("reported_item_type", typeFilter as any);
    const { data } = await q;
    setReports(data as Report[] ?? []);
    setLoading(false);
  }, [statusFilter, typeFilter, sortAsc]);

  useEffect(() => { load(); }, [load]);

  useEffect(() => {
    if (!selectedReport) { setReportedContent(null); return; }
    const { reported_item_type: type, reported_item_id: id } = selectedReport;
    setContentLoading(true);
    setReportedContent(null);
    (async () => {
      try {
        if (type === "post") {
          const { data } = await supabase.from("posts").select("headline, body, created_at, profiles(full_name)").eq("id", id).maybeSingle();
          if (data) setReportedContent({ title: (data as any).headline, excerpt: ((data as any).body ?? "").slice(0, 200), meta: `By ${(data as any).profiles?.full_name ?? "Unknown"} · ${format(new Date((data as any).created_at), "MMM d, yyyy")}` });
        } else if (type === "comment") {
          const { data } = await supabase.from("comments").select("body, created_at, profiles(full_name)").eq("id", id).maybeSingle();
          if (data) setReportedContent({ title: "Comment", excerpt: ((data as any).body ?? "").slice(0, 200), meta: `By ${(data as any).profiles?.full_name ?? "Unknown"} · ${format(new Date((data as any).created_at), "MMM d, yyyy")}` });
        } else if (type === "blog") {
          const { data } = await supabase.from("blogs").select("blog_name, description, created_at").eq("id", id).maybeSingle();
          if (data) setReportedContent({ title: (data as any).blog_name, excerpt: ((data as any).description ?? "").slice(0, 200), meta: `Blog · Created ${format(new Date((data as any).created_at), "MMM d, yyyy")}` });
        } else if (type === "user") {
          const { data } = await supabase.from("profiles").select("full_name, email, bio, created_at").eq("id", id).maybeSingle();
          if (data) setReportedContent({ title: (data as any).full_name ?? "Unknown User", excerpt: ((data as any).bio ?? "No bio provided").slice(0, 200), meta: `${(data as any).email ?? ""} · Joined ${format(new Date((data as any).created_at), "MMM d, yyyy")}` });
        }
      } catch (_) { /* noop */ }
      setContentLoading(false);
    })();
  }, [selectedReport]);

  const filtered = reports.filter((r) =>
    search === "" || r.reason_category.includes(search.toLowerCase()) ||
    r.reported_item_type.includes(search.toLowerCase()) || r.id.includes(search)
  );

  const logAction = async (action: string, reportId: string) => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;
    const { data: admin } = await (supabase as any).from("platform_admins").select("id").eq("user_id", session.user.id).maybeSingle();
    if (!admin) return;
    await (supabase as any).from("admin_activity_log").insert({ admin_id: admin.id, action_type: action, target_type: "report", target_id: reportId });
  };

  const handleAction = async () => {
    if (!confirmAction || !selectedReport) return;
    setActionLoading(true);
    const { type } = confirmAction;
    let newStatus: ReportStatus = "reviewed";
    if (type === "resolve") newStatus = "resolved";
    await supabase.from("reports").update({ status: newStatus }).eq("id", selectedReport.id);
    await logAction(type, selectedReport.id);
    toast.success(`Report ${type === "resolve" ? "resolved" : type === "dismiss" ? "dismissed" : "action taken"}`);
    setActionLoading(false);
    setConfirmAction(null);
    setSelectedReport(null);
    load();
  };

  const toggleSelect = (id: string) => {
    setSelected((prev) => { const s = new Set(prev); s.has(id) ? s.delete(id) : s.add(id); return s; });
  };

  return (
    <AdminLayout title="Reports Moderation" breadcrumbs={[{ label: "Reports" }]}>
      {/* Header + filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input placeholder="Search reports…" value={search} onChange={(e) => setSearch(e.target.value)}
            className="pl-9 bg-white border-gray-200 text-gray-800 placeholder:text-gray-400 focus:border-green-500" />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-36 bg-white border-gray-200 text-gray-700">
            <Filter className="w-3.5 h-3.5 mr-2 text-gray-400" /><SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent className="bg-white border-gray-200 text-gray-800">
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="reviewed">Reviewed</SelectItem>
            <SelectItem value="resolved">Resolved</SelectItem>
          </SelectContent>
        </Select>
        <Select value={typeFilter} onValueChange={setTypeFilter}>
          <SelectTrigger className="w-36 bg-white border-gray-200 text-gray-700">
            <SelectValue placeholder="Type" />
          </SelectTrigger>
          <SelectContent className="bg-white border-gray-200 text-gray-800">
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="post">Post</SelectItem>
            <SelectItem value="comment">Comment</SelectItem>
            <SelectItem value="blog">Blog</SelectItem>
            <SelectItem value="user">User</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {selected.size > 0 && (
        <div className="flex items-center gap-3 mb-4 px-4 py-3 rounded-lg bg-green-50 border border-green-200">
          <span className="text-green-700 text-sm font-medium">{selected.size} selected</span>
          <Button size="sm" variant="ghost" className="text-gray-500 hover:text-gray-700 text-xs" onClick={() => setSelected(new Set())}>Clear</Button>
        </div>
      )}

      {/* Table */}
      <div className="rounded-xl border border-gray-200 bg-white overflow-hidden">
        <div className="grid grid-cols-[auto_1fr_120px_120px_140px_120px] gap-4 px-4 py-3 border-b border-gray-100 text-xs font-medium text-gray-500 uppercase tracking-wider">
          <div className="w-4" />
          <span>Report</span><span>Type</span><span>Status</span>
          <button className="flex items-center gap-1 hover:text-gray-700" onClick={() => setSortAsc((a) => !a)}>
            Filed {sortAsc ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
          </button>
          <span>Actions</span>
        </div>

        {loading ? (
          <div className="divide-y divide-gray-100">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="h-14 px-4 flex items-center gap-4 animate-pulse">
                <div className="w-4 h-4 bg-gray-100 rounded" />
                <div className="flex-1 h-4 bg-gray-100 rounded" />
                <div className="w-16 h-5 bg-gray-100 rounded-full" />
                <div className="w-16 h-5 bg-gray-100 rounded-full" />
                <div className="w-24 h-4 bg-gray-100 rounded" />
                <div className="w-16 h-7 bg-gray-100 rounded" />
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <AdminEmptyState icon={Flag} title="No reports found" description="No reports match your current filters." className="rounded-none border-0" />
        ) : (
          <div className="divide-y divide-gray-100">
            {filtered.map((report) => {
              const statusCfg = STATUS_CONFIG[report.status];
              const typeCfg = ITEM_TYPE_CONFIG[report.reported_item_type];
              return (
                <div key={report.id} onClick={() => setSelectedReport(report)}
                  className="grid grid-cols-[auto_1fr_120px_120px_140px_120px] gap-4 px-4 py-3.5 items-center hover:bg-gray-50 cursor-pointer transition-colors">
                  <input type="checkbox" checked={selected.has(report.id)}
                    onChange={(e) => { e.stopPropagation(); toggleSelect(report.id); }}
                    className="w-4 h-4 rounded border-gray-300 accent-green-600" />
                  <div>
                    <p className="text-gray-800 text-sm font-medium capitalize">{report.reason_category.replace(/_/g, " ")}</p>
                    <p className="text-gray-400 text-xs">ID: {report.id.slice(0, 8)}…</p>
                  </div>
                  <span className={cn("inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border", typeCfg.color)}>{typeCfg.label}</span>
                  <span className={cn("inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border", statusCfg.color)}>{statusCfg.label}</span>
                  <span className="text-gray-500 text-xs">{formatDistanceToNow(new Date(report.created_at), { addSuffix: true })}</span>
                  <Button size="sm" variant="ghost" className="text-xs text-green-600 hover:text-green-700 hover:bg-green-50"
                    onClick={(e) => { e.stopPropagation(); setSelectedReport(report); }}>Review</Button>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Report detail slide-over */}
      <Sheet open={!!selectedReport} onOpenChange={(o) => !o && setSelectedReport(null)}>
        <SheetContent className="bg-white border-gray-200 text-gray-800 w-full sm:max-w-lg">
          <SheetHeader className="mb-6">
            <SheetTitle className="text-gray-900 flex items-center gap-2">
              <Flag className="w-4 h-4 text-rose-500" /> Report Detail
            </SheetTitle>
          </SheetHeader>
          {selectedReport && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-gray-50 rounded-lg p-3">
                  <p className="text-gray-400 text-xs mb-1">Type</p>
                  <p className="text-gray-800 text-sm capitalize font-medium">{selectedReport.reported_item_type}</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-3">
                  <p className="text-gray-400 text-xs mb-1">Status</p>
                  <span className={cn("inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border", STATUS_CONFIG[selectedReport.status].color)}>
                    {STATUS_CONFIG[selectedReport.status].label}
                  </span>
                </div>
                <div className="bg-gray-50 rounded-lg p-3">
                  <p className="text-gray-400 text-xs mb-1">Reason</p>
                  <p className="text-gray-800 text-sm capitalize font-medium">{selectedReport.reason_category.replace(/_/g, " ")}</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-3">
                  <p className="text-gray-400 text-xs mb-1">Filed</p>
                  <p className="text-gray-800 text-sm">{format(new Date(selectedReport.created_at), "MMM d, yyyy")}</p>
                </div>
              </div>

              <div className="rounded-lg border border-gray-200 bg-gray-50 overflow-hidden">
                <div className="flex items-center gap-2 px-3 py-2 border-b border-gray-200">
                  {selectedReport.reported_item_type === "post" && <FileText className="w-3.5 h-3.5 text-indigo-500" />}
                  {selectedReport.reported_item_type === "comment" && <MessageSquare className="w-3.5 h-3.5 text-purple-500" />}
                  {selectedReport.reported_item_type === "blog" && <BookOpen className="w-3.5 h-3.5 text-blue-500" />}
                  {selectedReport.reported_item_type === "user" && <User className="w-3.5 h-3.5 text-rose-500" />}
                  <span className="text-gray-500 text-xs font-medium capitalize">Reported {selectedReport.reported_item_type}</span>
                </div>
                <div className="p-3">
                  {contentLoading ? (
                    <div className="space-y-2">
                      <div className="h-4 bg-gray-200 rounded animate-pulse w-3/4" />
                      <div className="h-3 bg-gray-200 rounded animate-pulse" />
                      <div className="h-3 bg-gray-200 rounded animate-pulse w-5/6" />
                    </div>
                  ) : reportedContent ? (
                    <>
                      <p className="text-gray-800 text-sm font-semibold mb-1">{reportedContent.title}</p>
                      {reportedContent.excerpt && <p className="text-gray-500 text-xs leading-relaxed mb-2 line-clamp-4">{reportedContent.excerpt}</p>}
                      <p className="text-gray-400 text-xs">{reportedContent.meta}</p>
                    </>
                  ) : (
                    <p className="text-gray-400 text-xs italic">Could not load content — it may have been deleted.</p>
                  )}
                </div>
              </div>

              {selectedReport.custom_reason && (
                <div className="bg-gray-50 rounded-lg p-3">
                  <p className="text-gray-400 text-xs mb-1">Custom Reason</p>
                  <p className="text-gray-700 text-sm">{selectedReport.custom_reason}</p>
                </div>
              )}
              <div className="border-t border-gray-100 pt-4">
                <p className="text-gray-900 text-sm font-semibold mb-3">Actions</p>
                <div className="grid grid-cols-2 gap-2">
                  <Button size="sm" onClick={() => setConfirmAction({ type: "resolve", label: "Resolve this report? This marks it as resolved.", variant: "default" })}
                    className="bg-green-600 hover:bg-green-700 text-white gap-1.5">
                    <CheckCircle className="w-3.5 h-3.5" /> Resolve
                  </Button>
                  <Button size="sm" variant="ghost" onClick={() => setConfirmAction({ type: "dismiss", label: "Dismiss this report? No action will be taken.", variant: "warning" })}
                    className="border border-gray-200 text-gray-600 hover:bg-gray-50 gap-1.5">
                    <XCircle className="w-3.5 h-3.5" /> Dismiss
                  </Button>
                  <Button size="sm" onClick={() => setConfirmAction({ type: "warn", label: "Send a warning to the reported user?", variant: "warning" })}
                    className="bg-amber-500 hover:bg-amber-600 text-white gap-1.5">
                    <AlertTriangle className="w-3.5 h-3.5" /> Warn User
                  </Button>
                  <Button size="sm" onClick={() => setConfirmAction({ type: "suspend", label: "Suspend the reported user? This will restrict their account.", variant: "destructive" })}
                    className="bg-rose-600 hover:bg-rose-700 text-white gap-1.5">
                    <Ban className="w-3.5 h-3.5" /> Suspend
                  </Button>
                  <Button size="sm" variant="ghost" onClick={() => setConfirmAction({ type: "escalate", label: "Escalate this report to super admins?", variant: "default" })}
                    className="col-span-2 border border-green-200 text-green-700 hover:bg-green-50 gap-1.5">
                    <ArrowUp className="w-3.5 h-3.5" /> Escalate
                  </Button>
                </div>
              </div>
            </div>
          )}
        </SheetContent>
      </Sheet>

      <AdminConfirmDialog
        open={!!confirmAction} onOpenChange={(o) => !o && setConfirmAction(null)}
        title={`Confirm: ${confirmAction?.type ?? ""}`} description={confirmAction?.label ?? ""}
        confirmLabel={confirmAction?.type ? `Yes, ${confirmAction.type}` : "Confirm"}
        onConfirm={handleAction} loading={actionLoading} variant={confirmAction?.variant ?? "default"}
      />
    </AdminLayout>
  );
}
