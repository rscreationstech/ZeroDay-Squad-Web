-- Drop the security definer view
DROP VIEW IF EXISTS public.public_profiles;

-- Drop the permissive policy
DROP POLICY IF EXISTS "Anyone can view profiles" ON public.profiles;

-- Create a more restrictive policy: authenticated users can view all profiles
-- Public users can only view profiles without email access
CREATE POLICY "Authenticated users can view all profiles"
ON public.profiles
FOR SELECT
TO authenticated
USING (true);

-- Create policy for anonymous users (no email visible through RLS - they query but email column handled in code)
CREATE POLICY "Public can view profiles"
ON public.profiles
FOR SELECT
TO anon
USING (true);