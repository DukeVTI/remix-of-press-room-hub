import { LucideIcon, TrendingUp, TrendingDown, Minus } from "lucide-react";
import { cn } from "@/lib/utils";

interface AdminStatCardProps {
    label: string;
    value: string | number;
    icon: LucideIcon;
    trend?: number; // positive = up, negative = down, 0 = flat
    trendLabel?: string;
    accent?: "indigo" | "emerald" | "amber" | "rose" | "blue";
    loading?: boolean;
}

const ACCENT_MAP = {
    indigo: {
        icon: "bg-indigo-500/15 text-indigo-400",
        border: "border-indigo-500/20",
        glow: "shadow-indigo-900/20",
    },
    emerald: {
        icon: "bg-emerald-500/15 text-emerald-400",
        border: "border-emerald-500/20",
        glow: "shadow-emerald-900/20",
    },
    amber: {
        icon: "bg-amber-500/15 text-amber-400",
        border: "border-amber-500/20",
        glow: "shadow-amber-900/20",
    },
    rose: {
        icon: "bg-rose-500/15 text-rose-400",
        border: "border-rose-500/20",
        glow: "shadow-rose-900/20",
    },
    blue: {
        icon: "bg-blue-500/15 text-blue-400",
        border: "border-blue-500/20",
        glow: "shadow-blue-900/20",
    },
};

export function AdminStatCard({
    label,
    value,
    icon: Icon,
    trend,
    trendLabel,
    accent = "indigo",
    loading = false,
}: AdminStatCardProps) {
    const colors = ACCENT_MAP[accent];

    const TrendIcon =
        trend === undefined || trend === 0
            ? Minus
            : trend > 0
                ? TrendingUp
                : TrendingDown;
    const trendColor =
        trend === undefined || trend === 0
            ? "text-slate-500"
            : trend > 0
                ? "text-emerald-400"
                : "text-rose-400";

    if (loading) {
        return (
            <div className={cn("rounded-xl border bg-slate-900/60 p-5 animate-pulse", colors.border)}>
                <div className="flex items-start justify-between mb-4">
                    <div className="w-10 h-10 rounded-lg bg-slate-800" />
                </div>
                <div className="h-8 w-20 bg-slate-800 rounded mb-1" />
                <div className="h-4 w-28 bg-slate-800 rounded" />
            </div>
        );
    }

    return (
        <div
            className={cn(
                "rounded-xl border bg-slate-900/60 p-5 hover:bg-slate-900/80 transition-all duration-200",
                "shadow-lg hover:shadow-xl",
                colors.border,
                colors.glow
            )}
        >
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
            <p className="text-2xl font-bold text-white mb-0.5 tabular-nums">
                {typeof value === "number" ? value.toLocaleString() : value}
            </p>
            <p className="text-sm text-slate-400">{trendLabel || label}</p>
        </div>
    );
}
