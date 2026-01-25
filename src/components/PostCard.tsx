import React from "react";
import { Link } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface PostCardProps {
  post: {
    id: string;
    blogSlug: string;
    blogName: string;
    blogLogo: string;
    isVerified: boolean;
    headline: string;
    subtitle?: string;
    byline: string;
    content: string;
    publishedAt: string;
    viewCount: number;
    approvalCount: number;
    disapprovalCount: number;
    commentCount: number;
    isPinned?: boolean;
  };
}

export function PostCard({ post }: PostCardProps) {
  return (
    <article className="bg-white rounded-xl shadow-sm border p-5 flex flex-col gap-3 hover:shadow-md transition-all group">
      <div className="flex items-center gap-2 mb-1">
        <img
          src={post.blogLogo}
          alt={`Logo for ${post.blogName}`}
          className="w-7 h-7 rounded-full border"
        />
        <Link to={`/blog/${post.blogSlug}`} className="font-semibold text-sm hover:underline">
          {post.blogName}
        </Link>
        {post.isVerified && (
          <Badge className="ml-1 bg-blue-600 text-white" aria-label="Verified Publisher">✓</Badge>
        )}
        {post.isPinned && (
          <Badge className="ml-2 bg-yellow-400 text-black" aria-label="Pinned Post">PINNED</Badge>
        )}
      </div>
      <Link to={`/blog/${post.blogSlug}/post/${post.id}`} className="text-xl font-bold group-hover:text-primary transition-colors">
        {post.headline}
      </Link>
      {post.subtitle && <div className="text-muted-foreground text-base mb-1">{post.subtitle}</div>}
      <div className="text-sm text-muted-foreground mb-2 line-clamp-3">
        {post.content.slice(0, 200)}{post.content.length > 200 && "... Read more"}
      </div>
      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <span>By {post.byline}</span>
        <span>•</span>
        <span>{post.publishedAt}</span>
      </div>
      <div className="flex items-center gap-4 mt-2">
        <span aria-label="Views">👁 {post.viewCount}</span>
        <span aria-label="Approvals">✓ {post.approvalCount}</span>
        <span aria-label="Disapprovals">✗ {post.disapprovalCount}</span>
        <span aria-label="Comments">💬 {post.commentCount}</span>
        <Button variant="ghost" size="icon" aria-label="Share post">
          <span role="img" aria-label="Share">🔗</span>
        </Button>
      </div>
    </article>
  );
}
