import { useState, useCallback, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface HealthProfile {
  id: string;
  user_id: string;
  profile_name: string;
  relation: string;
  gender: number;
  age: number;
  height: number;
  weight: number;
  default_ap_hi: number;
  default_ap_lo: number;
  default_cholesterol: number;
  default_glucose: number;
  default_smoke: number;
  default_alco: number;
  default_active: number;
  created_at: string;
  updated_at: string;
}

export type HealthProfileInsert = Omit<HealthProfile, "id" | "created_at" | "updated_at">;

export function useHealthProfiles(userId: string | undefined) {
  const [profiles, setProfiles] = useState<HealthProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeProfileId, setActiveProfileId] = useState<string | null>(null);

  const loadProfiles = useCallback(async () => {
    if (!userId) { setProfiles([]); setLoading(false); return; }
    setLoading(true);
    const { data, error } = await supabase
      .from("health_profiles")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: true });
    if (!error && data) {
      setProfiles(data as unknown as HealthProfile[]);
    }
    setLoading(false);
  }, [userId]);

  useEffect(() => { loadProfiles(); }, [loadProfiles]);

  const createProfile = useCallback(async (profile: Omit<HealthProfileInsert, "user_id">) => {
    if (!userId) return null;
    const { data, error } = await supabase
      .from("health_profiles")
      .insert({ ...profile, user_id: userId } as any)
      .select()
      .single();
    if (!error && data) {
      await loadProfiles();
      return data as unknown as HealthProfile;
    }
    return null;
  }, [userId, loadProfiles]);

  const updateProfile = useCallback(async (id: string, updates: Partial<Omit<HealthProfileInsert, "user_id">>) => {
    const { error } = await supabase
      .from("health_profiles")
      .update({ ...updates, updated_at: new Date().toISOString() } as any)
      .eq("id", id);
    if (!error) await loadProfiles();
    return !error;
  }, [loadProfiles]);

  const deleteProfile = useCallback(async (id: string) => {
    const { error } = await supabase
      .from("health_profiles")
      .delete()
      .eq("id", id);
    if (!error) {
      if (activeProfileId === id) setActiveProfileId(null);
      await loadProfiles();
    }
    return !error;
  }, [loadProfiles, activeProfileId]);

  const activeProfile = profiles.find(p => p.id === activeProfileId) ?? null;

  return { profiles, loading, activeProfileId, activeProfile, setActiveProfileId, createProfile, updateProfile, deleteProfile, loadProfiles };
}
