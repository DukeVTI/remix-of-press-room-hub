import { useEffect, useState, useCallback } from "react";
import { useSeo } from "@/hooks/useSeo";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { AdminBadge } from "@/components/admin/AdminBadge";
import { AdminConfirmDialog } from "@/components/admin/AdminConfirmDialog";
import { AdminEmptyState } from "@/components/admin/AdminEmptyState";
import { supabase } from "@/integrations/supabase/client";
import { useAdminAuth } from "@/hooks/useAdminAuth";
import { toast } from "sonner";
import {
    Settings, Shield, Users, UserPlus, Trash2, Crown,
    ToggleLeft, ToggleRight, AlertTriangle, Plus, X
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { formatDistanceToNow } from "date-fns";
import { cn } from "@/lib/utils";

interface AdminRecord {
    id: string;
    user_id: string;
    admin_role: string;
    is_active: boolean;
    assigned_at: string;
    permissions: string[];
    profile: { email: string; full_name: string } | null;
}

type PlatformToggle = { key: string; label: string; description: string; enabled: boolean };

const DEFAULT_TOGGLES: PlatformToggle[] = [
    { key: "registrations_open", label: "Open Registrations", description: "Allow new users to sign up", enabled: true },
    { key: "blog_creation", label: "Blog Creation", description: "Allow users to create new blogs", enabled: true },
    { key: "maintenance_mode", label: "Maintenance Mode", description: "Show maintenance banner to all users", enabled: false },
    { key: "comment_posting", label: "Comment Posting", description: "Allow users to post comments", enabled: true },
    { key: "report_system", label: "Report System", description: "Allow users to flag content", enabled: true },
];

export default function AdminSettings() {
    useSeo({ title: "Admin Settings", description: "Platform settings and admin management.", noindex: true });
    const { adminRole } = useAdminAuth();
    const isSuperAdmin = adminRole === "super_admin";

    const [admins, setAdmins] = useState<AdminRecord[]>([]);
    const [loading, setLoading] = useState(true);
    const [inviteEmail, setInviteEmail] = useState("");
    const [inviteRole, setInviteRole] = useState<string>("moderator");
    const [inviteLoading, setInviteLoading] = useState(false);
    const [toggles, setToggles] = useState<PlatformToggle[]>(DEFAULT_TOGGLES);
    const [blocklist, setBlocklist] = useState<string[]>([]);
    const [newKeyword, setNewKeyword] = useState("");
    const [confirmAction, setConfirmAction] = useState<null | { type: string; id: string; label: string }>(null);
    const [actionLoading, setActionLoading] = useState(false);
    const [tab, setTab] = useState("admins");

    const loadAdmins = useCallback(async () => {
        setLoading(true);
        const { data } = await (supabase as any)
            .from("platform_admins")
            .select("id, user_id, admin_role, is_active, assigned_at, permissions, profiles(email, full_name)")
            .order("assigned_at", { ascending: true });
        const mapped = (data ?? []).map((a: any) => ({
            ...a,
            profile: Array.isArray(a.profiles) ? a.profiles[0] ?? null : a.profiles ?? null,
        }));
        setAdmins(mapped);
        setLoading(false);
    }, []);

    useEffect(() => { loadAdmins(); }, [loadAdmins]);

    const inviteAdmin = async () => {
        if (!inviteEmail.trim()) return;
        setInviteLoading(true);
        // Find user by email in profiles
        const { data: profileData } = await supabase
            .from("profiles")
            .select("id")
            .eq("email", inviteEmail.trim())
            .maybeSingle();
        if (!profileData) {
            toast.error("No user found with that email address");
            setInviteLoading(false);
            return;
        }
        const { error } = await (supabase as any).from("platform_admins").insert({
            user_id: profileData.id,
            admin_role: inviteRole,
            assigned_by: profileData.id,
            permissions: inviteRole === "super_admin" ? ["all"] : [inviteRole],
            is_active: true,
        });
        if (error) {
            toast.error(error.message.includes("duplicate") ? "User is already an admin" : error.message);
        } else {
            toast.success(`${inviteEmail} added as ${inviteRole}`);
            setInviteEmail("");
        }
        setInviteLoading(false);
        loadAdmins();
    };

    const handleAdminAction = async () => {
        if (!confirmAction) return;
        setActionLoading(true);
        const { type, id } = confirmAction;
        if (type === "deactivate") {
            await (supabase as any).from("platform_admins").update({ is_active: false }).eq("id", id);
            toast.success("Admin deactivated");
        } else if (type === "delete") {
            await (supabase as any).from("platform_admins").delete().eq("id", id);
            toast.success("Admin removed");
        } else if (type === "promote") {
            await (supabase as any).from("platform_admins").update({ admin_role: "super_admin", permissions: ["all"] }).eq("id", id);
            toast.success("Admin promoted to Super Admin");
        }
        setActionLoading(false);
        setConfirmAction(null);
        loadAdmins();
    };

    const addKeyword = () => {
        const kw = newKeyword.trim().toLowerCase();
        if (kw && !blocklist.includes(kw)) {
            setBlocklist((prev) => [...prev, kw]);
            setNewKeyword("");
            toast.success("Keyword added to blocklist");
        }
    };

    const removeKeyword = (kw: string) => {
        setBlocklist((prev) => prev.filter((k) => k !== kw));
    };

    const togglePlatformFlag = (key: string) => {
        setToggles((prev) => prev.map((t) => t.key === key ? { ...t, enabled: !t.enabled } : t));
        toast.success("Setting updated");
    };

    return (
        <AdminLayout title="Admin Settings" breadcrumbs={[{ label: "Settings" }]}>
            <Tabs value={tab} onValueChange={setTab}>
                <TabsList className="bg-gray-100 border border-gray-200 mb-6">
                    <TabsTrigger value="admins" className="data-[state=active]:bg-green-600 data-[state=active]:text-white text-gray-500 gap-2">
                        <Users className="w-3.5 h-3.5" /> Admin Team
                    </TabsTrigger>
                    <TabsTrigger value="platform" className="data-[state=active]:bg-green-600 data-[state=active]:text-white text-gray-500 gap-2">
                        <ToggleRight className="w-3.5 h-3.5" /> Platform Flags
                    </TabsTrigger>
                    <TabsTrigger value="automod" className="data-[state=active]:bg-green-600 data-[state=active]:text-white text-gray-500 gap-2">
                        <Shield className="w-3.5 h-3.5" /> Auto-Mod
                    </TabsTrigger>
                </TabsList>

                {/* ADMIN TEAM */}
                <TabsContent value="admins">
                    {isSuperAdmin && (
                        <div className="rounded-xl border border-gray-200 bg-white shadow-sm p-5 mb-6">
                            <h3 className="text-gray-800 font-bold text-sm mb-4 flex items-center gap-2">
                                <UserPlus className="w-4 h-4 text-green-600" /> Add New Admin
                            </h3>
                            <div className="flex gap-3">
                                <Input
                                    placeholder="user@email.com"
                                    value={inviteEmail}
                                    onChange={(e) => setInviteEmail(e.target.value)}
                                    className="flex-1 bg-white border-gray-200 text-gray-800 placeholder:text-gray-400 focus:border-green-500"
                                />
                                <Select value={inviteRole} onValueChange={setInviteRole}>
                                    <SelectTrigger className="w-40 bg-white border-gray-200 text-gray-800">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent className="bg-white border-gray-200 text-gray-800">
                                        <SelectItem value="moderator">Moderator</SelectItem>
                                        <SelectItem value="support">Support</SelectItem>
                                        <SelectItem value="super_admin">Super Admin</SelectItem>
                                    </SelectContent>
                                </Select>
                                <Button onClick={inviteAdmin} disabled={inviteLoading} className="bg-green-600 hover:bg-green-700 text-white flex-shrink-0">
                                    {inviteLoading ? "Adding…" : "Add Admin"}
                                </Button>
                            </div>
                        </div>
                    )}

                    <div className="rounded-xl border border-gray-200 bg-white overflow-hidden shadow-sm">
                        <div className="grid grid-cols-[2fr_120px_120px_80px_100px] gap-4 px-4 py-3 border-b border-gray-100 text-xs font-medium text-gray-500 uppercase tracking-wider bg-gray-50">
                            <span>Admin</span><span>Role</span><span>Added</span><span>Active</span>
                            {isSuperAdmin && <span>Actions</span>}
                        </div>
                        {loading ? (
                            <div className="divide-y divide-gray-100">
                                {Array.from({ length: 3 }).map((_, i) => (
                                    <div key={i} className="h-16 px-4 flex items-center gap-4 animate-pulse">
                                        <div className="w-9 h-9 rounded-full bg-gray-200" />
                                        <div className="flex-1 h-4 bg-gray-200 rounded" />
                                    </div>
                                ))}
                            </div>
                        ) : admins.length === 0 ? (
                            <AdminEmptyState icon={Users} title="No admins found" className="rounded-none border-0" />
                        ) : (
                            <div className="divide-y divide-gray-100">
                                {admins.map((admin) => (
                                    <div key={admin.id} className={cn("grid gap-4 px-4 py-3.5 items-center hover:bg-gray-50 transition-colors", isSuperAdmin ? "grid-cols-[2fr_120px_120px_80px_100px]" : "grid-cols-[2fr_120px_120px_80px]")}>
                                        <div className="flex items-center gap-3 min-w-0">
                                            <Avatar className="w-9 h-9 flex-shrink-0 border border-gray-200">
                                                <AvatarFallback className="bg-green-600 text-white text-xs">
                                                    {(admin.profile?.full_name?.[0] ?? admin.profile?.email?.[0] ?? "A").toUpperCase()}
                                                </AvatarFallback>
                                            </Avatar>
                                            <div className="min-w-0">
                                                <p className="text-gray-800 text-sm font-medium truncate">{admin.profile?.full_name ?? "Unknown"}</p>
                                                <p className="text-gray-500 text-xs truncate">{admin.profile?.email}</p>
                                            </div>
                                        </div>
                                        <AdminBadge role={admin.admin_role as any} />
                                        <span className="text-gray-500 text-xs">{formatDistanceToNow(new Date(admin.assigned_at), { addSuffix: true })}</span>
                                        <span className={cn("text-xs font-medium", admin.is_active ? "text-green-600" : "text-gray-500")}>
                                            {admin.is_active ? "Active" : "Inactive"}
                                        </span>
                                        {isSuperAdmin && (
                                            <div className="flex items-center gap-1">
                                                <Button size="icon" variant="ghost" title="Promote to Super Admin" onClick={() => setConfirmAction({ type: "promote", id: admin.id, label: "Promote this admin to Super Admin?" })} className="w-7 h-7 text-gray-400 hover:text-green-600 hover:bg-green-50">
                                                    <Crown className="w-3.5 h-3.5" />
                                                </Button>
                                                <Button size="icon" variant="ghost" title="Remove" onClick={() => setConfirmAction({ type: "delete", id: admin.id, label: "Remove this admin permanently?" })} className="w-7 h-7 text-gray-400 hover:text-rose-600 hover:bg-rose-50">
                                                    <Trash2 className="w-3.5 h-3.5" />
                                                </Button>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </TabsContent>

                {/* PLATFORM FLAGS */}
                <TabsContent value="platform">
                    <div className="rounded-xl border border-gray-200 bg-white shadow-sm divide-y divide-gray-100">
                        {toggles.map((toggle) => (
                            <div key={toggle.key} className="flex items-center justify-between px-5 py-4">
                                <div>
                                    <p className="text-gray-800 text-sm font-medium">{toggle.label}</p>
                                    <p className="text-gray-500 text-xs mt-0.5">{toggle.description}</p>
                                </div>
                                <Switch
                                    checked={toggle.enabled}
                                    onCheckedChange={() => togglePlatformFlag(toggle.key)}
                                    disabled={!isSuperAdmin}
                                    className="data-[state=checked]:bg-green-600"
                                />
                            </div>
                        ))}
                    </div>
                    {!isSuperAdmin && (
                        <p className="text-gray-500 text-xs mt-3 flex items-center gap-1.5">
                            <AlertTriangle className="w-3.5 h-3.5 text-amber-500" /> Only Super Admins can change platform flags.
                        </p>
                    )}
                </TabsContent>

                {/* AUTO-MOD KEYWORD BLOCKLIST */}
                <TabsContent value="automod">
                    <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
                        <h3 className="text-gray-800 font-bold text-sm mb-1">Keyword Blocklist</h3>
                        <p className="text-gray-500 text-xs mb-5">Content matching these keywords will be auto-flagged for review.</p>
                        <div className="flex gap-3 mb-4">
                            <Input
                                placeholder="Add keyword or phrase…"
                                value={newKeyword}
                                onChange={(e) => setNewKeyword(e.target.value)}
                                onKeyDown={(e) => e.key === "Enter" && addKeyword()}
                                className="flex-1 bg-white border-gray-200 text-gray-800 placeholder:text-gray-400 focus:border-green-500"
                            />
                            <Button onClick={addKeyword} className="bg-green-600 hover:bg-green-700 text-white gap-2 flex-shrink-0">
                                <Plus className="w-4 h-4" /> Add
                            </Button>
                        </div>
                        {blocklist.length === 0 ? (
                            <p className="text-gray-500 text-sm text-center py-6">No keywords yet. Add some above.</p>
                        ) : (
                            <div className="flex flex-wrap gap-2">
                                {blocklist.map((kw) => (
                                    <span key={kw} className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium">
                                        {kw}
                                        <button onClick={() => removeKeyword(kw)} className="text-rose-400 hover:text-rose-600 transition-colors">
                                            <X className="w-3 h-3" />
                                        </button>
                                    </span>
                                ))}
                            </div>
                        )}
                    </div>
                </TabsContent>
            </Tabs>

            <AdminConfirmDialog
                open={!!confirmAction}
                onOpenChange={(o) => !o && setConfirmAction(null)}
                title="Confirm action"
                description={confirmAction?.label ?? ""}
                confirmLabel="Confirm"
                onConfirm={handleAdminAction}
                loading={actionLoading}
                variant={confirmAction?.type === "delete" ? "destructive" : "default"}
            />
        </AdminLayout>
    );
}
