-- Drop existing policy
DROP POLICY IF EXISTS "Users can view all profiles" ON public.profiles;

-- Create policy: Anyone can view profiles (but we'll use a view to hide sensitive data)
CREATE POLICY "Anyone can view profiles"
ON public.profiles
FOR SELECT
USING (true);

-- Create a public-safe view that excludes email for non-owners
CREATE OR REPLACE VIEW public.public_profiles AS
SELECT 
  id,
  user_id,
  username,
  full_name,
  avatar_url,
  bio,
  skills,
  github_url,
  linkedin_url,
  twitter_url,
  website_url,
  created_at,
  updated_at,
  CASE 
    WHEN auth.uid() = user_id THEN email
    WHEN has_role(auth.uid(), 'admin') THEN email
    ELSE NULL
  END as email
FROM public.profiles;