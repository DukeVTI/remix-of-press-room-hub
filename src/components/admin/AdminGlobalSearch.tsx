import { useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { Search, X, User, BookOpen, FileText, Flag } from "lucide-react";
import { cn } from "@/lib/utils";

interface SearchResult {
    id: string;
    type: "user" | "blog" | "post" | "report";
    title: string;
    subtitle: string;
    href: string;
}

const TYPE_CFG = {
    user: { icon: User, color: "text-indigo-400", bg: "bg-indigo-500/10", label: "User" },
    blog: { icon: BookOpen, color: "text-blue-400", bg: "bg-blue-500/10", label: "Blog" },
    post: { icon: FileText, color: "text-emerald-400", bg: "bg-emerald-500/10", label: "Post" },
    report: { icon: Flag, color: "text-rose-400", bg: "bg-rose-500/10", label: "Report" },
};

export function AdminGlobalSearch() {
    const [open, setOpen] = useState(false);
    const [query, setQuery] = useState("");
    const [results, setResults] = useState<SearchResult[]>([]);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const runSearch = useCallback(async (q: string) => {
        if (!q.trim()) { setResults([]); return; }
        setLoading(true);

        const like = `%${q}%`;
        const [
            { data: users },
            { data: blogs },
            { data: posts },
            { data: reports },
        ] = await Promise.all([
            supabase.from("profiles").select("id, full_name, email").or(`full_name.ilike.${like},email.ilike.${like}`).limit(5),
            supabase.from("blogs").select("id, blog_name, slug").ilike("blog_name", like).limit(5),
            supabase.from("posts").select("id, headline").ilike("headline", like).limit(5),
            supabase.from("reports").select("id, report_type, reason").or(`report_type.ilike.${like},reason.ilike.${like}`).limit(5),
        ]);

        const all: SearchResult[] = [
            ...(users ?? []).map((u: any) => ({ id: u.id, type: "user" as const, title: u.full_name ?? u.email, subtitle: u.email, href: "/admin/users" })),
            ...(blogs ?? []).map((b: any) => ({ id: b.id, type: "blog" as const, title: b.blog_name, subtitle: `/${b.slug}`, href: "/admin/blogs" })),
            ...(posts ?? []).map((p: any) => ({ id: p.id, type: "post" as const, title: p.headline, subtitle: "Post", href: "/admin/content" })),
            ...(reports ?? []).map((r: any) => ({ id: r.id, type: "report" as const, title: r.report_type, subtitle: r.reason ?? "No reason", href: "/admin/reports" })),
        ];

        setResults(all);
        setLoading(false);
    }, []);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const q = e.target.value;
        setQuery(q);
        if (q.length >= 2) runSearch(q);
        else setResults([]);
    };

    const handleSelect = (result: SearchResult) => {
        navigate(result.href);
        setOpen(false);
        setQuery("");
        setResults([]);
    };

    return (
        <div className="relative">
            {/* Trigger */}
            <button
                onClick={() => setOpen(true)}
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-800/60 border border-slate-700/60 text-slate-400 hover:text-slate-300 hover:border-slate-600 transition-all text-sm"
            >
                <Search className="w-3.5 h-3.5" />
                <span className="hidden sm:block">Search…</span>
                <kbd className="hidden sm:block text-xs bg-slate-700/60 px-1.5 py-0.5 rounded text-slate-500">⌘K</kbd>
            </button>

            {/* Modal */}
            {open && (
                <div className="fixed inset-0 z-50 flex items-start justify-center pt-24 px-4">
                    {/* Backdrop */}
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => { setOpen(false); setQuery(""); setResults([]); }} />

                    <div className="relative w-full max-w-xl bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl shadow-black/60 overflow-hidden">
                        {/* Search input */}
                        <div className="flex items-center gap-3 px-4 py-4 border-b border-slate-800">
                            <Search className="w-4 h-4 text-slate-400 flex-shrink-0" />
                            <input
                                type="text"
                                placeholder="Search users, blogs, posts, reports…"
                                value={query}
                                onChange={handleChange}
                                autoFocus
                                className="flex-1 bg-transparent text-slate-200 placeholder:text-slate-500 text-sm border-0 outline-none"
                            />
                            {query && (
                                <button onClick={() => { setQuery(""); setResults([]); }} className="text-slate-500 hover:text-slate-300">
                                    <X className="w-4 h-4" />
                                </button>
                            )}
                        </div>

                        {/* Results */}
                        <div className="max-h-80 overflow-y-auto">
                            {loading ? (
                                <div className="p-4 space-y-2">
                                    {Array.from({ length: 4 }).map((_, i) => (
                                        <div key={i} className="h-11 bg-slate-800 rounded-lg animate-pulse" />
                                    ))}
                                </div>
                            ) : results.length === 0 && query.length >= 2 ? (
                                <div className="py-10 text-center text-slate-500 text-sm">No results for "{query}"</div>
                            ) : results.length === 0 ? (
                                <div className="py-8 text-center text-slate-600 text-sm">Start typing to search…</div>
                            ) : (
                                <div className="p-2">
                                    {results.map((r) => {
                                        const cfg = TYPE_CFG[r.type];
                                        const Icon = cfg.icon;
                                        return (
                                            <button
                                                key={`${r.type}-${r.id}`}
                                                onClick={() => handleSelect(r)}
                                                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-slate-800 transition-colors text-left"
                                            >
                                                <div className={cn("p-1.5 rounded-lg flex-shrink-0", cfg.bg)}>
                                                    <Icon className={cn("w-3.5 h-3.5", cfg.color)} />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-slate-200 text-sm truncate">{r.title}</p>
                                                    <p className="text-slate-500 text-xs truncate">{r.subtitle}</p>
                                                </div>
                                                <span className={cn("text-xs px-2 py-0.5 rounded-full flex-shrink-0", cfg.bg, cfg.color)}>
                                                    {cfg.label}
                                                </span>
                                            </button>
                                        );
                                    })}
                                </div>
                            )}
                        </div>

                        <div className="px-4 py-2.5 border-t border-slate-800 flex items-center gap-4 text-xs text-slate-600">
                            <span>↑↓ navigate</span>
                            <span>↵ select</span>
                            <span>esc close</span>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
