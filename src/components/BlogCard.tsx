import React from "react";
import { Link } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface BlogCardProps {
  blog: {
    id: string;
    slug: string;
    name: string;
    logo: string;
    isVerified: boolean;
    category: string;
    followerCount: number;
    description: string;
    isFollowing?: boolean;
  };
  onFollow?: () => void;
  onUnfollow?: () => void;
}

export function BlogCard({ blog, onFollow, onUnfollow }: BlogCardProps) {
  return (
    <article className="bg-white rounded-xl shadow-sm border p-5 flex flex-col gap-3 hover:shadow-md transition-all group">
      <div className="flex items-center gap-2 mb-1">
        <img
          src={blog.logo}
          alt={`Logo for ${blog.name}`}
          className="w-8 h-8 rounded-full border"
        />
        <Link to={`/blog/${blog.slug}`} className="font-semibold text-base hover:underline">
          {blog.name}
        </Link>
        {blog.isVerified && (
          <Badge className="ml-1 bg-blue-600 text-white" aria-label="Verified Publisher">✓</Badge>
        )}
        <Badge className="ml-2 bg-gray-200 text-gray-700" aria-label="Category">{blog.category}</Badge>
      </div>
      <div className="text-sm text-muted-foreground mb-1 line-clamp-2">
        {blog.description}
      </div>
      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <span>{blog.followerCount} followers</span>
      </div>
      {onFollow && !blog.isFollowing && (
        <Button size="sm" onClick={onFollow} aria-label={`Follow ${blog.name}`}>Follow</Button>
      )}
      {onUnfollow && blog.isFollowing && (
        <Button size="sm" variant="outline" onClick={onUnfollow} aria-label={`Unfollow ${blog.name}`}>Unfollow</Button>
      )}
    </article>
  );
}
