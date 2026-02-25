import { useState, useEffect, useRef } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CharacterCountInput } from "@/components/CharacterCountInput";
import { MediaUploader } from "@/components/MediaUploader";
import { Textarea } from "@/components/ui/textarea";
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
  GripVertical,
  Trash2,
  FileEdit
} from "lucide-react";
import { toast } from "sonner";
import type { Tables } from "@/integrations/supabase/types";
import { Footer } from "@/components/Footer";
import { useSeo } from "@/hooks/useSeo";

type Blog = Tables<"blogs">;

interface MediaItem {
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

const CreatePost = () => {
  useSeo({
    title: "Create New Post",
    description: "Write and publish a new article on your Press Room Publisher blog.",
    noindex: true,
  });
  
  const { blogSlug } = useParams<{ blogSlug: string }>();
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Auth state
  const [userId, setUserId] = useState<string | null>(null);
  const [userProfile, setUserProfile] = useState<{ first_name: string; last_name: string } | null>(null);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  
  // Blog data
  const [blog, setBlog] = useState<Blog | null>(null);
  
  // Form data
  const [headline, setHeadline] = useState("");
  const [subtitle, setSubtitle] = useState("");
  const [byline, setByline] = useState("");
  const [content, setContent] = useState("");
  const [media, setMedia] = useState<MediaItem[]>([]);
  
  // UI state
  const [isLoading, setIsLoading] = useState(false);
  const [isSavingDraft, setIsSavingDraft] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    const init = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        navigate("/login");
        return;
      }
      
      setUserId(session.user.id);

      // Fetch user profile for default byline
      const { data: profile } = await supabase
        .from("profiles")
        .select("first_name, last_name")
        .eq("id", session.user.id)
        .maybeSingle();

      if (profile) {
        setUserProfile(profile);
        setByline(`${profile.first_name} ${profile.last_name}`);
      }

      // Fetch blog
      const { data: blogData, error: blogError } = await supabase
        .from("blogs")
        .select("*")
        .eq("slug", blogSlug)
        .maybeSingle();

      if (blogError || !blogData) {
        toast.error("Blog not found");
        navigate("/dashboard");
        return;
      }

      // Check if user can manage this blog
      const { data: canManage } = await supabase.rpc("can_manage_blog", {
        _user_id: session.user.id,
        _blog_id: blogData.id,
      });

      if (!canManage) {
        toast.error("You don't have permission to create posts on this blog");
        navigate("/dashboard");
        return;
      }

      setBlog(blogData);
      setIsCheckingAuth(false);
    };

    init();
  }, [blogSlug, navigate]);

  // Handle media file selection
  const handleMediaSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    
    if (media.length + files.length > MAX_MEDIA_FILES) {
      toast.error(`Maximum ${MAX_MEDIA_FILES} media files allowed`);
      return;
    }

    files.forEach((file) => {
      // Validate file type
      let type: "image" | "video" | "audio" | null = null;
      if (file.type.startsWith("image/")) type = "image";
      else if (file.type.startsWith("video/")) type = "video";
      else if (file.type.startsWith("audio/")) type = "audio";

      if (!type) {
        toast.error(`${file.name} is not a supported media type`);
        return;
      }

      // Validate file size (max 50MB for video, 10MB for others)
      const maxSize = type === "video" ? 50 * 1024 * 1024 : 10 * 1024 * 1024;
      if (file.size > maxSize) {
        toast.error(`${file.name} exceeds maximum file size`);
        return;
      }

      // Create preview
      const preview = type === "audio" 
        ? "" 
        : URL.createObjectURL(file);

      const newMedia: MediaItem = {
        id: `${Date.now()}-${Math.random()}`,
        file,
        preview,
        type,
        description: "",
      };

      setMedia((prev) => [...prev, newMedia]);
    });

    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  // Update media description
  const updateMediaDescription = (id: string, description: string) => {
    setMedia((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, description } : item
      )
    );
  };

  // Remove media item
  const removeMedia = (id: string) => {
    setMedia((prev) => {
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
      const missingDescriptions = media.some((m) => !m.description.trim());
      if (missingDescriptions) {
        newErrors.media = "All media must have accessibility descriptions for publishing";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Upload media files
  const uploadMediaFiles = async (postId: string): Promise<boolean> => {
    for (let i = 0; i < media.length; i++) {
      const item = media[i];
      
      // Update uploading state
      setMedia((prev) =>
        prev.map((m) =>
          m.id === item.id ? { ...m, isUploading: true } : m
        )
      );

      try {
        // Upload to storage
        const fileExt = item.file.name.split(".").pop();
        const fileName = `${userId}/${postId}/${Date.now()}-${i}.${fileExt}`;

        const { error: uploadError } = await supabase.storage
          .from("post-media")
          .upload(fileName, item.file);

        if (uploadError) throw uploadError;

        // Get public URL
        const { data: urlData } = supabase.storage
          .from("post-media")
          .getPublicUrl(fileName);

        // Create media record
        const { error: mediaError } = await supabase
          .from("media")
          .insert({
            post_id: postId,
            media_type: item.type,
            file_url: urlData.publicUrl,
            description: item.description.trim(),
            file_size: item.file.size,
            order_position: i,
          });

        if (mediaError) throw mediaError;

        // Update state
        setMedia((prev) =>
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
    
    if (!validateForm(isDraft) || !userId || !blog) return;

    const loadingState = isDraft ? setIsSavingDraft : setIsLoading;
    loadingState(true);

    try {
      // Create the post
      const { data: post, error: postError } = await supabase
        .from("posts")
        .insert({
          blog_id: blog.id,
          author_id: userId,
          headline: headline.trim(),
          subtitle: subtitle.trim() || null,
          byline: byline.trim(),
          content: content.trim(),
          status,
        })
        .select()
        .single();

      if (postError) throw postError;

      // Upload media files if any
      if (media.length > 0) {
        const success = await uploadMediaFiles(post.id);
        if (!success && !isDraft) {
          // Delete the post if media upload fails for publishing
          await supabase.from("posts").delete().eq("id", post.id);
          throw new Error("Failed to upload media files");
        }
      }

      toast.success(
        isDraft ? "Draft saved successfully!" : "Post published successfully!",
        {
          description: isDraft 
            ? "You can continue editing later." 
            : "Your post is now live.",
        }
      );

      navigate(`/blog/${blogSlug}/manage`);
    } catch (error: any) {
      console.error("Error creating post:", error);
      toast.error("Failed to create post", {
        description: error.message || "Please try again",
      });
    } finally {
      loadingState(false);
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
                <span className="font-serif text-lg font-bold text-foreground">New Post</span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                className="rounded-full"
                onClick={() => handleSubmit("draft")}
                disabled={isLoading || isSavingDraft}
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
                className="btn-accent rounded-full"
                onClick={() => handleSubmit("published")}
                disabled={isLoading || isSavingDraft}
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

      <main id="main-content" className="flex-1 max-w-4xl mx-auto px-4 sm:px-6 py-8 w-full">
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

          {/* Media Upload */}
          <fieldset className="space-y-4">
            <legend className="form-label">
              Media <span className="text-muted-foreground text-sm">(optional)</span>
            </legend>
            <p className="text-xs text-muted-foreground">
              Add images to your post. Each file requires an accessibility description.
            </p>
            <MediaUploader
              onUpload={(file, alt, description) => {
                // Add uploaded image to media state
                setMedia((prev) => [
                  ...prev,
                  {
                    id: `${Date.now()}-${Math.random()}`,
                    file,
                    preview: URL.createObjectURL(file),
                    type: "image",
                    description,
                  },
                ]);
              }}
              maxDescriptionLength={MAX_DESCRIPTION_CHARS}
              disabled={isLoading || isSavingDraft}
            />
            {errors.media && (
              <p className="text-sm text-destructive flex items-center gap-1" role="alert">
                <AlertCircle className="h-4 w-4" aria-hidden="true" />
                {errors.media}
              </p>
            )}
            {/* Show uploaded images */}
            {media.length > 0 && (
              <div className="space-y-4">
                {media.map((item, index) => (
                  <div key={item.id} className="editorial-card flex gap-4">
                    <div className="flex-shrink-0 w-24 h-24 rounded-lg overflow-hidden bg-muted flex items-center justify-center">
                      {item.type === "image" && item.preview ? (
                        <img
                          src={item.preview}
                          alt={item.description || `Preview of image ${index + 1}`}
                          className="w-full h-full object-cover"
                        />
                      ) : null}
                    </div>
                    <div className="flex-1 space-y-2">
                      <span className="text-sm font-medium text-foreground truncate">
                        {item.file.name}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        ({(item.file.size / 1024 / 1024).toFixed(2)} MB)
                      </span>
                      <div className="flex justify-between">
                        <p className="text-xs text-muted-foreground">
                          {item.description}
                        </p>
                      </div>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => removeMedia(item.id)}
                      aria-label={`Remove ${item.file.name}`}
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" aria-hidden="true" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </fieldset>

          {/* Submit Buttons (Mobile) */}
          <div className="flex gap-2 sm:hidden pt-4 border-t border-border">
            <Button
              type="button"
              variant="outline"
              onClick={() => handleSubmit("draft")}
              disabled={isLoading || isSavingDraft}
              className="flex-1"
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
              type="button"
              className="btn-gold flex-1"
              onClick={() => handleSubmit("published")}
              disabled={isLoading || isSavingDraft}
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
        </form>
      </main>

      <Footer />
    </div>
  );
};

export default CreatePost;
