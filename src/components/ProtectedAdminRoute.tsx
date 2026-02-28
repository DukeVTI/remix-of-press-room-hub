import { ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { useAdminAuth } from "@/hooks/useAdminAuth";
import { Shield } from "lucide-react";

export function ProtectedAdminRoute({ children }: { children: ReactNode }) {
  const { isAdmin, loading } = useAdminAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center gap-4">
        <div className="relative">
          <Shield className="w-12 h-12 text-green-500 animate-pulse" style={{ color: "#00ad00" }} />
          <div className="absolute inset-0 rounded-full border-2 border-green-400/30 animate-ping" style={{ borderColor: "rgba(0,173,0,0.25)" }} />
        </div>
        <p className="text-gray-400 text-sm tracking-widest uppercase animate-pulse">
          Verifying access…
        </p>
      </div>
    );
  }

  if (!isAdmin) return <Navigate to="/admin/login" replace />;
  return <>{children}</>;
}
