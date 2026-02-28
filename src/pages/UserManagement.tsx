import { useEffect, useState, useCallback } from "react";
import { useSeo } from "@/hooks/useSeo";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { AdminEmptyState } from "@/components/admin/AdminEmptyState";
import { AdminConfirmDialog } from "@/components/admin/AdminConfirmDialog";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Users, Search, Ban, CheckCircle, AlertTriangle, ShieldCheck, Trash2, MoreVertical } from "lucide-react";
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
  id: string; first_name: string; last_name: string; email: string;
  screen_name: string | null; account_status: AccountStatus;
  is_verified: boolean; created_at: string; profile_photo_url: string | null;
}

const STATUS_CFG: Record<AccountStatus, { label: string; color: string }> = {
  active: { label: "Active", color: "bg-green-50 text-green-700 border-green-200" },
  suspended: { label: "Suspended", color: "bg-rose-50 text-rose-700 border-rose-200" },
  deactivated: { label: "Deactivated", color: "bg-gray-100 text-gray-600 border-gray-200" },
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
    if (statusFilter !== "all") q = (q as any).eq("account_status", statusFilter); // cast: typed union vs string
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
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input placeholder="Search by name, email, or username…" value={search} onChange={(e) => setSearch(e.target.value)}
            className="pl-9 bg-white border-gray-200 text-gray-800 placeholder:text-gray-400 focus:border-green-500" />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-40 bg-white border-gray-200 text-gray-700">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent className="bg-white border-gray-200 text-gray-800">
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="suspended">Suspended</SelectItem>
            <SelectItem value="deactivated">Deactivated</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      <div className="rounded-xl border border-gray-200 bg-white overflow-hidden">
        <div className="grid grid-cols-[2fr_1fr_100px_80px_44px] gap-4 px-4 py-3 border-b border-gray-100 text-xs font-medium text-gray-500 uppercase tracking-wider">
          <span>User</span><span>Joined</span><span>Status</span><span>Verified</span><span />
        </div>

        {loading ? (
          <div className="divide-y divide-gray-100">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="h-16 px-4 flex items-center gap-4 animate-pulse">
                <div className="w-9 h-9 rounded-full bg-gray-100" />
                <div className="flex-1 space-y-1.5">
                  <div className="h-3.5 w-32 bg-gray-100 rounded" />
                  <div className="h-3 w-40 bg-gray-100 rounded" />
                </div>
                <div className="w-20 h-5 bg-gray-100 rounded-full" />
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <AdminEmptyState icon={Users} title="No users found" description="No users match your search or filters." className="rounded-none border-0" />
        ) : (
          <div className="divide-y divide-gray-100">
            {filtered.map((user) => {
              const statusCfg = STATUS_CFG[user.account_status];
              const initials = `${user.first_name[0] ?? ""}${user.last_name[0] ?? ""}`.toUpperCase();
              return (
                <div key={user.id} onClick={() => setSelected(user)}
                  className="grid grid-cols-[2fr_1fr_100px_80px_44px] gap-4 px-4 py-3.5 items-center hover:bg-gray-50 cursor-pointer transition-colors">
                  <div className="flex items-center gap-3 min-w-0">
                    <Avatar className="w-9 h-9 flex-shrink-0 border border-gray-200">
                      <AvatarImage src={user.profile_photo_url ?? undefined} />
                      <AvatarFallback className="bg-green-600 text-white text-xs">{initials}</AvatarFallback>
                    </Avatar>
                    <div className="min-w-0">
                      <p className="text-gray-800 text-sm font-medium truncate">
                        {user.first_name} {user.last_name}
                        {user.screen_name && <span className="text-gray-400 font-normal"> @{user.screen_name}</span>}
                      </p>
                      <p className="text-gray-400 text-xs truncate">{user.email}</p>
                    </div>
                  </div>
                  <span className="text-gray-500 text-xs">{formatDistanceToNow(new Date(user.created_at), { addSuffix: true })}</span>
                  <span className={cn("inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border w-fit", statusCfg.color)}>{statusCfg.label}</span>
                  <span>{user.is_verified ? (
                    <span className="flex items-center gap-1 text-green-600 text-xs"><ShieldCheck className="w-3.5 h-3.5" /> Yes</span>
                  ) : (
                    <span className="text-gray-300 text-xs">—</span>
                  )}</span>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                      <Button size="icon" variant="ghost" className="text-gray-400 hover:text-gray-600 h-8 w-8">
                        <MoreVertical className="w-4 h-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="bg-white border-gray-200 text-gray-700">
                      <DropdownMenuItem className="gap-2 cursor-pointer focus:bg-gray-50"
                        onClick={(e) => { e.stopPropagation(); setSelected(user); setConfirmAction({ type: "verified", label: "Mark this user as verified?", variant: "default", newStatus: "active" }); }}>
                        <ShieldCheck className="w-3.5 h-3.5 text-green-600" /> Verify
                      </DropdownMenuItem>
                      <DropdownMenuItem className="gap-2 cursor-pointer focus:bg-gray-50"
                        onClick={(e) => { e.stopPropagation(); setSelected(user); setConfirmAction({ type: "warned", label: "Send a warning to this user?", variant: "warning" }); }}>
                        <AlertTriangle className="w-3.5 h-3.5 text-amber-500" /> Warn
                      </DropdownMenuItem>
                      <DropdownMenuItem className="gap-2 cursor-pointer focus:bg-gray-50"
                        onClick={(e) => { e.stopPropagation(); setSelected(user); setConfirmAction({ type: "suspended", label: "Suspend this user? Their access will be restricted.", variant: "destructive", newStatus: "suspended" }); }}>
                        <Ban className="w-3.5 h-3.5 text-rose-500" /> Suspend
                      </DropdownMenuItem>
                      <DropdownMenuSeparator className="bg-gray-100" />
                      <DropdownMenuItem className="gap-2 cursor-pointer focus:bg-rose-50 text-rose-500"
                        onClick={(e) => { e.stopPropagation(); setSelected(user); setConfirmAction({ type: "deleted", label: "Delete this user permanently? This cannot be undone.", variant: "destructive", newStatus: "deactivated" }); }}>
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
        <SheetContent className="bg-white border-gray-200 text-gray-800 w-full sm:max-w-md">
          <SheetHeader className="mb-6">
            <SheetTitle className="text-gray-900 flex items-center gap-2">
              <Users className="w-4 h-4 text-green-600" /> User Profile
            </SheetTitle>
          </SheetHeader>
          {selected && (
            <div className="space-y-4">
              <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl">
                <Avatar className="w-14 h-14 border-2 border-gray-200">
                  <AvatarImage src={selected.profile_photo_url ?? undefined} />
                  <AvatarFallback className="bg-green-600 text-white text-lg">
                    {`${selected.first_name[0]}${selected.last_name[0]}`.toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="text-gray-900 font-semibold text-lg">{selected.first_name} {selected.last_name}</p>
                  {selected.screen_name && <p className="text-gray-500 text-sm">@{selected.screen_name}</p>}
                  <p className="text-gray-400 text-xs">{selected.email}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-gray-50 rounded-lg p-3">
                  <p className="text-gray-400 text-xs mb-1">Status</p>
                  <span className={cn("inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border", STATUS_CFG[selected.account_status].color)}>
                    {STATUS_CFG[selected.account_status].label}
                  </span>
                </div>
                <div className="bg-gray-50 rounded-lg p-3">
                  <p className="text-gray-400 text-xs mb-1">Verified</p>
                  <p className={cn("text-sm font-semibold", selected.is_verified ? "text-green-600" : "text-gray-400")}>
                    {selected.is_verified ? "Yes" : "No"}
                  </p>
                </div>
                <div className="bg-gray-50 rounded-lg p-3 col-span-2">
                  <p className="text-gray-400 text-xs mb-1">Joined</p>
                  <p className="text-gray-800 text-sm">{format(new Date(selected.created_at), "PPP")}</p>
                </div>
              </div>
              <div className="border-t border-gray-100 pt-4 grid grid-cols-2 gap-2">
                <Button size="sm" className="bg-green-600 hover:bg-green-700 text-white gap-1.5"
                  onClick={() => setConfirmAction({ type: "reactivated", label: "Reactivate this user account?", variant: "default", newStatus: "active" })}>
                  <CheckCircle className="w-3.5 h-3.5" /> Reactivate
                </Button>
                <Button size="sm" className="bg-rose-600 hover:bg-rose-700 text-white gap-1.5"
                  onClick={() => setConfirmAction({ type: "suspended", label: "Suspend this user?", variant: "destructive", newStatus: "suspended" })}>
                  <Ban className="w-3.5 h-3.5" /> Suspend
                </Button>
              </div>
            </div>
          )}
        </SheetContent>
      </Sheet>

      <AdminConfirmDialog
        open={!!confirmAction} onOpenChange={(o) => !o && setConfirmAction(null)}
        title="Confirm action" description={confirmAction?.label ?? ""}
        confirmLabel="Confirm" onConfirm={handleAction} loading={actionLoading}
        variant={confirmAction?.variant ?? "default"}
      />
    </AdminLayout>
  );
}
