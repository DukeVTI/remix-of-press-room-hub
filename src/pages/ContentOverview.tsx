import { useEffect, useState, useCallback } from "react";
import { useSeo } from "@/hooks/useSeo";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { AdminEmptyState } from "@/components/admin/AdminEmptyState";
import { AdminConfirmDialog } from "@/components/admin/AdminConfirmDialog";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { FileText, Search, EyeOff, Trash2, Pin, Flag } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { formatDistanceToNow } from "date-fns";
import { cn } from "@/lib/utils";

interface Post {
  id: string;
  headline: string;
  status: string;
  view_count: number;
  approval_count: number;
  comment_count: number;
  created_at: string;
  blog_id: string;
  author_id: string;
}

interface Comment {
  id: string;
  content: string;
  status: string;
  created_at: string;
  post_id: string;
  user_id: string;
}

const POST_STATUS_CFG: Record<string, string> = {
  published: "bg-green-50 text-green-700 border-green-200",
  draft: "bg-gray-100 text-gray-600 border-gray-200",
  hidden: "bg-rose-50 text-rose-700 border-rose-200",
  deleted: "bg-gray-100 text-gray-500 border-gray-200",
};

export default function ContentOverview() {
  useSeo({ title: "Content Overview", description: "Monitor and moderate posts and comments.", noindex: true });
  const [posts, setPosts] = useState<Post[]>([]);
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [tab, setTab] = useState("posts");
  const [confirmAction, setConfirmAction] = useState<null | { type: string; id: string; tableType: "posts" | "comments" }>(null);
  const [actionLoading, setActionLoading] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    const [{ data: postsData }, { data: commentsData }] = await Promise.all([
      supabase.from("posts").select("id,headline,status,view_count,approval_count,comment_count,created_at,blog_id,author_id").order("created_at", { ascending: false }).limit(100),
      supabase.from("comments").select("id,content,status,created_at,post_id,user_id").order("created_at", { ascending: false }).limit(100),
    ]);
    setPosts(postsData as Post[] ?? []);
    setComments(commentsData as Comment[] ?? []);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const filteredPosts = posts.filter((p) =>
    search === "" || p.headline.toLowerCase().includes(search.toLowerCase())
  );

  const filteredComments = comments.filter((c) =>
    search === "" || c.content.toLowerCase().includes(search.toLowerCase())
  );

  const flaggedPosts = posts.filter((p) => p.status === "hidden");

  const handleAction = async () => {
    if (!confirmAction) return;
    setActionLoading(true);
    const { type, id, tableType } = confirmAction;
    let newStatus = type === "hide" ? "hidden" : type === "delete" ? "deleted" : "published";
    await supabase.from(tableType).update({ status: newStatus as any }).eq("id", id);
    toast.success(`Content ${type === "hide" ? "hidden" : type === "delete" ? "deleted" : "restored"}`);
    setActionLoading(false);
    setConfirmAction(null);
    load();
  };

  const renderPostsTable = (data: Post[]) => (
    data.length === 0 ? (
      <AdminEmptyState icon={FileText} title="No posts found" description="No posts match your search." className="rounded-none border-0" />
    ) : (
      <div className="divide-y divide-gray-100">
        {data.map((post) => (
          <div key={post.id} className="grid grid-cols-[1fr_100px_80px_80px_80px_120px] gap-4 px-4 py-3.5 items-center hover:bg-gray-50 transition-colors">
            <div>
              <p className="text-gray-800 text-sm font-medium truncate">{post.headline}</p>
              <p className="text-gray-400 text-xs">{formatDistanceToNow(new Date(post.created_at), { addSuffix: true })}</p>
            </div>
            <span className={cn("inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border capitalize", POST_STATUS_CFG[post.status] ?? "")}>
              {post.status}
            </span>
            <span className="text-gray-500 text-xs text-right">{post.view_count.toLocaleString()} views</span>
            <span className="text-gray-500 text-xs text-right">{post.approval_count} 👍</span>
            <span className="text-gray-500 text-xs text-right">{post.comment_count} 💬</span>
            <div className="flex items-center gap-1">
              <Button
                size="icon"
                variant="ghost"
                title="Hide"
                onClick={() => setConfirmAction({ type: "hide", id: post.id, tableType: "posts" })}
                className="w-7 h-7 text-gray-400 hover:text-amber-600 hover:bg-amber-50"
              >
                <EyeOff className="w-3.5 h-3.5" />
              </Button>
              <Button
                size="icon"
                variant="ghost"
                title="Delete"
                onClick={() => setConfirmAction({ type: "delete", id: post.id, tableType: "posts" })}
                className="w-7 h-7 text-gray-400 hover:text-rose-500 hover:bg-rose-50"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </Button>
            </div>
          </div>
        ))}
      </div>
    )
  );

  return (
    <AdminLayout title="Content Overview" breadcrumbs={[{ label: "Content" }]}>
      {/* Stats strip */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        {[
          { label: "Total Posts", value: posts.length, color: "text-green-600" },
          { label: "Total Comments", value: comments.length, color: "text-blue-600" },
          { label: "Hidden/Flagged", value: flaggedPosts.length, color: "text-rose-600" },
        ].map(({ label, value, color }) => (
          <div key={label} className="rounded-xl border border-gray-200 bg-white p-4">
            <p className="text-gray-400 text-xs mb-1">{label}</p>
            <p className={cn("text-2xl font-bold tabular-nums", color)}>{value.toLocaleString()}</p>
          </div>
        ))}
      </div>

      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
        <Input
          placeholder="Search content…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9 bg-white border-gray-200 text-gray-800 placeholder:text-gray-400 focus:border-green-500"
        />
      </div>

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList className="bg-gray-100 border border-gray-200 mb-4">
          <TabsTrigger value="posts" className="data-[state=active]:bg-green-600 data-[state=active]:text-white text-gray-500">
            Posts ({filteredPosts.length})
          </TabsTrigger>
          <TabsTrigger value="comments" className="data-[state=active]:bg-green-600 data-[state=active]:text-white text-gray-500">
            Comments ({filteredComments.length})
          </TabsTrigger>
          <TabsTrigger value="flagged" className="data-[state=active]:bg-rose-600 data-[state=active]:text-white text-gray-500">
            Flagged ({flaggedPosts.length})
          </TabsTrigger>
        </TabsList>

        <div className="rounded-xl border border-gray-200 bg-white overflow-hidden">
          <div className="grid grid-cols-[1fr_100px_80px_80px_80px_120px] gap-4 px-4 py-3 border-b border-gray-100 text-xs font-medium text-gray-500 uppercase tracking-wider">
            <span>Content</span><span>Status</span><span>Views</span><span>Reactions</span><span>Comments</span><span>Actions</span>
          </div>
          <TabsContent value="posts" className="mt-0">{loading ? <div className="h-40 flex items-center justify-center text-gray-400 text-sm animate-pulse">Loading…</div> : renderPostsTable(filteredPosts)}</TabsContent>
          <TabsContent value="comments" className="mt-0">
            {loading ? (
              <div className="h-40 flex items-center justify-center text-gray-400 text-sm animate-pulse">Loading…</div>
            ) : filteredComments.length === 0 ? (
              <AdminEmptyState icon={FileText} title="No comments found" className="rounded-none border-0" />
            ) : (
              <div className="divide-y divide-gray-100">
                {filteredComments.map((comment) => (
                  <div key={comment.id} className="grid grid-cols-[1fr_100px_200px_120px] gap-4 px-4 py-3.5 items-center hover:bg-gray-50 transition-colors">
                    <p className="text-gray-700 text-sm line-clamp-2">{comment.content}</p>
                    <span className={cn("inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border capitalize", POST_STATUS_CFG[comment.status] ?? "")}>
                      {comment.status}
                    </span>
                    <span className="text-gray-500 text-xs">{formatDistanceToNow(new Date(comment.created_at), { addSuffix: true })}</span>
                    <div className="flex items-center gap-1">
                      <Button size="icon" variant="ghost" onClick={() => setConfirmAction({ type: "hide", id: comment.id, tableType: "comments" })} className="w-7 h-7 text-gray-400 hover:text-amber-600 hover:bg-amber-50">
                        <EyeOff className="w-3.5 h-3.5" />
                      </Button>
                      <Button size="icon" variant="ghost" onClick={() => setConfirmAction({ type: "delete", id: comment.id, tableType: "comments" })} className="w-7 h-7 text-gray-400 hover:text-rose-500 hover:bg-rose-50">
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>
          <TabsContent value="flagged" className="mt-0">{loading ? <div className="h-40 flex items-center justify-center text-slate-500 text-sm animate-pulse">Loading…</div> : renderPostsTable(flaggedPosts)}</TabsContent>
        </div>
      </Tabs>

      <AdminConfirmDialog
        open={!!confirmAction}
        onOpenChange={(o) => !o && setConfirmAction(null)}
        title="Confirm moderation action"
        description={confirmAction ? `Are you sure you want to ${confirmAction.type} this content?` : ""}
        confirmLabel={confirmAction?.type === "hide" ? "Hide Content" : "Delete Content"}
        onConfirm={handleAction}
        loading={actionLoading}
        variant={confirmAction?.type === "delete" ? "destructive" : "warning"}
      />
    </AdminLayout>
  );
}
