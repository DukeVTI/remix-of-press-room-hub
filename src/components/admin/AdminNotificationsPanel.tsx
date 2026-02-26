import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Bell, AlertTriangle, Info, CheckCircle, XCircle, X } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface Alert {
    id: string;
    alert_type: string;
    severity: string;
    title: string;
    description: string;
    is_read: boolean;
    created_at: string;
}

const SEVERITY_CFG: Record<string, { icon: React.ElementType; color: string; bg: string }> = {
    critical: { icon: XCircle, color: "text-rose-400", bg: "bg-rose-500/10 border-rose-500/20" },
    warning: { icon: AlertTriangle, color: "text-amber-400", bg: "bg-amber-500/10 border-amber-500/20" },
    info: { icon: Info, color: "text-blue-400", bg: "bg-blue-500/10 border-blue-500/20" },
    success: { icon: CheckCircle, color: "text-emerald-400", bg: "bg-emerald-500/10 border-emerald-500/20" },
};

export function AdminNotificationsPanel() {
    const [open, setOpen] = useState(false);
    const [alerts, setAlerts] = useState<Alert[]>([]);
    const [loading, setLoading] = useState(false);

    const unread = alerts.filter((a) => !a.is_read).length;

    const loadAlerts = async () => {
        setLoading(true);
        const { data } = await (supabase as any)
            .from("admin_alerts")
            .select("*")
            .order("created_at", { ascending: false })
            .limit(20);
        setAlerts((data as unknown as Alert[]) ?? []);
        setLoading(false);
    };

    useEffect(() => {
        loadAlerts();
        // Real-time subscription
        const channel = supabase
            .channel("admin_alerts_realtime")
            .on("postgres_changes", { event: "INSERT", schema: "public", table: "admin_alerts" }, () => {
                loadAlerts();
            })
            .subscribe();
        return () => { supabase.removeChannel(channel); };
    }, []);

    const markAllRead = async () => {
        await (supabase as any).from("admin_alerts").update({ is_read: true }).eq("is_read", false);
        setAlerts((prev) => prev.map((a) => ({ ...a, is_read: true })));
    };

    const dismiss = async (id: string, e: React.MouseEvent) => {
        e.stopPropagation();
        await (supabase as any).from("admin_alerts").delete().eq("id", id);
        setAlerts((prev) => prev.filter((a) => a.id !== id));
    };

    return (
        <div className="relative">
            {/* Bell button */}
            <button
                onClick={() => setOpen((o) => !o)}
                className="relative p-2 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
                aria-label="Notifications"
            >
                <Bell className="w-5 h-5" />
                {unread > 0 && (
                    <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-rose-500 border border-slate-900" />
                )}
            </button>

            {/* Dropdown panel */}
            {open && (
                <>
                    {/* Backdrop */}
                    <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />

                    <div className="absolute right-0 top-full mt-2 w-80 z-50 rounded-xl border border-slate-800 bg-slate-900 shadow-2xl shadow-black/40 overflow-hidden">
                        {/* Header */}
                        <div className="flex items-center justify-between px-4 py-3 border-b border-slate-800">
                            <div className="flex items-center gap-2">
                                <Bell className="w-4 h-4 text-indigo-400" />
                                <span className="text-slate-200 text-sm font-semibold">Notifications</span>
                                {unread > 0 && (
                                    <span className="px-1.5 py-0.5 rounded-full bg-rose-500/20 text-rose-300 text-xs font-bold border border-rose-500/30">
                                        {unread}
                                    </span>
                                )}
                            </div>
                            {unread > 0 && (
                                <button onClick={markAllRead} className="text-slate-500 hover:text-slate-300 text-xs transition-colors">
                                    Mark all read
                                </button>
                            )}
                        </div>

                        {/* Alert list */}
                        <div className="max-h-80 overflow-y-auto divide-y divide-slate-800/60">
                            {loading ? (
                                <div className="p-4 space-y-2">
                                    {Array.from({ length: 3 }).map((_, i) => (
                                        <div key={i} className="h-12 bg-slate-800 rounded-lg animate-pulse" />
                                    ))}
                                </div>
                            ) : alerts.length === 0 ? (
                                <div className="flex flex-col items-center justify-center py-10 gap-2">
                                    <Bell className="w-8 h-8 text-slate-700" />
                                    <p className="text-slate-500 text-sm">All caught up!</p>
                                </div>
                            ) : (
                                alerts.map((alert) => {
                                    const cfg = SEVERITY_CFG[alert.severity] ?? SEVERITY_CFG.info;
                                    const Icon = cfg.icon;
                                    return (
                                        <div
                                            key={alert.id}
                                            className={cn(
                                                "flex items-start gap-3 px-4 py-3 hover:bg-slate-800/40 transition-colors",
                                                !alert.is_read && "bg-indigo-500/5"
                                            )}
                                        >
                                            <div className={cn("mt-0.5 p-1.5 rounded-lg border flex-shrink-0", cfg.bg)}>
                                                <Icon className={cn("w-3.5 h-3.5", cfg.color)} />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className={cn("text-xs font-semibold", alert.is_read ? "text-slate-300" : "text-white")}>
                                                    {alert.title}
                                                    {!alert.is_read && <span className="ml-2 w-1.5 h-1.5 rounded-full bg-indigo-400 inline-block align-middle" />}
                                                </p>
                                                <p className="text-slate-500 text-xs mt-0.5 line-clamp-2">{alert.description}</p>
                                                <p className="text-slate-600 text-xs mt-1">{formatDistanceToNow(new Date(alert.created_at), { addSuffix: true })}</p>
                                            </div>
                                            <button
                                                onClick={(e) => dismiss(alert.id, e)}
                                                className="text-slate-600 hover:text-slate-400 transition-colors flex-shrink-0 mt-0.5"
                                            >
                                                <X className="w-3.5 h-3.5" />
                                            </button>
                                        </div>
                                    );
                                })
                            )}
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}
