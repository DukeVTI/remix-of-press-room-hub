import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { PostCard } from "@/components/PostCard";

const SHARE_OPTIONS = [
  { label: "Facebook", icon: "📘", url: (u: string, t: string) => `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(u)}` },
  { label: "X (Twitter)", icon: "🐦", url: (u: string, t: string) => `https://twitter.com/intent/tweet?url=${encodeURIComponent(u)}&text=${encodeURIComponent(t)}` },
  { label: "Instagram", icon: "📷", url: () => null, disabled: true, message: "Copy link and share to Instagram" },
  { label: "TikTok", icon: "🎵", url: () => null, disabled: true, message: "Copy link and share to TikTok" },
  { label: "WhatsApp", icon: "💬", url: (u: string, t: string) => `https://wa.me/?text=${encodeURIComponent(`${t} ${u}`)}` },
  { label: "LinkedIn", icon: "💼", url: (u: string, t: string) => `https://www.linkedin.com/shareArticle?mini=true&url=${encodeURIComponent(u)}&title=${encodeURIComponent(t)}` },
  { label: "Email", icon: "✉️", url: (u: string, t: string) => `mailto:?subject=${encodeURIComponent(t)}&body=${encodeURIComponent(`${t}\n\n${u}`)}` },
  { label: "Text Message", icon: "💬", url: (u: string, t: string) => `sms:?&body=${encodeURIComponent(`${t} ${u}`)}` },
  { label: "Copy Link", icon: "🔗", url: (u: string) => u, isCopy: true },
];

interface ShareSheetProps {
  open: boolean;
  onClose: () => void;
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

export function ShareSheet({ open, onClose, post }: ShareSheetProps) {
  const [copied, setCopied] = useState(false);
  const postUrl = `https://pressroompublisher.com/blog/${post.blogSlug}/post/${post.id}`;
  const headline = post.headline;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(postUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 1200);
    } catch {
      setCopied(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Share this post</DialogTitle>
        </DialogHeader>
        <div className="mb-4">
          <PostCard post={post} />
        </div>
        <div className="grid grid-cols-2 gap-3">
          {SHARE_OPTIONS.map((opt) => (
            <div key={opt.label} className="flex flex-col items-center gap-1">
              {opt.isCopy ? (
                <Button
                  variant="outline"
                  size="icon"
                  aria-label="Copy post link"
                  onClick={handleCopy}
                  className="text-xl"
                  disabled={copied}
                >
                  {opt.icon}
                </Button>
              ) : opt.disabled ? (
                <Button
                  variant="ghost"
                  size="icon"
                  aria-label={opt.label}
                  disabled
                  title={opt.message}
                  className="text-xl opacity-60"
                >
                  {opt.icon}
                </Button>
              ) : (
                <a
                  href={opt.url(postUrl, headline)}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={`Share to ${opt.label}`}
                >
                  <Button variant="outline" size="icon" className="text-xl">
                    {opt.icon}
                  </Button>
                </a>
              )}
              <span className="text-xs mt-1 text-center">
                {opt.isCopy && copied ? "Copied!" : opt.label}
              </span>
            </div>
          ))}
        </div>
        <DialogFooter>
          <Button onClick={onClose} aria-label="Close share sheet">Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
