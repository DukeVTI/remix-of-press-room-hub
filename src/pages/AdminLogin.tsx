import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Shield, Eye, EyeOff, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

const PRP_LOGO = "https://pressroompublisher.broadcasterscommunity.com/wp-content/uploads/2026/01/PRP-BRAND-lOGO-TRANSPARENT-white.png";

export default function AdminLogin() {
    const navigate = useNavigate();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPw, setShowPw] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setLoading(true);

        try {
            // 1. Sign in with Supabase Auth
            const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
                email: email.trim(),
                password,
            });
            if (authError) throw new Error("Invalid credentials. Please try again.");

            // 2. Verify this user exists in platform_admins and is active
            const { data: adminRow } = await (supabase as any)
                .from("platform_admins")
                .select("admin_role, is_active")
                .eq("user_id", authData.user.id)
                .eq("is_active", true)
                .maybeSingle();

            if (!adminRow) {
                // User authenticated but is not a platform admin — sign them out
                await supabase.auth.signOut();
                throw new Error("Access denied. Your account does not have admin privileges.");
            }

            navigate("/admin");
        } catch (err: any) {
            setError(err.message || "An unexpected error occurred.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div
            style={{
                minHeight: "100vh",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                backgroundColor: "#f4f4f4",
                backgroundImage: "url(https://pressroompublisher.broadcasterscommunity.com/wp-content/uploads/2026/01/african-podcasters.jpeg)",
                backgroundSize: "cover",
                backgroundPosition: "center",
                padding: "24px",
                fontFamily: "'Inter', 'Arial', sans-serif",
            }}
        >
            {/* Dark overlay */}
            <div style={{ position: "fixed", inset: 0, backgroundColor: "rgba(0,0,0,0.70)", zIndex: 0 }} />

            {/* Login card */}
            <div
                style={{
                    position: "relative",
                    zIndex: 1,
                    width: "100%",
                    maxWidth: "420px",
                    backgroundColor: "#fff",
                    borderRadius: "12px",
                    boxShadow: "0 20px 60px rgba(0,0,0,0.35)",
                    overflow: "hidden",
                }}
            >
                {/* Green header band */}
                <div style={{
                    backgroundColor: "#00ad00",
                    padding: "28px 32px",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    gap: "12px",
                }}>
                    <img src={PRP_LOGO} alt="Press Room Publisher" style={{ height: "52px", objectFit: "contain" }} />
                    <div style={{ textAlign: "center" }}>
                        <h1 style={{ color: "#fff", fontSize: "16px", fontWeight: 800, letterSpacing: "2px", textTransform: "uppercase", margin: 0 }}>
                            Admin Console
                        </h1>
                        <p style={{ color: "rgba(255,255,255,0.8)", fontSize: "12px", margin: "4px 0 0", letterSpacing: "1px" }}>
                            Authorised Personnel Only
                        </p>
                    </div>
                </div>

                {/* Form area */}
                <div style={{ padding: "32px" }}>
                    {/* Shield icon */}
                    <div style={{ display: "flex", justifyContent: "center", marginBottom: "24px" }}>
                        <div style={{
                            width: "48px", height: "48px", borderRadius: "50%",
                            backgroundColor: "#f0fff0", border: "2px solid #00ad00",
                            display: "flex", alignItems: "center", justifyContent: "center",
                        }}>
                            <Shield size={22} color="#00ad00" />
                        </div>
                    </div>

                    {error && (
                        <div style={{
                            backgroundColor: "#fff0f0",
                            border: "1px solid #ffcccc",
                            borderRadius: "6px",
                            padding: "12px 16px",
                            marginBottom: "20px",
                            color: "#cc0000",
                            fontSize: "13px",
                            lineHeight: 1.5,
                        }}>
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                        {/* Email */}
                        <div>
                            <label style={{ display: "block", fontSize: "12px", fontWeight: 700, color: "#333", textTransform: "uppercase", letterSpacing: "0.8px", marginBottom: "8px" }}>
                                Email address
                            </label>
                            <input
                                type="email"
                                value={email}
                                onChange={e => setEmail(e.target.value)}
                                required
                                placeholder="admin@example.com"
                                autoComplete="username"
                                style={{
                                    width: "100%",
                                    padding: "11px 14px",
                                    border: "1.5px solid #ddd",
                                    borderRadius: "6px",
                                    fontSize: "14px",
                                    color: "#333",
                                    outline: "none",
                                    boxSizing: "border-box",
                                    transition: "border-color 0.2s",
                                    fontFamily: "inherit",
                                }}
                                onFocus={e => { e.target.style.borderColor = "#00ad00"; }}
                                onBlur={e => { e.target.style.borderColor = "#ddd"; }}
                            />
                        </div>

                        {/* Password */}
                        <div>
                            <label style={{ display: "block", fontSize: "12px", fontWeight: 700, color: "#333", textTransform: "uppercase", letterSpacing: "0.8px", marginBottom: "8px" }}>
                                Password
                            </label>
                            <div style={{ position: "relative" }}>
                                <input
                                    type={showPw ? "text" : "password"}
                                    value={password}
                                    onChange={e => setPassword(e.target.value)}
                                    required
                                    placeholder="••••••••"
                                    autoComplete="current-password"
                                    style={{
                                        width: "100%",
                                        padding: "11px 44px 11px 14px",
                                        border: "1.5px solid #ddd",
                                        borderRadius: "6px",
                                        fontSize: "14px",
                                        color: "#333",
                                        outline: "none",
                                        boxSizing: "border-box",
                                        transition: "border-color 0.2s",
                                        fontFamily: "inherit",
                                    }}
                                    onFocus={e => { e.target.style.borderColor = "#00ad00"; }}
                                    onBlur={e => { e.target.style.borderColor = "#ddd"; }}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPw(v => !v)}
                                    style={{
                                        position: "absolute", right: "12px", top: "50%", transform: "translateY(-50%)",
                                        background: "none", border: "none", cursor: "pointer", color: "#888", padding: "2px",
                                    }}
                                    aria-label={showPw ? "Hide password" : "Show password"}
                                >
                                    {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                                </button>
                            </div>
                        </div>

                        {/* Submit */}
                        <button
                            type="submit"
                            disabled={loading}
                            style={{
                                marginTop: "8px",
                                backgroundColor: loading ? "#aaa" : "#00ad00",
                                color: "#fff",
                                border: "none",
                                padding: "13px 24px",
                                fontWeight: 700,
                                fontSize: "14px",
                                letterSpacing: "1.5px",
                                textTransform: "uppercase",
                                borderRadius: "6px",
                                cursor: loading ? "not-allowed" : "pointer",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                gap: "8px",
                                width: "100%",
                                fontFamily: "inherit",
                                transition: "background-color 0.2s",
                            }}
                            onMouseEnter={e => { if (!loading) (e.currentTarget as HTMLButtonElement).style.backgroundColor = "#008f00"; }}
                            onMouseLeave={e => { if (!loading) (e.currentTarget as HTMLButtonElement).style.backgroundColor = "#00ad00"; }}
                        >
                            {loading && <Loader2 size={16} className="animate-spin" />}
                            {loading ? "Verifying…" : "Access Admin Console"}
                        </button>
                    </form>

                    <p style={{ textAlign: "center", fontSize: "12px", color: "#aaa", marginTop: "24px", lineHeight: 1.5 }}>
                        This area is restricted to authorised PRP administrators only.<br />
                        Unauthorised access attempts are logged.
                    </p>
                </div>
            </div>
        </div>
    );
}
