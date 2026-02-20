import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { Edit3 } from "lucide-react";

interface Blog {
  id: string;
  blog_name: string;
  slug: string;
  profile_photo_url: string;
  profile_photo_alt: string;
}

interface BlogPickerModalProps {
  open: boolean;
  onClose: () => void;
  blogs: Blog[];
}

export function BlogPickerModal({ open, onClose, blogs }: BlogPickerModalProps) {
  const navigate = useNavigate();

  const handleSelect = (slug: string) => {
    onClose();
    navigate(`/blog/${slug}/post/create`);
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md" aria-labelledby="blog-picker-title">
        <DialogHeader>
          <DialogTitle id="blog-picker-title" className="font-serif text-xl">
            Choose a Publication
          </DialogTitle>
          <DialogDescription>
            Select the publication you want to post to.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-2 mt-2" role="list" aria-label="Your publications">
          {blogs.map((blog) => (
            <Button
              key={blog.id}
              variant="ghost"
              className="w-full justify-start h-auto p-3 rounded-xl hover:bg-accent/10"
              onClick={() => handleSelect(blog.slug)}
              aria-label={`Publish new post to ${blog.blog_name}`}
              role="listitem"
            >
              <Avatar className="h-10 w-10 rounded-lg border border-border mr-3 flex-shrink-0">
                <AvatarImage
                  src={blog.profile_photo_url}
                  alt={blog.profile_photo_alt || `${blog.blog_name} profile photo`}
                />
                <AvatarFallback className="rounded-lg bg-accent text-accent-foreground font-bold">
                  {blog.blog_name.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <span className="font-medium text-foreground">{blog.blog_name}</span>
            </Button>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}
