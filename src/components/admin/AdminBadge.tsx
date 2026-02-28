import { cn } from "@/lib/utils";

type AdminRole = string | null;

const ROLE_CONFIG: Record<string, { label: string; className: string }> = {
    super_admin: { label: "Super Admin", className: "bg-purple-50 text-purple-700 border-purple-200" },
    moderator: { label: "Moderator", className: "bg-blue-50 text-blue-700 border-blue-200" },
    support: { label: "Support", className: "bg-green-50 text-green-700 border-green-200" },
};

interface AdminBadgeProps { role: AdminRole; className?: string; }

export function AdminBadge({ role, className }: AdminBadgeProps) {
    if (!role) return null;
    const config = ROLE_CONFIG[role] ?? {
        label: role.replace("_", " "),
        className: "bg-gray-100 text-gray-600 border-gray-200",
    };
    return (
        <span className={cn(
            "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border capitalize tracking-wide",
            config.className, className
        )}>
            {config.label}
        </span>
    );
}
