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
                "rounded-xl border border-dashed border-gray-200 bg-gray-50",
                className
            )}
        >
            <div className="w-16 h-16 rounded-2xl bg-gray-100 flex items-center justify-center mb-4">
                <Icon className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-gray-700 font-semibold text-lg mb-1">{title}</h3>
            {description && (
                <p className="text-gray-400 text-sm max-w-sm mb-4">{description}</p>
            )}
            {action}
        </div>
    );
}
