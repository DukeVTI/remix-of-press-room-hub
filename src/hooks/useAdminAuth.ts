import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export function useAdminAuth() {
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);
  const [adminRole, setAdminRole] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    async function checkAdmin() {
      setLoading(true);
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) {
        if (mounted) setIsAdmin(false);
        setLoading(false);
        return;
      }
      const { data, error } = await supabase
        .from("platform_admins")
        .select("admin_role")
        .eq("user_id", session.user.id)
        .eq("is_active", true)
        .maybeSingle();
      if (mounted) {
        setIsAdmin(!!data);
        setAdminRole(data?.admin_role || null);
        setLoading(false);
      }
    }
    checkAdmin();
    return () => { mounted = false; };
  }, []);

  return { isAdmin, adminRole, loading };
}
