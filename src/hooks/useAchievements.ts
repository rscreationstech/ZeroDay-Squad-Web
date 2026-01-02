import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Achievement, Profile } from "@/types/database";

export function useAchievements() {
  return useQuery({
    queryKey: ["achievements"],
    queryFn: async () => {
      const { data: achievements, error } = await supabase
        .from("achievements")
        .select("*")
        .order("achievement_date", { ascending: false });
      
      if (error) throw error;
      
      // Fetch owners and members for each achievement
      const achievementsWithDetails = await Promise.all(
        (achievements || []).map(async (achievement) => {
          let owner = null;
          let members: Profile[] = [];
          
          if (achievement.owner_id) {
            const { data: ownerData } = await supabase
              .from("profiles")
              .select("id,username,full_name,avatar_url,bio,skills,github_url,linkedin_url,website_url")
              .eq("id", achievement.owner_id)
              .maybeSingle();
            owner = ownerData;
          }
          
          if (achievement.is_team_achievement) {
            const { data: memberData } = await supabase
              .from("achievement_members")
              .select("profile_id")
              .eq("achievement_id", achievement.id);
            
            if (memberData && memberData.length > 0) {
              const { data: profilesData } = await supabase
                .from("profiles")
                .select("id,username,full_name,avatar_url,bio,skills,github_url,linkedin_url,website_url")
                .in("id", memberData.map(m => m.profile_id));
              members = profilesData || [];
            }
          }
          
          return { ...achievement, owner, members } as Achievement;
        })
      );
      
      return achievementsWithDetails;
    },
  });
}

export function useCreateAchievement() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ 
      achievement, 
      memberIds 
    }: { 
      achievement: Omit<Achievement, "id" | "created_at" | "updated_at" | "owner" | "members">; 
      memberIds?: string[];
    }) => {
      const { data, error } = await supabase
        .from("achievements")
        .insert(achievement)
        .select()
        .single();
      
      if (error) throw error;
      
      if (memberIds && memberIds.length > 0) {
        const { error: membersError } = await supabase
          .from("achievement_members")
          .insert(memberIds.map(profileId => ({
            achievement_id: data.id,
            profile_id: profileId,
          })));
        
        if (membersError) throw membersError;
      }
      
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["achievements"] });
    },
  });
}

export function useUpdateAchievement() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ 
      id, 
      updates, 
      memberIds 
    }: { 
      id: string; 
      updates: Partial<Achievement>; 
      memberIds?: string[];
    }) => {
      const { data, error } = await supabase
        .from("achievements")
        .update(updates)
        .eq("id", id)
        .select()
        .single();
      
      if (error) throw error;
      
      if (memberIds !== undefined) {
        // Remove existing members
        await supabase
          .from("achievement_members")
          .delete()
          .eq("achievement_id", id);
        
        // Add new members
        if (memberIds.length > 0) {
          const { error: membersError } = await supabase
            .from("achievement_members")
            .insert(memberIds.map(profileId => ({
              achievement_id: id,
              profile_id: profileId,
            })));
          
          if (membersError) throw membersError;
        }
      }
      
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["achievements"] });
    },
  });
}

export function useDeleteAchievement() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("achievements")
        .delete()
        .eq("id", id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["achievements"] });
    },
  });
}
