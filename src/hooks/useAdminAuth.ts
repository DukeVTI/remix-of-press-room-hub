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
      const { data: rows, error } = await (supabase.rpc as any)("check_is_admin");

      if (mounted) {
        if (error || !rows) {
          setIsAdmin(false);
          setAdminRole(null);
        } else {
          const row = Array.isArray(rows) ? rows[0] : rows;
          const active = !!row && row.is_active;
          setIsAdmin(active);
          setAdminRole(active ? (row.admin_role ?? null) : null);
        }
        setLoading(false);
      }
    }
    checkAdmin();
    return () => { mounted = false; };
  }, []);

  return { isAdmin, adminRole, loading };
}
