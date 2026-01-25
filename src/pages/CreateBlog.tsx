import { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { CharacterCountInput } from "@/components/CharacterCountInput";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { 
  ArrowLeft, 
  Upload, 
  X, 
  Loader2,
  ImageIcon,
  AlertCircle,
  CheckCircle2,
  PenSquare
} from "lucide-react";
import { toast } from "sonner";
import type { Tables } from "@/integrations/supabase/types";
import { MediaUploader } from "@/components/MediaUploader";
import { Footer } from "@/components/Footer";

type BlogCategory = Tables<"blog_categories">;
type BlogLanguage = Tables<"blog_languages">;

const MAX_DESCRIPTION_CHARS = 500;
const MAX_CUSTOM_FIELD_CHARS = 50;

const CreateBlog = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Auth state
  const [userId, setUserId] = useState<string | null>(null);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  
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

  // Check auth and load reference data
  useEffect(() => {
    const init = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        navigate("/login");
        return;
      }
      
      setUserId(session.user.id);
      setIsCheckingAuth(false);

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
  }, [navigate]);

  // Handle photo selection
  const handlePhotoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      setErrors(prev => ({ ...prev, photo: "Please select an image file" }));
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setErrors(prev => ({ ...prev, photo: "Image must be less than 5MB" }));
      return;
    }

    setProfilePhoto(file);
    setErrors(prev => ({ ...prev, photo: "" }));

    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setPhotoPreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const removePhoto = () => {
    setProfilePhoto(null);
    setPhotoPreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
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

    // Check if "Others" category is selected and custom is empty
    const selectedCategory = categories.find(c => c.id === categoryId);
    if (selectedCategory?.slug === "others" && !customCategory.trim()) {
      newErrors.customCategory = "Please specify your custom category";
    }

    if (selectedLanguages.length === 0) {
      newErrors.languages = "Please select at least one language";
    }

    // Check if "Others" language is selected and custom is empty
    const othersLanguage = languages.find(l => l.code === "other");
    if (othersLanguage && selectedLanguages.includes(othersLanguage.id) && !customLanguage.trim()) {
      newErrors.customLanguage = "Please specify your custom language";
    }

    if (!profilePhoto) {
      newErrors.photo = "Blog profile photo is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm() || !userId) return;

    setIsLoading(true);

    try {
      // 1. Upload photo to storage
      const fileExt = profilePhoto!.name.split(".").pop();
      const fileName = `${userId}/${Date.now()}.${fileExt}`;
      
      const { error: uploadError } = await supabase.storage
        .from("blog-photos")
        .upload(fileName, profilePhoto!);

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: urlData } = supabase.storage
        .from("blog-photos")
        .getPublicUrl(fileName);

      // 2. Save media info (alt, description) to media table
      const { data: media, error: mediaError } = await supabase
        .from("media")
        .insert({
          post_id: null, // No post, this is for blog profile
          media_type: "image",
          file_url: urlData.publicUrl,
          description: photoDescription,
          file_size: profilePhoto.size,
          order_position: 0,
          created_at: new Date().toISOString(),
          alt: photoAlt,
          blog_id: null // Optionally, add blog_id after blog is created
        })
        .select()
        .single();
      if (mediaError) throw mediaError;

      // 3. Create the blog
      const selectedCategory = categories.find(c => c.id === categoryId);
      const othersLanguage = languages.find(l => l.code === "other");

      const { data: blog, error: blogError } = await supabase
        .from("blogs")
        .insert({
          owner_id: userId,
          blog_name: blogName.trim(),
          description: description.trim(),
          category_id: categoryId,
          custom_category: selectedCategory?.slug === "others" ? customCategory.trim() : null,
          languages: selectedLanguages,
          custom_language: othersLanguage && selectedLanguages.includes(othersLanguage.id) 
            ? customLanguage.trim() 
            : null,
          profile_photo_url: urlData.publicUrl,
          slug: "", // Will be auto-generated by trigger
        })
        .select()
        .single();

      if (blogError) {
        // Check for unique constraint violation
        if (blogError.code === "23505") {
          setErrors({ blogName: "A blog with this name already exists" });
          throw new Error("Blog name already taken");
        }
        throw blogError;
      }

      toast.success("Blog created successfully!", {
        description: `Welcome to ${blogName}!`,
      });

      navigate(`/blog/${blog.slug}/manage`);
    } catch (error: any) {
      console.error("Error creating blog:", error);
      if (!errors.blogName) {
        toast.error("Failed to create blog", {
          description: error.message || "Please try again",
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Add state for alt text and description from MediaUploader
  const [photoAlt, setPhotoAlt] = useState("");
  const [photoDescription, setPhotoDescription] = useState("");

  if (isCheckingAuth || isLoadingData) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-accent" aria-label="Loading" />
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
      <header className="border-b border-border bg-card sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4 flex items-center gap-4">
          <Link 
            to="/dashboard" 
            className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
            aria-label="Back to dashboard"
          >
            <ArrowLeft className="h-5 w-5" aria-hidden="true" />
            <span className="sr-only sm:not-sr-only">Back</span>
          </Link>
          <div className="flex items-center gap-2">
            <PenSquare className="h-6 w-6 text-accent" aria-hidden="true" />
            <span className="font-serif text-lg font-bold text-foreground">Create Blog</span>
          </div>
        </div>
      </header>

      <main id="main-content" className="flex-1 max-w-2xl mx-auto px-4 sm:px-6 py-8 w-full">
        <div className="card-premium">
          <div className="mb-8">
            <h1 className="heading-lg text-foreground mb-2">Create Your Blog</h1>
            <p className="body-md text-muted-foreground">
              Set up your new publication. All fields marked with <span className="text-destructive">*</span> are required.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8" noValidate>
            {/* Blog Profile Photo field (replace custom upload logic with MediaUploader) */}
            <MediaUploader
              onUpload={(file, alt, description) => {
                setProfilePhoto(file);
                setPhotoPreview(URL.createObjectURL(file));
                setPhotoAlt(alt);
                setPhotoDescription(description);
                setErrors(prev => ({ ...prev, photo: "" }));
              }}
              maxAltLength={120}
              maxDescriptionLength={300}
              accept="image/*"
              disabled={isLoading}
              className="w-full"
            />
            {errors.photo && (
              <p id="photo-error" className="text-sm text-destructive flex items-center gap-1" role="alert">
                <AlertCircle className="h-4 w-4" aria-hidden="true" />
                {errors.photo}
              </p>
            )}

            {/* Blog Name */}
            <div className="space-y-2">
              <Label htmlFor="blog-name" className="form-label">
                Blog Name <span className="text-destructive" aria-hidden="true">*</span>
              </Label>
              <CharacterCountInput
                value={blogName}
                onChange={e => setBlogName(e.target.value)}
                maxLength={100}
                label="Blog Name"
                required
                placeholder="e.g., Daily News Direct"
                ariaLabel="Blog name"
                className={errors.blogName ? "border-destructive" : ""}
                disabled={isLoading}
              />
              <div className="flex justify-between">
                <p id="blog-name-hint" className="text-xs text-muted-foreground">
                  Choose a unique, memorable name for your blog
                </p>
              </div>
              {errors.blogName && (
                <p id="blog-name-error" className="text-sm text-destructive flex items-center gap-1" role="alert">
                  <AlertCircle className="h-4 w-4" aria-hidden="true" />
                  {errors.blogName}
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
                  className={errors.category ? "border-destructive" : ""}
                  aria-describedby={errors.category ? "category-error" : undefined}
                  aria-invalid={!!errors.category}
                >
                  <SelectValue placeholder="Select a category" />
                </SelectTrigger>
                <SelectContent className="max-h-[300px]">
                  {categories.map((category) => (
                    <SelectItem key={category.id} value={category.id}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.category && (
                <p id="category-error" className="text-sm text-destructive flex items-center gap-1" role="alert">
                  <AlertCircle className="h-4 w-4" aria-hidden="true" />
                  {errors.category}
                </p>
              )}

              {/* Custom Category field (replace Input with CharacterCountInput) */}
              {showCustomCategory && (
                <div className="mt-3 space-y-2">
                  <Label htmlFor="custom-category" className="form-label">
                    Specify Category <span className="text-destructive" aria-hidden="true">*</span>
                  </Label>
                  <CharacterCountInput
                    value={customCategory}
                    onChange={e => setCustomCategory(e.target.value)}
                    maxLength={MAX_CUSTOM_FIELD_CHARS}
                    label="Specify Category"
                    required
                    placeholder="Enter your category"
                    ariaLabel="Custom category"
                    className={errors.customCategory ? "border-destructive" : ""}
                    disabled={isLoading}
                  />
                  {errors.customCategory && (
                    <p id="custom-category-error" className="text-sm text-destructive flex items-center gap-1" role="alert">
                      <AlertCircle className="h-4 w-4" aria-hidden="true" />
                      {errors.customCategory}
                    </p>
                  )}
                </div>
              )}
            </div>

            {/* Languages */}
            <fieldset className="space-y-3">
              <legend className="form-label">
                Languages <span className="text-destructive" aria-hidden="true">*</span>
              </legend>
              <p className="text-xs text-muted-foreground">
                Select all languages your blog will publish in
              </p>
              
              <div 
                className="grid grid-cols-2 sm:grid-cols-3 gap-3"
                role="group"
                aria-describedby={errors.languages ? "languages-error" : undefined}
              >
                {languages.map((language) => (
                  <label
                    key={language.id}
                    className={`
                      flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-all
                      ${selectedLanguages.includes(language.id) 
                        ? "border-accent bg-accent/10" 
                        : "border-border hover:border-accent/50"
                      }
                    `}
                  >
                    <Checkbox
                      checked={selectedLanguages.includes(language.id)}
                      onCheckedChange={() => toggleLanguage(language.id)}
                      aria-label={`Select ${language.name} language`}
                    />
                    <span className="text-sm font-medium">{language.name}</span>
                  </label>
                ))}
              </div>
              
              {errors.languages && (
                <p id="languages-error" className="text-sm text-destructive flex items-center gap-1" role="alert">
                  <AlertCircle className="h-4 w-4" aria-hidden="true" />
                  {errors.languages}
                </p>
              )}

              {/* Custom Language field (replace Input with CharacterCountInput) */}
              {showCustomLanguage && (
                <div className="mt-3 space-y-2">
                  <Label htmlFor="custom-language" className="form-label">
                    Specify Language <span className="text-destructive" aria-hidden="true">*</span>
                  </Label>
                  <CharacterCountInput
                    value={customLanguage}
                    onChange={e => setCustomLanguage(e.target.value)}
                    maxLength={MAX_CUSTOM_FIELD_CHARS}
                    label="Specify Language"
                    required
                    placeholder="Enter your language"
                    ariaLabel="Custom language"
                    className={errors.customLanguage ? "border-destructive" : ""}
                    disabled={isLoading}
                  />
                  {errors.customLanguage && (
                    <p id="custom-language-error" className="text-sm text-destructive flex items-center gap-1" role="alert">
                      <AlertCircle className="h-4 w-4" aria-hidden="true" />
                      {errors.customLanguage}
                    </p>
                  )}
                </div>
              )}
            </fieldset>

            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="description" className="form-label">
                Description <span className="text-destructive" aria-hidden="true">*</span>
              </Label>
              <CharacterCountInput
                value={description}
                onChange={e => setDescription(e.target.value)}
                maxLength={MAX_DESCRIPTION_CHARS}
                label="Description"
                required
                placeholder="Tell readers what your blog is about..."
                ariaLabel="Blog description"
                type="textarea"
                className={`min-h-[120px] ${errors.description ? "border-destructive" : ""}`}
                disabled={isLoading}
              />
              <div className="flex justify-between">
                <p id="description-hint" className="text-xs text-muted-foreground">
                  Tell readers what your blog is about
                </p>
              </div>
              {errors.description && (
                <p id="description-error" className="text-sm text-destructive flex items-center gap-1" role="alert">
                  <AlertCircle className="h-4 w-4" aria-hidden="true" />
                  {errors.description}
                </p>
              )}
            </div>

            {/* Submit Button */}
            <div className="pt-4 border-t border-border">
              <Button 
                type="submit" 
                className="btn-accent rounded-full w-full"
                disabled={isLoading}
                aria-label={isLoading ? "Creating blog..." : "Create blog"}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-5 w-5 mr-2 animate-spin" aria-hidden="true" />
                    Creating Blog...
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="h-5 w-5 mr-2" aria-hidden="true" />
                    Create Blog
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

export default CreateBlog;
