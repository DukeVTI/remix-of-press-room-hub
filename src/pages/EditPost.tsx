import { useState, useEffect, useRef } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CharacterCountInput } from "@/components/CharacterCountInput";
import { MediaUploader } from "@/components/MediaUploader";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { 
  ArrowLeft, 
  Plus, 
  X, 
  Loader2,
  ImageIcon,
  Video,
  Music,
  AlertCircle,
  Save,
  Send,
  Trash2,
  Lock,
  Unlock,
  Pin,
  PinOff,
  FileEdit
} from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import type { Tables } from "@/integrations/supabase/types";
import { Footer } from "@/components/Footer";

type Post = Tables<"posts">;
type Blog = Tables<"blogs">;

interface ExistingMedia {
  id: string;
  file_url: string;
  description: string;
  media_type: "image" | "video" | "audio";
  order_position: number;
  isDeleted?: boolean;
}

interface NewMediaItem {
  id: string;
  file: File;
  preview: string;
  type: "image" | "video" | "audio";
  description: string;
  isUploading?: boolean;
}

const MAX_HEADLINE_CHARS = 150;
const MAX_SUBTITLE_CHARS = 250;
const MAX_BYLINE_CHARS = 100;
const MAX_CONTENT_CHARS = 2500;
const MAX_DESCRIPTION_CHARS = 500;
const MAX_MEDIA_FILES = 10;

const EditPost = () => {
  const { blogSlug, postId } = useParams<{ blogSlug: string; postId: string }>();
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Auth state
  const [userId, setUserId] = useState<string | null>(null);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  
  // Data
  const [blog, setBlog] = useState<Blog | null>(null);
  const [post, setPost] = useState<Post | null>(null);
  
  // Form data
  const [headline, setHeadline] = useState("");
  const [subtitle, setSubtitle] = useState("");
  const [byline, setByline] = useState("");
  const [content, setContent] = useState("");
  const [commentsLocked, setCommentsLocked] = useState(false);
  const [isPinned, setIsPinned] = useState(false);
  const [existingMedia, setExistingMedia] = useState<ExistingMedia[]>([]);
  const [newMedia, setNewMedia] = useState<NewMediaItem[]>([]);
  
  // UI state
  const [isLoading, setIsLoading] = useState(false);
  const [isSavingDraft, setIsSavingDraft] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    const init = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        navigate("/login");
        return;
      }
      
      setUserId(session.user.id);

      // Fetch post with blog
      const { data: postData, error: postError } = await supabase
        .from("posts")
        .select(`
          *,
          blogs!inner(*),
          media(*)
        `)
        .eq("id", postId)
        .maybeSingle();

      if (postError || !postData) {
        toast.error("Post not found");
        navigate("/dashboard");
        return;
      }

      // Verify blog slug matches
      if (postData.blogs.slug !== blogSlug) {
        toast.error("Post not found");
        navigate("/dashboard");
        return;
      }

      // Check if user can manage this blog
      const { data: canManage } = await supabase.rpc("can_manage_blog", {
        _user_id: session.user.id,
        _blog_id: postData.blogs.id,
      });

      if (!canManage) {
        toast.error("You don't have permission to edit this post");
        navigate("/dashboard");
        return;
      }

      setBlog(postData.blogs);
      setPost(postData);
      
      // Populate form
      setHeadline(postData.headline);
      setSubtitle(postData.subtitle || "");
      setByline(postData.byline);
      setContent(postData.content);
      setCommentsLocked(postData.comments_locked);
      setIsPinned(postData.is_pinned);
      
      // Sort and set existing media
      const sortedMedia = (postData.media || [])
        .sort((a: any, b: any) => a.order_position - b.order_position)
        .map((m: any) => ({
          id: m.id,
          file_url: m.file_url,
          description: m.description,
          media_type: m.media_type as "image" | "video" | "audio",
          order_position: m.order_position,
        }));
      setExistingMedia(sortedMedia);

      setIsCheckingAuth(false);
    };

    init();
  }, [blogSlug, postId, navigate]);

  // Handle new media file selection
  const handleMediaSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const activeExisting = existingMedia.filter(m => !m.isDeleted).length;
    
    if (activeExisting + newMedia.length + files.length > MAX_MEDIA_FILES) {
      toast.error(`Maximum ${MAX_MEDIA_FILES} media files allowed`);
      return;
    }

    files.forEach((file) => {
      let type: "image" | "video" | "audio" | null = null;
      if (file.type.startsWith("image/")) type = "image";
      else if (file.type.startsWith("video/")) type = "video";
      else if (file.type.startsWith("audio/")) type = "audio";

      if (!type) {
        toast.error(`${file.name} is not a supported media type`);
        return;
      }

      const maxSize = type === "video" ? 50 * 1024 * 1024 : 10 * 1024 * 1024;
      if (file.size > maxSize) {
        toast.error(`${file.name} exceeds maximum file size`);
        return;
      }

      const preview = type === "audio" ? "" : URL.createObjectURL(file);

      const newItem: NewMediaItem = {
        id: `new-${Date.now()}-${Math.random()}`,
        file,
        preview,
        type,
        description: "",
      };

      setNewMedia((prev) => [...prev, newItem]);
    });

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  // Update existing media description
  const updateExistingMediaDescription = (id: string, description: string) => {
    setExistingMedia((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, description } : item
      )
    );
  };

  // Update new media description
  const updateNewMediaDescription = (id: string, description: string) => {
    setNewMedia((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, description } : item
      )
    );
  };

  // Mark existing media for deletion
  const markExistingMediaForDeletion = (id: string) => {
    setExistingMedia((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, isDeleted: true } : item
      )
    );
  };

  // Restore existing media
  const restoreExistingMedia = (id: string) => {
    setExistingMedia((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, isDeleted: false } : item
      )
    );
  };

  // Remove new media item
  const removeNewMedia = (id: string) => {
    setNewMedia((prev) => {
      const item = prev.find((m) => m.id === id);
      if (item?.preview) {
        URL.revokeObjectURL(item.preview);
      }
      return prev.filter((m) => m.id !== id);
    });
  };

  // Validate form
  const validateForm = (isDraft: boolean): boolean => {
    const newErrors: Record<string, string> = {};

    if (!headline.trim()) {
      newErrors.headline = "Headline is required";
    } else if (headline.length < 5) {
      newErrors.headline = "Headline must be at least 5 characters";
    }

    if (!byline.trim()) {
      newErrors.byline = "Byline is required";
    }

    if (!isDraft) {
      if (!content.trim()) {
        newErrors.content = "Content is required for publishing";
      } else if (content.length < 50) {
        newErrors.content = "Content must be at least 50 characters for publishing";
      }

      // Check all media has descriptions
      const activeExisting = existingMedia.filter(m => !m.isDeleted);
      const existingMissingDesc = activeExisting.some((m) => !m.description.trim());
      const newMissingDesc = newMedia.some((m) => !m.description.trim());
      
      if (existingMissingDesc || newMissingDesc) {
        newErrors.media = "All media must have accessibility descriptions for publishing";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Upload new media files
  const uploadNewMediaFiles = async (): Promise<boolean> => {
    const activeExistingCount = existingMedia.filter(m => !m.isDeleted).length;
    
    for (let i = 0; i < newMedia.length; i++) {
      const item = newMedia[i];
      
      setNewMedia((prev) =>
        prev.map((m) =>
          m.id === item.id ? { ...m, isUploading: true } : m
        )
      );

      try {
        const fileExt = item.file.name.split(".").pop();
        const fileName = `${userId}/${postId}/${Date.now()}-${i}.${fileExt}`;

        const { error: uploadError } = await supabase.storage
          .from("post-media")
          .upload(fileName, item.file);

        if (uploadError) throw uploadError;

        const { data: urlData } = supabase.storage
          .from("post-media")
          .getPublicUrl(fileName);

        const { error: mediaError } = await supabase
          .from("media")
          .insert({
            post_id: postId,
            media_type: item.type,
            file_url: urlData.publicUrl,
            description: item.description.trim(),
            file_size: item.file.size,
            order_position: activeExistingCount + i,
          });

        if (mediaError) throw mediaError;

        setNewMedia((prev) =>
          prev.map((m) =>
            m.id === item.id ? { ...m, isUploading: false } : m
          )
        );
      } catch (error: any) {
        console.error("Error uploading media:", error);
        toast.error(`Failed to upload ${item.file.name}`);
        return false;
      }
    }
    return true;
  };

  // Handle form submission
  const handleSubmit = async (status: "draft" | "published") => {
    const isDraft = status === "draft";
    
    if (!validateForm(isDraft) || !userId || !blog || !post) return;

    const loadingState = isDraft ? setIsSavingDraft : setIsLoading;
    loadingState(true);

    try {
      // Update existing media descriptions
      for (const media of existingMedia.filter(m => !m.isDeleted)) {
        await supabase
          .from("media")
          .update({ description: media.description.trim() })
          .eq("id", media.id);
      }

      // Delete marked media
      const toDelete = existingMedia.filter(m => m.isDeleted);
      for (const media of toDelete) {
        await supabase.from("media").delete().eq("id", media.id);
        // Note: Storage cleanup could be done via a database trigger or scheduled job
      }

      // Upload new media
      if (newMedia.length > 0) {
        const success = await uploadNewMediaFiles();
        if (!success && !isDraft) {
          throw new Error("Failed to upload media files");
        }
      }

      // Update the post
      const { error: postError } = await supabase
        .from("posts")
        .update({
          headline: headline.trim(),
          subtitle: subtitle.trim() || null,
          byline: byline.trim(),
          content: content.trim(),
          status,
          comments_locked: commentsLocked,
          is_pinned: isPinned,
        })
        .eq("id", postId);

      if (postError) throw postError;

      toast.success(
        isDraft ? "Draft saved successfully!" : "Post updated successfully!",
        {
          description: isDraft 
            ? "You can continue editing later." 
            : "Your changes are now live.",
        }
      );

      navigate(`/blog/${blogSlug}/manage`);
    } catch (error: any) {
      console.error("Error updating post:", error);
      toast.error("Failed to update post", {
        description: error.message || "Please try again",
      });
    } finally {
      loadingState(false);
    }
  };

  // Handle post deletion
  const handleDelete = async () => {
    if (!post) return;
    
    setIsDeleting(true);

    try {
      const { error } = await supabase
        .from("posts")
        .update({ status: "deleted" })
        .eq("id", postId);

      if (error) throw error;

      toast.success("Post deleted successfully");
      navigate(`/blog/${blogSlug}/manage`);
    } catch (error: any) {
      console.error("Error deleting post:", error);
      toast.error("Failed to delete post");
    } finally {
      setIsDeleting(false);
    }
  };

  const getMediaIcon = (type: "image" | "video" | "audio") => {
    switch (type) {
      case "image":
        return <ImageIcon className="h-5 w-5" aria-hidden="true" />;
      case "video":
        return <Video className="h-5 w-5" aria-hidden="true" />;
      case "audio":
        return <Music className="h-5 w-5" aria-hidden="true" />;
    }
  };

  if (isCheckingAuth) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-accent" aria-label="Loading" />
      </div>
    );
  }

  const activeExistingMedia = existingMedia.filter(m => !m.isDeleted);
  const deletedExistingMedia = existingMedia.filter(m => m.isDeleted);
  const totalMediaCount = activeExistingMedia.length + newMedia.length;

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <a href="#main-content" className="skip-link">
        Skip to main content
      </a>

      {/* Header */}
      <header className="border-b border-border bg-card sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link 
                to={`/blog/${blogSlug}/manage`} 
                className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
                aria-label="Back to blog management"
              >
                <ArrowLeft className="h-5 w-5" aria-hidden="true" />
              </Link>
              <div className="flex items-center gap-2">
                <FileEdit className="h-6 w-6 text-accent" aria-hidden="true" />
                <span className="font-serif text-lg font-bold text-foreground">Edit Post</span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button
                    variant="destructive"
                    disabled={isLoading || isSavingDraft || isDeleting}
                    aria-label="Delete post"
                  >
                    {isDeleting ? (
                      <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                    ) : (
                      <Trash2 className="h-4 w-4" aria-hidden="true" />
                    )}
                    <span className="hidden sm:inline ml-2">Delete</span>
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Delete Post?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This action cannot be undone. The post will be permanently deleted.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel aria-label="Cancel deletion">Cancel</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={handleDelete}
                      className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                      aria-label="Confirm deletion"
                    >
                      Delete
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>

              <Button
                variant="outline"
                onClick={() => handleSubmit("draft")}
                disabled={isLoading || isSavingDraft || isDeleting}
                aria-label="Save as draft"
              >
                {isSavingDraft ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" aria-hidden="true" />
                ) : (
                  <Save className="h-4 w-4 mr-2" aria-hidden="true" />
                )}
                Save Draft
              </Button>
              <Button
                className="btn-gold"
                onClick={() => handleSubmit("published")}
                disabled={isLoading || isSavingDraft || isDeleting}
                aria-label="Publish post"
              >
                {isLoading ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" aria-hidden="true" />
                ) : (
                  <Send className="h-4 w-4 mr-2" aria-hidden="true" />
                )}
                Publish
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main id="main-content" className="container mx-auto px-4 py-8 max-w-4xl">
        <form onSubmit={(e) => e.preventDefault()} className="space-y-8">
          {/* Headline */}
          <div className="space-y-2">
            <Label htmlFor="headline" className="form-label">
              Headline <span className="text-destructive" aria-hidden="true">*</span>
            </Label>
            <CharacterCountInput
              value={headline}
              onChange={e => setHeadline(e.target.value)}
              maxLength={MAX_HEADLINE_CHARS}
              label={undefined}
              required
              placeholder="Enter a compelling headline..."
              ariaLabel="Headline"
              className={`text-2xl font-display ${errors.headline ? "border-destructive" : ""}`}
              disabled={isLoading || isSavingDraft}
            />
            <div className="flex justify-between">
              <p id="headline-hint" className="text-xs text-muted-foreground">
                Capture attention with a clear, engaging headline
              </p>
            </div>
            {errors.headline && (
              <p id="headline-error" className="text-sm text-destructive flex items-center gap-1" role="alert">
                <AlertCircle className="h-4 w-4" aria-hidden="true" />
                {errors.headline}
              </p>
            )}
          </div>

          {/* Subtitle */}
          <div className="space-y-2">
            <Label htmlFor="subtitle" className="form-label">
              Subtitle <span className="text-muted-foreground text-sm">(optional)</span>
            </Label>
            <CharacterCountInput
              value={subtitle}
              onChange={e => setSubtitle(e.target.value)}
              maxLength={MAX_SUBTITLE_CHARS}
              label={undefined}
              placeholder="Add a subtitle to provide more context..."
              ariaLabel="Subtitle"
              className="text-lg"
              disabled={isLoading || isSavingDraft}
            />
            <div className="flex justify-between">
              <p id="subtitle-hint" className="text-xs text-muted-foreground">
                Expand on your headline with additional context
              </p>
            </div>
          </div>

          {/* Byline */}
          <div className="space-y-2">
            <Label htmlFor="byline" className="form-label">
              Byline <span className="text-destructive" aria-hidden="true">*</span>
            </Label>
            <CharacterCountInput
              value={byline}
              onChange={e => setByline(e.target.value)}
              maxLength={MAX_BYLINE_CHARS}
              label={undefined}
              required
              placeholder="Author name as displayed to readers"
              ariaLabel="Byline"
              className={errors.byline ? "border-destructive" : ""}
              disabled={isLoading || isSavingDraft}
            />
            <div className="flex justify-between">
              <p id="byline-hint" className="text-xs text-muted-foreground">
                How your name will appear on the published post
              </p>
            </div>
            {errors.byline && (
              <p id="byline-error" className="text-sm text-destructive flex items-center gap-1" role="alert">
                <AlertCircle className="h-4 w-4" aria-hidden="true" />
                {errors.byline}
              </p>
            )}
          </div>

          {/* Content */}
          <div className="space-y-2">
            <Label htmlFor="content" className="form-label">
              Content <span className="text-destructive" aria-hidden="true">*</span>
            </Label>
            <CharacterCountInput
              value={content}
              onChange={e => setContent(e.target.value)}
              maxLength={MAX_CONTENT_CHARS}
              label={undefined}
              required
              type="textarea"
              placeholder="Write your post content here..."
              ariaLabel="Content"
              className={`min-h-[300px] font-serif text-lg leading-relaxed ${errors.content ? "border-destructive" : ""}`}
              disabled={isLoading || isSavingDraft}
            />
            <div className="flex justify-between">
              <p id="content-hint" className="text-xs text-muted-foreground">
                Write your story. Minimum 50 characters required for publishing.
              </p>
            </div>
            {errors.content && (
              <p id="content-error" className="text-sm text-destructive flex items-center gap-1" role="alert">
                <AlertCircle className="h-4 w-4" aria-hidden="true" />
                {errors.content}
              </p>
            )}
          </div>

          {/* Post Settings */}
          <fieldset className="space-y-4 border border-border rounded-lg p-4">
            <legend className="form-label px-2">Post Settings</legend>
            
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="comments-locked" className="flex items-center gap-2">
                  {commentsLocked ? (
                    <Lock className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
                  ) : (
                    <Unlock className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
                  )}
                  Lock Comments
                </Label>
                <p className="text-xs text-muted-foreground">
                  Prevent new comments on this post
                </p>
              </div>
              <Switch
                id="comments-locked"
                checked={commentsLocked}
                onCheckedChange={setCommentsLocked}
                aria-label="Toggle comment lock"
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="is-pinned" className="flex items-center gap-2">
                  {isPinned ? (
                    <Pin className="h-4 w-4 text-accent" aria-hidden="true" />
                  ) : (
                    <PinOff className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
                  )}
                  Pin Post
                </Label>
                <p className="text-xs text-muted-foreground">
                  Keep this post at the top of your blog
                </p>
              </div>
              <Switch
                id="is-pinned"
                checked={isPinned}
                onCheckedChange={setIsPinned}
                aria-label="Toggle pin post"
              />
            </div>
          </fieldset>

          {/* Media Upload */}
          <fieldset className="space-y-4">
            <legend className="form-label">
              Media <span className="text-muted-foreground text-sm">({totalMediaCount}/{MAX_MEDIA_FILES})</span>
            </legend>
            <p className="text-xs text-muted-foreground">
              Add images, videos, or audio to your post. Each file requires an accessibility description.
            </p>

            {errors.media && (
              <p className="text-sm text-destructive flex items-center gap-1" role="alert">
                <AlertCircle className="h-4 w-4" aria-hidden="true" />
                {errors.media}
              </p>
            )}

            {/* Add Media Button */}
            {totalMediaCount < MAX_MEDIA_FILES && (
              <div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*,video/*,audio/*"
                  onChange={handleMediaSelect}
                  className="sr-only"
                  id="media-upload"
                  multiple
                  aria-label="Upload media files"
                />
                <label htmlFor="media-upload">
                  <Button
                    type="button"
                    variant="outline"
                    className="cursor-pointer"
                    onClick={() => fileInputRef.current?.click()}
                    aria-label="Add media files"
                  >
                    <Plus className="h-4 w-4 mr-2" aria-hidden="true" />
                    Add Media
                  </Button>
                </label>
              </div>
            )}

            {/* Existing Media */}
            {activeExistingMedia.length > 0 && (
              <div className="space-y-4">
                <h3 className="text-sm font-medium text-foreground">Current Media</h3>
                {activeExistingMedia.map((item) => (
                  <div key={item.id} className="flex gap-4 p-4 border border-border rounded-lg bg-card">
                    {/* Preview */}
                    <div className="w-24 h-24 flex-shrink-0 rounded-lg overflow-hidden bg-muted flex items-center justify-center">
                      {item.media_type === "image" && (
                        <img
                          src={item.file_url}
                          alt={item.description}
                          className="w-full h-full object-cover"
                        />
                      )}
                      {item.media_type === "video" && (
                        <Video className="h-8 w-8 text-muted-foreground" aria-hidden="true" />
                      )}
                      {item.media_type === "audio" && (
                        <Music className="h-8 w-8 text-muted-foreground" aria-hidden="true" />
                      )}
                    </div>
                    {/* Details and Restore */}
                    <div className="flex-1 flex flex-col justify-between">
                      <div>
                        <span className="text-sm font-medium text-foreground truncate">
                          {item.file_url.split('/').pop()}
                        </span>
                        <div className="flex justify-between">
                          <p className="text-xs text-muted-foreground">
                            {item.description}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center justify-between mt-2">
                        <span className="text-sm text-muted-foreground line-through">
                          {item.description || "No description"}
                        </span>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => restoreExistingMedia(item.id)}
                          aria-label={`Restore ${item.media_type}`}
                        >
                          Restore
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* New Media */}
            {newMedia.length > 0 && (
              <div className="space-y-4">
                <h3 className="text-sm font-medium text-foreground">New Media</h3>
                {newMedia.map((item) => (
                  <div 
                    key={item.id} 
                    className={`flex gap-4 p-4 border rounded-lg ${item.isUploading ? "border-accent bg-accent/5" : "border-border bg-card"}`}
                  >
                    {/* Preview */}
                    <div className="w-24 h-24 flex-shrink-0 rounded-lg overflow-hidden bg-muted flex items-center justify-center">
                      {item.type === "image" && item.preview && (
                        <img
                          src={item.preview}
                          alt="Preview"
                          className="w-full h-full object-cover"
                        />
                      )}
                      {item.type === "video" && item.preview && (
                        <video
                          src={item.preview}
                          className="w-full h-full object-cover"
                        />
                      )}
                      {item.type === "audio" && (
                        <Music className="h-8 w-8 text-muted-foreground" aria-hidden="true" />
                      )}
                    </div>

                    {/* Details */}
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center gap-2">
                        {getMediaIcon(item.type)}
                        <span className="text-sm font-medium">{item.file.name}</span>
                        {item.isUploading && (
                          <Loader2 className="h-4 w-4 animate-spin text-accent" aria-label="Uploading" />
                        )}
                      </div>
                      <Textarea
                        value={item.description}
                        onChange={(e) => updateNewMediaDescription(item.id, e.target.value)}
                        placeholder="Describe this media for accessibility (required)..."
                        className="text-sm"
                        maxLength={MAX_DESCRIPTION_CHARS}
                        aria-label={`Description for ${item.file.name}`}
                        disabled={item.isUploading}
                      />
                      <div className="flex justify-between items-center">
                        <span className="text-xs text-muted-foreground">
                          {item.description.length}/{MAX_DESCRIPTION_CHARS}
                        </span>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeNewMedia(item.id)}
                          disabled={item.isUploading}
                          className="text-destructive hover:text-destructive"
                          aria-label={`Remove ${item.file.name}`}
                        >
                          <X className="h-4 w-4" aria-hidden="true" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {totalMediaCount === 0 && (
              <p className="text-sm text-muted-foreground text-center py-8">
                No media attached to this post.
              </p>
            )}
          </fieldset>
        </form>
      </main>

      <Footer />
    </div>
  );
};

export default EditPost;
