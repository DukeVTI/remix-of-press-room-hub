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
        if (count >= 10) return "text-rose-700 bg-rose-50 border-rose-200";
        if (count >= 5) return "text-orange-700 bg-orange-50 border-orange-200";
        return "text-amber-700 bg-amber-50 border-amber-200";
    };

    return (
        <AdminLayout title="Flagged Watch List" breadcrumbs={[{ label: "Watch List" }]}>
            {/* Alert banner */}
            {watchlist.length > 0 && (
                <div className="mb-6 px-4 py-3 rounded-xl border border-rose-200 bg-rose-50 flex items-center gap-3">
                    <AlertTriangle className="w-5 h-5 text-rose-500 flex-shrink-0" />
                    <p className="text-rose-700 text-sm">
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
                    className="pl-9 bg-white border-gray-200 text-gray-800 placeholder:text-gray-400 focus:border-green-500"
                />
            </div>

            <div className="rounded-xl border border-gray-200 bg-white overflow-hidden">
                <div className="grid grid-cols-[2fr_80px_120px_100px_44px] gap-4 px-4 py-3 border-b border-gray-100 text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <span>User</span><span>Risk</span><span>Reports</span><span>Last Report</span><span />
                </div>

                {loading ? (
                    <div className="divide-y divide-gray-100">
                        {Array.from({ length: 5 }).map((_, i) => (
                            <div key={i} className="h-16 px-4 flex items-center gap-4 animate-pulse">
                                <div className="w-9 h-9 rounded-full bg-gray-100" />
                                <div className="flex-1 h-4 bg-gray-100 rounded" />
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
                    <div className="divide-y divide-gray-100">
                        {visible.map((w) => (
                            <div key={w.reported_user_id}>
                                {/* Main row */}
                                <div
                                    className="grid grid-cols-[2fr_80px_120px_100px_44px] gap-4 px-4 py-3.5 items-center hover:bg-gray-50 transition-colors cursor-pointer"
                                    onClick={() => setExpanded(expanded === w.reported_user_id ? null : w.reported_user_id)}
                                >
                                    <div className="flex items-center gap-3 min-w-0">
                                        <Avatar className="w-9 h-9 flex-shrink-0 border border-gray-200">
                                            <AvatarImage src={w.avatar_url} />
                                            <AvatarFallback className="bg-rose-600 text-white text-xs">{w.full_name[0]}</AvatarFallback>
                                        </Avatar>
                                        <div className="min-w-0">
                                            <p className="text-gray-800 text-sm font-medium truncate">{w.full_name}</p>
                                            <p className="text-gray-400 text-xs truncate">{w.email}</p>
                                        </div>
                                    </div>
                                    <span className={cn("inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold border w-fit", getRiskColor(w.report_count))}>
                                        {w.report_count >= 10 ? "HIGH" : w.report_count >= 5 ? "MED" : "LOW"}
                                    </span>
                                    <span className="text-gray-700 text-sm tabular-nums flex items-center gap-1.5">
                                        <Flag className="w-3.5 h-3.5 text-rose-500" /> {w.report_count} reports
                                    </span>
                                    <span className="text-gray-500 text-xs">{formatDistanceToNow(new Date(w.latest_report), { addSuffix: true })}</span>
                                    <Button
                                        size="icon"
                                        variant="ghost"
                                        title="View user"
                                        onClick={(e) => { e.stopPropagation(); navigate("/admin/users"); }}
                                        className="w-7 h-7 text-gray-400 hover:text-green-600 hover:bg-green-50"
                                    >
                                        <Eye className="w-3.5 h-3.5" />
                                    </Button>
                                </div>

                                {/* Expanded report history */}
                                {expanded === w.reported_user_id && (
                                    <div className="bg-gray-50 border-t border-gray-100 px-6 py-4 space-y-2">
                                        <p className="text-gray-400 text-xs font-medium uppercase tracking-wider mb-3">Report History</p>
                                        {(userReports[w.reported_user_id] ?? []).map((r) => (
                                            <div key={r.id} className="flex items-start gap-3 text-xs py-2 border-b border-gray-100 last:border-0">
                                                <FileText className="w-3.5 h-3.5 text-gray-400 mt-0.5 flex-shrink-0" />
                                                <div className="flex-1 min-w-0">
                                                    <span className="text-gray-700 capitalize font-medium">{r.report_type}</span>
                                                    <span className="text-gray-400 mx-2">·</span>
                                                    <span className="text-gray-500">{r.reason}</span>
                                                </div>
                                                <span className={cn("px-2 py-0.5 rounded-full text-xs border capitalize flex-shrink-0",
                                                    r.status === "resolved" ? "bg-green-50 text-green-700 border-green-200" :
                                                        r.status === "dismissed" ? "bg-gray-100 text-gray-600 border-gray-200" :
                                                            "bg-amber-50 text-amber-700 border-amber-200"
                                                )}>
                                                    {r.status}
                                                </span>
                                                <span className="text-gray-300 flex-shrink-0">{formatDistanceToNow(new Date(r.created_at), { addSuffix: true })}</span>
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
