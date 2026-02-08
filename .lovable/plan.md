
# Plan: Fix Accessibility and UX Issues for Blind User

Based on the blind user's detailed feedback, I've identified 4 distinct issues that need to be addressed:

---

## Issue Analysis

### Issue 1: "Create a New Publication" and "Start Reading" Links Redirect to Registration
**Root Cause:** The Index.tsx homepage always shows `isAuthenticated={false}` in the PRPHeader component (hardcoded on line 25). This means even logged-in users see "Start reading" and "Get started" buttons that link to `/register` instead of appropriate authenticated destinations.

**Impact:** Authenticated users clicking these links are sent to the registration page instead of the dashboard or content.

### Issue 2: Alt Text for Profile Photos Not Being Displayed
**Root Cause:** While the blogs table has `profile_photo_alt` column and it's properly collected during blog creation, it's not being used in the `alt` attribute of images when displaying blog profile photos. The BlogView.tsx uses a generic `alt` attribute: `alt="${blog.blog_name} profile photo"` instead of using the actual alt text stored in the database.

**Impact:** Screen reader users cannot access the meaningful alt text they provided for their images.

### Issue 3: Welcome Notification Not Appearing
**Root Cause:** The `WelcomeModal` component exists but is never imported or rendered anywhere in the application. The Register.tsx page just navigates to `/dashboard` after successful registration without showing the welcome modal. Additionally, there's no database flag to track whether a user has seen the welcome message.

**Impact:** New users don't receive the welcome confirmation experience that was designed for them.

### Issue 4: Profile Photos Collected But Alt Text Not Stored (User Profiles)
**Root Cause:** The profiles table schema doesn't have a `profile_photo_alt` column to store alt text. While blogs have this field, user profiles do not. The ProfileEdit.tsx page doesn't persist alt text to the database.

---

## Implementation Plan

### Part 1: Fix Homepage Navigation for Authenticated Users

**File: `src/pages/Index.tsx`**
- Import the `useAuth` hook (or check session directly with Supabase)
- Dynamically set `isAuthenticated` prop on PRPHeader based on actual auth state
- Change the "Start reading" button to link to `/dashboard` when authenticated
- Change the "Get started" CTA button to link to `/blogs/create` when authenticated

### Part 2: Display Alt Text for Blog Profile Photos

**File: `src/pages/BlogView.tsx`**
- Update the AvatarImage component to use `blog.profile_photo_alt` if available
- Fallback to `${blog.blog_name} profile photo` if no alt text

**File: `src/pages/Dashboard.tsx`**
- Update blog profile photo images to use the stored alt text

**File: `src/components/BlogCard.tsx`** (if exists)
- Check and update any blog card components

### Part 3: Implement Welcome Modal for New Users

**Database Changes:**
- Add `has_seen_welcome` boolean column to profiles table (default: false)

**File: `src/pages/Dashboard.tsx`**
- Import the `WelcomeModal` component
- Add state to track modal visibility
- On initial load, check if `has_seen_welcome` is false
- If false, show the welcome modal (type: "subscriber")
- When modal is closed, update the database to set `has_seen_welcome` to true

**File: `src/pages/CreateBlog.tsx` (after successful creation)**
- After blog creation, navigate to manage page
- Add logic to show blog welcome modal on first blog creation

### Part 4: Add Alt Text Support for User Profile Photos

**Database Changes:**
- Add `profile_photo_alt` column to profiles table (nullable text)

**File: `src/pages/ProfileEdit.tsx`**
- Update the form to include alt text field (similar to CreateBlog.tsx)
- Save alt text when updating profile
- Make alt text required when uploading a photo

**File: `src/pages/PublisherProfile.tsx`**
- Use stored alt text for publisher profile photos

**File: `src/pages/Dashboard.tsx`**
- Use stored alt text for user's own profile photo

---

## Technical Details

### Database Migration SQL
```sql
-- Add welcome flag to profiles
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS has_seen_welcome BOOLEAN DEFAULT FALSE;

-- Add alt text column for profile photos
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS profile_photo_alt TEXT;
```

### Key Components to Modify
1. `src/pages/Index.tsx` - Auth state detection
2. `src/pages/BlogView.tsx` - Alt text display
3. `src/pages/Dashboard.tsx` - Auth display, alt text, welcome modal
4. `src/pages/ProfileEdit.tsx` - Alt text collection
5. `src/pages/PublisherProfile.tsx` - Alt text display

### Accessibility Considerations
- All image alt texts will be used directly from the database when available
- Fallback alt texts will be descriptive and meaningful
- Welcome modal will be fully accessible with proper focus management
- Screen readers will announce the modal title and content correctly
