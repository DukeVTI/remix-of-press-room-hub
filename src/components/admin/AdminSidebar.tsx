import { Link, useLocation } from "react-router-dom";
import {
    LayoutDashboard,
    Flag,
    Users,
    FileText,
    BookOpen,
    BarChart3,
    ClipboardList,
    ChevronLeft,
    ChevronRight,
    Shield,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAdminAuth } from "@/hooks/useAdminAuth";

interface NavItem {
    label: string;
    href: string;
    icon: React.ElementType;
    roles?: string[];
}

const NAV_ITEMS: NavItem[] = [
    { label: "Dashboard", href: "/admin", icon: LayoutDashboard },
    { label: "Reports", href: "/admin/reports", icon: Flag },
    { label: "Users", href: "/admin/users", icon: Users },
    { label: "Content", href: "/admin/content", icon: FileText },
    { label: "Blogs", href: "/admin/blogs", icon: BookOpen },
    { label: "Analytics", href: "/admin/analytics", icon: BarChart3 },
    { label: "Activity Log", href: "/admin/activity-log", icon: ClipboardList },
];

interface AdminSidebarProps {
    open: boolean;
    onToggle: () => void;
}

export function AdminSidebar({ open, onToggle }: AdminSidebarProps) {
    const location = useLocation();
    const { adminRole } = useAdminAuth();

    return (
        <aside
            className={cn(
                "fixed top-0 left-0 h-full z-40 flex flex-col",
                "bg-slate-900 border-r border-slate-800",
                "transition-all duration-300 ease-in-out",
                open ? "w-[260px]" : "w-[72px]"
            )}
        >
            {/* Logo / Brand */}
            <div className="flex items-center gap-3 px-4 py-5 border-b border-slate-800 min-h-[64px]">
                <div className="flex-shrink-0 w-9 h-9 rounded-lg bg-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-900/50">
                    <Shield className="w-5 h-5 text-white" />
                </div>
                {open && (
                    <div className="overflow-hidden">
                        <p className="text-white font-semibold text-sm leading-tight whitespace-nowrap">Admin Console</p>
                        <p className="text-indigo-400 text-xs capitalize whitespace-nowrap">{adminRole?.replace("_", " ") || "Platform Admin"}</p>
                    </div>
                )}
            </div>

            {/* Nav Items */}
            <nav className="flex-1 py-4 px-2 space-y-1 overflow-y-auto">
                {NAV_ITEMS.map((item) => {
                    const Icon = item.icon;
                    const isActive =
                        item.href === "/admin"
                            ? location.pathname === "/admin"
                            : location.pathname.startsWith(item.href);

                    return (
                        <Link
                            key={item.href}
                            to={item.href}
                            title={!open ? item.label : undefined}
                            className={cn(
                                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium",
                                "transition-all duration-200 group relative",
                                isActive
                                    ? "bg-indigo-600/20 text-indigo-300 border border-indigo-500/30 shadow-sm shadow-indigo-900/20"
                                    : "text-slate-400 hover:text-slate-200 hover:bg-slate-800"
                            )}
                        >
                            <Icon
                                className={cn(
                                    "flex-shrink-0 w-5 h-5 transition-colors",
                                    isActive ? "text-indigo-400" : "text-slate-500 group-hover:text-slate-300"
                                )}
                            />
                            {open && (
                                <span className="whitespace-nowrap overflow-hidden">{item.label}</span>
                            )}
                            {isActive && open && (
                                <span className="ml-auto w-1.5 h-1.5 rounded-full bg-indigo-400 flex-shrink-0" />
                            )}
                        </Link>
                    );
                })}
            </nav>

            {/* Toggle Button */}
            <div className="p-3 border-t border-slate-800">
                <button
                    onClick={onToggle}
                    className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-slate-500 hover:text-slate-300 hover:bg-slate-800 transition-all duration-200 text-sm"
                >
                    {open ? (
                        <>
                            <ChevronLeft className="w-4 h-4" />
                            <span>Collapse</span>
                        </>
                    ) : (
                        <ChevronRight className="w-4 h-4" />
                    )}
                </button>
            </div>
        </aside>
    );
}
