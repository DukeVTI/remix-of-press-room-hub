import { useEffect, useState, useCallback } from "react";
import { useSeo } from "@/hooks/useSeo";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { AdminEmptyState } from "@/components/admin/AdminEmptyState";
import { AdminConfirmDialog } from "@/components/admin/AdminConfirmDialog";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { BookOpen, Search, Star, ShieldCheck, Ban, Trash2, MoreVertical, Tag } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { formatDistanceToNow } from "date-fns";
import { cn } from "@/lib/utils";

interface Blog {
  id: string;
  blog_name: string;
  slug: string;
  status: string;
  is_verified: boolean;
  follower_count: number;
  created_at: string;
  profile_photo_url: string;
}

interface Category {
  id: string;
  name: string;
  slug: string;
  created_at: string;
}

const BLOG_STATUS_CFG: Record<string, string> = {
  active: "bg-emerald-500/15 text-emerald-300 border-emerald-500/30",
  hidden: "bg-amber-500/15 text-amber-300 border-amber-500/30",
  deleted: "bg-rose-500/15 text-rose-300 border-rose-500/30",
};

export default function BlogManagement() {
  useSeo({ title: "Blog Management", description: "Manage all platform blogs.", noindex: true });
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [tab, setTab] = useState("blogs");
  const [confirmAction, setConfirmAction] = useState<null | { type: string; id: string; label: string; variant: "destructive" | "warning" | "default" }>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [newCategory, setNewCategory] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    let q = supabase.from("blogs").select("id,blog_name,slug,status,is_verified,follower_count,created_at,profile_photo_url").order("created_at", { ascending: false });
    if (statusFilter !== "all") q = q.eq("status", statusFilter);
    const [{ data: blogsData }, { data: catsData }] = await Promise.all([q, supabase.from("blog_categories").select("*").order("name")]);
    setBlogs(blogsData as Blog[] ?? []);
    setCategories(catsData as Category[] ?? []);
    setLoading(false);
  }, [statusFilter]);

  useEffect(() => { load(); }, [load]);

  const filtered = blogs.filter((b) =>
    search === "" || b.blog_name.toLowerCase().includes(search.toLowerCase()) || b.slug.includes(search.toLowerCase())
  );

  const handleAction = async () => {
    if (!confirmAction) return;
    setActionLoading(true);
    const { type, id } = confirmAction;
    const newStatus = type === "suspend" ? "hidden" : type === "delete" ? "deleted" : "active";
    await supabase.from("blogs").update({ status: newStatus, ...(type === "verify" ? { is_verified: true } : {}) }).eq("id", id);
    toast.success(`Blog ${type}d successfully`);
    setActionLoading(false);
    setConfirmAction(null);
    load();
  };

  const addCategory = async () => {
    if (!newCategory.trim()) return;
    const slug = newCategory.toLowerCase().replace(/\s+/g, "-");
    const { error } = await supabase.from("blog_categories").insert({ name: newCategory.trim(), slug });
    if (error) { toast.error("Failed to add category"); return; }
    toast.success("Category added");
    setNewCategory("");
    load();
  };

  const deleteCategory = async (id: string) => {
    await supabase.from("blog_categories").delete().eq("id", id);
    toast.success("Category deleted");
    load();
  };

  return (
    <AdminLayout title="Blog Management" breadcrumbs={[{ label: "Blogs" }]}>
      <Tabs value={tab} onValueChange={setTab}>
        <TabsList className="bg-slate-900 border border-slate-800 mb-6">
          <TabsTrigger value="blogs" className="data-[state=active]:bg-indigo-600 data-[state=active]:text-white text-slate-400">
            Blogs ({blogs.length})
          </TabsTrigger>
          <TabsTrigger value="categories" className="data-[state=active]:bg-indigo-600 data-[state=active]:text-white text-slate-400">
            Categories ({categories.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="blogs">
          {/* Filters */}
          <div className="flex gap-3 mb-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <Input placeholder="Search blogs…" value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9 bg-slate-900 border-slate-700 text-slate-200 placeholder:text-slate-500 focus:border-indigo-500" />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-36 bg-slate-900 border-slate-700 text-slate-300">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent className="bg-slate-900 border-slate-700 text-slate-200">
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="hidden">Hidden</SelectItem>
                <SelectItem value="deleted">Deleted</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="rounded-xl border border-slate-800 bg-slate-900/60 overflow-hidden">
            <div className="grid grid-cols-[2fr_100px_100px_80px_44px] gap-4 px-4 py-3 border-b border-slate-800 text-xs font-medium text-slate-500 uppercase tracking-wider">
              <span>Blog</span><span>Status</span><span>Followers</span><span>Verified</span><span />
            </div>
            {loading ? (
              <div className="divide-y divide-slate-800">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="h-16 px-4 flex items-center gap-4 animate-pulse">
                    <div className="w-9 h-9 rounded-full bg-slate-800" />
                    <div className="flex-1 h-4 bg-slate-800 rounded" />
                    <div className="w-16 h-5 bg-slate-800 rounded-full" />
                  </div>
                ))}
              </div>
            ) : filtered.length === 0 ? (
              <AdminEmptyState icon={BookOpen} title="No blogs found" className="rounded-none border-0" />
            ) : (
              <div className="divide-y divide-slate-800/60">
                {filtered.map((blog) => (
                  <div key={blog.id} className="grid grid-cols-[2fr_100px_100px_80px_44px] gap-4 px-4 py-3.5 items-center hover:bg-slate-800/30 transition-colors">
                    <div className="flex items-center gap-3 min-w-0">
                      <Avatar className="w-9 h-9 flex-shrink-0 border border-slate-700">
                        <AvatarImage src={blog.profile_photo_url} />
                        <AvatarFallback className="bg-indigo-700 text-white text-xs">{blog.blog_name[0]}</AvatarFallback>
                      </Avatar>
                      <div className="min-w-0">
                        <p className="text-slate-200 text-sm font-medium truncate">{blog.blog_name}</p>
                        <p className="text-slate-500 text-xs">/{blog.slug}</p>
                      </div>
                    </div>
                    <span className={cn("inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border capitalize w-fit", BLOG_STATUS_CFG[blog.status])}>
                      {blog.status}
                    </span>
                    <span className="text-slate-300 text-sm tabular-nums">{blog.follower_count.toLocaleString()}</span>
                    <span>{blog.is_verified ? <span className="text-emerald-400 text-xs flex items-center gap-1"><ShieldCheck className="w-3.5 h-3.5" /> Yes</span> : <span className="text-slate-600 text-xs">—</span>}</span>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button size="icon" variant="ghost" className="text-slate-500 hover:text-slate-300 h-8 w-8">
                          <MoreVertical className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="bg-slate-900 border-slate-800 text-slate-200">
                        <DropdownMenuItem className="gap-2 cursor-pointer focus:bg-slate-800" onClick={() => setConfirmAction({ type: "feature", id: blog.id, label: "Feature this blog on the platform homepage?", variant: "default" })}>
                          <Star className="w-3.5 h-3.5 text-amber-400" /> Feature
                        </DropdownMenuItem>
                        <DropdownMenuItem className="gap-2 cursor-pointer focus:bg-slate-800" onClick={() => setConfirmAction({ type: "verify", id: blog.id, label: "Mark this blog as verified?", variant: "default" })}>
                          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" /> Verify
                        </DropdownMenuItem>
                        <DropdownMenuItem className="gap-2 cursor-pointer focus:bg-slate-800" onClick={() => setConfirmAction({ type: "suspend", id: blog.id, label: "Suspend this blog? It will be hidden from public.", variant: "warning" })}>
                          <Ban className="w-3.5 h-3.5 text-amber-400" /> Suspend
                        </DropdownMenuItem>
                        <DropdownMenuSeparator className="bg-slate-800" />
                        <DropdownMenuItem className="gap-2 cursor-pointer focus:bg-rose-950/40 text-rose-400" onClick={() => setConfirmAction({ type: "delete", id: blog.id, label: "Delete this blog permanently?", variant: "destructive" })}>
                          <Trash2 className="w-3.5 h-3.5" /> Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                ))}
              </div>
            )}
          </div>
        </TabsContent>

        {/* Categories tab */}
        <TabsContent value="categories">
          <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-5">
            <div className="flex gap-3 mb-6">
              <Input placeholder="New category name…" value={newCategory} onChange={(e) => setNewCategory(e.target.value)} className="bg-slate-900 border-slate-700 text-slate-200 placeholder:text-slate-500 focus:border-indigo-500" />
              <Button onClick={addCategory} className="bg-indigo-600 hover:bg-indigo-700 text-white gap-2 flex-shrink-0">
                <Tag className="w-4 h-4" /> Add
              </Button>
            </div>
            {categories.length === 0 ? (
              <AdminEmptyState icon={Tag} title="No categories yet" description="Add your first category above." className="border-0 py-8" />
            ) : (
              <div className="space-y-2">
                {categories.map((cat) => (
                  <div key={cat.id} className="flex items-center justify-between px-4 py-3 rounded-lg bg-slate-800/50 hover:bg-slate-800 transition-colors">
                    <div>
                      <p className="text-slate-200 text-sm font-medium">{cat.name}</p>
                      <p className="text-slate-500 text-xs">/{cat.slug}</p>
                    </div>
                    <Button size="icon" variant="ghost" onClick={() => deleteCategory(cat.id)} className="w-8 h-8 text-slate-500 hover:text-rose-400 hover:bg-rose-500/10">
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  </div>
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
        onConfirm={handleAction}
        loading={actionLoading}
        variant={confirmAction?.variant ?? "default"}
      />
    </AdminLayout>
  );
}
