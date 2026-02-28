import { ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { useAdminAuth } from "@/hooks/useAdminAuth";

const PRP_LOGO_WH = "https://pressroompublisher.broadcasterscommunity.com/wp-content/uploads/2026/01/PRP-BRAND-lOGO-TRANSPARENT-white.png";

export function ProtectedAdminRoute({ children }: { children: ReactNode }) {
  const { isAdmin, loading } = useAdminAuth();

  if (loading) {
    return (
      <div style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#00ad00",
        gap: "24px",
        fontFamily: "'Inter', 'Arial', sans-serif",
      }}>
        {/* PRP Logo */}
        <img
          src={PRP_LOGO_WH}
          alt="Press Room Publisher"
          style={{ height: "60px", objectFit: "contain" }}
        />

        {/* Spinner ring */}
        <div style={{ position: "relative", width: "40px", height: "40px" }}>
          <div style={{
            position: "absolute",
            inset: 0,
            borderRadius: "50%",
            border: "3px solid rgba(255,255,255,0.25)",
          }} />
          <div style={{
            position: "absolute",
            inset: 0,
            borderRadius: "50%",
            border: "3px solid transparent",
            borderTopColor: "#fff",
            animation: "spin 0.8s linear infinite",
          }} />
        </div>

        {/* Label */}
        <p style={{
          color: "rgba(255,255,255,0.85)",
          fontSize: "12px",
          letterSpacing: "3px",
          textTransform: "uppercase",
          margin: 0,
        }}>
          Confirming access…
        </p>

        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  if (!isAdmin) return <Navigate to="/admin/login" replace />;
  return <>{children}</>;
}
