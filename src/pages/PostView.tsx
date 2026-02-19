import {  
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { Calendar, Eye, ThumbsUp, ThumbsDown, MessageSquare, ArrowLeft, Loader2, Pin, User, FileQuestion } from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Textarea } from "@/components/ui/textarea";
import { CommentSection } from "@/components/CommentSection";
import { ReportModal } from "@/components/ReportModal";
import { ShareSheet } from "@/components/ShareSheet";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import type { Tables, Database } from "@/integrations/supabase/types";
import { PRPHeader } from "@/components/ui/prp-header";
import { Footer } from "@/components/Footer";


type Post = Tables<"posts">;
type Blog = Tables<"blogs">;
type Comment = Tables<"comments">;
type ReportReason = Database["public"]["Enums"]["report_reason"];

interface PostWithDetails extends Post {
  blogs: {
    id: string;
    blog_name: string;
    slug: string;
    profile_photo_url: string;
  };
  media: { 
    id: string; 
    file_url: string; 
    description: string; 
    media_type: string;
    order_position: number;
  }[];
}

interface CommentWithProfile extends Comment {
  profiles: { 
    first_name: string; 
    last_name: string; 
    screen_name: string | null;
    profile_photo_url: string | null;
  } | null;
  replies?: CommentWithProfile[];
}

const REPORT_REASONS = [
  { value: "misleading", label: "Misleading" },
  { value: "falsehood", label: "Falsehood" },
  { value: "wrong_impression", label: "Wrong Impression" },
  { value: "cyber_bully", label: "Cyber Bullying" },
  { value: "scam", label: "Scam" },
  { value: "cursing", label: "Cursing" },
  { value: "abuse", label: "Abuse" },
  { value: "discrimination", label: "Discrimination" },
  { value: "bad_profiling", label: "Bad Profiling" },
  { value: "propaganda", label: "Propaganda" },
  { value: "instigating", label: "Instigating" },
  { value: "miseducation", label: "Miseducation" },
  { value: "disrespectful", label: "Disrespectful" },
  { value: "intolerance", label: "Intolerance" },
  { value: "others", label: "Others" },
];

const PostView = () => {
  const { blogSlug, postId } = useParams<{ blogSlug: string; postId: string }>();
  const navigate = useNavigate();
  
  const [post, setPost] = useState<PostWithDetails | null>(null);
  const [comments, setComments] = useState<CommentWithProfile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);
  const [userReaction, setUserReaction] = useState<"approve" | "disapprove" | null>(null);
  const [reactionLoading, setReactionLoading] = useState(false);
  
  // Comment state
  const [commentLoading, setCommentLoading] = useState(false);
  const [commentReactions, setCommentReactions] = useState<Record<string, "approve" | "disapprove" | null>>({});
  
  // Report state
  const [reportDialogOpen, setReportDialogOpen] = useState(false);
  const [reportReason, setReportReason] = useState("");
  const [customReason, setCustomReason] = useState("");
  const [reportLoading, setReportLoading] = useState(false);

  useEffect(() => {
    const init = async () => {
      // Check if user is logged in
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        setUserId(session.user.id);
      }

      // Fetch post details
      const { data: postData, error: postError } = await supabase
        .from("posts")
        .select(`
          *,
          blogs!inner(id, blog_name, slug, profile_photo_url),
          media(id, file_url, description, media_type, order_position)
        `)
        .eq("id", postId)
        .eq("status", "published")
        .maybeSingle();

      if (postError || !postData) {
        setIsLoading(false);
        return;
      }

      // Verify blog slug matches
      if (postData.blogs.slug !== blogSlug) {
        setIsLoading(false);
        return;
      }

      setPost(postData as PostWithDetails);

      // Increment view count atomically (server-side RPC prevents race condition)
      await supabase.rpc("increment_view_count", { _post_id: postId });

      // Check user's reaction
      if (session) {
        const { data: reactionData } = await supabase
          .from("post_reactions")
          .select("reaction_type")
          .eq("user_id", session.user.id)
          .eq("post_id", postId)
          .maybeSingle();

        if (reactionData) {
          setUserReaction(reactionData.reaction_type as "approve" | "disapprove");
        }
      }

      // Fetch comments
      await fetchComments();

      setIsLoading(false);
    };

    init();
  }, [blogSlug, postId]);

  const fetchComments = async () => {
    const { data: commentsData } = await supabase
      .from("comments")
      .select(`
        *,
        profiles(first_name, last_name, screen_name, profile_photo_url)
      `)
      .eq("post_id", postId)
      .eq("status", "active")
      .order("is_pinned", { ascending: false })
      .order("created_at", { ascending: true });

    if (commentsData) {
      // Organize comments into tree structure
      const topLevel: CommentWithProfile[] = [];
      const replies: Record<string, CommentWithProfile[]> = {};

      commentsData.forEach((comment) => {
        const c = comment as CommentWithProfile;
        if (c.parent_comment_id) {
          if (!replies[c.parent_comment_id]) {
            replies[c.parent_comment_id] = [];
          }
          replies[c.parent_comment_id].push(c);
        } else {
          topLevel.push(c);
        }
      });

      // Attach replies to parent comments
      topLevel.forEach((comment) => {
        comment.replies = replies[comment.id] || [];
      });

      setComments(topLevel);

      // Fetch user's reactions to these comments
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        const commentIds = commentsData.map(c => c.id);
        const { data: reactionsData } = await supabase
          .from("comment_reactions")
          .select("comment_id, reaction_type")
          .eq("user_id", session.user.id)
          .in("comment_id", commentIds);

        if (reactionsData) {
          const reactionsMap: Record<string, "approve" | "disapprove" | null> = {};
          reactionsData.forEach((r) => {
            reactionsMap[r.comment_id] = r.reaction_type as "approve" | "disapprove";
          });
          setCommentReactions(reactionsMap);
        }
      }
    }
  };

  const handleCommentReaction = async (commentId: string, type: "approve" | "disapprove") => {
    if (!userId) {
      toast.error("Please sign in to react to comments");
      return;
    }

    const currentReaction = commentReactions[commentId];

    try {
      if (currentReaction === type) {
        // Remove reaction (toggle off)
        await supabase
          .from("comment_reactions")
          .delete()
          .eq("user_id", userId)
          .eq("comment_id", commentId);

        setCommentReactions(prev => ({ ...prev, [commentId]: null }));
        
        // Update count locally
        setComments(prev => updateCommentCount(prev, commentId, type, -1));
      } else if (currentReaction) {
        // Change reaction type
        await supabase
          .from("comment_reactions")
          .update({ reaction_type: type })
          .eq("user_id", userId)
          .eq("comment_id", commentId);

        setCommentReactions(prev => ({ ...prev, [commentId]: type }));
        
        // Update counts: decrement old, increment new
        setComments(prev => {
          let updated = updateCommentCount(prev, commentId, currentReaction, -1);
          updated = updateCommentCount(updated, commentId, type, 1);
          return updated;
        });
      } else {
        // Add new reaction
        await supabase
          .from("comment_reactions")
          .insert({ user_id: userId, comment_id: commentId, reaction_type: type });

        setCommentReactions(prev => ({ ...prev, [commentId]: type }));
        
        // Update count locally
        setComments(prev => updateCommentCount(prev, commentId, type, 1));
      }
    } catch (error) {
      toast.error("Failed to update reaction");
    }
  };

  // Helper to update comment counts in nested structure
  const updateCommentCount = (
    comments: CommentWithProfile[],
    commentId: string,
    type: "approve" | "disapprove",
    delta: number
  ): CommentWithProfile[] => {
    return comments.map(comment => {
      if (comment.id === commentId) {
        return {
          ...comment,
          approval_count: type === "approve" ? comment.approval_count + delta : comment.approval_count,
          disapproval_count: type === "disapprove" ? comment.disapproval_count + delta : comment.disapproval_count,
        };
      }
      if (comment.replies && comment.replies.length > 0) {
        return {
          ...comment,
          replies: updateCommentCount(comment.replies, commentId, type, delta),
        };
      }
      return comment;
    });
  };

  const handlePinComment = async (commentId: string) => {
    if (!userId || !post) {
      toast.error("Please sign in to pin comments");
      return;
    }

    try {
      await supabase
        .from("comments")
        .update({ is_pinned: true })
        .eq("id", commentId);

      // Refresh comments to reflect the change
      await fetchComments();
      toast.success("Comment pinned!");
    } catch (error) {
      toast.error("Failed to pin comment");
    }
  };

  const handleUnpinComment = async (commentId: string) => {
    if (!userId || !post) {
      toast.error("Please sign in to unpin comments");
      return;
    }

    try {
      await supabase
        .from("comments")
        .update({ is_pinned: false })
        .eq("id", commentId);

      // Refresh comments to reflect the change
      await fetchComments();
      toast.success("Comment unpinned!");
    } catch (error) {
      toast.error("Failed to unpin comment");
    }
  };

  const handleReaction = async (type: "approve" | "disapprove") => {
    if (!userId || !post) {
      toast.error("Please sign in to react to posts");
      return;
    }

    setReactionLoading(true);

    try {
      if (userReaction === type) {
        // Remove reaction
        await supabase
          .from("post_reactions")
          .delete()
          .eq("user_id", userId)
          .eq("post_id", post.id);

        setUserReaction(null);
        setPost(prev => {
          if (!prev) return null;
          return {
            ...prev,
            approval_count: type === "approve" ? prev.approval_count - 1 : prev.approval_count,
            disapproval_count: type === "disapprove" ? prev.disapproval_count - 1 : prev.disapproval_count,
          };
        });
      } else if (userReaction) {
        // Change reaction
        await supabase
          .from("post_reactions")
          .update({ reaction_type: type })
          .eq("user_id", userId)
          .eq("post_id", post.id);

        setUserReaction(type);
        setPost(prev => {
          if (!prev) return null;
          return {
            ...prev,
            approval_count: type === "approve" ? prev.approval_count + 1 : prev.approval_count - 1,
            disapproval_count: type === "disapprove" ? prev.disapproval_count + 1 : prev.disapproval_count - 1,
          };
        });
      } else {
        // Add new reaction
        await supabase
          .from("post_reactions")
          .insert({ user_id: userId, post_id: post.id, reaction_type: type });

        setUserReaction(type);
        setPost(prev => {
          if (!prev) return null;
          return {
            ...prev,
            approval_count: type === "approve" ? prev.approval_count + 1 : prev.approval_count,
            disapproval_count: type === "disapprove" ? prev.disapproval_count + 1 : prev.disapproval_count,
          };
        });
      }
    } catch (error) {
      toast.error("Failed to update reaction");
    }

    setReactionLoading(false);
  };

  const handleSubmitComment = async (content: string, parentId?: string) => {
    if (!userId || !post) {
      toast.error("Please sign in to comment");
      return;
    }

    if (post.comments_locked) {
      toast.error("Comments are locked on this post");
      return;
    }

    if (!content.trim()) {
      toast.error("Please enter a comment");
      return;
    }

    setCommentLoading(true);

    try {
      await supabase
        .from("comments")
        .insert({
          post_id: post.id,
          user_id: userId,
          parent_comment_id: parentId || null,
          content: content.trim(),
        });

      // Refresh comments
      await fetchComments();

      // Update comment count locally
      setPost(prev => prev ? { ...prev, comment_count: prev.comment_count + 1 } : null);

      toast.success("Comment posted!");
    } catch (error) {
      toast.error("Failed to post comment");
    }

    setCommentLoading(false);
  };

  const handleShare = async () => {
    const url = window.location.href;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: post?.headline,
          text: post?.subtitle || post?.headline,
          url: url,
        });
      } catch (error) {
        // User cancelled or share failed
      }
    } else {
      // Fallback: copy to clipboard
      await navigator.clipboard.writeText(url);
      toast.success("Link copied to clipboard!");
    }
  };

  const handleReport = async () => {
    if (!userId || !post) {
      toast.error("Please sign in to report content");
      return;
    }

    if (!reportReason) {
      toast.error("Please select a reason");
      return;
    }

    if (reportReason === "others" && !customReason.trim()) {
      toast.error("Please describe the issue");
      return;
    }

    setReportLoading(true);

    try {
      await supabase.from("reports").insert({
        reporter_id: userId,
        reported_item_type: "post" as const,
        reported_item_id: post.id,
        reason_category: reportReason as ReportReason,
        custom_reason: reportReason === "others" ? customReason.trim() : null,
      });

      toast.success("Report submitted. Thank you for helping keep PRP safe.");
      setReportDialogOpen(false);
      setReportReason("");
      setCustomReason("");
    } catch (error) {
      toast.error("Failed to submit report");
    }

    setReportLoading(false);
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    });
  };

  const formatNumber = (num: number) => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + "M";
    if (num >= 1000) return (num / 1000).toFixed(1) + "K";
    return num.toString();
  };

  const formatRelativeTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return "Just now";
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    return formatDate(dateString);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-accent" aria-label="Loading post" />
      </div>
    );
  }

  if (!post) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <PRPHeader isAuthenticated={!!userId} />

        <main id="main-content" className="flex-1 section-container py-16 text-center">
          <div 
            className="w-20 h-20 mx-auto mb-6 rounded-full bg-muted flex items-center justify-center"
            aria-hidden="true"
          >
            <FileQuestion className="h-10 w-10 text-muted-foreground" />
          </div>
          <h1 className="display-lg text-foreground mb-4">Post not found</h1>
          <p className="body-md text-muted-foreground mb-8">
            The post you're looking for doesn't exist or has been removed.
          </p>
          <Link to="/">
            <Button className="btn-accent rounded-full" aria-label="Go back to homepage">
              <ArrowLeft className="h-4 w-4 mr-2" aria-hidden="true" />
              Back to home
            </Button>
          </Link>
        </main>

        <Footer />
      </div>
    );
  }

  // Sort media by order_position
  const sortedMedia = [...(post.media || [])].sort((a, b) => a.order_position - b.order_position);

  return (
    <div className="min-h-screen bg-background">
      <PRPHeader isAuthenticated={!!userId} />

      <main id="main-content" role="main">
        {/* Banner/Cover */}
        <div className="w-full h-40 md:h-56 bg-gradient-to-r from-pink-200/80 to-accent/30 flex items-end justify-center mb-0 relative border-b border-muted-foreground/10 shadow-md shadow-pink-100/40" />

        <article className="container mx-auto px-4 py-8 max-w-2xl">
          {/* Post Header - editorial style */}
          <header className="mb-8 flex flex-col items-center justify-center text-center">
            {post.is_pinned && (
              <Badge variant="secondary" className="px-4 py-1 rounded-full bg-accent/20 text-accent mb-4">
                <Pin className="h-3 w-3 mr-1" aria-hidden="true" />
                Pinned
              </Badge>
            )}

            <h1 className="text-4xl md:text-5xl font-extrabold text-foreground font-serif leading-tight mb-3">
              {post.headline}
            </h1>

            {post.subtitle && (
              <p className="text-lg text-muted-foreground mb-6">
                {post.subtitle}
              </p>
            )}

            <div className="flex flex-wrap items-center justify-center gap-3 text-base text-muted-foreground mb-6">
              <span className="flex items-center gap-2">
                <User className="h-4 w-4" aria-hidden="true" />
                <span>By {post.byline}</span>
              </span>
              <span className="flex items-center gap-2">
                <Calendar className="h-4 w-4" aria-hidden="true" />
                <time dateTime={post.published_at || ""}>
                  {formatDate(post.published_at)}
                </time>
              </span>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-4 text-base text-muted-foreground mb-6">
              <span className="flex items-center gap-1" aria-label={`${post.view_count} views`}>
                <Eye className="h-4 w-4" aria-hidden="true" />
                <span>{formatNumber(post.view_count)} views</span>
              </span>
              <span className="flex items-center gap-1" aria-label={`${post.approval_count} approvals`}>
                <ThumbsUp className="h-4 w-4" aria-hidden="true" />
                <span>{formatNumber(post.approval_count)}</span>
              </span>
              <span className="flex items-center gap-1" aria-label={`${post.disapproval_count} disapprovals`}>
                <ThumbsDown className="h-4 w-4" aria-hidden="true" />
                <span>{formatNumber(post.disapproval_count)}</span>
              </span>
              <span className="flex items-center gap-1" aria-label={`${post.comment_count} comments`}>
                <MessageSquare className="h-4 w-4" aria-hidden="true" />
                <span>{formatNumber(post.comment_count)}</span>
              </span>
            </div>
          </header>

          <Separator className="my-8" />

          {/* Media Gallery */}
          {sortedMedia.length > 0 && (
            <section aria-label="Post media" className="mb-8">
              <div className="space-y-4">
                {sortedMedia.map((item) => (
                  <figure key={item.id} className="rounded-lg overflow-hidden">
                    {item.media_type === "image" && (
                      <img
                        src={item.file_url}
                        alt={item.description}
                        className="w-full h-auto object-cover"
                      />
                    )}
                    {item.media_type === "video" && (
                      <video
                        controls
                        className="w-full"
                        aria-label={item.description}
                      >
                        <source src={item.file_url} />
                        Your browser does not support the video tag.
                      </video>
                    )}
                    {item.media_type === "audio" && (
                      <audio
                        controls
                        className="w-full"
                        aria-label={item.description}
                      >
                        <source src={item.file_url} />
                        Your browser does not support the audio tag.
                      </audio>
                    )}
                    <figcaption className="text-sm text-muted-foreground mt-2 italic">
                      {item.description}
                    </figcaption>
                  </figure>
                ))}
              </div>
            </section>
          )}

          {/* Post Content */}
          <section aria-label="Post content" className="mb-8">
            <div className="prose prose-lg max-w-none">
              {post.content.split('\n').map((paragraph, index) => (
                <p key={index} className="body-lg text-foreground mb-4">
                  {paragraph}
                </p>
              ))}
            </div>
          </section>

          <Separator className="my-8" />

          {/* Reaction Buttons */}
          <section aria-label="Post reactions" className="mb-8">
            <div className="flex items-center gap-4">
              <Button
                variant={userReaction === "approve" ? "default" : "outline"}
                onClick={() => handleReaction("approve")}
                disabled={reactionLoading || !userId}
                className={userReaction === "approve" ? "bg-green-600 hover:bg-green-700" : ""}
                aria-label={userReaction === "approve" ? "Remove approval" : "Approve this post"}
                aria-pressed={userReaction === "approve"}
              >
                <ThumbsUp className="h-4 w-4 mr-2" aria-hidden="true" />
                Approve ({formatNumber(post.approval_count)})
              </Button>

              <Button
                variant={userReaction === "disapprove" ? "default" : "outline"}
                onClick={() => handleReaction("disapprove")}
                disabled={reactionLoading || !userId}
                className={userReaction === "disapprove" ? "bg-red-600 hover:bg-red-700" : ""}
                aria-label={userReaction === "disapprove" ? "Remove disapproval" : "Disapprove this post"}
                aria-pressed={userReaction === "disapprove"}
              >
                <ThumbsDown className="h-4 w-4 mr-2" aria-hidden="true" />
                Disapprove ({formatNumber(post.disapproval_count)})
              </Button>

              {!userId && (
                <p className="text-sm text-muted-foreground">
                  <Link to="/login" className="text-accent hover:underline">Sign in</Link> to react
                </p>
              )}
            </div>
          </section>

          <Separator className="my-8" />

          {/* Comments Section */}
          <CommentSection
            comments={comments}
            postId={post.id}
            currentUserId={userId || undefined}
            canComment={!!userId}
            commentsLocked={post.comments_locked}
            userReactions={commentReactions}
            onAddComment={async (content, parentId) => {
              await handleSubmitComment(content, parentId);
            }}
            onEditComment={async () => {}}
            onDeleteComment={async () => {}}
            onApprove={async (commentId) => {
              await handleCommentReaction(commentId, "approve");
            }}
            onDisapprove={async (commentId) => {
              await handleCommentReaction(commentId, "disapprove");
            }}
            onPin={async (commentId) => {
              await handlePinComment(commentId);
            }}
            onUnpin={async (commentId) => {
              await handleUnpinComment(commentId);
            }}
          />
        </article>
      </main>

      <Footer />
    </div>
  );
};

export default PostView;
