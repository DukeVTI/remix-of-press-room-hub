import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, TrendingUp, Users } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { formatDistanceToNow } from "date-fns";

interface TrendingPost {
    id: string;
    headline: string;
    created_at: string;
    view_count: number;
    blog_id: string;
    blogs: {
        blog_name: string;
        slug: string;
        profile_photo_url: string;
    } | null;
    profiles: {
        first_name: string;
        last_name: string;
    } | null;
}

export function TrendingSection() {
    const [posts, setPosts] = useState<TrendingPost[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchTrendingPosts = async () => {
            setLoading(true);
            const { data, error } = await supabase
                .from('posts')
                .select(`
          id,
          headline,
          created_at,
          view_count,
          blog_id,
          blogs (
            blog_name,
            slug,
            profile_photo_url
          ),
          profiles:author_id (
            first_name,
            last_name
          )
        `)
                .eq('status', 'published')
                .order('view_count', { ascending: false })
                .limit(3);

            if (data) {
                setPosts(data as unknown as TrendingPost[]);
            }
            setLoading(false);
        };

        fetchTrendingPosts();
    }, []);

    if (loading) {
        return (
            <section className="bg-background py-16 px-6 border-b border-border">
                <div className="max-w-[1100px] mx-auto flex justify-center py-10">
                    <Loader2 className="h-10 w-10 animate-spin text-accent" />
                </div>
            </section>
        );
    }

    if (posts.length === 0) return null;

    return (
        <section className="bg-background py-16 px-6 border-y border-border">
            <div className="max-w-[1100px] mx-auto">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center border border-accent/20">
                            <TrendingUp className="h-6 w-6 text-accent" />
                        </div>
                        <div>
                            <h2 className="text-2xl md:text-3xl font-black uppercase tracking-[1px] text-foreground m-0">
                                Trending Publications
                            </h2>
                            <p className="text-muted-foreground mt-1 text-[15px]">
                                Discover the most popular stories on Press Room Publisher today.
                            </p>
                        </div>
                    </div>
                    <Link
                        to="/search"
                        className="hidden md:inline-flex items-center justify-center rounded-sm border-2 border-[#00ad00] bg-transparent px-6 py-2.5 text-sm font-bold uppercase tracking-widest text-[#00ad00] transition-colors hover:bg-[#00ad00] hover:text-white"
                    >
                        Explore All
                    </Link>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {posts.map((post) => {
                        const blogSlug = post.blogs?.slug || 'unknown';
                        const postUrl = `/blog/${blogSlug}/post/${post.id}`;

                        return (
                            <Link
                                key={post.id}
                                to={postUrl}
                                className="group block"
                            >
                                <article className="h-full flex flex-col p-6 rounded-2xl border border-border bg-card hover:border-accent/40 hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
                                    <div className="flex items-center gap-3 mb-5">
                                        <Avatar className="h-12 w-12 border border-border shadow-sm">
                                            <AvatarImage src={post.blogs?.profile_photo_url} />
                                            <AvatarFallback className="bg-gradient-to-br from-accent to-accent/80 text-white font-bold text-lg">
                                                {post.blogs?.blog_name?.charAt(0) || 'P'}
                                            </AvatarFallback>
                                        </Avatar>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-bold text-accent truncate">
                                                {post.blogs?.blog_name}
                                            </p>
                                            <p className="text-xs text-muted-foreground truncate">
                                                By {post.profiles?.first_name} {post.profiles?.last_name}
                                            </p>
                                        </div>
                                    </div>

                                    <h3 className="font-serif font-bold text-[17px] text-foreground line-clamp-3 leading-relaxed mb-4 group-hover:text-accent transition-colors flex-1">
                                        {post.headline}
                                    </h3>

                                    <div className="flex items-center justify-between mt-auto pt-4 border-t border-border/50 text-xs text-muted-foreground font-medium">
                                        <span className="flex items-center gap-1.5">
                                            <Users className="h-4 w-4" />
                                            {post.view_count.toLocaleString()} views
                                        </span>
                                        <span>
                                            {formatDistanceToNow(new Date(post.created_at), { addSuffix: true })}
                                        </span>
                                    </div>
                                </article>
                            </Link>
                        );
                    })}
                </div>

                <div className="mt-8 text-center md:hidden">
                    <Link
                        to="/search"
                        className="inline-flex w-full items-center justify-center rounded-sm border-2 border-[#00ad00] bg-transparent px-6 py-3.5 text-sm font-bold uppercase tracking-widest text-[#00ad00] transition-colors hover:bg-[#00ad00] hover:text-white"
                    >
                        Explore All Stories
                    </Link>
                </div>
            </div>
        </section>
    );
}
