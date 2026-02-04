import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { CharacterCountInput } from "@/components/CharacterCountInput";
import { ReportModal } from "@/components/ReportModal";

// Types for comments and reactions
type Comment = {
  id: string;
  postId: string;
  userId: string;
  parentCommentId?: string | null;
  content: string;
  approvalCount: number;
  disapprovalCount: number;
  isPinned: boolean;
  status: "active" | "hidden" | "deleted";
  createdAt: string;
  updatedAt?: string;
  user: {
    firstName: string;
    lastName: string;
    screenName?: string;
    profilePhotoUrl?: string;
    isVerified?: boolean;
  };
  replies?: Comment[];
};

type CommentSectionProps = {
  comments: Comment[] | any[];
  postId: string;
  currentUserId?: string;
  canComment: boolean;
  commentsLocked: boolean;
  onAddComment: (content: string, parentId?: string) => Promise<void>;
  onEditComment: (commentId: string, content: string) => Promise<void>;
  onDeleteComment: (commentId: string) => Promise<void>;
  onApprove: (commentId: string) => Promise<void>;
  onDisapprove: (commentId: string) => Promise<void>;
  onPin: (commentId: string) => Promise<void>;
  onUnpin: (commentId: string) => Promise<void>;
};

export function CommentSection({
  comments,
  postId,
  currentUserId,
  canComment,
  commentsLocked,
  onAddComment,
  onEditComment,
  onDeleteComment,
  onApprove,
  onDisapprove,
  onPin,
  onUnpin,
}: CommentSectionProps) {
  const [newComment, setNewComment] = useState("");
  const [replyTo, setReplyTo] = useState<string | null>(null);
  const [editId, setEditId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState("");
  const [reporting, setReporting] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleAdd = async () => {
    if (!newComment.trim()) return;
    try {
      await onAddComment(newComment.trim(), replyTo || undefined);
      setNewComment("");
      setReplyTo(null);
      setError(null);
    } catch (e) {
      setError("Failed to post comment. Please try again.");
    }
  };

  const handleEdit = async () => {
    if (!editContent.trim() || !editId) return;
    try {
      await onEditComment(editId, editContent.trim());
      setEditId(null);
      setEditContent("");
      setError(null);
    } catch (e) {
      setError("Failed to edit comment. Please try again.");
    }
  };

  // Helper to normalize comment data (handles both camelCase and snake_case from Supabase)
  const normalizeComment = (comment: Comment | any): Comment => {
    // If the comment already has the expected structure, return it
    if (comment.user) return comment;
    
    // Otherwise, transform from Supabase snake_case format
    const profiles = comment.profiles;
    return {
      id: comment.id,
      postId: comment.post_id || comment.postId,
      userId: comment.user_id || comment.userId,
      parentCommentId: comment.parent_comment_id || comment.parentCommentId,
      content: comment.content,
      approvalCount: comment.approval_count ?? comment.approvalCount ?? 0,
      disapprovalCount: comment.disapproval_count ?? comment.disapprovalCount ?? 0,
      isPinned: comment.is_pinned ?? comment.isPinned ?? false,
      status: comment.status || "active",
      createdAt: comment.created_at || comment.createdAt,
      updatedAt: comment.updated_at || comment.updatedAt,
      user: profiles ? {
        firstName: profiles.first_name || "",
        lastName: profiles.last_name || "",
        screenName: profiles.screen_name || undefined,
        profilePhotoUrl: profiles.profile_photo_url || undefined,
        isVerified: profiles.is_verified || false,
      } : {
        firstName: "Unknown",
        lastName: "User",
      },
      replies: comment.replies?.map((r: any) => normalizeComment(r)),
    };
  };

  const renderComment = (rawComment: Comment | any, depth = 0) => {
    const comment = normalizeComment(rawComment);
    const isReply = depth === 1;
    const canEdit = currentUserId && comment.userId === currentUserId;
    const canPin = !isReply && (onPin && onUnpin);
    const isEditing = editId === comment.id;
    const isDeleted = comment.status === "deleted";
    return (
      <div
        key={comment.id}
        className={`flex flex-col gap-1 border-b pb-3 mb-3 pl-${isReply ? 6 : 0}`}
        aria-label={isReply ? "Reply" : "Comment"}
      >
        <div className="flex items-center gap-2">
          {comment.user?.profilePhotoUrl && (
            <img
              src={comment.user.profilePhotoUrl}
              alt={`${comment.user.firstName} ${comment.user.lastName}'s profile photo`}
              className="w-8 h-8 rounded-full border"
            />
          )}
          <span className="font-semibold">
            {comment.user?.firstName || "Unknown"} {comment.user?.lastName || "User"}
          </span>
          {comment.user?.screenName && (
            <span className="text-gray-500 ml-1">@{comment.user.screenName}</span>
          )}
          {comment.user?.isVerified && (
            <span title="Verified Publisher" aria-label="Verified Publisher" className="ml-1 text-blue-600">✓</span>
          )}
          {comment.isPinned && (
            <span className="ml-2 px-2 py-0.5 bg-yellow-100 text-yellow-800 rounded text-xs font-bold">PINNED</span>
          )}
        </div>
        <div className="text-xs text-gray-500" aria-label="Comment timestamp">
          {new Date(comment.createdAt).toLocaleString()}
          {comment.updatedAt && <span> (edited)</span>}
        </div>
        {isEditing ? (
          <div className="flex flex-col gap-1">
            <CharacterCountInput
              value={editContent}
              onChange={e => setEditContent(e.target.value)}
              maxLength={500}
              type="textarea"
              ariaLabel="Edit comment"
            />
            <div className="flex gap-2 mt-1">
              <Button size="sm" onClick={handleEdit} aria-label="Save edited comment">Save</Button>
              <Button size="sm" variant="ghost" onClick={() => setEditId(null)} aria-label="Cancel edit">Cancel</Button>
            </div>
          </div>
        ) : (
          <div className={`mt-1 ${isDeleted ? "italic text-gray-400" : ""}`}>
            {isDeleted ? "[deleted]" : comment.content}
          </div>
        )}
        {!isDeleted && (
          <div className="flex gap-2 items-center mt-1">
            <Button size="sm" variant="ghost" onClick={() => onApprove(comment.id)} aria-label="Approve comment">👍 {comment.approvalCount}</Button>
            <Button size="sm" variant="ghost" onClick={() => onDisapprove(comment.id)} aria-label="Disapprove comment">👎 {comment.disapprovalCount}</Button>
            {canComment && !commentsLocked && (
              <Button size="sm" variant="ghost" onClick={() => setReplyTo(comment.id)} aria-label="Reply to comment">Reply</Button>
            )}
            <Button size="sm" variant="ghost" onClick={() => setReporting(comment.id)} aria-label="Report comment">Report</Button>
            {canEdit && !isEditing && (
              <Button size="sm" variant="ghost" onClick={() => { setEditId(comment.id); setEditContent(comment.content); }} aria-label="Edit comment">Edit</Button>
            )}
            {canEdit && (
              <Button size="sm" variant="ghost" onClick={() => onDeleteComment(comment.id)} aria-label="Delete comment">Delete</Button>
            )}
            {canPin && !comment.isPinned && (
              <Button size="sm" variant="ghost" onClick={() => onPin(comment.id)} aria-label="Pin comment">Pin</Button>
            )}
            {canPin && comment.isPinned && (
              <Button size="sm" variant="ghost" onClick={() => onUnpin(comment.id)} aria-label="Unpin comment">Unpin</Button>
            )}
          </div>
        )}
        {/* Replies */}
        {comment.replies && comment.replies.length > 0 && (
          <div className="mt-2 pl-6 border-l">
            {comment.replies.map(reply => renderComment(reply, 1))}
          </div>
        )}
        {/* Reply form */}
        {replyTo === comment.id && canComment && !commentsLocked && (
          <div className="mt-2">
            <CharacterCountInput
              value={newComment}
              onChange={e => setNewComment(e.target.value)}
              maxLength={500}
              type="textarea"
              ariaLabel="Reply to comment"
            />
            <div className="flex gap-2 mt-1">
              <Button size="sm" onClick={handleAdd} aria-label="Post reply">Post Reply</Button>
              <Button size="sm" variant="ghost" onClick={() => { setReplyTo(null); setNewComment(""); }} aria-label="Cancel reply">Cancel</Button>
            </div>
          </div>
        )}
        {/* Report Modal */}
        {reporting === comment.id && (
          <ReportModal
            open={true}
            onClose={() => setReporting(null)}
            itemType="comment"
            itemId={comment.id}
          />
        )}
      </div>
    );
  };

  return (
    <section aria-label="Comments section" className="w-full mt-6">
      <h2 className="text-lg font-bold mb-4">Comments ({comments.length})</h2>
      {commentsLocked && (
        <div className="text-yellow-700 bg-yellow-100 rounded px-3 py-2 mb-3" role="alert">
          Comments are locked by the publisher
        </div>
      )}
      {canComment && !commentsLocked && (
        <div className="mb-4">
          <CharacterCountInput
            value={newComment}
            onChange={e => setNewComment(e.target.value)}
            maxLength={500}
            type="textarea"
            label="Share your thoughts..."
            ariaLabel="New comment"
          />
          <div className="flex gap-2 mt-1">
            <Button onClick={handleAdd} aria-label="Post comment">Post Comment</Button>
            {replyTo && (
              <Button variant="ghost" onClick={() => { setReplyTo(null); setNewComment(""); }} aria-label="Cancel reply">Cancel</Button>
            )}
          </div>
        </div>
      )}
      {error && <div className="text-red-600 text-sm mb-2" role="alert">{error}</div>}
      <div>
        {comments.length === 0 ? (
          <div className="text-muted-foreground">No comments yet. Be the first to comment!</div>
        ) : (
          comments.filter(c => !c.parentCommentId && !c.parent_comment_id).map(comment => renderComment(comment))
        )}
      </div>
    </section>
  );
}
