-- Add welcome flag to profiles
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS has_seen_welcome BOOLEAN DEFAULT FALSE;

-- Add alt text column for profile photos
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS profile_photo_alt TEXT;