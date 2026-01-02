import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Project, Profile } from "@/types/database";

export function useProjects() {
  return useQuery({
    queryKey: ["projects"],
    queryFn: async () => {
      const { data: projects, error } = await supabase
        .from("projects")
        .select("*")
        .order("created_at", { ascending: false });
      
      if (error) throw error;
      
      // Fetch owners and members for each project
      const projectsWithDetails = await Promise.all(
        (projects || []).map(async (project) => {
          let owner = null;
          let members: Profile[] = [];
          
          if (project.owner_id) {
            const { data: ownerData } = await supabase
              .from("profiles")
              .select("id,username,full_name,avatar_url,bio,skills,github_url,linkedin_url,website_url")
              .eq("id", project.owner_id)
              .maybeSingle();
            owner = ownerData;
          }
          
          if (project.is_team_project) {
            const { data: memberData } = await supabase
              .from("project_members")
              .select("profile_id")
              .eq("project_id", project.id);
            
            if (memberData && memberData.length > 0) {
              const { data: profilesData } = await supabase
                .from("profiles")
                .select("id,username,full_name,avatar_url,bio,skills,github_url,linkedin_url,website_url")
                .in("id", memberData.map(m => m.profile_id));
              members = profilesData || [];
            }
          }
          
          return { ...project, owner, members } as Project;
        })
      );
      
      return projectsWithDetails;
    },
  });
}

export function useCreateProject() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ 
      project, 
      memberIds 
    }: { 
      project: Omit<Project, "id" | "created_at" | "updated_at" | "owner" | "members">; 
      memberIds?: string[];
    }) => {
      const { data, error } = await supabase
        .from("projects")
        .insert(project)
        .select()
        .single();
      
      if (error) throw error;
      
      if (memberIds && memberIds.length > 0) {
        const { error: membersError } = await supabase
          .from("project_members")
          .insert(memberIds.map(profileId => ({
            project_id: data.id,
            profile_id: profileId,
          })));
        
        if (membersError) throw membersError;
      }
      
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["projects"] });
    },
  });
}

export function useUpdateProject() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ 
      id, 
      updates, 
      memberIds 
    }: { 
      id: string; 
      updates: Partial<Project>; 
      memberIds?: string[];
    }) => {
      const { data, error } = await supabase
        .from("projects")
        .update(updates)
        .eq("id", id)
        .select()
        .single();
      
      if (error) throw error;
      
      if (memberIds !== undefined) {
        // Remove existing members
        await supabase
          .from("project_members")
          .delete()
          .eq("project_id", id);
        
        // Add new members
        if (memberIds.length > 0) {
          const { error: membersError } = await supabase
            .from("project_members")
            .insert(memberIds.map(profileId => ({
              project_id: id,
              profile_id: profileId,
            })));
          
          if (membersError) throw membersError;
        }
      }
      
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["projects"] });
    },
  });
}

export function useDeleteProject() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("projects")
        .delete()
        .eq("id", id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["projects"] });
    },
  });
}
