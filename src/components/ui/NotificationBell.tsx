import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Bell } from "lucide-react";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatDistanceToNow } from "date-fns";
import { Link } from "react-router-dom";

interface Notification {
    id: string;
    type: string;
    title: string;
    message: string;
    link_url: string | null;
    is_read: boolean;
    created_at: string;
}

export function NotificationBell() {
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [isOpen, setIsOpen] = useState(false);

    useEffect(() => {
        const fetchNotifications = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) return;

            const { data } = await supabase
                .from("notifications")
                .select("*")
                .eq("user_id", session.user.id)
                .order("created_at", { ascending: false })
                .limit(20); // Get last 20 notifications

            if (data) {
                setNotifications(data);
                setUnreadCount(data.filter((n) => !n.is_read).length);
            }
        };

        fetchNotifications();

        // Optional: Subscribe to real-time notifications
        // We'll skip complex real-time setup right now unless specifically needed,
        // but it's where you'd add a channel subscription to "notifications" table.

    }, []);

    const markAsRead = async (id: string) => {
        // Optimistically update UI
        setNotifications((prev) =>
            prev.map((n) => (n.id === id ? { ...n, is_read: true } : n))
        );
        setUnreadCount((prev) => Math.max(0, prev - 1));

        await supabase
            .from("notifications")
            .update({ is_read: true })
            .eq("id", id);
    };

    const markAllAsRead = async () => {
        if (unreadCount === 0) return;

        const { data: { session } } = await supabase.auth.getSession();
        if (!session) return;

        // Optimistically update
        setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
        setUnreadCount(0);

        await supabase
            .from("notifications")
            .update({ is_read: true })
            .eq("user_id", session.user.id)
            .eq("is_read", false);
    };

    return (
        <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="relative mr-2 h-9 w-9 text-muted-foreground hover:text-foreground">
                    <Bell className="h-5 w-5" />
                    {unreadCount > 0 && (
                        <Badge className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full p-0 text-[10px] bg-rose-500 hover:bg-rose-500">
                            {unreadCount > 9 ? "9+" : unreadCount}
                        </Badge>
                    )}
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-80 sm:w-96 rounded-xl shadow-lg border-border" align="end" alignOffset={-16}>
                <div className="flex items-center justify-between px-4 py-3 border-b border-border">
                    <DropdownMenuLabel className="font-semibold px-0 py-0">Notifications</DropdownMenuLabel>
                    {unreadCount > 0 && (
                        <Button variant="ghost" size="sm" onClick={markAllAsRead} className="h-auto px-2 py-1 text-xs text-muted-foreground hover:text-foreground">
                            Mark all as read
                        </Button>
                    )}
                </div>
                <DropdownMenuGroup className="max-h-[350px] overflow-y-auto overflow-x-hidden">
                    {notifications.length === 0 ? (
                        <div className="py-8 text-center px-4">
                            <Bell className="h-8 w-8 mx-auto text-muted-foreground/30 mb-3" />
                            <p className="text-sm text-muted-foreground">No notifications yet.</p>
                        </div>
                    ) : (
                        notifications.map((notification) => (
                            <div key={notification.id}>
                                <div
                                    className={`relative flex flex-col gap-1 px-4 py-3 hover:bg-muted/50 transition-colors ${!notification.is_read ? 'bg-accent/5' : ''
                                        }`}
                                    onClick={() => {
                                        if (!notification.is_read) markAsRead(notification.id);
                                        // Close dropdown if clicking a link
                                        if (notification.link_url) setIsOpen(false);
                                    }}
                                >
                                    {/* Unread dot */}
                                    {!notification.is_read && (
                                        <div className="absolute left-2 top-4 h-1.5 w-1.5 rounded-full bg-accent" />
                                    )}

                                    <div className="pl-3">
                                        <div className="flex items-start justify-between gap-2">
                                            <p className="text-sm font-medium leading-none mb-1 text-foreground">
                                                {notification.title}
                                            </p>
                                            <span className="text-[10px] text-muted-foreground whitespace-nowrap">
                                                {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true })}
                                            </span>
                                        </div>
                                        <p className="text-sm text-muted-foreground line-clamp-2">
                                            {notification.message}
                                        </p>

                                        {notification.link_url && (
                                            <Link
                                                to={notification.link_url}
                                                className="text-xs text-accent mt-2 inline-block hover:underline"
                                            >
                                                View details →
                                            </Link>
                                        )}
                                    </div>
                                </div>
                                <DropdownMenuSeparator className="my-0" />
                            </div>
                        ))
                    )}
                </DropdownMenuGroup>
                <div className="p-2 border-t border-border bg-muted/20">
                    <Button variant="ghost" className="w-full h-8 text-xs text-muted-foreground hover:text-foreground">
                        View all
                    </Button>
                </div>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
