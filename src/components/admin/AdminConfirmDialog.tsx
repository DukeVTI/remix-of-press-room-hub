import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";

interface AdminConfirmDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    title: string;
    description: string;
    confirmLabel?: string;
    cancelLabel?: string;
    onConfirm: () => void;
    loading?: boolean;
    variant?: "destructive" | "warning" | "default";
    icon?: LucideIcon;
}

const VARIANT_CONFIG = {
    destructive: {
        button: "bg-rose-600 hover:bg-rose-700 text-white border-rose-700 focus:ring-rose-500",
        icon: "text-rose-400",
    },
    warning: {
        button: "bg-amber-600 hover:bg-amber-700 text-white border-amber-700 focus:ring-amber-500",
        icon: "text-amber-400",
    },
    default: {
        button: "bg-indigo-600 hover:bg-indigo-700 text-white border-indigo-700 focus:ring-indigo-500",
        icon: "text-indigo-400",
    },
};

export function AdminConfirmDialog({
    open,
    onOpenChange,
    title,
    description,
    confirmLabel = "Confirm",
    cancelLabel = "Cancel",
    onConfirm,
    loading = false,
    variant = "destructive",
    icon: Icon,
}: AdminConfirmDialogProps) {
    const styles = VARIANT_CONFIG[variant];

    return (
        <AlertDialog open={open} onOpenChange={onOpenChange}>
            <AlertDialogContent className="bg-slate-900 border-slate-800 text-slate-100 max-w-md">
                <AlertDialogHeader>
                    <AlertDialogTitle className="flex items-center gap-2 text-white">
                        {Icon && <Icon className={cn("w-5 h-5", styles.icon)} />}
                        {title}
                    </AlertDialogTitle>
                    <AlertDialogDescription className="text-slate-400">
                        {description}
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel className="bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700 hover:text-white">
                        {cancelLabel}
                    </AlertDialogCancel>
                    <AlertDialogAction
                        onClick={onConfirm}
                        disabled={loading}
                        className={cn("border", styles.button, loading && "opacity-50 cursor-not-allowed")}
                    >
                        {loading ? "Processing…" : confirmLabel}
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}
