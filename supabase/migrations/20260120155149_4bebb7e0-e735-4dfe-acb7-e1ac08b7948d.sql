-- Create storage bucket for post media
INSERT INTO storage.buckets (id, name, public) 
VALUES ('post-media', 'post-media', true);

-- Allow authenticated users to upload post media
CREATE POLICY "Authenticated users can upload post media"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'post-media');

-- Allow public read access to post media
CREATE POLICY "Post media is publicly accessible"
ON storage.objects
FOR SELECT
USING (bucket_id = 'post-media');

-- Allow users to update their own post media
CREATE POLICY "Users can update their own post media"
ON storage.objects
FOR UPDATE
TO authenticated
USING (bucket_id = 'post-media' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Allow users to delete their own post media
CREATE POLICY "Users can delete their own post media"
ON storage.objects
FOR DELETE
TO authenticated
USING (bucket_id = 'post-media' AND auth.uid()::text = (storage.foldername(name))[1]);