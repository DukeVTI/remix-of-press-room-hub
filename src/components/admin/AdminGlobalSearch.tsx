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
    user: { icon: User, color: "text-blue-600", bg: "bg-blue-50", label: "User" },
    blog: { icon: BookOpen, color: "text-purple-600", bg: "bg-purple-50", label: "Blog" },
    post: { icon: FileText, color: "text-green-600", bg: "bg-green-50", label: "Post" },
    report: { icon: Flag, color: "text-rose-600", bg: "bg-rose-50", label: "Report" },
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
            {/* Trigger — light theme */}
            <button
                onClick={() => setOpen(true)}
                style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    padding: "6px 12px",
                    borderRadius: "8px",
                    backgroundColor: "#f5f5f5",
                    border: "1px solid #e0e0e0",
                    color: "#888",
                    fontSize: "13px",
                    cursor: "pointer",
                    transition: "all 0.15s",
                }}
                onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.borderColor = "#00ad00"; (e.currentTarget as HTMLButtonElement).style.color = "#555"; }}
                onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.borderColor = "#e0e0e0"; (e.currentTarget as HTMLButtonElement).style.color = "#888"; }}
            >
                <Search size={14} />
                <span>Search…</span>
                <kbd style={{ fontSize: "11px", backgroundColor: "#eee", padding: "1px 6px", borderRadius: "4px", color: "#aaa" }}>⌘K</kbd>
            </button>

            {/* Modal — light theme */}
            {open && (
                <div style={{ position: "fixed", inset: 0, zIndex: 50, display: "flex", alignItems: "flex-start", justifyContent: "center", paddingTop: "96px", padding: "96px 16px 0" }}>
                    {/* Backdrop */}
                    <div
                        style={{ position: "absolute", inset: 0, backgroundColor: "rgba(0,0,0,0.35)" }}
                        onClick={() => { setOpen(false); setQuery(""); setResults([]); }}
                    />
                    <div style={{
                        position: "relative",
                        width: "100%",
                        maxWidth: "560px",
                        backgroundColor: "#fff",
                        border: "1px solid #e0e0e0",
                        borderRadius: "14px",
                        boxShadow: "0 20px 60px rgba(0,0,0,0.15)",
                        overflow: "hidden",
                    }}>
                        {/* Input */}
                        <div style={{ display: "flex", alignItems: "center", gap: "12px", padding: "14px 16px", borderBottom: "1px solid #f0f0f0" }}>
                            <Search size={16} color="#aaa" style={{ flexShrink: 0 }} />
                            <input
                                type="text"
                                placeholder="Search users, blogs, posts, reports…"
                                value={query}
                                onChange={handleChange}
                                autoFocus
                                style={{ flex: 1, border: "none", outline: "none", fontSize: "14px", color: "#333", background: "transparent" }}
                            />
                            {query && (
                                <button onClick={() => { setQuery(""); setResults([]); }} style={{ background: "none", border: "none", cursor: "pointer", color: "#aaa", padding: "2px" }}>
                                    <X size={16} />
                                </button>
                            )}
                        </div>

                        {/* Results */}
                        <div style={{ maxHeight: "320px", overflowY: "auto" }}>
                            {loading ? (
                                <div style={{ padding: "12px", display: "flex", flexDirection: "column", gap: "8px" }}>
                                    {Array.from({ length: 4 }).map((_, i) => (
                                        <div key={i} style={{ height: "44px", backgroundColor: "#f5f5f5", borderRadius: "8px", animation: "pulse 1.5s infinite" }} />
                                    ))}
                                </div>
                            ) : results.length === 0 && query.length >= 2 ? (
                                <div style={{ padding: "40px 16px", textAlign: "center", color: "#aaa", fontSize: "13px" }}>No results for "{query}"</div>
                            ) : results.length === 0 ? (
                                <div style={{ padding: "32px 16px", textAlign: "center", color: "#ccc", fontSize: "13px" }}>Start typing to search…</div>
                            ) : (
                                <div style={{ padding: "8px" }}>
                                    {results.map((r) => {
                                        const cfg = TYPE_CFG[r.type];
                                        const Icon = cfg.icon;
                                        return (
                                            <button
                                                key={`${r.type}-${r.id}`}
                                                onClick={() => handleSelect(r)}
                                                style={{
                                                    width: "100%",
                                                    display: "flex",
                                                    alignItems: "center",
                                                    gap: "12px",
                                                    padding: "10px 12px",
                                                    borderRadius: "8px",
                                                    border: "none",
                                                    background: "none",
                                                    cursor: "pointer",
                                                    textAlign: "left",
                                                    transition: "background 0.12s",
                                                }}
                                                onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.backgroundColor = "#f7f7f7"; }}
                                                onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.backgroundColor = "transparent"; }}
                                            >
                                                <div className={cn("p-1.5 rounded-lg flex-shrink-0", cfg.bg)}>
                                                    <Icon size={14} className={cfg.color} />
                                                </div>
                                                <div style={{ flex: 1, minWidth: 0 }}>
                                                    <p style={{ color: "#222", fontSize: "13px", margin: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{r.title}</p>
                                                    <p style={{ color: "#aaa", fontSize: "11px", margin: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{r.subtitle}</p>
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

                        <div style={{ padding: "8px 16px", borderTop: "1px solid #f0f0f0", display: "flex", gap: "16px", fontSize: "11px", color: "#ccc" }}>
                            <span>↑↓ navigate</span><span>↵ select</span><span>esc close</span>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
