-- Create storage bucket for blog profile photos
INSERT INTO storage.buckets (id, name, public) 
VALUES ('blog-photos', 'blog-photos', true);

-- Allow authenticated users to upload blog photos
CREATE POLICY "Authenticated users can upload blog photos"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'blog-photos');

-- Allow public read access to blog photos
CREATE POLICY "Blog photos are publicly accessible"
ON storage.objects
FOR SELECT
USING (bucket_id = 'blog-photos');

-- Allow users to update their own blog photos
CREATE POLICY "Users can update their own blog photos"
ON storage.objects
FOR UPDATE
TO authenticated
USING (bucket_id = 'blog-photos' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Allow users to delete their own blog photos
CREATE POLICY "Users can delete their own blog photos"
ON storage.objects
FOR DELETE
TO authenticated
USING (bucket_id = 'blog-photos' AND auth.uid()::text = (storage.foldername(name))[1]);