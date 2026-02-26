import { cn } from "@/lib/utils";

type AdminRole = string | null;

const ROLE_CONFIG: Record<string, { label: string; className: string }> = {
    super_admin: {
        label: "Super Admin",
        className: "bg-purple-500/15 text-purple-300 border-purple-500/30",
    },
    moderator: {
        label: "Moderator",
        className: "bg-blue-500/15 text-blue-300 border-blue-500/30",
    },
    support: {
        label: "Support",
        className: "bg-emerald-500/15 text-emerald-300 border-emerald-500/30",
    },
};

interface AdminBadgeProps {
    role: AdminRole;
    className?: string;
}

export function AdminBadge({ role, className }: AdminBadgeProps) {
    if (!role) return null;
    const config = ROLE_CONFIG[role] ?? {
        label: role.replace("_", " "),
        className: "bg-slate-500/15 text-slate-300 border-slate-500/30",
    };

    return (
        <span
            className={cn(
                "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border capitalize tracking-wide",
                config.className,
                className
            )}
        >
            {config.label}
        </span>
    );
}
