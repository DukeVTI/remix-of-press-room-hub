import { useEffect, useState, useCallback } from "react";
import { useSeo } from "@/hooks/useSeo";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { AdminEmptyState } from "@/components/admin/AdminEmptyState";
import { AdminConfirmDialog } from "@/components/admin/AdminConfirmDialog";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import {
  Users, Search, Ban, CheckCircle, AlertTriangle, ShieldCheck, Trash2, MoreVertical,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { formatDistanceToNow, format } from "date-fns";
import { cn } from "@/lib/utils";

type AccountStatus = "active" | "suspended" | "deactivated";

interface Profile {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  screen_name: string | null;
  account_status: AccountStatus;
  is_verified: boolean;
  created_at: string;
  profile_photo_url: string | null;
}

const STATUS_CFG: Record<AccountStatus, { label: string; color: string }> = {
  active: { label: "Active", color: "bg-emerald-500/15 text-emerald-300 border-emerald-500/30" },
  suspended: { label: "Suspended", color: "bg-rose-500/15 text-rose-300 border-rose-500/30" },
  deactivated: { label: "Deactivated", color: "bg-slate-500/15 text-slate-400 border-slate-500/30" },
};

export default function UserManagement() {
  useSeo({ title: "User Management", description: "Manage user accounts.", noindex: true });
  const [users, setUsers] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selected, setSelected] = useState<Profile | null>(null);
  const [confirmAction, setConfirmAction] = useState<null | { type: string; label: string; variant: "destructive" | "warning" | "default"; newStatus?: AccountStatus }>(null);
  const [actionLoading, setActionLoading] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    let q = supabase.from("profiles").select("*").order("created_at", { ascending: false });
    if (statusFilter !== "all") q = q.eq("account_status", statusFilter);
    const { data } = await q;
    setUsers(data as Profile[] ?? []);
    setLoading(false);
  }, [statusFilter]);

  useEffect(() => { load(); }, [load]);

  const filtered = users.filter((u) =>
    search === "" ||
    `${u.first_name} ${u.last_name}`.toLowerCase().includes(search.toLowerCase()) ||
    u.email.toLowerCase().includes(search.toLowerCase()) ||
    (u.screen_name ?? "").toLowerCase().includes(search.toLowerCase())
  );

  const handleAction = async () => {
    if (!confirmAction || !selected) return;
    setActionLoading(true);
    if (confirmAction.newStatus) {
      await supabase.from("profiles").update({ account_status: confirmAction.newStatus }).eq("id", selected.id);
      toast.success(`User ${confirmAction.type}`);
    }
    setActionLoading(false);
    setConfirmAction(null);
    setSelected(null);
    load();
  };

  return (
    <AdminLayout title="User Management" breadcrumbs={[{ label: "Users" }]}>
      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <Input
            placeholder="Search by name, email, or username…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 bg-slate-900 border-slate-700 text-slate-200 placeholder:text-slate-500 focus:border-indigo-500"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-40 bg-slate-900 border-slate-700 text-slate-300">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent className="bg-slate-900 border-slate-700 text-slate-200">
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="suspended">Suspended</SelectItem>
            <SelectItem value="deactivated">Deactivated</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      <div className="rounded-xl border border-slate-800 bg-slate-900/60 overflow-hidden">
        <div className="grid grid-cols-[2fr_1fr_100px_80px_44px] gap-4 px-4 py-3 border-b border-slate-800 text-xs font-medium text-slate-500 uppercase tracking-wider">
          <span>User</span>
          <span>Joined</span>
          <span>Status</span>
          <span>Verified</span>
          <span />
        </div>

        {loading ? (
          <div className="divide-y divide-slate-800">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="h-16 px-4 flex items-center gap-4 animate-pulse">
                <div className="w-9 h-9 rounded-full bg-slate-800" />
                <div className="flex-1 space-y-1.5">
                  <div className="h-3.5 w-32 bg-slate-800 rounded" />
                  <div className="h-3 w-40 bg-slate-800 rounded" />
                </div>
                <div className="w-20 h-5 bg-slate-800 rounded-full" />
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <AdminEmptyState
            icon={Users}
            title="No users found"
            description="No users match your search or filters."
            className="rounded-none border-0"
          />
        ) : (
          <div className="divide-y divide-slate-800/60">
            {filtered.map((user) => {
              const statusCfg = STATUS_CFG[user.account_status];
              const initials = `${user.first_name[0] ?? ""}${user.last_name[0] ?? ""}`.toUpperCase();
              return (
                <div
                  key={user.id}
                  onClick={() => setSelected(user)}
                  className="grid grid-cols-[2fr_1fr_100px_80px_44px] gap-4 px-4 py-3.5 items-center hover:bg-slate-800/40 cursor-pointer transition-colors"
                >
                  {/* User info */}
                  <div className="flex items-center gap-3 min-w-0">
                    <Avatar className="w-9 h-9 flex-shrink-0 border border-slate-700">
                      <AvatarImage src={user.profile_photo_url ?? undefined} />
                      <AvatarFallback className="bg-indigo-700 text-white text-xs">{initials}</AvatarFallback>
                    </Avatar>
                    <div className="min-w-0">
                      <p className="text-slate-200 text-sm font-medium truncate">
                        {user.first_name} {user.last_name}
                        {user.screen_name && (
                          <span className="text-slate-500 font-normal"> @{user.screen_name}</span>
                        )}
                      </p>
                      <p className="text-slate-500 text-xs truncate">{user.email}</p>
                    </div>
                  </div>
                  <span className="text-slate-400 text-xs">
                    {formatDistanceToNow(new Date(user.created_at), { addSuffix: true })}
                  </span>
                  <span className={cn("inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border w-fit", statusCfg.color)}>
                    {statusCfg.label}
                  </span>
                  <span>{user.is_verified ? (
                    <span className="flex items-center gap-1 text-emerald-400 text-xs"><ShieldCheck className="w-3.5 h-3.5" /> Yes</span>
                  ) : (
                    <span className="text-slate-600 text-xs">—</span>
                  )}</span>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                      <Button size="icon" variant="ghost" className="text-slate-500 hover:text-slate-300 h-8 w-8">
                        <MoreVertical className="w-4 h-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="bg-slate-900 border-slate-800 text-slate-200">
                      <DropdownMenuItem
                        className="gap-2 cursor-pointer focus:bg-slate-800"
                        onClick={(e) => { e.stopPropagation(); setSelected(user); setConfirmAction({ type: "verified", label: "Mark this user as verified?", variant: "default", newStatus: "active" }); }}
                      >
                        <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" /> Verify
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        className="gap-2 cursor-pointer focus:bg-slate-800"
                        onClick={(e) => { e.stopPropagation(); setSelected(user); setConfirmAction({ type: "warned", label: "Send a warning to this user?", variant: "warning" }); }}
                      >
                        <AlertTriangle className="w-3.5 h-3.5 text-amber-400" /> Warn
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        className="gap-2 cursor-pointer focus:bg-slate-800"
                        onClick={(e) => { e.stopPropagation(); setSelected(user); setConfirmAction({ type: "suspended", label: "Suspend this user? Their access will be restricted.", variant: "destructive", newStatus: "suspended" }); }}
                      >
                        <Ban className="w-3.5 h-3.5 text-rose-400" /> Suspend
                      </DropdownMenuItem>
                      <DropdownMenuSeparator className="bg-slate-800" />
                      <DropdownMenuItem
                        className="gap-2 cursor-pointer focus:bg-rose-950/40 text-rose-400"
                        onClick={(e) => { e.stopPropagation(); setSelected(user); setConfirmAction({ type: "deleted", label: "Delete this user permanently? This cannot be undone.", variant: "destructive", newStatus: "deactivated" }); }}
                      >
                        <Trash2 className="w-3.5 h-3.5" /> Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* User detail sheet */}
      <Sheet open={!!selected && !confirmAction} onOpenChange={(o) => !o && setSelected(null)}>
        <SheetContent className="bg-slate-900 border-slate-800 text-slate-200 w-full sm:max-w-md">
          <SheetHeader className="mb-6">
            <SheetTitle className="text-white flex items-center gap-2">
              <Users className="w-4 h-4 text-indigo-400" />
              User Profile
            </SheetTitle>
          </SheetHeader>
          {selected && (
            <div className="space-y-4">
              <div className="flex items-center gap-4 p-4 bg-slate-800/60 rounded-xl">
                <Avatar className="w-14 h-14 border-2 border-slate-700">
                  <AvatarImage src={selected.profile_photo_url ?? undefined} />
                  <AvatarFallback className="bg-indigo-700 text-white text-lg">
                    {`${selected.first_name[0]}${selected.last_name[0]}`.toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="text-white font-semibold text-lg">{selected.first_name} {selected.last_name}</p>
                  {selected.screen_name && <p className="text-slate-400 text-sm">@{selected.screen_name}</p>}
                  <p className="text-slate-500 text-xs">{selected.email}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-slate-800/60 rounded-lg p-3">
                  <p className="text-slate-500 text-xs mb-1">Status</p>
                  <span className={cn("inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border", STATUS_CFG[selected.account_status].color)}>
                    {STATUS_CFG[selected.account_status].label}
                  </span>
                </div>
                <div className="bg-slate-800/60 rounded-lg p-3">
                  <p className="text-slate-500 text-xs mb-1">Verified</p>
                  <p className={cn("text-sm font-semibold", selected.is_verified ? "text-emerald-400" : "text-slate-500")}>
                    {selected.is_verified ? "Yes" : "No"}
                  </p>
                </div>
                <div className="bg-slate-800/60 rounded-lg p-3 col-span-2">
                  <p className="text-slate-500 text-xs mb-1">Joined</p>
                  <p className="text-slate-200 text-sm">{format(new Date(selected.created_at), "PPP")}</p>
                </div>
              </div>
              <div className="border-t border-slate-800 pt-4 grid grid-cols-2 gap-2">
                <Button
                  size="sm"
                  className="bg-emerald-600 hover:bg-emerald-700 text-white gap-1.5"
                  onClick={() => setConfirmAction({ type: "reactivated", label: "Reactivate this user account?", variant: "default", newStatus: "active" })}
                >
                  <CheckCircle className="w-3.5 h-3.5" /> Reactivate
                </Button>
                <Button
                  size="sm"
                  className="bg-rose-700 hover:bg-rose-600 text-white gap-1.5"
                  onClick={() => setConfirmAction({ type: "suspended", label: "Suspend this user?", variant: "destructive", newStatus: "suspended" })}
                >
                  <Ban className="w-3.5 h-3.5" /> Suspend
                </Button>
              </div>
            </div>
          )}
        </SheetContent>
      </Sheet>

      <AdminConfirmDialog
        open={!!confirmAction}
        onOpenChange={(o) => !o && setConfirmAction(null)}
        title={`Confirm action`}
        description={confirmAction?.label ?? ""}
        confirmLabel="Confirm"
        onConfirm={handleAction}
        loading={actionLoading}
        variant={confirmAction?.variant ?? "default"}
      />
    </AdminLayout>
  );
}
