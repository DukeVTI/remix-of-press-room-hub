import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface AdminEmptyStateProps {
    icon: LucideIcon;
    title: string;
    description?: string;
    action?: React.ReactNode;
    className?: string;
}

export function AdminEmptyState({
    icon: Icon,
    title,
    description,
    action,
    className,
}: AdminEmptyStateProps) {
    return (
        <div
            className={cn(
                "flex flex-col items-center justify-center py-16 px-6 text-center",
                "rounded-xl border border-dashed border-slate-800 bg-slate-900/30",
                className
            )}
        >
            <div className="w-16 h-16 rounded-2xl bg-slate-800/80 flex items-center justify-center mb-4">
                <Icon className="w-8 h-8 text-slate-500" />
            </div>
            <h3 className="text-slate-300 font-semibold text-lg mb-1">{title}</h3>
            {description && (
                <p className="text-slate-500 text-sm max-w-sm mb-4">{description}</p>
            )}
            {action}
        </div>
    );
}
