import { LucideIcon, TrendingUp, TrendingDown, Minus } from "lucide-react";
import { cn } from "@/lib/utils";

interface AdminStatCardProps {
    label: string;
    value: string | number;
    icon: LucideIcon;
    trend?: number;
    trendLabel?: string;
    accent?: "green" | "blue" | "amber" | "rose" | "purple";
    loading?: boolean;
}

const ACCENT_MAP = {
    green: { icon: "bg-green-50 text-green-600", border: "border-green-100", num: "text-green-700" },
    blue: { icon: "bg-blue-50 text-blue-600", border: "border-blue-100", num: "text-blue-700" },
    amber: { icon: "bg-amber-50 text-amber-600", border: "border-amber-100", num: "text-amber-700" },
    rose: { icon: "bg-rose-50 text-rose-600", border: "border-rose-100", num: "text-rose-700" },
    purple: { icon: "bg-purple-50 text-purple-600", border: "border-purple-100", num: "text-purple-700" },
};

export function AdminStatCard({
    label,
    value,
    icon: Icon,
    trend,
    trendLabel,
    accent = "green",
    loading = false,
}: AdminStatCardProps) {
    const colors = ACCENT_MAP[accent];

    const TrendIcon =
        trend === undefined || trend === 0 ? Minus : trend > 0 ? TrendingUp : TrendingDown;
    const trendColor =
        trend === undefined || trend === 0 ? "text-gray-400" : trend > 0 ? "text-green-500" : "text-rose-500";

    if (loading) {
        return (
            <div className={cn("rounded-xl border bg-white p-5 animate-pulse", colors.border)}>
                <div className="flex items-start justify-between mb-4">
                    <div className="w-10 h-10 rounded-lg bg-gray-100" />
                </div>
                <div className="h-8 w-20 bg-gray-100 rounded mb-1" />
                <div className="h-4 w-28 bg-gray-100 rounded" />
            </div>
        );
    }

    return (
        <div className={cn(
            "rounded-xl border bg-white p-5 hover:shadow-md transition-all duration-200",
            colors.border,
        )}>
            <div className="flex items-start justify-between mb-4">
                <div className={cn("p-2.5 rounded-lg", colors.icon)}>
                    <Icon className="w-5 h-5" />
                </div>
                {trend !== undefined && (
                    <div className={cn("flex items-center gap-1 text-xs font-medium", trendColor)}>
                        <TrendIcon className="w-3.5 h-3.5" />
                        <span>{Math.abs(trend)}%</span>
                    </div>
                )}
            </div>
            <p className={cn("text-2xl font-bold mb-0.5 tabular-nums", colors.num)}>
                {typeof value === "number" ? value.toLocaleString() : value}
            </p>
            <p className="text-sm text-gray-500">{trendLabel || label}</p>
        </div>
    );
}
