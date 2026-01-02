-- Create a function to get all profiles with their roles
-- Uses SECURITY DEFINER to bypass RLS and allow public access to role information
-- This enables the Members page to display role-based colors for all viewers

CREATE OR REPLACE FUNCTION public.get_profiles_with_roles()
RETURNS TABLE (
  id UUID,
  user_id UUID,
  username TEXT,
  full_name TEXT,
  avatar_url TEXT,
  bio TEXT,
  skills TEXT[],
  github_url TEXT,
  linkedin_url TEXT,
  website_url TEXT,
  role app_role
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT 
    p.id,
    p.user_id,
    p.username,
    p.full_name,
    p.avatar_url,
    p.bio,
    p.skills,
    p.github_url,
    p.linkedin_url,
    p.website_url,
    COALESCE(ur.role, 'member'::app_role) as role
  FROM public.profiles p
  LEFT JOIN public.user_roles ur ON p.user_id = ur.user_id
  ORDER BY p.created_at DESC
$$;

-- Grant execute permission to all users (authenticated and anonymous)
GRANT EXECUTE ON FUNCTION public.get_profiles_with_roles() TO anon, authenticated;
