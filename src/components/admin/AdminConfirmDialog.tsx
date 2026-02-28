import {
    AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
    AlertDialogDescription, AlertDialogFooter, AlertDialogHeader,
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
    destructive: { button: "bg-rose-600 hover:bg-rose-700 text-white border-rose-700", icon: "text-rose-500" },
    warning: { button: "bg-amber-500 hover:bg-amber-600 text-white border-amber-600", icon: "text-amber-500" },
    default: { button: "bg-green-600 hover:bg-green-700 text-white border-green-700", icon: "text-green-600" },
};

export function AdminConfirmDialog({
    open, onOpenChange, title, description,
    confirmLabel = "Confirm", cancelLabel = "Cancel",
    onConfirm, loading = false, variant = "destructive", icon: Icon,
}: AdminConfirmDialogProps) {
    const styles = VARIANT_CONFIG[variant];
    return (
        <AlertDialog open={open} onOpenChange={onOpenChange}>
            <AlertDialogContent className="bg-white border-gray-200 text-gray-800 max-w-md">
                <AlertDialogHeader>
                    <AlertDialogTitle className="flex items-center gap-2 text-gray-900">
                        {Icon && <Icon className={cn("w-5 h-5", styles.icon)} />}
                        {title}
                    </AlertDialogTitle>
                    <AlertDialogDescription className="text-gray-500">
                        {description}
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel className="bg-gray-100 border-gray-200 text-gray-700 hover:bg-gray-200">
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
