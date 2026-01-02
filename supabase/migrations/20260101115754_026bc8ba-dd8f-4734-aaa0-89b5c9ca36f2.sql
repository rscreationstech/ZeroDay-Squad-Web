-- Add image_url column to achievements table for achievement images
ALTER TABLE public.achievements 
ADD COLUMN IF NOT EXISTS image_url text;