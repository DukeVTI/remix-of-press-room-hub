import { useEffect, useState, useCallback } from "react";
import { useSeo } from "@/hooks/useSeo";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { AdminEmptyState } from "@/components/admin/AdminEmptyState";
import { supabase } from "@/integrations/supabase/client";
import { useAdminAuth } from "@/hooks/useAdminAuth";
import { toast } from "sonner";
import { Megaphone, Send, Globe, CheckCircle, Clock, Users, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

interface Announcement {
    id: string;
    title: string;
    body: string;
    target_audience: string;
    status: string;
    sent_at: string;
    recipient_count: number;
}

const AUDIENCE_CFG: Record<string, { label: string; icon: React.ElementType; color: string }> = {
    all: { label: "All Users", icon: Globe, color: "text-green-600" },
    publishers: { label: "Publishers Only", icon: BookOpen, color: "text-blue-600" },
    new_users: { label: "New Users (< 30 days)", icon: Users, color: "text-teal-600" },
};

export default function AdminAnnouncements() {
    useSeo({ title: "Announcements", description: "Send platform-wide announcements.", noindex: true });
    const { adminRole } = useAdminAuth();
    const [announcements, setAnnouncements] = useState<Announcement[]>([]);
    const [loading, setLoading] = useState(true);
    const [sending, setSending] = useState(false);
    const [title, setTitle] = useState("");
    const [body, setBody] = useState("");
    const [audience, setAudience] = useState("all");

    const load = useCallback(async () => {
        setLoading(true);
        const { data } = await (supabase as any)
            .from("admin_announcements")
            .select("*")
            .order("sent_at", { ascending: false });
        setAnnouncements((data as unknown as Announcement[]) ?? []);
        setLoading(false);
    }, []);

    useEffect(() => { load(); }, [load]);

    const send = async () => {
        if (!title.trim() || !body.trim()) { toast.error("Title and body are required"); return; }

        setSending(true);
        // Get current admin record
        const { data: { session } } = await supabase.auth.getSession();
        const { data: adminData } = await (supabase as any)
            .from("platform_admins")
            .select("id")
            .eq("user_id", session?.user?.id)
            .maybeSingle();

        if (!adminData) { toast.error("Could not verify admin identity"); setSending(false); return; }

        // Count recipients
        let recipientCount = 0;
        if (audience === "all") {
            const { count } = await supabase.from("profiles").select("*", { count: "exact", head: true });
            recipientCount = count ?? 0;
        } else if (audience === "publishers") {
            const { count } = await supabase.from("blogs").select("*", { count: "exact", head: true }).eq("status", "active");
            recipientCount = count ?? 0;
        } else if (audience === "new_users") {
            const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
            const { count } = await supabase.from("profiles").select("*", { count: "exact", head: true }).gte("created_at", thirtyDaysAgo);
            recipientCount = count ?? 0;
        }

        const { error } = await (supabase as any).from("admin_announcements").insert({
            title: title.trim(),
            body: body.trim(),
            target_audience: audience,
            sent_by: adminData.id,
            status: "sent",
            recipient_count: recipientCount,
        });

        if (error) {
            toast.error("Failed to send announcement");
        } else {
            toast.success(`Announcement sent to ${recipientCount.toLocaleString()} recipients`);
            setTitle("");
            setBody("");
            setAudience("all");
            load();
        }
        setSending(false);
    };

    const AudienceIcon = AUDIENCE_CFG[audience]?.icon ?? Globe;

    return (
        <AdminLayout title="Announcements" breadcrumbs={[{ label: "Announcements" }]}>
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
                {/* Compose panel */}
                <div className="lg:col-span-2">
                    <div className="rounded-xl border border-gray-200 bg-white p-5 sticky top-6 shadow-sm">
                        <h2 className="text-gray-800 font-bold text-sm mb-5 flex items-center gap-2">
                            <Megaphone className="w-4 h-4 text-green-600" /> Compose Announcement
                        </h2>

                        <div className="space-y-4">
                            <div>
                                <label className="text-gray-500 text-xs font-medium mb-1.5 block">Title</label>
                                <Input
                                    placeholder="Announcement title…"
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                    className="bg-white border-gray-200 text-gray-800 placeholder:text-gray-400 focus:border-green-500"
                                />
                            </div>

                            <div>
                                <label className="text-gray-500 text-xs font-medium mb-1.5 block">Message</label>
                                <Textarea
                                    placeholder="Write your announcement message…"
                                    value={body}
                                    onChange={(e) => setBody(e.target.value)}
                                    rows={6}
                                    className="bg-white border-gray-200 text-gray-800 placeholder:text-gray-400 focus:border-green-500 resize-none"
                                />
                            </div>

                            <div>
                                <label className="text-gray-500 text-xs font-medium mb-1.5 block">Target Audience</label>
                                <Select value={audience} onValueChange={setAudience}>
                                    <SelectTrigger className="bg-white border-gray-200 text-gray-800 w-full">
                                        <AudienceIcon className={cn("w-3.5 h-3.5 mr-2", AUDIENCE_CFG[audience]?.color)} />
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent className="bg-white border-gray-200 text-gray-800">
                                        {Object.entries(AUDIENCE_CFG).map(([val, cfg]) => (
                                            <SelectItem key={val} value={val}>
                                                <div className="flex items-center gap-2">
                                                    <cfg.icon className={cn("w-3.5 h-3.5", cfg.color)} />
                                                    {cfg.label}
                                                </div>
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <Button
                                onClick={send}
                                disabled={sending || !title.trim() || !body.trim()}
                                className="w-full bg-green-600 hover:bg-green-700 text-white gap-2 mt-2"
                            >
                                <Send className="w-4 h-4" />
                                {sending ? "Sending…" : "Send Announcement"}
                            </Button>
                        </div>
                    </div>
                </div>

                {/* History */}
                <div className="lg:col-span-3">
                    <h2 className="text-gray-800 font-bold text-sm mb-4">Announcement History</h2>
                    {loading ? (
                        <div className="space-y-3">
                            {Array.from({ length: 3 }).map((_, i) => (
                                <div key={i} className="rounded-xl border border-gray-100 bg-gray-50 p-4 animate-pulse h-24" />
                            ))}
                        </div>
                    ) : announcements.length === 0 ? (
                        <AdminEmptyState
                            icon={Megaphone}
                            title="No announcements yet"
                            description="Compose your first announcement above."
                            className="rounded-xl border border-gray-200 bg-white shadow-sm h-48"
                        />
                    ) : (
                        <div className="space-y-3">
                            {announcements.map((a) => {
                                const cfg = AUDIENCE_CFG[a.target_audience];
                                const AudIcon = cfg?.icon ?? Globe;
                                return (
                                    <div key={a.id} className="rounded-xl border border-gray-200 bg-white p-4 hover:border-green-300 transition-colors shadow-sm">
                                        <div className="flex items-start justify-between gap-3 mb-2">
                                            <h3 className="text-gray-800 font-medium text-sm">{a.title}</h3>
                                            <span className={cn(
                                                "inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium border flex-shrink-0",
                                                a.status === "sent"
                                                    ? "bg-green-50 text-green-700 border-green-200"
                                                    : "bg-gray-100 text-gray-500 border-gray-200"
                                            )}>
                                                {a.status === "sent" ? <CheckCircle className="w-3 h-3" /> : <Clock className="w-3 h-3" />}
                                                {a.status}
                                            </span>
                                        </div>
                                        <p className="text-gray-500 text-xs line-clamp-2 mb-3">{a.body}</p>
                                        <div className="flex items-center gap-4 text-xs text-gray-400">
                                            <span className="flex items-center gap-1">
                                                <AudIcon className={cn("w-3 h-3", cfg?.color)} />
                                                {cfg?.label ?? a.target_audience}
                                            </span>
                                            <span>{a.recipient_count.toLocaleString()} recipients</span>
                                            <span className="ml-auto text-gray-500 font-medium">{format(new Date(a.sent_at), "MMM d, yyyy")}</span>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>
        </AdminLayout>
    );
}
