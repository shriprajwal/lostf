-- Run this in Supabase Dashboard → SQL Editor
-- Fixes image deletion by allowing authenticated users to delete from the images bucket

-- Allow anyone to view/download images (public read)
CREATE POLICY "Allow public reads"
ON storage.objects FOR SELECT
USING ( bucket_id = 'images' );

-- Allow signed-in users to upload images
CREATE POLICY "Allow authenticated uploads"
ON storage.objects FOR INSERT
WITH CHECK ( bucket_id = 'images' AND auth.role() = 'authenticated' );

-- Allow signed-in users to delete images (THIS IS THE MISSING ONE)
CREATE POLICY "Allow authenticated deletes"
ON storage.objects FOR DELETE
USING ( bucket_id = 'images' AND auth.role() = 'authenticated' );

-- If the policies above already exist, use these DROP + CREATE variants instead:
-- DROP POLICY IF EXISTS "Allow public reads" ON storage.objects;
-- DROP POLICY IF EXISTS "Allow authenticated uploads" ON storage.objects;
-- DROP POLICY IF EXISTS "Allow authenticated deletes" ON storage.objects;
