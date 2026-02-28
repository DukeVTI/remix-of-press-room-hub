import { useEffect, useState } from "react";
import { useSeo } from "@/hooks/useSeo";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { supabase } from "@/integrations/supabase/client";
import { BarChart3, Users, BookOpen, FileText, MessageSquare, ThumbsUp, TrendingUp, Activity } from "lucide-react";
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from "recharts";
import { cn } from "@/lib/utils";
import { format, subDays } from "date-fns";

interface TopBlog { id: string; blog_name: string; follower_count: number; is_verified: boolean; }
interface TopPost { id: string; headline: string; view_count: number; approval_count: number; }
interface SummaryStats { users: number; blogs: number; posts: number; comments: number; reactions: number; }

const CHART_COLORS = ["#00ad00", "#3b82f6", "#f59e0b", "#f43f5e", "#a78bfa", "#22d3ee"];

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border border-gray-200 rounded-lg px-3 py-2 text-xs text-gray-700 shadow-lg">
      <p className="text-gray-400 mb-1">{label}</p>
      {payload.map((p: any) => (
        <p key={p.dataKey} style={{ color: p.color }}>{p.name}: <span className="font-bold">{p.value}</span></p>
      ))}
    </div>
  );
};

const ChartCard = ({ title, icon: Icon, color, children, loading, colSpan = "" }: {
  title: string; icon: React.ElementType; color: string; children: React.ReactNode; loading: boolean; colSpan?: string;
}) => (
  <div className={cn("rounded-xl border border-gray-200 bg-white p-5", colSpan)}>
    <div className="flex items-center gap-2 mb-4">
      <Icon className={cn("w-4 h-4", color)} />
      <h2 className="text-gray-800 font-semibold text-sm">{title}</h2>
    </div>
    {loading ? <div className="h-48 bg-gray-100 rounded-lg animate-pulse" /> : children}
  </div>
);

export default function PlatformAnalytics() {
  useSeo({ title: "Platform Analytics", description: "Key platform metrics and growth.", noindex: true });
  const [summary, setSummary] = useState<SummaryStats | null>(null);
  const [topBlogs, setTopBlogs] = useState<TopBlog[]>([]);
  const [topPosts, setTopPosts] = useState<TopPost[]>([]);
  const [postTrend, setPostTrend] = useState<{ date: string; posts: number; users: number }[]>([]);
  const [categoryData, setCategoryData] = useState<{ name: string; value: number }[]>([]);
  const [engagementData, setEngagementData] = useState<{ name: string; posts: number; comments: number; reactions: number }[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadAnalytics() {
      const [
        { count: users },
        { count: blogs },
        { count: posts },
        { count: comments },
        { count: reactions },
        { data: topBlogsData },
        { data: topPostsData },
        { data: recentPosts },
        { data: recentUsers },
        { data: catsData },
        { data: blogsWithCats },
        { data: recentComments },
        { data: topBlogsForEngagement },
      ] = await Promise.all([
        supabase.from("profiles").select("*", { count: "exact", head: true }),
        supabase.from("blogs").select("*", { count: "exact", head: true }),
        supabase.from("posts").select("*", { count: "exact", head: true }),
        supabase.from("comments").select("*", { count: "exact", head: true }),
        supabase.from("post_reactions").select("*", { count: "exact", head: true }),
        supabase.from("blogs").select("id,blog_name,follower_count,is_verified").order("follower_count", { ascending: false }).limit(5),
        supabase.from("posts").select("id,headline,view_count,approval_count").eq("status", "published").order("view_count", { ascending: false }).limit(5),
        supabase.from("posts").select("created_at").gte("created_at", subDays(new Date(), 30).toISOString()).order("created_at"),
        supabase.from("profiles").select("created_at").gte("created_at", subDays(new Date(), 30).toISOString()).order("created_at"),
        supabase.from("blog_categories").select("id, name"),
        supabase.from("blogs").select("category_id"),
        supabase.from("comments").select("created_at").gte("created_at", subDays(new Date(), 14).toISOString()),
        supabase.from("blogs").select("id, blog_name").order("follower_count", { ascending: false }).limit(6),
      ]);

      setSummary({ users: users ?? 0, blogs: blogs ?? 0, posts: posts ?? 0, comments: comments ?? 0, reactions: reactions ?? 0 });
      setTopBlogs(topBlogsData as TopBlog[] ?? []);
      setTopPosts(topPostsData as TopPost[] ?? []);

      // Build 30-day trend (posts + new users)
      const days: Record<string, { posts: number; users: number }> = {};
      for (let i = 29; i >= 0; i--) {
        days[format(subDays(new Date(), i), "MMM d")] = { posts: 0, users: 0 };
      }
      (recentPosts ?? []).forEach((p: any) => {
        const day = format(new Date(p.created_at), "MMM d");
        if (day in days) days[day].posts++;
      });
      (recentUsers ?? []).forEach((u: any) => {
        const day = format(new Date(u.created_at), "MMM d");
        if (day in days) days[day].users++;
      });
      setPostTrend(Object.entries(days).map(([date, v]) => ({ date, ...v })));

      // Category distribution
      const catMap: Record<string, string> = {};
      (catsData ?? []).forEach((c: any) => { catMap[c.id] = c.name; });
      const catCount: Record<string, number> = {};
      (blogsWithCats ?? []).forEach((b: any) => {
        const name = catMap[b.category_id] ?? "Other";
        catCount[name] = (catCount[name] ?? 0) + 1;
      });
      setCategoryData(Object.entries(catCount).sort((a, b) => b[1] - a[1]).slice(0, 6).map(([name, value]) => ({ name, value })));

      // Engagement: posts + comments per top blog (comment matching is approximate via blog_id)
      // Engagement chart: count posts/comments/reactions per top blog
      if (topBlogsForEngagement && topBlogsForEngagement.length > 0) {
        const blogIds = (topBlogsForEngagement as any[]).map((b: any) => b.id);

        // Step 1: get all posts for these blogs
        const { data: blogPostRows } = await supabase.from("posts").select("id, blog_id").in("blog_id", blogIds);
        const postIds = (blogPostRows ?? []).map((p: any) => p.id);

        // Step 2: count comments and reactions by post_id, then map back to blog
        const [{ data: commentsForPosts }, { data: reactionsForPosts }] = await Promise.all([
          postIds.length > 0
            ? (supabase.from("comments").select("post_id") as any).in("post_id", postIds)
            : Promise.resolve({ data: [] }),
          postIds.length > 0
            ? (supabase.from("post_reactions").select("post_id") as any).in("post_id", postIds)
            : Promise.resolve({ data: [] }),
        ]);

        // Build post → blog map
        const postToBlog: Record<string, string> = {};
        (blogPostRows ?? []).forEach((p: any) => { postToBlog[p.id] = p.blog_id; });

        const postCountByBlog: Record<string, number> = {};
        const commentCountByBlog: Record<string, number> = {};
        const reactionCountByBlog: Record<string, number> = {};
        (blogPostRows ?? []).forEach((p: any) => { postCountByBlog[p.blog_id] = (postCountByBlog[p.blog_id] ?? 0) + 1; });
        (commentsForPosts ?? []).forEach((c: any) => { const bid = postToBlog[c.post_id]; if (bid) commentCountByBlog[bid] = (commentCountByBlog[bid] ?? 0) + 1; });
        (reactionsForPosts ?? []).forEach((r: any) => { const bid = postToBlog[r.post_id]; if (bid) reactionCountByBlog[bid] = (reactionCountByBlog[bid] ?? 0) + 1; });

        setEngagementData((topBlogsForEngagement as any[]).map((b: any) => ({
          name: b.blog_name.length > 14 ? b.blog_name.slice(0, 14) + "…" : b.blog_name,
          posts: postCountByBlog[b.id] ?? 0,
          comments: commentCountByBlog[b.id] ?? 0,
          reactions: reactionCountByBlog[b.id] ?? 0,
        })));
      }

      setLoading(false);
    }
    loadAnalytics();
  }, []);

  const summaryItems = [
    { label: "Users", value: summary?.users ?? 0, icon: Users, color: "text-green-600" },
    { label: "Blogs", value: summary?.blogs ?? 0, icon: BookOpen, color: "text-blue-600" },
    { label: "Posts", value: summary?.posts ?? 0, icon: FileText, color: "text-purple-600" },
    { label: "Comments", value: summary?.comments ?? 0, icon: MessageSquare, color: "text-indigo-600" },
    { label: "Reactions", value: summary?.reactions ?? 0, icon: ThumbsUp, color: "text-amber-600" },
  ];

  return (
    <AdminLayout title="Platform Analytics" breadcrumbs={[{ label: "Analytics" }]}>
      {/* Summary strip */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 mb-8">
        {summaryItems.map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="rounded-xl border border-gray-200 bg-white p-4">
            <div className="flex items-center gap-2 mb-2">
              <Icon className={cn("w-4 h-4", color)} />
              <p className="text-gray-400 text-xs">{label}</p>
            </div>
            {loading ? (
              <div className="h-7 w-16 bg-gray-100 rounded animate-pulse" />
            ) : (
              <p className="text-gray-900 text-2xl font-bold tabular-nums">{value.toLocaleString()}</p>
            )}
          </div>
        ))}
      </div>

      {/* Row 1: Growth trend + Category pie */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <ChartCard title="Activity — Last 30 Days" icon={TrendingUp} color="text-green-600" loading={loading} colSpan="lg:col-span-2">
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={postTrend}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="date" tick={{ fill: "#9ca3af", fontSize: 10 }} tickLine={false} axisLine={false} interval={4} />
              <YAxis tick={{ fill: "#9ca3af", fontSize: 10 }} tickLine={false} axisLine={false} allowDecimals={false} />
              <Tooltip content={<CustomTooltip />} />
              <Legend wrapperStyle={{ fontSize: "11px", color: "#6b7280" }} iconSize={8} />
              <Line type="monotone" dataKey="posts" stroke="#6366f1" strokeWidth={2} dot={false} activeDot={{ r: 5 }} name="Posts" />
              <Line type="monotone" dataKey="users" stroke="#34d399" strokeWidth={2} dot={false} activeDot={{ r: 5 }} name="New Users" />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Blog Categories" icon={BookOpen} color="text-blue-600" loading={loading}>
          {categoryData.length === 0 ? (
            <div className="h-48 flex items-center justify-center text-gray-400 text-sm">No data</div>
          ) : (
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie data={categoryData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={70} paddingAngle={3}>
                  {categoryData.map((_, i) => (
                    <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
                <Legend wrapperStyle={{ fontSize: "11px", color: "#6b7280" }} iconSize={8} />
              </PieChart>
            </ResponsiveContainer>
          )}
        </ChartCard>
      </div>

      {/* Row 2: Engagement bar chart per blog */}
      <div className="mb-6">
        <ChartCard title="Top Blog Engagement (Posts · Comments · Reactions)" icon={Activity} color="text-green-600" loading={loading}>
          {engagementData.length === 0 ? (
            <div className="h-48 flex items-center justify-center text-gray-400 text-sm">No data</div>
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={engagementData} barGap={2}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="name" tick={{ fill: "#9ca3af", fontSize: 10 }} tickLine={false} axisLine={false} />
                <YAxis tick={{ fill: "#9ca3af", fontSize: 10 }} tickLine={false} axisLine={false} allowDecimals={false} />
                <Tooltip content={<CustomTooltip />} />
                <Legend wrapperStyle={{ fontSize: "11px", color: "#6b7280" }} iconSize={8} />
                <Bar dataKey="posts" fill="#00ad00" radius={[3, 3, 0, 0]} name="Posts" />
                <Bar dataKey="comments" fill="#3b82f6" radius={[3, 3, 0, 0]} name="Comments" />
                <Bar dataKey="reactions" fill="#f59e0b" radius={[3, 3, 0, 0]} name="Reactions" />
              </BarChart>
            </ResponsiveContainer>
          )}
        </ChartCard>
      </div>

      {/* Row 3: Leaderboards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top blogs */}
        <div className="rounded-xl border border-gray-200 bg-white p-5">
          <h2 className="text-gray-800 font-semibold text-sm mb-4 flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-blue-500" /> Top Blogs by Followers
          </h2>
          {loading ? (
            <div className="space-y-3">{Array.from({ length: 5 }).map((_, i) => <div key={i} className="h-10 bg-gray-100 rounded animate-pulse" />)}</div>
          ) : topBlogs.length === 0 ? (
            <p className="text-gray-400 text-sm">No data</p>
          ) : (
            <div className="space-y-2">
              {topBlogs.map((b, i) => (
                <div key={b.id} className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-gray-50 transition-colors">
                  <span className="text-gray-400 text-xs font-bold w-4 text-right">#{i + 1}</span>
                  <p className="flex-1 text-gray-800 text-sm truncate">{b.blog_name}</p>
                  <span className="text-gray-500 text-xs tabular-nums">{(b.follower_count ?? 0).toLocaleString()} followers</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Top posts */}
        <div className="rounded-xl border border-gray-200 bg-white p-5">
          <h2 className="text-gray-800 font-semibold text-sm mb-4 flex items-center gap-2">
            <FileText className="w-4 h-4 text-green-600" /> Top Posts by Views
          </h2>
          {loading ? (
            <div className="space-y-3">{Array.from({ length: 5 }).map((_, i) => <div key={i} className="h-10 bg-gray-100 rounded animate-pulse" />)}</div>
          ) : topPosts.length === 0 ? (
            <p className="text-gray-400 text-sm">No data</p>
          ) : (
            <div className="space-y-2">
              {topPosts.map((p, i) => (
                <div key={p.id} className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-gray-50 transition-colors">
                  <span className="text-gray-400 text-xs font-bold w-4 text-right">#{i + 1}</span>
                  <p className="flex-1 text-gray-800 text-sm truncate">{p.headline}</p>
                  <span className="text-gray-500 text-xs tabular-nums">{(p.view_count ?? 0).toLocaleString()} views</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}
