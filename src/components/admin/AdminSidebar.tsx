import { Link, useLocation } from "react-router-dom";
import {
    LayoutDashboard, Flag, Users, FileText, BookOpen, BarChart3,
    ClipboardList, ChevronLeft, ChevronRight, Settings, AlertTriangle, Megaphone,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAdminAuth } from "@/hooks/useAdminAuth";

const PRP_LOGO_WH = "https://pressroompublisher.broadcasterscommunity.com/wp-content/uploads/2026/01/PRP-BRAND-lOGO-TRANSPARENT-white.png";

interface NavItem {
    label: string;
    href: string;
    icon: React.ElementType;
    roles?: string[];
    dividerBefore?: boolean;
}

const NAV_ITEMS: NavItem[] = [
    { label: "Dashboard", href: "/admin", icon: LayoutDashboard },
    { label: "Reports", href: "/admin/reports", icon: Flag },
    { label: "Watch List", href: "/admin/watchlist", icon: AlertTriangle },
    { label: "Users", href: "/admin/users", icon: Users },
    { label: "Content", href: "/admin/content", icon: FileText },
    { label: "Blogs", href: "/admin/blogs", icon: BookOpen },
    { label: "Analytics", href: "/admin/analytics", icon: BarChart3, dividerBefore: true },
    { label: "Activity Log", href: "/admin/activity-log", icon: ClipboardList },
    { label: "Announcements", href: "/admin/announcements", icon: Megaphone },
    { label: "Settings", href: "/admin/settings", icon: Settings, roles: ["super_admin"], dividerBefore: true },
];

interface AdminSidebarProps {
    open: boolean;
    onToggle: () => void;
}

export function AdminSidebar({ open, onToggle }: AdminSidebarProps) {
    const location = useLocation();
    const { adminRole } = useAdminAuth();

    const visibleItems = NAV_ITEMS.filter(
        (item) => !item.roles || item.roles.includes(adminRole ?? "")
    );

    return (
        <aside
            className={cn(
                "fixed top-0 left-0 h-full z-40 flex flex-col",
                "transition-all duration-300 ease-in-out",
                open ? "w-[240px]" : "w-[68px]"
            )}
            style={{
                backgroundColor: "#fff",
                borderRight: "1px solid #e8e8e8",
                boxShadow: "2px 0 8px rgba(0,0,0,0.05)",
            }}
        >
            {/* Logo — PRP white logo on green band */}
            <div style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                padding: "0 16px",
                height: "64px",
                borderBottom: "1px solid #e8e8e8",
                minHeight: "64px",
                backgroundColor: "#00ad00",
                overflow: "hidden",
            }}>
                <img
                    src={PRP_LOGO_WH}
                    alt="Press Room Publisher"
                    style={{ height: open ? "36px" : "28px", objectFit: "contain", transition: "all 0.3s" }}
                />
            </div>

            {/* Nav Items */}
            <nav style={{ flex: 1, padding: "12px 8px", overflowY: "auto", display: "flex", flexDirection: "column", gap: "2px" }}>
                {visibleItems.map((item) => {
                    const Icon = item.icon;
                    const isActive =
                        item.href === "/admin"
                            ? location.pathname === "/admin"
                            : location.pathname.startsWith(item.href);

                    return (
                        <div key={item.href}>
                            {item.dividerBefore && (
                                <div style={{ borderTop: "1px solid #eee", margin: "8px 4px" }} />
                            )}
                            <Link
                                to={item.href}
                                title={!open ? item.label : undefined}
                                style={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: "10px",
                                    padding: open ? "9px 12px" : "9px 0",
                                    justifyContent: open ? "flex-start" : "center",
                                    borderRadius: "7px",
                                    textDecoration: "none",
                                    fontSize: "13px",
                                    fontWeight: isActive ? 700 : 500,
                                    color: isActive ? "#00ad00" : "#555",
                                    backgroundColor: isActive ? "#f0fff0" : "transparent",
                                    borderLeft: isActive ? "3px solid #00ad00" : "3px solid transparent",
                                    transition: "all 0.15s",
                                }}
                                onMouseEnter={e => {
                                    if (!isActive) {
                                        (e.currentTarget as HTMLAnchorElement).style.backgroundColor = "#f9f9f9";
                                        (e.currentTarget as HTMLAnchorElement).style.color = "#333";
                                    }
                                }}
                                onMouseLeave={e => {
                                    if (!isActive) {
                                        (e.currentTarget as HTMLAnchorElement).style.backgroundColor = "transparent";
                                        (e.currentTarget as HTMLAnchorElement).style.color = "#555";
                                    }
                                }}
                            >
                                <Icon
                                    size={18}
                                    style={{
                                        flexShrink: 0,
                                        color: isActive ? "#00ad00" : "#888",
                                    }}
                                />
                                {open && (
                                    <span style={{ whiteSpace: "nowrap", overflow: "hidden" }}>{item.label}</span>
                                )}
                            </Link>
                        </div>
                    );
                })}
            </nav>

            {/* PRP branding at bottom */}
            {open && (
                <div style={{
                    padding: "12px 16px",
                    borderTop: "1px solid #eee",
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                }}>
                    <img src={PRP_ICON} alt="PRP" style={{ width: "20px", height: "20px", objectFit: "contain" }} />
                    <span style={{ fontSize: "11px", color: "#aaa", letterSpacing: "0.5px" }}>Press Room Publisher</span>
                </div>
            )}

            {/* Toggle Button */}
            <div style={{ padding: "10px 8px", borderTop: open ? "none" : "1px solid #eee" }}>
                <button
                    onClick={onToggle}
                    style={{
                        width: "100%",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: "6px",
                        padding: "8px",
                        borderRadius: "7px",
                        border: "none",
                        background: "none",
                        color: "#999",
                        cursor: "pointer",
                        fontSize: "12px",
                        transition: "all 0.15s",
                    }}
                    onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.backgroundColor = "#f0f0f0"; (e.currentTarget as HTMLButtonElement).style.color = "#333"; }}
                    onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.backgroundColor = "transparent"; (e.currentTarget as HTMLButtonElement).style.color = "#999"; }}
                >
                    {open ? (
                        <><ChevronLeft size={16} /><span>Collapse</span></>
                    ) : (
                        <ChevronRight size={16} />
                    )}
                </button>
            </div>
        </aside>
    );
}
