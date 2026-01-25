-- Add alt_text column for blog profile photos
ALTER TABLE public.blogs 
ADD COLUMN profile_photo_alt TEXT DEFAULT '' NOT NULL;