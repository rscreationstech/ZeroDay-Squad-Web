-- Add new columns to profiles table
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS full_name TEXT,
ADD COLUMN IF NOT EXISTS bio TEXT,
ADD COLUMN IF NOT EXISTS skills TEXT[],
ADD COLUMN IF NOT EXISTS github_url TEXT,
ADD COLUMN IF NOT EXISTS linkedin_url TEXT,
ADD COLUMN IF NOT EXISTS twitter_url TEXT,
ADD COLUMN IF NOT EXISTS website_url TEXT;

-- Create site_stats table for admin-editable homepage stats
CREATE TABLE public.site_stats (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  stat_key TEXT NOT NULL UNIQUE,
  stat_label TEXT NOT NULL,
  stat_value INTEGER NOT NULL DEFAULT 0,
  display_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.site_stats ENABLE ROW LEVEL SECURITY;

-- Anyone can view stats
CREATE POLICY "Anyone can view site stats"
ON public.site_stats FOR SELECT
USING (true);

-- Only admins can manage stats
CREATE POLICY "Admins can manage site stats"
ON public.site_stats FOR ALL
USING (public.has_role(auth.uid(), 'admin'));

-- Create projects table
CREATE TABLE public.projects (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  status TEXT NOT NULL DEFAULT 'active',
  is_team_project BOOLEAN NOT NULL DEFAULT false,
  owner_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  github_url TEXT,
  demo_url TEXT,
  image_url TEXT,
  tags TEXT[],
  language TEXT,
  stars INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;

-- Anyone can view projects
CREATE POLICY "Anyone can view projects"
ON public.projects FOR SELECT
USING (true);

-- Owners can manage their own projects (non-team)
CREATE POLICY "Owners can manage own projects"
ON public.projects FOR ALL
USING (
  (NOT is_team_project AND owner_id = (SELECT id FROM public.profiles WHERE user_id = auth.uid()))
  OR public.has_role(auth.uid(), 'admin')
);

-- Create project_members junction table for team projects
CREATE TABLE public.project_members (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  profile_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(project_id, profile_id)
);

ALTER TABLE public.project_members ENABLE ROW LEVEL SECURITY;

-- Anyone can view project members
CREATE POLICY "Anyone can view project members"
ON public.project_members FOR SELECT
USING (true);

-- Only admins can manage project members
CREATE POLICY "Admins can manage project members"
ON public.project_members FOR ALL
USING (public.has_role(auth.uid(), 'admin'));

-- Create achievements table
CREATE TABLE public.achievements (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  achievement_type TEXT NOT NULL DEFAULT 'personal',
  achievement_date DATE,
  icon TEXT,
  is_team_achievement BOOLEAN NOT NULL DEFAULT false,
  owner_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  is_highlighted BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.achievements ENABLE ROW LEVEL SECURITY;

-- Anyone can view achievements
CREATE POLICY "Anyone can view achievements"
ON public.achievements FOR SELECT
USING (true);

-- Owners can manage their own achievements (non-team)
CREATE POLICY "Owners can manage own achievements"
ON public.achievements FOR ALL
USING (
  (NOT is_team_achievement AND owner_id = (SELECT id FROM public.profiles WHERE user_id = auth.uid()))
  OR public.has_role(auth.uid(), 'admin')
);

-- Create achievement_members junction table for team achievements
CREATE TABLE public.achievement_members (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  achievement_id UUID NOT NULL REFERENCES public.achievements(id) ON DELETE CASCADE,
  profile_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(achievement_id, profile_id)
);

ALTER TABLE public.achievement_members ENABLE ROW LEVEL SECURITY;

-- Anyone can view achievement members
CREATE POLICY "Anyone can view achievement members"
ON public.achievement_members FOR SELECT
USING (true);

-- Only admins can manage achievement members
CREATE POLICY "Admins can manage achievement members"
ON public.achievement_members FOR ALL
USING (public.has_role(auth.uid(), 'admin'));

-- Update triggers for new tables
CREATE TRIGGER update_site_stats_updated_at
BEFORE UPDATE ON public.site_stats
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_projects_updated_at
BEFORE UPDATE ON public.projects
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_achievements_updated_at
BEFORE UPDATE ON public.achievements
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Insert default stats
INSERT INTO public.site_stats (stat_key, stat_label, stat_value, display_order) VALUES
('ctf_wins', 'CTF Wins', 0, 1),
('bug_bounties', 'Bug Bounties', 0, 2),
('active_members', 'Active Members', 0, 3),
('projects_completed', 'Projects Completed', 0, 4);