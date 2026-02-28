import { Link, useNavigate } from "react-router-dom";
import { Menu, LogOut, User, ChevronRight } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAdminAuth } from "@/hooks/useAdminAuth";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { AdminBadge } from "./AdminBadge";
import { AdminNotificationsPanel } from "./AdminNotificationsPanel";
import { AdminGlobalSearch } from "./AdminGlobalSearch";

interface Breadcrumb {
    label: string;
    href?: string;
}

interface AdminHeaderProps {
    title: string;
    breadcrumbs?: Breadcrumb[];
    onMenuToggle: () => void;
}

export function AdminHeader({ title, breadcrumbs = [], onMenuToggle }: AdminHeaderProps) {
    const { adminRole } = useAdminAuth();
    const navigate = useNavigate();

    const handleSignOut = async () => {
        await supabase.auth.signOut();
        navigate("/admin/login");
    };

    return (
        <header
            style={{
                position: "sticky",
                top: 0,
                zIndex: 30,
                height: "64px",
                display: "flex",
                alignItems: "center",
                gap: "16px",
                padding: "0 24px",
                backgroundColor: "#fff",
                borderBottom: "1px solid #e8e8e8",
                boxShadow: "0 1px 4px rgba(0,0,0,0.04)",
            }}
        >
            {/* Menu toggle */}
            <button
                onClick={onMenuToggle}
                style={{ background: "none", border: "none", cursor: "pointer", color: "#666", padding: "4px", display: "flex", alignItems: "center" }}
                aria-label="Toggle sidebar"
            >
                <Menu size={20} />
            </button>

            {/* Breadcrumbs */}
            <nav style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "13px", flex: 1, minWidth: 0 }}>
                <Link to="/admin" style={{ color: "#aaa", textDecoration: "none", flexShrink: 0 }}
                    onMouseEnter={e => { (e.currentTarget as HTMLAnchorElement).style.color = "#00ad00"; }}
                    onMouseLeave={e => { (e.currentTarget as HTMLAnchorElement).style.color = "#aaa"; }}
                >
                    Admin
                </Link>
                {breadcrumbs.map((crumb, i) => (
                    <span key={i} style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                        <ChevronRight size={14} style={{ color: "#ccc", flexShrink: 0 }} />
                        {crumb.href ? (
                            <Link to={crumb.href} style={{ color: "#888", textDecoration: "none" }}
                                onMouseEnter={e => { (e.currentTarget as HTMLAnchorElement).style.color = "#00ad00"; }}
                                onMouseLeave={e => { (e.currentTarget as HTMLAnchorElement).style.color = "#888"; }}
                            >
                                {crumb.label}
                            </Link>
                        ) : (
                            <span style={{ color: "#222", fontWeight: 600, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                                {crumb.label}
                            </span>
                        )}
                    </span>
                ))}
                {breadcrumbs.length === 0 && (
                    <span style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                        <ChevronRight size={14} style={{ color: "#ccc", flexShrink: 0 }} />
                        <span style={{ color: "#222", fontWeight: 600, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                            {title}
                        </span>
                    </span>
                )}
            </nav>

            {/* Right side */}
            <div style={{ display: "flex", alignItems: "center", gap: "8px", flexShrink: 0 }}>
                <AdminGlobalSearch />
                <AdminBadge role={adminRole} />
                <AdminNotificationsPanel />

                {/* Avatar dropdown */}
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <button style={{ display: "flex", alignItems: "center", gap: "8px", padding: "4px 8px", borderRadius: "8px", border: "1px solid #eee", background: "none", cursor: "pointer", transition: "background 0.15s" }}
                            onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.backgroundColor = "#f5f5f5"; }}
                            onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.backgroundColor = "transparent"; }}
                        >
                            <Avatar style={{ width: "30px", height: "30px", border: "2px solid #00ad00" }}>
                                <AvatarFallback style={{ backgroundColor: "#00ad00", color: "#fff", fontSize: "11px", fontWeight: 700 }}>
                                    AD
                                </AvatarFallback>
                            </Avatar>
                        </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-48">
                        <DropdownMenuItem
                            onClick={() => navigate("/dashboard")}
                            className="gap-2 cursor-pointer"
                        >
                            <User className="w-4 h-4" />
                            My Profile
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                            onClick={handleSignOut}
                            className="gap-2 text-red-500 focus:text-red-600 cursor-pointer"
                        >
                            <LogOut className="w-4 h-4" />
                            Sign Out
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
        </header>
    );
}
