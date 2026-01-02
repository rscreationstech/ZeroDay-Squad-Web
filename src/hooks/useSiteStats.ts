import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { SiteStat } from "@/types/database";

export function useSiteStats() {
  return useQuery({
    queryKey: ["site-stats"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("site_stats")
        .select("*")
        .order("display_order", { ascending: true });
      
      if (error) throw error;
      return data as SiteStat[];
    },
  });
}

export function useCreateSiteStat() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (stat: Omit<SiteStat, "id" | "created_at" | "updated_at">) => {
      const { data, error } = await supabase
        .from("site_stats")
        .insert(stat)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["site-stats"] });
    },
  });
}

export function useUpdateSiteStat() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<SiteStat> }) => {
      const { data, error } = await supabase
        .from("site_stats")
        .update(updates)
        .eq("id", id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["site-stats"] });
    },
  });
}

export function useDeleteSiteStat() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("site_stats")
        .delete()
        .eq("id", id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["site-stats"] });
    },
  });
}
