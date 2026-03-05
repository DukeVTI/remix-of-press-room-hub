import { useState } from "react";
import {
    AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
    AlertDialogDescription, AlertDialogFooter, AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";

interface AdminActionDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    title: string;
    description: string;
    confirmLabel?: string;
    cancelLabel?: string;
    onConfirm: (reason: string) => void; // Updated to pass reason
    loading?: boolean;
    variant?: "destructive" | "warning" | "default";
    icon?: LucideIcon;
    requireReason?: boolean; // If true, reason is mandatory
    reasonPlaceholder?: string;
}

const VARIANT_CONFIG = {
    destructive: { button: "bg-rose-600 hover:bg-rose-700 text-white border-rose-700", icon: "text-rose-500" },
    warning: { button: "bg-amber-500 hover:bg-amber-600 text-white border-amber-600", icon: "text-amber-500" },
    default: { button: "bg-green-600 hover:bg-green-700 text-white border-green-700", icon: "text-green-600" },
};

export function AdminActionDialog({
    open, onOpenChange, title, description,
    confirmLabel = "Confirm", cancelLabel = "Cancel",
    onConfirm, loading = false, variant = "destructive", icon: Icon,
    requireReason = false, reasonPlaceholder = "Provide a reason for this action...",
}: AdminActionDialogProps) {
    const styles = VARIANT_CONFIG[variant];
    const [reason, setReason] = useState("");

    const handleConfirm = () => {
        onConfirm(reason);
    };

    // Reset reason when dialog closes
    const handleOpenChange = (isOpen: boolean) => {
        if (!isOpen) {
            setReason("");
        }
        onOpenChange(isOpen);
    };

    return (
        <AlertDialog open={open} onOpenChange={handleOpenChange}>
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

                <div className="py-2">
                    <Textarea
                        placeholder={reasonPlaceholder}
                        value={reason}
                        onChange={(e) => setReason(e.target.value)}
                        className="bg-white border-gray-200 text-gray-800 placeholder:text-gray-400 focus:border-green-500 min-h-[100px]"
                    />
                    {requireReason && <p className="text-xs text-gray-500 mt-1">A reason is required to proceed.</p>}
                </div>

                <AlertDialogFooter>
                    <AlertDialogCancel className="bg-gray-100 border-gray-200 text-gray-700 hover:bg-gray-200" disabled={loading}>
                        {cancelLabel}
                    </AlertDialogCancel>
                    <AlertDialogAction
                        onClick={handleConfirm}
                        disabled={loading || (requireReason && !reason.trim())}
                        className={cn("border", styles.button, (loading || (requireReason && !reason.trim())) && "opacity-50 cursor-not-allowed")}
                    >
                        {loading ? "Processing…" : confirmLabel}
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}
