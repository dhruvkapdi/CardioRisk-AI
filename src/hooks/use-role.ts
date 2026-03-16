import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

export function useRole(userId: string | undefined) {
  const [isAdmin, setIsAdmin] = useState(false);
  const [roleLoading, setRoleLoading] = useState(true);

  useEffect(() => {
    if (!userId) {
      setIsAdmin(false);
      setRoleLoading(false);
      return;
    }

    let cancelled = false;

    async function fetchRole() {
      setRoleLoading(true);
      const { data } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", userId!)
        .eq("role", "admin")
        .maybeSingle();

      if (!cancelled) {
        setIsAdmin(!!data);
        setRoleLoading(false);
      }
    }

    fetchRole();
    return () => { cancelled = true; };
  }, [userId]);

  return { isAdmin, roleLoading };
}
