import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Eye, EyeOff, ArrowLeft, Loader2 } from "lucide-react";
import { PRPHeader } from "@/components/ui/prp-header";
import { Footer } from "@/components/Footer";

const months = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

const currentYear = new Date().getFullYear();
const years = Array.from({ length: 100 }, (_, i) => currentYear - 18 - i);
const days = Array.from({ length: 31 }, (_, i) => i + 1);

const Register = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    middleName: "",
    screenName: "",
    birthMonth: "",
    birthDay: "",
    birthYear: "",
    bio: "",
    hobbies: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      toast({
        title: "Passwords don't match",
        description: "Please make sure your passwords match.",
        variant: "destructive",
      });
      return;
    }

    if (formData.password.length < 8) {
      toast({
        title: "Password too short",
        description: "Password must be at least 8 characters.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      const dateOfBirth = `${formData.birthYear}-${String(months.indexOf(formData.birthMonth) + 1).padStart(2, "0")}-${String(formData.birthDay).padStart(2, "0")}`;

      const { error } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          emailRedirectTo: window.location.origin,
          data: {
            first_name: formData.firstName,
            last_name: formData.lastName,
            middle_name: formData.middleName || null,
            screen_name: formData.screenName || null,
            date_of_birth: dateOfBirth,
            bio: formData.bio || null,
            hobbies: formData.hobbies || null,
          },
        },
      });

      if (error) throw error;

      toast({
        title: "Welcome to Press Room Publisher!",
        description: "Your account has been created successfully.",
      });

      navigate("/dashboard");
    } catch (error: any) {
      toast({
        title: "Registration failed",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <a href="#registration-form" className="skip-link">
        Skip to registration form
      </a>

      {/* Header - Consistent with homepage */}
      <PRPHeader isAuthenticated={false} />

      <main className="flex-1 flex flex-col items-center justify-center px-4 py-12">
        <Link to="/" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-8">
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          <span>Back to home</span>
        </Link>

        <div className="card-premium max-w-2xl w-full p-8 animate-fade-in" id="registration-form">
          <div className="text-center mb-8">
            <h1 className="display-lg text-foreground mb-2">Create Your Account</h1>
            <p className="body-md text-muted-foreground">
              Join Press Room Publisher and start sharing your stories
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8" aria-label="Registration form">
            {/* Personal Information Section */}
            <fieldset className="space-y-6">
              <legend className="headline-sm text-foreground border-b border-border pb-2 w-full">
                Personal Information
              </legend>

              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName">First Name <span className="text-destructive" aria-label="required">*</span></Label>
                  <Input
                    id="firstName"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleChange}
                    required
                    aria-required="true"
                    className="input-modern"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">Last Name <span className="text-destructive" aria-label="required">*</span></Label>
                  <Input
                    id="lastName"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleChange}
                    required
                    aria-required="true"
                    className="input-modern"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="middleName">Middle Name (optional)</Label>
                <Input
                  id="middleName"
                  name="middleName"
                  value={formData.middleName}
                  onChange={handleChange}
                  className="input-modern"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="screenName">Screen Name (optional)</Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">@</span>
                  <Input
                    id="screenName"
                    name="screenName"
                    value={formData.screenName}
                    onChange={handleChange}
                    className="input-modern pl-8"
                    aria-describedby="screenName-hint"
                  />
                </div>
                <p id="screenName-hint" className="text-sm text-muted-foreground">
                  Your screen name will appear as @{formData.screenName || "yourname"}
                </p>
              </div>

              {/* Date of Birth */}
              <div className="space-y-2">
                <Label id="dob-label">Date of Birth <span className="text-destructive" aria-label="required">*</span></Label>
                <div className="grid grid-cols-3 gap-2" role="group" aria-labelledby="dob-label">
                  <select
                    name="birthMonth"
                    value={formData.birthMonth}
                    onChange={handleChange}
                    required
                    aria-label="Birth month"
                    className="input-modern"
                  >
                    <option value="">Month</option>
                    {months.map((m) => (
                      <option key={m} value={m}>{m}</option>
                    ))}
                  </select>
                  <select
                    name="birthDay"
                    value={formData.birthDay}
                    onChange={handleChange}
                    required
                    aria-label="Birth day"
                    className="input-modern"
                  >
                    <option value="">Day</option>
                    {days.map((d) => (
                      <option key={d} value={d}>{d}</option>
                    ))}
                  </select>
                  <select
                    name="birthYear"
                    value={formData.birthYear}
                    onChange={handleChange}
                    required
                    aria-label="Birth year"
                    className="input-modern"
                  >
                    <option value="">Year</option>
                    {years.map((y) => (
                      <option key={y} value={y}>{y}</option>
                    ))}
                  </select>
                </div>
                <p className="text-sm text-muted-foreground">
                  Only month and day will be public. Year stays private.
                </p>
              </div>

              {/* Bio & Hobbies */}
              <div className="space-y-2">
                <Label htmlFor="bio">Short Bio (optional)</Label>
                <Textarea
                  id="bio"
                  name="bio"
                  value={formData.bio}
                  onChange={handleChange}
                  rows={3}
                  className="input-modern resize-none"
                  aria-describedby="bio-hint"
                />
                <p id="bio-hint" className="text-sm text-muted-foreground">You can add this later</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="hobbies">Hobbies (optional)</Label>
                <Textarea
                  id="hobbies"
                  name="hobbies"
                  value={formData.hobbies}
                  onChange={handleChange}
                  rows={2}
                  className="input-modern resize-none"
                />
              </div>
            </fieldset>

            {/* Account Credentials Section */}
            <fieldset className="space-y-6">
              <legend className="headline-sm text-foreground border-b border-border pb-2 w-full">
                Account Credentials
              </legend>

              <div className="space-y-2">
                <Label htmlFor="email">Email Address <span className="text-destructive" aria-label="required">*</span></Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  aria-required="true"
                  className="input-modern"
                  aria-describedby="email-hint"
                />
                <p id="email-hint" className="text-sm text-muted-foreground">
                  Your email will never be shared publicly
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password <span className="text-destructive" aria-label="required">*</span></Label>
                <div className="relative">
                  <Input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    value={formData.password}
                    onChange={handleChange}
                    required
                    minLength={8}
                    aria-required="true"
                    className="input-modern pr-10"
                    aria-describedby="password-hint"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
                <p id="password-hint" className="text-sm text-muted-foreground">
                  Minimum 8 characters
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm Password <span className="text-destructive" aria-label="required">*</span></Label>
                <div className="relative">
                  <Input
                    id="confirmPassword"
                    name="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    required
                    aria-required="true"
                    className="input-modern pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                  >
                    {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
              </div>
            </fieldset>

            <Button
              type="submit"
              size="lg"
              disabled={isLoading}
              className="w-full btn-accent text-lg py-6 rounded-full shadow-md"
              aria-label={isLoading ? "Creating your account..." : "Create your account"}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" aria-hidden="true" />
                  Creating Account...
                </>
              ) : (
                "Get Started"
              )}
            </Button>

            <p className="text-center text-sm text-muted-foreground">
              Already have an account?{" "}
              <Link to="/login" className="text-accent hover:underline font-medium">
                Sign in here
              </Link>
            </p>
          </form>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Register;
