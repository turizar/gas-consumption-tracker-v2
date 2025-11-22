-- Fix RLS policies for personal use
-- Allow all operations for now (since it's personal use)

-- Drop existing policies
DROP POLICY IF EXISTS "Allow all operations on house_readings" ON house_readings;
DROP POLICY IF EXISTS "Allow all operations on house_config" ON house_config;

-- Create new policies that allow all operations
CREATE POLICY "Allow all operations on house_readings" ON house_readings
  FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Allow all operations on house_config" ON house_config
  FOR ALL USING (true) WITH CHECK (true);

-- Fix storage policies
-- First, let's check if there are any storage policies
-- We need to allow public access to the meter-photos bucket

-- Create a policy for the meter-photos bucket
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('meter-photos', 'meter-photos', true, 52428800, ARRAY['image/*'])
ON CONFLICT (id) DO UPDATE SET
  public = true,
  file_size_limit = 52428800,
  allowed_mime_types = ARRAY['image/*'];

-- Create storage policies
CREATE POLICY "Allow public uploads to meter-photos" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'meter-photos');

CREATE POLICY "Allow public access to meter-photos" ON storage.objects
  FOR SELECT USING (bucket_id = 'meter-photos');

CREATE POLICY "Allow public updates to meter-photos" ON storage.objects
  FOR UPDATE USING (bucket_id = 'meter-photos');

CREATE POLICY "Allow public deletes to meter-photos" ON storage.objects
  FOR DELETE USING (bucket_id = 'meter-photos');
