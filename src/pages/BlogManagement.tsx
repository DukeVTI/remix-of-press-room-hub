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
  active: "bg-green-50 text-green-700 border-green-200",
  hidden: "bg-amber-50 text-amber-700 border-amber-200",
  deleted: "bg-rose-50 text-rose-700 border-rose-200",
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
        <TabsList className="bg-gray-100 border border-gray-200 mb-6">
          <TabsTrigger value="blogs" className="data-[state=active]:bg-green-600 data-[state=active]:text-white text-gray-500">
            Blogs ({blogs.length})
          </TabsTrigger>
          <TabsTrigger value="categories" className="data-[state=active]:bg-green-600 data-[state=active]:text-white text-gray-500">
            Categories ({categories.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="blogs">
          {/* Filters */}
          <div className="flex gap-3 mb-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
              <Input placeholder="Search blogs…" value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9 bg-white border-gray-200 text-gray-800 placeholder:text-gray-400 focus:border-green-500" />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-36 bg-white border-gray-200 text-gray-800">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent className="bg-white border-gray-200 text-gray-800">
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="hidden">Hidden</SelectItem>
                <SelectItem value="deleted">Deleted</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="rounded-xl border border-gray-200 bg-white overflow-hidden shadow-sm">
            <div className="grid grid-cols-[2fr_100px_100px_80px_44px] gap-4 px-4 py-3 border-b border-gray-100 text-xs font-medium text-gray-500 uppercase tracking-wider bg-gray-50">
              <span>Blog</span><span>Status</span><span>Followers</span><span>Verified</span><span />
            </div>
            {loading ? (
              <div className="divide-y divide-gray-100">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="h-16 px-4 flex items-center gap-4 animate-pulse">
                    <div className="w-9 h-9 rounded-full bg-gray-200" />
                    <div className="flex-1 h-4 bg-gray-200 rounded" />
                    <div className="w-16 h-5 bg-gray-200 rounded-full" />
                  </div>
                ))}
              </div>
            ) : filtered.length === 0 ? (
              <AdminEmptyState icon={BookOpen} title="No blogs found" className="rounded-none border-0" />
            ) : (
              <div className="divide-y divide-gray-100">
                {filtered.map((blog) => (
                  <div key={blog.id} className="grid grid-cols-[2fr_100px_100px_80px_44px] gap-4 px-4 py-3.5 items-center hover:bg-gray-50 transition-colors">
                    <div className="flex items-center gap-3 min-w-0">
                      <Avatar className="w-9 h-9 flex-shrink-0 border border-gray-200">
                        <AvatarImage src={blog.profile_photo_url} />
                        <AvatarFallback className="bg-green-600 text-white text-xs">{blog.blog_name[0]}</AvatarFallback>
                      </Avatar>
                      <div className="min-w-0">
                        <p className="text-gray-800 text-sm font-medium truncate">{blog.blog_name}</p>
                        <p className="text-gray-500 text-xs">/{blog.slug}</p>
                      </div>
                    </div>
                    <span className={cn("inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border capitalize w-fit", BLOG_STATUS_CFG[blog.status])}>
                      {blog.status}
                    </span>
                    <span className="text-gray-600 text-sm tabular-nums">{blog.follower_count.toLocaleString()}</span>
                    <span>{blog.is_verified ? <span className="text-green-600 text-xs flex items-center gap-1"><ShieldCheck className="w-3.5 h-3.5" /> Yes</span> : <span className="text-gray-400 text-xs">—</span>}</span>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button size="icon" variant="ghost" className="text-gray-400 hover:text-gray-600 h-8 w-8 hover:bg-gray-100">
                          <MoreVertical className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="bg-white border-gray-200 text-gray-800">
                        <DropdownMenuItem className="gap-2 cursor-pointer focus:bg-gray-100" onClick={() => setConfirmAction({ type: "feature", id: blog.id, label: "Feature this blog on the platform homepage?", variant: "default" })}>
                          <Star className="w-3.5 h-3.5 text-amber-500" /> Feature
                        </DropdownMenuItem>
                        <DropdownMenuItem className="gap-2 cursor-pointer focus:bg-gray-100" onClick={() => setConfirmAction({ type: "verify", id: blog.id, label: "Mark this blog as verified?", variant: "default" })}>
                          <ShieldCheck className="w-3.5 h-3.5 text-green-600" /> Verify
                        </DropdownMenuItem>
                        <DropdownMenuItem className="gap-2 cursor-pointer focus:bg-gray-100" onClick={() => setConfirmAction({ type: "suspend", id: blog.id, label: "Suspend this blog? It will be hidden from public.", variant: "warning" })}>
                          <Ban className="w-3.5 h-3.5 text-amber-500" /> Suspend
                        </DropdownMenuItem>
                        <DropdownMenuSeparator className="bg-gray-100" />
                        <DropdownMenuItem className="gap-2 cursor-pointer focus:bg-rose-50 text-rose-600 focus:text-rose-700" onClick={() => setConfirmAction({ type: "delete", id: blog.id, label: "Delete this blog permanently?", variant: "destructive" })}>
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
          <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
            <div className="flex gap-3 mb-6">
              <Input placeholder="New category name…" value={newCategory} onChange={(e) => setNewCategory(e.target.value)} className="bg-white border-gray-200 text-gray-800 placeholder:text-gray-400 focus:border-green-500" />
              <Button onClick={addCategory} className="bg-green-600 hover:bg-green-700 text-white gap-2 flex-shrink-0">
                <Tag className="w-4 h-4" /> Add
              </Button>
            </div>
            {categories.length === 0 ? (
              <AdminEmptyState icon={Tag} title="No categories yet" description="Add your first category above." className="border-0 py-8" />
            ) : (
              <div className="space-y-2">
                {categories.map((cat) => (
                  <div key={cat.id} className="flex items-center justify-between px-4 py-3 rounded-lg border border-gray-100 bg-gray-50 hover:border-green-300 transition-colors">
                    <div>
                      <p className="text-gray-800 text-sm font-medium">{cat.name}</p>
                      <p className="text-gray-500 text-xs">/{cat.slug}</p>
                    </div>
                    <Button size="icon" variant="ghost" onClick={() => deleteCategory(cat.id)} className="w-8 h-8 text-gray-400 hover:text-rose-600 hover:bg-rose-50">
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
