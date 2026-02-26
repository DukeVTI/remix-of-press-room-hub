import { useEffect, useState, useCallback } from "react";
import { useSeo } from "@/hooks/useSeo";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { AdminEmptyState } from "@/components/admin/AdminEmptyState";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { AlertTriangle, Flag, Search, User, FileText, Eye } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { formatDistanceToNow } from "date-fns";
import { cn } from "@/lib/utils";

interface ReportGroup {
    reported_user_id: string;
    report_count: number;
    latest_report: string;
    email: string;
    full_name: string;
    avatar_url: string;
    status: string;
}

interface UserReport {
    id: string;
    report_type: string;
    reason: string;
    status: string;
    created_at: string;
}

export default function FlaggedWatchList() {
    useSeo({ title: "Flagged Watch List", description: "Users with multiple reports.", noindex: true });
    const navigate = useNavigate();
    const [watchlist, setWatchlist] = useState<ReportGroup[]>([]);
    const [userReports, setUserReports] = useState<Record<string, UserReport[]>>({});
    const [expanded, setExpanded] = useState<string | null>(null);
    const [search, setSearch] = useState("");
    const [loading, setLoading] = useState(true);

    const load = useCallback(async () => {
        setLoading(true);
        // Get all reports with user info — group client-side
        const { data: reports } = await supabase
            .from("reports")
            .select("id, reported_user_id, report_type, reason, status, created_at, profiles!reported_user_id(id, email, full_name, avatar_url, status)")
            .order("created_at", { ascending: false });

        if (!reports) { setLoading(false); return; }

        // Group by reported_user_id
        const grouped: Record<string, ReportGroup> = {};
        const byUser: Record<string, UserReport[]> = {};

        for (const r of reports as any[]) {
            const uid = r.reported_user_id;
            if (!uid) continue;
            const profile = Array.isArray(r.profiles) ? r.profiles[0] : r.profiles;
            if (!grouped[uid]) {
                grouped[uid] = {
                    reported_user_id: uid,
                    report_count: 0,
                    latest_report: r.created_at,
                    email: profile?.email ?? "Unknown",
                    full_name: profile?.full_name ?? "Unknown",
                    avatar_url: profile?.avatar_url ?? "",
                    status: profile?.status ?? "active",
                };
            }
            grouped[uid].report_count++;
            if (!byUser[uid]) byUser[uid] = [];
            byUser[uid].push({ id: r.id, report_type: r.report_type, reason: r.reason, status: r.status, created_at: r.created_at });
        }

        // Only users with 2+ reports, sorted by count desc
        const filtered = Object.values(grouped)
            .filter((g) => g.report_count >= 2)
            .sort((a, b) => b.report_count - a.report_count);

        setWatchlist(filtered);
        setUserReports(byUser);
        setLoading(false);
    }, []);

    useEffect(() => { load(); }, [load]);

    const visible = watchlist.filter((w) =>
        search === "" ||
        w.full_name.toLowerCase().includes(search.toLowerCase()) ||
        w.email.toLowerCase().includes(search.toLowerCase())
    );

    const getRiskColor = (count: number) => {
        if (count >= 10) return "text-rose-400 bg-rose-500/10 border-rose-500/30";
        if (count >= 5) return "text-orange-400 bg-orange-500/10 border-orange-500/30";
        return "text-amber-400 bg-amber-500/10 border-amber-500/30";
    };

    return (
        <AdminLayout title="Flagged Watch List" breadcrumbs={[{ label: "Watch List" }]}>
            {/* Alert banner */}
            {watchlist.length > 0 && (
                <div className="mb-6 px-4 py-3 rounded-xl border border-rose-500/30 bg-rose-500/10 flex items-center gap-3">
                    <AlertTriangle className="w-5 h-5 text-rose-400 flex-shrink-0" />
                    <p className="text-rose-300 text-sm">
                        <strong>{watchlist.length}</strong> users have 2 or more reports against them and require review.
                    </p>
                </div>
            )}

            <div className="relative mb-5">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <Input
                    placeholder="Search by name or email…"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="pl-9 bg-slate-900 border-slate-700 text-slate-200 placeholder:text-slate-500 focus:border-indigo-500"
                />
            </div>

            <div className="rounded-xl border border-slate-800 bg-slate-900/60 overflow-hidden">
                <div className="grid grid-cols-[2fr_80px_120px_100px_44px] gap-4 px-4 py-3 border-b border-slate-800 text-xs font-medium text-slate-500 uppercase tracking-wider">
                    <span>User</span><span>Risk</span><span>Reports</span><span>Last Report</span><span />
                </div>

                {loading ? (
                    <div className="divide-y divide-slate-800">
                        {Array.from({ length: 5 }).map((_, i) => (
                            <div key={i} className="h-16 px-4 flex items-center gap-4 animate-pulse">
                                <div className="w-9 h-9 rounded-full bg-slate-800" />
                                <div className="flex-1 h-4 bg-slate-800 rounded" />
                            </div>
                        ))}
                    </div>
                ) : visible.length === 0 ? (
                    <AdminEmptyState
                        icon={AlertTriangle}
                        title={watchlist.length === 0 ? "No flagged users" : "No results"}
                        description={watchlist.length === 0 ? "No users have 2+ reports filed against them." : "Try a different search."}
                        className="rounded-none border-0"
                    />
                ) : (
                    <div className="divide-y divide-slate-800/60">
                        {visible.map((w) => (
                            <div key={w.reported_user_id}>
                                {/* Main row */}
                                <div
                                    className="grid grid-cols-[2fr_80px_120px_100px_44px] gap-4 px-4 py-3.5 items-center hover:bg-slate-800/30 transition-colors cursor-pointer"
                                    onClick={() => setExpanded(expanded === w.reported_user_id ? null : w.reported_user_id)}
                                >
                                    <div className="flex items-center gap-3 min-w-0">
                                        <Avatar className="w-9 h-9 flex-shrink-0 border border-slate-700">
                                            <AvatarImage src={w.avatar_url} />
                                            <AvatarFallback className="bg-rose-700 text-white text-xs">{w.full_name[0]}</AvatarFallback>
                                        </Avatar>
                                        <div className="min-w-0">
                                            <p className="text-slate-200 text-sm font-medium truncate">{w.full_name}</p>
                                            <p className="text-slate-500 text-xs truncate">{w.email}</p>
                                        </div>
                                    </div>
                                    <span className={cn("inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold border w-fit", getRiskColor(w.report_count))}>
                                        {w.report_count >= 10 ? "HIGH" : w.report_count >= 5 ? "MED" : "LOW"}
                                    </span>
                                    <span className="text-slate-300 text-sm tabular-nums flex items-center gap-1.5">
                                        <Flag className="w-3.5 h-3.5 text-rose-400" /> {w.report_count} reports
                                    </span>
                                    <span className="text-slate-400 text-xs">{formatDistanceToNow(new Date(w.latest_report), { addSuffix: true })}</span>
                                    <Button
                                        size="icon"
                                        variant="ghost"
                                        title="View user"
                                        onClick={(e) => { e.stopPropagation(); navigate("/admin/users"); }}
                                        className="w-7 h-7 text-slate-500 hover:text-indigo-400 hover:bg-indigo-500/10"
                                    >
                                        <Eye className="w-3.5 h-3.5" />
                                    </Button>
                                </div>

                                {/* Expanded report history */}
                                {expanded === w.reported_user_id && (
                                    <div className="bg-slate-950/60 border-t border-slate-800/60 px-6 py-4 space-y-2">
                                        <p className="text-slate-400 text-xs font-medium uppercase tracking-wider mb-3">Report History</p>
                                        {(userReports[w.reported_user_id] ?? []).map((r) => (
                                            <div key={r.id} className="flex items-start gap-3 text-xs py-2 border-b border-slate-800/40 last:border-0">
                                                <FileText className="w-3.5 h-3.5 text-slate-500 mt-0.5 flex-shrink-0" />
                                                <div className="flex-1 min-w-0">
                                                    <span className="text-slate-300 capitalize font-medium">{r.report_type}</span>
                                                    <span className="text-slate-500 mx-2">·</span>
                                                    <span className="text-slate-400">{r.reason}</span>
                                                </div>
                                                <span className={cn("px-2 py-0.5 rounded-full text-xs border capitalize flex-shrink-0",
                                                    r.status === "resolved" ? "bg-emerald-500/15 text-emerald-300 border-emerald-500/30" :
                                                        r.status === "dismissed" ? "bg-slate-500/15 text-slate-400 border-slate-500/30" :
                                                            "bg-amber-500/15 text-amber-300 border-amber-500/30"
                                                )}>
                                                    {r.status}
                                                </span>
                                                <span className="text-slate-600 flex-shrink-0">{formatDistanceToNow(new Date(r.created_at), { addSuffix: true })}</span>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </AdminLayout>
    );
}
