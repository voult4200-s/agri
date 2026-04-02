-- Create storage bucket for user profile photos
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'profile-photos',
  'profile-photos',
  true,
  5242880,
  ARRAY['image/jpeg', 'image/png', 'image/webp']
)
ON CONFLICT (id)
DO UPDATE SET
  public = EXCLUDED.public,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

-- Users can read all profile photos (public avatars)
DROP POLICY IF EXISTS "Profile photos are publicly readable" ON storage.objects;
CREATE POLICY "Profile photos are publicly readable"
ON storage.objects FOR SELECT
USING (bucket_id = 'profile-photos');

-- Users can upload to their own folder only (folder name must be auth uid)
DROP POLICY IF EXISTS "Users can upload their own profile photos" ON storage.objects;
CREATE POLICY "Users can upload their own profile photos"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'profile-photos'
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Users can update their own profile photos only
DROP POLICY IF EXISTS "Users can update their own profile photos" ON storage.objects;
CREATE POLICY "Users can update their own profile photos"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'profile-photos'
  AND auth.uid()::text = (storage.foldername(name))[1]
)
WITH CHECK (
  bucket_id = 'profile-photos'
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Users can delete their own profile photos only
DROP POLICY IF EXISTS "Users can delete their own profile photos" ON storage.objects;
CREATE POLICY "Users can delete their own profile photos"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'profile-photos'
  AND auth.uid()::text = (storage.foldername(name))[1]
);
