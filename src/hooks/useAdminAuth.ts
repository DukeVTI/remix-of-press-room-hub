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
        if (mounted) { setIsAdmin(false); setLoading(false); }
        return;
      }

      // Use SECURITY DEFINER RPC — bypasses all RLS complications
      const { data: isAdmin, error } = await (supabase.rpc as any)("check_is_admin");

      if (mounted) {
        if (error) {
          setIsAdmin(false);
          setAdminRole(null);
        } else {
          setIsAdmin(!!isAdmin);
          // Fetch role separately if admin
          if (isAdmin) {
            const { data: adminData } = await supabase
              .from("platform_admins")
              .select("admin_role")
              .eq("user_id", session.user.id)
              .eq("is_active", true)
              .maybeSingle();
            setAdminRole(adminData?.admin_role ?? null);
          } else {
            setAdminRole(null);
          }
        }
        setLoading(false);
      }
    }
    checkAdmin();
    return () => { mounted = false; };
  }, []);

  return { isAdmin, adminRole, loading };
}
