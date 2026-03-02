import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { Loader2, TrendingUp, Users, FileText, ArrowRight } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { formatDistanceToNow } from "date-fns";

interface DiscoverModalProps {
    open: boolean;
    onClose: () => void;
}

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

export function DiscoverModal({ open, onClose }: DiscoverModalProps) {
    const [posts, setPosts] = useState<TrendingPost[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!open) return;

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
                .limit(6);

            if (data) {
                setPosts(data as unknown as TrendingPost[]);
            }
            setLoading(false);
        };

        fetchTrendingPosts();
    }, [open]);

    return (
        <Sheet open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
            <SheetContent side="right" className="w-full sm:max-w-md p-0 flex flex-col h-full bg-background border-l border-border">
                <SheetHeader className="p-6 border-b border-border bg-gradient-to-br from-accent/5 to-transparent">
                    <SheetTitle className="flex items-center gap-2 text-xl font-serif text-foreground">
                        <TrendingUp className="h-5 w-5 text-accent" />
                        Discover Trending
                    </SheetTitle>
                    <SheetDescription>
                        Explore the most popular stories across Press Room Publisher right now.
                    </SheetDescription>
                </SheetHeader>

                <div className="flex-1 overflow-y-auto p-6">
                    {loading ? (
                        <div className="flex items-center justify-center h-40">
                            <Loader2 className="h-8 w-8 animate-spin text-accent" />
                        </div>
                    ) : posts.length === 0 ? (
                        <div className="text-center py-10 text-muted-foreground">
                            <FileText className="h-10 w-10 mx-auto mb-3 opacity-20" />
                            <p>No trending posts right now.</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {posts.map((post) => {
                                const blogSlug = post.blogs?.slug || 'unknown';
                                const postUrl = `/blog/${blogSlug}/post/${post.id}`;

                                return (
                                    <Link
                                        key={post.id}
                                        to={postUrl}
                                        onClick={onClose}
                                        className="group block"
                                    >
                                        <article className="p-4 rounded-xl border border-border bg-card hover:border-accent/40 hover:shadow-md transition-all duration-200">
                                            <div className="flex items-start gap-3 mb-3">
                                                <Avatar className="h-10 w-10 border border-border flex-shrink-0">
                                                    <AvatarImage src={post.blogs?.profile_photo_url} />
                                                    <AvatarFallback className="bg-accent/10 text-accent font-bold">
                                                        {post.blogs?.blog_name?.charAt(0) || 'P'}
                                                    </AvatarFallback>
                                                </Avatar>
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-xs font-medium text-accent truncate">
                                                        {post.blogs?.blog_name}
                                                    </p>
                                                    <p className="text-[11px] text-muted-foreground">
                                                        By {post.profiles?.first_name} {post.profiles?.last_name}
                                                    </p>
                                                </div>
                                            </div>

                                            <h3 className="font-serif font-bold text-foreground text-sm line-clamp-2 leading-snug mb-2 group-hover:text-accent transition-colors">
                                                {post.headline}
                                            </h3>

                                            <div className="flex items-center justify-between mt-3 text-xs text-muted-foreground">
                                                <span className="flex items-center gap-1">
                                                    <Users className="h-3 w-3" />
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
                    )}
                </div>

                <div className="p-4 border-t border-border bg-muted/30">
                    <Link to="/search" onClick={onClose}>
                        <Button className="w-full bg-accent text-accent-foreground hover:bg-accent/90 rounded-full h-11">
                            Search all stories
                            <ArrowRight className="h-4 w-4 ml-2" />
                        </Button>
                    </Link>
                </div>
            </SheetContent>
        </Sheet>
    );
}
