import { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  ArrowLeft, 
  Loader2,
  Upload,
  X,
  AlertCircle,
  Save,
  User,
  Camera
} from "lucide-react";
import { toast } from "sonner";
import type { Tables } from "@/integrations/supabase/types";
import { CharacterCountInput } from "@/components/CharacterCountInput";
import { MediaUploader } from "@/components/MediaUploader";
import { Footer } from "@/components/Footer";

type Profile = Tables<"profiles">;

const MAX_BIO_CHARS = 500;
const MAX_HOBBIES_CHARS = 300;

const ProfileEdit = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Auth state
  const [userId, setUserId] = useState<string | null>(null);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  
  // Profile data
  const [profile, setProfile] = useState<Profile | null>(null);
  
  // Form data
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [middleName, setMiddleName] = useState("");
  const [screenName, setScreenName] = useState("");
  const [bio, setBio] = useState("");
  const [hobbies, setHobbies] = useState("");
  const [profilePhoto, setProfilePhoto] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [removePhoto, setRemovePhoto] = useState(false);
  
  // UI state
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Add state for alt text and description from MediaUploader
  const [photoAlt, setPhotoAlt] = useState("");
  const [photoDescription, setPhotoDescription] = useState("");

  useEffect(() => {
    const init = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        navigate("/login");
        return;
      }
      
      setUserId(session.user.id);

      // Fetch profile
      const { data: profileData, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", session.user.id)
        .maybeSingle();

      if (error || !profileData) {
        toast.error("Failed to load profile");
        navigate("/dashboard");
        return;
      }

      setProfile(profileData);
      
      // Populate form
      setFirstName(profileData.first_name);
      setLastName(profileData.last_name);
      setMiddleName(profileData.middle_name || "");
      setScreenName(profileData.screen_name || "");
      setBio(profileData.bio || "");
      setHobbies(profileData.hobbies || "");
      
      if (profileData.profile_photo_url) {
        setPhotoPreview(profileData.profile_photo_url);
      }
      
      // Load profile photo alt text from database
      setPhotoAlt((profileData as any).profile_photo_alt || "");

      setIsCheckingAuth(false);
    };

    init();
  }, [navigate]);

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
    setRemovePhoto(false);
    setErrors(prev => ({ ...prev, photo: "" }));

    const reader = new FileReader();
    reader.onloadend = () => {
      setPhotoPreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleRemovePhoto = () => {
    setProfilePhoto(null);
    setPhotoPreview(null);
    setRemovePhoto(true);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  // Validate form
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!firstName.trim()) {
      newErrors.firstName = "First name is required";
    }

    if (!lastName.trim()) {
      newErrors.lastName = "Last name is required";
    }

    if (screenName && !/^[a-zA-Z0-9_]+$/.test(screenName)) {
      newErrors.screenName = "Screen name can only contain letters, numbers, and underscores";
    }

    if (screenName && screenName.length < 3) {
      newErrors.screenName = "Screen name must be at least 3 characters";
    }

    // Require alt text if there's a profile photo (either new or existing)
    if ((profilePhoto || (photoPreview && !removePhoto)) && !photoAlt.trim()) {
      newErrors.photoAlt = "Alt text is required for accessibility";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm() || !userId || !profile) return;

    setIsLoading(true);

    try {
      let photoUrl = profile.profile_photo_url;

      // Handle photo upload
      if (profilePhoto) {
        const fileExt = profilePhoto.name.split(".").pop();
        const fileName = `${userId}/profile.${fileExt}`;

        // Delete old photo if exists
        if (profile.profile_photo_url) {
          const oldPath = profile.profile_photo_url.split("/").pop();
          if (oldPath) {
            await supabase.storage.from("profile-photos").remove([`${userId}/${oldPath}`]);
          }
        }

        const { error: uploadError } = await supabase.storage
          .from("profile-photos")
          .upload(fileName, profilePhoto, { upsert: true });

        if (uploadError) throw uploadError;

        const { data: urlData } = supabase.storage
          .from("profile-photos")
          .getPublicUrl(fileName);

        photoUrl = urlData.publicUrl;
      } else if (removePhoto && profile.profile_photo_url) {
        // Remove photo
        const oldPath = profile.profile_photo_url.split("/").pop();
        if (oldPath) {
          await supabase.storage.from("profile-photos").remove([`${userId}/${oldPath}`]);
        }
        photoUrl = null;
      }

      // Update profile
      const { error: updateError } = await supabase
        .from("profiles")
        .update({
          first_name: firstName.trim(),
          last_name: lastName.trim(),
          middle_name: middleName.trim() || null,
          screen_name: screenName.trim() || null,
          bio: bio.trim() || null,
          hobbies: hobbies.trim() || null,
          profile_photo_url: photoUrl,
          profile_photo_alt: photoAlt.trim() || null,
        })
        .eq("id", userId);

      if (updateError) throw updateError;

      toast.success("Profile updated successfully!");
      navigate("/dashboard");
    } catch (error: any) {
      console.error("Error updating profile:", error);
      
      if (error.message?.includes("screen_name")) {
        setErrors({ screenName: "This screen name is already taken" });
      } else {
        toast.error("Failed to update profile", {
          description: error.message || "Please try again",
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  if (isCheckingAuth) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-accent" aria-label="Loading profile" />
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
                to="/dashboard" 
                className="text-muted-foreground hover:text-foreground transition-colors"
                aria-label="Back to dashboard"
              >
                <ArrowLeft className="h-5 w-5" aria-hidden="true" />
              </Link>
              <div className="flex items-center gap-2">
                <User className="h-6 w-6 text-accent" aria-hidden="true" />
                <span className="font-serif text-lg font-bold text-foreground">Edit Profile</span>
              </div>
            </div>

            <Button
              onClick={handleSubmit}
              disabled={isLoading}
              className="btn-accent rounded-full"
              aria-label="Save profile changes"
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" aria-hidden="true" />
              ) : (
                <Save className="h-4 w-4 mr-2" aria-hidden="true" />
              )}
              Save Changes
            </Button>
          </div>
        </div>
      </header>

      <main id="main-content" className="flex-1 max-w-2xl mx-auto px-4 sm:px-6 py-8 w-full">
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Profile Photo field (replace custom upload logic with MediaUploader) */}
          <section className="text-center" aria-labelledby="photo-heading">
            <h2 id="photo-heading" className="sr-only">Profile Photo</h2>
            
            <div className="relative inline-block">
              <Avatar className="h-32 w-32 border-4 border-accent">
                <AvatarImage 
                  src={photoPreview || undefined} 
                  alt="Your profile photo"
                />
                <AvatarFallback className="text-3xl bg-accent text-accent-foreground">
                  {firstName.charAt(0)}{lastName.charAt(0)}
                </AvatarFallback>
              </Avatar>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handlePhotoSelect}
                className="sr-only"
                id="photo-upload"
                aria-label="Upload profile photo"
              />

              <label
                htmlFor="photo-upload"
                className="absolute bottom-0 right-0 p-2 bg-accent text-accent-foreground rounded-full cursor-pointer hover:bg-accent/90 transition-colors"
                aria-label="Change profile photo"
              >
                <Camera className="h-5 w-5" aria-hidden="true" />
              </label>
            </div>

            <div className="mt-4 flex justify-center gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => fileInputRef.current?.click()}
                aria-label="Upload new photo"
              >
                <Upload className="h-4 w-4 mr-2" aria-hidden="true" />
                Upload Photo
              </Button>
              {photoPreview && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={handleRemovePhoto}
                  className="text-destructive"
                  aria-label="Remove profile photo"
                >
                  <X className="h-4 w-4 mr-2" aria-hidden="true" />
                  Remove
                </Button>
              )}
            </div>

            {/* Alt Text Input for Profile Photo */}
            {(photoPreview && !removePhoto) && (
              <div className="mt-4 space-y-2">
                <Label htmlFor="photo-alt" className="form-label">
                  Alt Text <span className="text-destructive" aria-hidden="true">*</span>
                </Label>
                <CharacterCountInput
                  value={photoAlt}
                  onChange={e => setPhotoAlt(e.target.value)}
                  maxLength={120}
                  label="Alt Text"
                  required
                  placeholder="Describe your photo for screen readers, e.g. 'Portrait of John smiling outdoors'"
                  ariaLabel="Image alt text for screen readers"
                  className={errors.photoAlt ? "border-destructive" : ""}
                  disabled={isLoading}
                />
                <p className="text-xs text-muted-foreground">
                  This helps visually impaired readers understand your profile photo.
                </p>
                {errors.photoAlt && (
                  <p id="photo-alt-error" className="text-sm text-destructive flex items-center gap-1" role="alert">
                    <AlertCircle className="h-4 w-4" aria-hidden="true" />
                    {errors.photoAlt}
                  </p>
                )}
              </div>
            )}

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
              <p className="text-sm text-destructive flex items-center gap-1" role="alert">
                <AlertCircle className="h-4 w-4" aria-hidden="true" />
                {errors.photo}
              </p>
            )}
          </section>

          {/* Name Fields */}
          <fieldset className="space-y-4">
            <legend className="form-label text-lg mb-4">Personal Information</legend>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* First Name */}
              <div className="space-y-2">
                <Label htmlFor="firstName">
                  First Name <span className="text-destructive" aria-hidden="true">*</span>
                </Label>
                <Input
                  id="firstName"
                  type="text"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  className={errors.firstName ? "border-destructive" : ""}
                  disabled={isLoading}
                />
                {errors.firstName && (
                  <p className="text-sm text-destructive flex items-center gap-1" role="alert">
                    <AlertCircle className="h-4 w-4" aria-hidden="true" />
                    {errors.firstName}
                  </p>
                )}
              </div>

              {/* Last Name field */}
              <div className="space-y-2">
                <Label htmlFor="lastName">
                  Last Name <span className="text-destructive" aria-hidden="true">*</span>
                </Label>
                <CharacterCountInput
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  maxLength={50}
                  placeholder="Enter your last name"
                  ariaLabel="Last name"
                  className={errors.lastName ? "border-destructive" : ""}
                  disabled={isLoading}
                />
                {errors.lastName && (
                  <p className="text-sm text-destructive flex items-center gap-1" role="alert">
                    <AlertCircle className="h-4 w-4" aria-hidden="true" />
                    {errors.lastName}
                  </p>
                )}
              </div>
            </div>

            {/* Middle Name field */}
            <div className="space-y-2">
              <Label htmlFor="middleName">
                Middle Name <span className="text-muted-foreground text-sm">(optional)</span>
              </Label>
              <CharacterCountInput
                value={middleName}
                onChange={(e) => setMiddleName(e.target.value)}
                maxLength={50}
                label="Middle Name"
                placeholder="Enter your middle name (optional)"
                ariaLabel="Middle name"
                className={errors.middleName ? "border-destructive" : ""}
                disabled={isLoading}
              />
            </div>

            {/* Screen Name field */}
            <div className="space-y-2">
              <Label htmlFor="screenName">
                Screen Name <span className="text-muted-foreground text-sm">(optional)</span>
              </Label>
              <CharacterCountInput
                value={screenName}
                onChange={(e) => setScreenName(e.target.value)}
                maxLength={30}
                label="Screen Name"
                placeholder="Enter your PRP screen name (optional)"
                ariaLabel="Screen name"
                className={errors.screenName ? "border-destructive" : ""}
                disabled={isLoading}
              />
              {errors.screenName && (
                <p className="text-sm text-destructive flex items-center gap-1" role="alert">
                  <AlertCircle className="h-4 w-4" aria-hidden="true" />
                  {errors.screenName}
                </p>
              )}
            </div>
          </fieldset>

          {/* Bio & Hobbies */}
          <fieldset className="space-y-4">
            <legend className="form-label text-lg mb-4">About You</legend>

            {/* Bio */}
            <div className="space-y-2">
              <Label htmlFor="bio">
                Bio <span className="text-muted-foreground text-sm">(optional)</span>
              </Label>
              <CharacterCountInput
                value={bio}
                onChange={e => setBio(e.target.value)}
                maxLength={MAX_BIO_CHARS}
                label="Bio"
                placeholder="Write a short bio about yourself (optional)"
                ariaLabel="Bio"
                type="textarea"
                className={errors.bio ? "border-destructive" : ""}
                disabled={isLoading}
              />
              <div className="flex justify-between">
                <p id="bio-hint" className="text-xs text-muted-foreground">
                  A short bio that will appear on your publisher profile
                </p>
                <span className="text-xs text-muted-foreground" aria-live="polite">
                  {bio.length}/{MAX_BIO_CHARS}
                </span>
              </div>
            </div>

            {/* Hobbies */}
            <div className="space-y-2">
              <Label htmlFor="hobbies">
                Hobbies & Interests <span className="text-muted-foreground text-sm">(optional)</span>
              </Label>
              <CharacterCountInput
                value={hobbies}
                onChange={e => setHobbies(e.target.value)}
                maxLength={MAX_HOBBIES_CHARS}
                label="Hobbies"
                placeholder="List your hobbies (optional)"
                ariaLabel="Hobbies"
                type="textarea"
                className={errors.hobbies ? "border-destructive" : ""}
                disabled={isLoading}
              />
              <div className="flex justify-between">
                <p id="hobbies-hint" className="text-xs text-muted-foreground">
                  Share your interests with your audience
                </p>
                <span className="text-xs text-muted-foreground" aria-live="polite">
                  {hobbies.length}/{MAX_HOBBIES_CHARS}
                </span>
              </div>
            </div>
          </fieldset>

          {/* Account Info (Read-only) */}
          <fieldset className="space-y-4 opacity-75">
            <legend className="form-label text-lg mb-4">Account Information</legend>
            <p className="text-sm text-muted-foreground mb-4">
              These fields cannot be changed here. Contact support if you need to update them.
            </p>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={profile?.email || ""}
                disabled
                className="bg-muted"
                aria-describedby="email-note"
              />
              <p id="email-note" className="text-xs text-muted-foreground">
                Your email is private and never shown publicly.
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="dob">Date of Birth</Label>
              <Input
                id="dob"
                type="text"
                value={profile?.date_of_birth ? new Date(profile.date_of_birth).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" }) : ""}
                disabled
                className="bg-muted"
                aria-describedby="dob-note"
              />
              <p id="dob-note" className="text-xs text-muted-foreground">
                Only your birthday month and day are public. The year is always hidden.
              </p>
            </div>
          </fieldset>

          {/* Submit Button (mobile) */}
          <div className="md:hidden">
            <Button
              type="submit"
              disabled={isLoading}
              className="w-full btn-gold"
              aria-label="Save profile changes"
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" aria-hidden="true" />
              ) : (
                <Save className="h-4 w-4 mr-2" aria-hidden="true" />
              )}
              Save Changes
            </Button>
          </div>
        </form>
      </main>

      <Footer />
    </div>
  );
};

export default ProfileEdit;
