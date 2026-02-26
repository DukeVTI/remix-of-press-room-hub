import { useEffect, useState } from "react";
import { useSeo } from "@/hooks/useSeo";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { supabase } from "@/integrations/supabase/client";
import { BarChart3, Users, BookOpen, FileText, MessageSquare, ThumbsUp } from "lucide-react";
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from "recharts";
import { cn } from "@/lib/utils";
import { format, subDays } from "date-fns";

interface TopBlog {
  id: string;
  blog_name: string;
  follower_count: number;
  is_verified: boolean;
}

interface TopPost {
  id: string;
  headline: string;
  view_count: number;
  approval_count: number;
}

interface SummaryStats {
  users: number;
  blogs: number;
  posts: number;
  comments: number;
  reactions: number;
}

const CHART_COLORS = ["#6366f1", "#22d3ee", "#34d399", "#f59e0b", "#f43f5e"];

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-200 shadow-xl">
      <p className="text-slate-400 mb-1">{label}</p>
      {payload.map((p: any) => (
        <p key={p.dataKey} style={{ color: p.color }}>{p.name}: <span className="font-bold">{p.value}</span></p>
      ))}
    </div>
  );
};

export default function PlatformAnalytics() {
  useSeo({ title: "Platform Analytics", description: "Key platform metrics and growth.", noindex: true });
  const [summary, setSummary] = useState<SummaryStats | null>(null);
  const [topBlogs, setTopBlogs] = useState<TopBlog[]>([]);
  const [topPosts, setTopPosts] = useState<TopPost[]>([]);
  const [postTrend, setPostTrend] = useState<{ date: string; posts: number }[]>([]);
  const [categoryData, setCategoryData] = useState<{ name: string; value: number }[]>([]);
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
        { data: catsData },
        { data: blogsWithCats },
      ] = await Promise.all([
        supabase.from("profiles").select("*", { count: "exact", head: true }),
        supabase.from("blogs").select("*", { count: "exact", head: true }),
        supabase.from("posts").select("*", { count: "exact", head: true }),
        supabase.from("comments").select("*", { count: "exact", head: true }),
        supabase.from("post_reactions").select("*", { count: "exact", head: true }),
        supabase.from("blogs").select("id,blog_name,follower_count,is_verified").order("follower_count", { ascending: false }).limit(5),
        supabase.from("posts").select("id,headline,view_count,approval_count").eq("status", "published").order("view_count", { ascending: false }).limit(5),
        supabase.from("posts").select("created_at").gte("created_at", subDays(new Date(), 30).toISOString()).order("created_at"),
        supabase.from("blog_categories").select("id, name"),
        supabase.from("blogs").select("category_id"),
      ]);

      setSummary({ users: users ?? 0, blogs: blogs ?? 0, posts: posts ?? 0, comments: comments ?? 0, reactions: reactions ?? 0 });
      setTopBlogs(topBlogsData as TopBlog[] ?? []);
      setTopPosts(topPostsData as TopPost[] ?? []);

      // Build post trend (last 30 days)
      const days: Record<string, number> = {};
      for (let i = 29; i >= 0; i--) {
        days[format(subDays(new Date(), i), "MMM d")] = 0;
      }
      (recentPosts ?? []).forEach((p: any) => {
        const day = format(new Date(p.created_at), "MMM d");
        if (day in days) days[day]++;
      });
      setPostTrend(Object.entries(days).map(([date, posts]) => ({ date, posts })));

      // Build category distribution
      const catMap: Record<string, string> = {};
      (catsData ?? []).forEach((c: any) => { catMap[c.id] = c.name; });
      const catCount: Record<string, number> = {};
      (blogsWithCats ?? []).forEach((b: any) => {
        const name = catMap[b.category_id] ?? "Other";
        catCount[name] = (catCount[name] ?? 0) + 1;
      });
      setCategoryData(Object.entries(catCount).sort((a, b) => b[1] - a[1]).slice(0, 6).map(([name, value]) => ({ name, value })));

      setLoading(false);
    }
    loadAnalytics();
  }, []);

  const summaryItems = [
    { label: "Users", value: summary?.users ?? 0, icon: Users, color: "text-indigo-400" },
    { label: "Blogs", value: summary?.blogs ?? 0, icon: BookOpen, color: "text-blue-400" },
    { label: "Posts", value: summary?.posts ?? 0, icon: FileText, color: "text-emerald-400" },
    { label: "Comments", value: summary?.comments ?? 0, icon: MessageSquare, color: "text-purple-400" },
    { label: "Reactions", value: summary?.reactions ?? 0, icon: ThumbsUp, color: "text-amber-400" },
  ];

  return (
    <AdminLayout title="Platform Analytics" breadcrumbs={[{ label: "Analytics" }]}>
      {/* Summary strip */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 mb-8">
        {summaryItems.map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="rounded-xl border border-slate-800 bg-slate-900/60 p-4">
            <div className="flex items-center gap-2 mb-2">
              <Icon className={cn("w-4 h-4", color)} />
              <p className="text-slate-500 text-xs">{label}</p>
            </div>
            {loading ? (
              <div className="h-7 w-16 bg-slate-800 rounded animate-pulse" />
            ) : (
              <p className="text-white text-2xl font-bold tabular-nums">{value.toLocaleString()}</p>
            )}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* Posts trend chart */}
        <div className="lg:col-span-2 rounded-xl border border-slate-800 bg-slate-900/60 p-5">
          <div className="flex items-center gap-2 mb-4">
            <BarChart3 className="w-4 h-4 text-indigo-400" />
            <h2 className="text-white font-semibold text-sm">Posts Published — Last 30 Days</h2>
          </div>
          {loading ? (
            <div className="h-48 bg-slate-800 rounded-lg animate-pulse" />
          ) : (
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={postTrend}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis
                  dataKey="date"
                  tick={{ fill: "#64748b", fontSize: 10 }}
                  tickLine={false}
                  axisLine={false}
                  interval={4}
                />
                <YAxis tick={{ fill: "#64748b", fontSize: 10 }} tickLine={false} axisLine={false} allowDecimals={false} />
                <Tooltip content={<CustomTooltip />} />
                <Line
                  type="monotone"
                  dataKey="posts"
                  stroke="#6366f1"
                  strokeWidth={2}
                  dot={false}
                  activeDot={{ r: 5, fill: "#6366f1" }}
                  name="Posts"
                />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Category distribution */}
        <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-5">
          <h2 className="text-white font-semibold text-sm mb-4">Blog Categories</h2>
          {loading ? (
            <div className="h-48 bg-slate-800 rounded-lg animate-pulse" />
          ) : categoryData.length === 0 ? (
            <div className="h-48 flex items-center justify-center text-slate-500 text-sm">No data</div>
          ) : (
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie data={categoryData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={70} paddingAngle={3}>
                  {categoryData.map((_, i) => (
                    <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
                <Legend
                  wrapperStyle={{ fontSize: "11px", color: "#94a3b8" }}
                  iconSize={8}
                />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top blogs */}
        <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-5">
          <h2 className="text-white font-semibold text-sm mb-4">Top Blogs by Followers</h2>
          {loading ? (
            <div className="space-y-3">{Array.from({ length: 5 }).map((_, i) => <div key={i} className="h-10 bg-slate-800 rounded animate-pulse" />)}</div>
          ) : topBlogs.length === 0 ? (
            <p className="text-slate-500 text-sm">No data</p>
          ) : (
            <div className="space-y-2">
              {topBlogs.map((b, i) => (
                <div key={b.id} className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-slate-800/50 transition-colors">
                  <span className="text-slate-500 text-xs font-bold w-4 text-right">#{i + 1}</span>
                  <p className="flex-1 text-slate-200 text-sm truncate">{b.blog_name}</p>
                  <span className="text-slate-400 text-xs tabular-nums">{b.follower_count.toLocaleString()} followers</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Top posts */}
        <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-5">
          <h2 className="text-white font-semibold text-sm mb-4">Top Posts by Views</h2>
          {loading ? (
            <div className="space-y-3">{Array.from({ length: 5 }).map((_, i) => <div key={i} className="h-10 bg-slate-800 rounded animate-pulse" />)}</div>
          ) : topPosts.length === 0 ? (
            <p className="text-slate-500 text-sm">No data</p>
          ) : (
            <div className="space-y-2">
              {topPosts.map((p, i) => (
                <div key={p.id} className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-slate-800/50 transition-colors">
                  <span className="text-slate-500 text-xs font-bold w-4 text-right">#{i + 1}</span>
                  <p className="flex-1 text-slate-200 text-sm truncate">{p.headline}</p>
                  <span className="text-slate-400 text-xs tabular-nums">{p.view_count.toLocaleString()} views</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}
