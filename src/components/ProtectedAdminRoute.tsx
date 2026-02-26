import { ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { useAdminAuth } from "@/hooks/useAdminAuth";
import { Shield } from "lucide-react";

export function ProtectedAdminRoute({ children }: { children: ReactNode }) {
  const { isAdmin, loading } = useAdminAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center gap-4">
        <div className="relative">
          <Shield className="w-12 h-12 text-indigo-400 animate-pulse" />
          <div className="absolute inset-0 rounded-full border-2 border-indigo-500/30 animate-ping" />
        </div>
        <p className="text-slate-400 text-sm tracking-widest uppercase animate-pulse">
          Verifying access…
        </p>
      </div>
    );
  }

  if (!isAdmin) return <Navigate to="/dashboard" replace />;
  return <>{children}</>;
}
