import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import type { Session, User } from "@supabase/supabase-js";

interface AuthState {
  session: Session | null;
  user: User | null;
  isLoading: boolean;
}

/**
 * Centralized auth hook that properly handles session persistence.
 * Sets up onAuthStateChange BEFORE checking session to avoid race conditions.
 */
export function useAuth(options?: { redirectTo?: string; requireAuth?: boolean }) {
  const { redirectTo = "/login", requireAuth = true } = options || {};
  const navigate = useNavigate();
  const [authState, setAuthState] = useState<AuthState>({
    session: null,
    user: null,
    isLoading: true,
  });

  useEffect(() => {
    // CRITICAL: Set up auth listener FIRST, before checking session
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        // Update state synchronously to avoid race conditions
        setAuthState({
          session,
          user: session?.user ?? null,
          isLoading: false,
        });

        // Handle sign out
        if (event === "SIGNED_OUT" && requireAuth) {
          navigate(redirectTo);
        }
      }
    );

    // Then get the initial session
    // Use setTimeout to ensure this runs after the listener is set up
    const initSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      setAuthState({
        session,
        user: session?.user ?? null,
        isLoading: false,
      });

      // Redirect if no session and auth is required
      if (!session && requireAuth) {
        navigate(redirectTo);
      }
    };

    initSession();

    return () => {
      subscription.unsubscribe();
    };
  }, [navigate, redirectTo, requireAuth]);

  const signOut = async () => {
    await supabase.auth.signOut();
    navigate(redirectTo);
  };

  return {
    ...authState,
    signOut,
    isAuthenticated: !!authState.session,
  };
}
