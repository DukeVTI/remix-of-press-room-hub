import { useState, useEffect, useRef } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  ArrowLeft, 
  Upload, 
  X, 
  Loader2,
  ImageIcon,
  AlertCircle,
  Save,
  Camera,
  Settings
} from "lucide-react";
import { toast } from "sonner";
import type { Tables } from "@/integrations/supabase/types";
import { Footer } from "@/components/Footer";
import { useSeo } from "@/hooks/useSeo";

type Blog = Tables<"blogs">;
type BlogCategory = Tables<"blog_categories">;
type BlogLanguage = Tables<"blog_languages">;

const MAX_DESCRIPTION_CHARS = 500;
const MAX_CUSTOM_FIELD_CHARS = 50;

const EditBlog = () => {
  useSeo({
    title: "Edit Blog Settings",
    description: "Update your blog settings, including name, description, category, and profile photo.",
    noindex: true,
  });
  
  const { blogSlug } = useParams<{ blogSlug: string }>();
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Auth state
  const [userId, setUserId] = useState<string | null>(null);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  
  // Original data
  const [blog, setBlog] = useState<Blog | null>(null);
  
  // Form data
  const [blogName, setBlogName] = useState("");
  const [description, setDescription] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [customCategory, setCustomCategory] = useState("");
  const [selectedLanguages, setSelectedLanguages] = useState<string[]>([]);
  const [customLanguage, setCustomLanguage] = useState("");
  const [profilePhoto, setProfilePhoto] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  
  // Reference data
  const [categories, setCategories] = useState<BlogCategory[]>([]);
  const [languages, setLanguages] = useState<BlogLanguage[]>([]);
  
  // UI state
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    const init = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        navigate("/login");
        return;
      }
      
      setUserId(session.user.id);

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

      // Only owner can edit blog settings
      if (blogData.owner_id !== session.user.id) {
        toast.error("Only the blog owner can edit settings");
        navigate(`/blog/${blogSlug}/manage`);
        return;
      }

      setBlog(blogData);
      setIsCheckingAuth(false);

      // Populate form
      setBlogName(blogData.blog_name);
      setDescription(blogData.description);
      setCategoryId(blogData.category_id);
      setCustomCategory(blogData.custom_category || "");
      setSelectedLanguages(blogData.languages || []);
      setCustomLanguage(blogData.custom_language || "");
      setPhotoPreview(blogData.profile_photo_url);

      // Load categories and languages
      const [categoriesRes, languagesRes] = await Promise.all([
        supabase.from("blog_categories").select("*").order("name"),
        supabase.from("blog_languages").select("*").order("name")
      ]);

      if (categoriesRes.data) setCategories(categoriesRes.data);
      if (languagesRes.data) setLanguages(languagesRes.data);
      setIsLoadingData(false);
    };

    init();
  }, [blogSlug, navigate]);

  // Handle photo selection
  const handlePhotoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setErrors(prev => ({ ...prev, photo: "Please select an image file" }));
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setErrors(prev => ({ ...prev, photo: "Image must be less than 5MB" }));
      return;
    }

    setProfilePhoto(file);
    setErrors(prev => ({ ...prev, photo: "" }));

    const reader = new FileReader();
    reader.onloadend = () => {
      setPhotoPreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  // Handle language toggle
  const toggleLanguage = (languageId: string) => {
    setSelectedLanguages(prev => 
      prev.includes(languageId)
        ? prev.filter(id => id !== languageId)
        : [...prev, languageId]
    );
  };

  // Validate form
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!blogName.trim()) {
      newErrors.blogName = "Blog name is required";
    } else if (blogName.length < 3) {
      newErrors.blogName = "Blog name must be at least 3 characters";
    }

    if (!description.trim()) {
      newErrors.description = "Description is required";
    } else if (description.length < 20) {
      newErrors.description = "Description must be at least 20 characters";
    }

    if (!categoryId) {
      newErrors.category = "Please select a category";
    }

    const selectedCategory = categories.find(c => c.id === categoryId);
    if (selectedCategory?.slug === "others" && !customCategory.trim()) {
      newErrors.customCategory = "Please specify your custom category";
    }

    if (selectedLanguages.length === 0) {
      newErrors.languages = "Please select at least one language";
    }

    const othersLanguage = languages.find(l => l.code === "other");
    if (othersLanguage && selectedLanguages.includes(othersLanguage.id) && !customLanguage.trim()) {
      newErrors.customLanguage = "Please specify your custom language";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm() || !userId || !blog) return;

    setIsLoading(true);

    try {
      let photoUrl = blog.profile_photo_url;

      // Upload new photo if selected
      if (profilePhoto) {
        const fileExt = profilePhoto.name.split(".").pop();
        const fileName = `${userId}/${Date.now()}.${fileExt}`;
        
        const { error: uploadError } = await supabase.storage
          .from("blog-photos")
          .upload(fileName, profilePhoto);

        if (uploadError) throw uploadError;

        const { data: urlData } = supabase.storage
          .from("blog-photos")
          .getPublicUrl(fileName);

        photoUrl = urlData.publicUrl;
      }

      const selectedCategory = categories.find(c => c.id === categoryId);
      const othersLanguage = languages.find(l => l.code === "other");

      const { error: updateError } = await supabase
        .from("blogs")
        .update({
          blog_name: blogName.trim(),
          description: description.trim(),
          category_id: categoryId,
          custom_category: selectedCategory?.slug === "others" ? customCategory.trim() : null,
          languages: selectedLanguages,
          custom_language: othersLanguage && selectedLanguages.includes(othersLanguage.id) 
            ? customLanguage.trim() 
            : null,
          profile_photo_url: photoUrl,
        })
        .eq("id", blog.id);

      if (updateError) {
        if (updateError.code === "23505") {
          setErrors({ blogName: "A blog with this name already exists" });
          throw new Error("Blog name already taken");
        }
        throw updateError;
      }

      toast.success("Blog updated successfully!");
      navigate(`/blog/${blogSlug}/manage`);
    } catch (error: any) {
      console.error("Error updating blog:", error);
      if (!errors.blogName) {
        toast.error("Failed to update blog", {
          description: error.message || "Please try again",
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  if (isCheckingAuth || isLoadingData) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-accent" aria-label="Loading blog settings" />
      </div>
    );
  }

  const selectedCategory = categories.find(c => c.id === categoryId);
  const showCustomCategory = selectedCategory?.slug === "others";
  const othersLanguage = languages.find(l => l.code === "other");
  const showCustomLanguage = othersLanguage && selectedLanguages.includes(othersLanguage.id);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <a href="#main-content" className="skip-link">
        Skip to main content
      </a>

      {/* Header */}
      <header className="border-b border-border bg-card sticky top-0 z-10" role="banner">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4 flex items-center gap-4">
          <Link 
            to={`/blog/${blogSlug}/manage`}
            className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
            aria-label="Back to blog management"
          >
            <ArrowLeft className="h-5 w-5" aria-hidden="true" />
            <span className="sr-only sm:not-sr-only">Back</span>
          </Link>
          <div className="flex items-center gap-2">
            <Settings className="h-6 w-6 text-accent" aria-hidden="true" />
            <span className="font-serif text-lg font-bold text-foreground">Edit Blog Settings</span>
          </div>
        </div>
      </header>

      <main id="main-content" role="main" className="flex-1 max-w-2xl mx-auto px-4 sm:px-6 py-8 w-full">
        <div className="card-premium">
          <div className="mb-8">
            <h1 className="heading-lg text-foreground mb-2">Edit Blog Settings</h1>
            <p className="body-md text-muted-foreground">
              Update your blog's information. All fields marked with <span className="text-destructive">*</span> are required.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8" noValidate aria-label="Edit blog form">
            {/* Blog Profile Photo */}
            <div className="space-y-3">
              <Label className="form-label">
                Blog Profile Photo <span className="text-destructive" aria-hidden="true">*</span>
              </Label>
              
              <div className="flex items-center gap-6">
                <div className="relative">
                  <Avatar className="h-24 w-24 border-2 border-accent/20">
                    <AvatarImage 
                      src={photoPreview || undefined} 
                      alt="Blog profile photo preview"
                    />
                    <AvatarFallback className="bg-muted">
                      <ImageIcon className="h-10 w-10 text-muted-foreground" aria-hidden="true" />
                    </AvatarFallback>
                  </Avatar>
                  
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="absolute -bottom-1 -right-1 p-2 bg-accent text-accent-foreground rounded-full hover:bg-accent/90 transition-colors"
                    aria-label="Change blog profile photo"
                  >
                    <Camera className="h-4 w-4" aria-hidden="true" />
                  </button>
                </div>

                <div className="flex-1">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handlePhotoSelect}
                    className="hidden"
                    aria-label="Upload blog profile photo"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => fileInputRef.current?.click()}
                    aria-label="Choose a new photo for your blog"
                  >
                    <Upload className="h-4 w-4 mr-2" aria-hidden="true" />
                    Change Photo
                  </Button>
                  <p className="text-xs text-muted-foreground mt-2">
                    JPG, PNG or GIF. Max 5MB.
                  </p>
                </div>
              </div>

              {errors.photo && (
                <p className="text-sm text-destructive flex items-center gap-1" role="alert">
                  <AlertCircle className="h-4 w-4" aria-hidden="true" />
                  {errors.photo}
                </p>
              )}
            </div>

            {/* Blog Name */}
            <div className="space-y-2">
              <Label htmlFor="blogName" className="form-label">
                Blog Name <span className="text-destructive" aria-hidden="true">*</span>
              </Label>
              <Input
                id="blogName"
                value={blogName}
                onChange={(e) => setBlogName(e.target.value)}
                className="input-editorial"
                aria-required="true"
                aria-invalid={!!errors.blogName}
                aria-describedby={errors.blogName ? "blogName-error" : undefined}
              />
              {errors.blogName && (
                <p id="blogName-error" className="text-sm text-destructive flex items-center gap-1" role="alert">
                  <AlertCircle className="h-4 w-4" aria-hidden="true" />
                  {errors.blogName}
                </p>
              )}
            </div>

            {/* Description */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="description" className="form-label">
                  Description <span className="text-destructive" aria-hidden="true">*</span>
                </Label>
                <span 
                  className={`text-xs ${description.length > MAX_DESCRIPTION_CHARS ? "text-destructive" : "text-muted-foreground"}`}
                  aria-live="polite"
                >
                  {description.length}/{MAX_DESCRIPTION_CHARS}
                </span>
              </div>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value.slice(0, MAX_DESCRIPTION_CHARS))}
                className="input-editorial min-h-[120px]"
                aria-required="true"
                aria-invalid={!!errors.description}
                aria-describedby={errors.description ? "description-error" : "description-hint"}
              />
              <p id="description-hint" className="text-xs text-muted-foreground">
                Describe what your blog is about
              </p>
              {errors.description && (
                <p id="description-error" className="text-sm text-destructive flex items-center gap-1" role="alert">
                  <AlertCircle className="h-4 w-4" aria-hidden="true" />
                  {errors.description}
                </p>
              )}
            </div>

            {/* Category */}
            <div className="space-y-2">
              <Label htmlFor="category" className="form-label">
                Category <span className="text-destructive" aria-hidden="true">*</span>
              </Label>
              <Select value={categoryId} onValueChange={setCategoryId}>
                <SelectTrigger 
                  id="category" 
                  className="input-editorial"
                  aria-required="true"
                  aria-invalid={!!errors.category}
                  aria-label="Select blog category"
                >
                  <SelectValue placeholder="Select a category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((cat) => (
                    <SelectItem key={cat.id} value={cat.id}>
                      {cat.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.category && (
                <p className="text-sm text-destructive flex items-center gap-1" role="alert">
                  <AlertCircle className="h-4 w-4" aria-hidden="true" />
                  {errors.category}
                </p>
              )}

              {showCustomCategory && (
                <div className="mt-3 space-y-2">
                  <Label htmlFor="customCategory" className="form-label">
                    Custom Category <span className="text-destructive" aria-hidden="true">*</span>
                  </Label>
                  <div className="flex items-center justify-between">
                    <Input
                      id="customCategory"
                      value={customCategory}
                      onChange={(e) => setCustomCategory(e.target.value.slice(0, MAX_CUSTOM_FIELD_CHARS))}
                      placeholder="Enter your category"
                      className="input-editorial"
                      aria-required="true"
                      aria-invalid={!!errors.customCategory}
                    />
                    <span className="text-xs text-muted-foreground ml-2">
                      {customCategory.length}/{MAX_CUSTOM_FIELD_CHARS}
                    </span>
                  </div>
                  {errors.customCategory && (
                    <p className="text-sm text-destructive flex items-center gap-1" role="alert">
                      <AlertCircle className="h-4 w-4" aria-hidden="true" />
                      {errors.customCategory}
                    </p>
                  )}
                </div>
              )}
            </div>

            {/* Languages */}
            <div className="space-y-3">
              <Label className="form-label">
                Languages <span className="text-destructive" aria-hidden="true">*</span>
              </Label>
              <p className="text-xs text-muted-foreground">
                Select all languages you'll publish in
              </p>
              
              <div 
                className="grid grid-cols-2 sm:grid-cols-3 gap-3"
                role="group"
                aria-label="Select blog languages"
              >
                {languages.map((lang) => (
                  <label
                    key={lang.id}
                    className={`
                      flex items-center gap-2 p-3 rounded-lg border cursor-pointer transition-colors
                      ${selectedLanguages.includes(lang.id) 
                        ? "border-accent bg-accent/10" 
                        : "border-border hover:border-accent/50"}
                    `}
                  >
                    <Checkbox
                      checked={selectedLanguages.includes(lang.id)}
                      onCheckedChange={() => toggleLanguage(lang.id)}
                      aria-label={`Select ${lang.name} language`}
                    />
                    <span className="text-sm text-foreground">{lang.name}</span>
                  </label>
                ))}
              </div>

              {errors.languages && (
                <p className="text-sm text-destructive flex items-center gap-1" role="alert">
                  <AlertCircle className="h-4 w-4" aria-hidden="true" />
                  {errors.languages}
                </p>
              )}

              {showCustomLanguage && (
                <div className="mt-3 space-y-2">
                  <Label htmlFor="customLanguage" className="form-label">
                    Custom Language <span className="text-destructive" aria-hidden="true">*</span>
                  </Label>
                  <div className="flex items-center justify-between">
                    <Input
                      id="customLanguage"
                      value={customLanguage}
                      onChange={(e) => setCustomLanguage(e.target.value.slice(0, MAX_CUSTOM_FIELD_CHARS))}
                      placeholder="Enter your language"
                      className="input-editorial"
                      aria-required="true"
                      aria-invalid={!!errors.customLanguage}
                    />
                    <span className="text-xs text-muted-foreground ml-2">
                      {customLanguage.length}/{MAX_CUSTOM_FIELD_CHARS}
                    </span>
                  </div>
                  {errors.customLanguage && (
                    <p className="text-sm text-destructive flex items-center gap-1" role="alert">
                      <AlertCircle className="h-4 w-4" aria-hidden="true" />
                      {errors.customLanguage}
                    </p>
                  )}
                </div>
              )}
            </div>

            {/* Submit Button */}
            <div className="flex items-center gap-4 pt-4">
              <Link to={`/blog/${blogSlug}/manage`}>
                <Button
                  type="button"
                  variant="outline"
                  className="rounded-full"
                  aria-label="Cancel and go back to blog management"
                >
                  Cancel
                </Button>
              </Link>
              <Button
                type="submit"
                disabled={isLoading}
                className="btn-accent rounded-full flex-1"
                aria-label={isLoading ? "Saving changes..." : "Save blog changes"}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" aria-hidden="true" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-5 w-5" aria-hidden="true" />
                    Save Changes
                  </>
                )}
              </Button>
            </div>
          </form>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default EditBlog;
