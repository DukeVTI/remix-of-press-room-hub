import { Link, useNavigate } from "react-router-dom";
import { Menu, Bell, LogOut, User, ChevronRight } from "lucide-react";
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
        navigate("/login");
    };

    return (
        <header className="sticky top-0 z-30 h-16 flex items-center gap-4 px-6 border-b border-slate-800 bg-slate-950/80 backdrop-blur-md">
            {/* Menu toggle */}
            <button
                onClick={onMenuToggle}
                className="text-slate-400 hover:text-slate-200 transition-colors"
                aria-label="Toggle sidebar"
            >
                <Menu className="w-5 h-5" />
            </button>

            {/* Breadcrumbs */}
            <nav className="flex items-center gap-1.5 text-sm flex-1">
                <Link to="/admin" className="text-slate-500 hover:text-slate-300 transition-colors">
                    Admin
                </Link>
                {breadcrumbs.map((crumb, i) => (
                    <span key={i} className="flex items-center gap-1.5">
                        <ChevronRight className="w-3.5 h-3.5 text-slate-600" />
                        {crumb.href ? (
                            <Link to={crumb.href} className="text-slate-400 hover:text-slate-200 transition-colors">
                                {crumb.label}
                            </Link>
                        ) : (
                            <span className="text-slate-200 font-medium">{crumb.label}</span>
                        )}
                    </span>
                ))}
                {breadcrumbs.length === 0 && (
                    <span className="flex items-center gap-1.5">
                        <ChevronRight className="w-3.5 h-3.5 text-slate-600" />
                        <span className="text-slate-200 font-medium">{title}</span>
                    </span>
                )}
            </nav>

            {/* Right side */}
            <div className="flex items-center gap-3">
                <AdminBadge role={adminRole} />

                {/* Notifications */}
                <button className="relative text-slate-400 hover:text-slate-200 transition-colors p-1.5 rounded-lg hover:bg-slate-800">
                    <Bell className="w-5 h-5" />
                    <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-indigo-400" />
                </button>

                {/* Avatar dropdown */}
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <button className="flex items-center gap-2 p-1 rounded-lg hover:bg-slate-800 transition-colors">
                            <Avatar className="w-8 h-8 border border-slate-700">
                                <AvatarFallback className="bg-indigo-700 text-white text-xs font-semibold">
                                    AD
                                </AvatarFallback>
                            </Avatar>
                        </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent
                        align="end"
                        className="w-48 bg-slate-900 border-slate-800 text-slate-200"
                    >
                        <DropdownMenuItem
                            onClick={() => navigate("/dashboard")}
                            className="gap-2 text-slate-300 focus:bg-slate-800 focus:text-white cursor-pointer"
                        >
                            <User className="w-4 h-4" />
                            My Profile
                        </DropdownMenuItem>
                        <DropdownMenuSeparator className="bg-slate-800" />
                        <DropdownMenuItem
                            onClick={handleSignOut}
                            className="gap-2 text-red-400 focus:bg-red-950/40 focus:text-red-300 cursor-pointer"
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
