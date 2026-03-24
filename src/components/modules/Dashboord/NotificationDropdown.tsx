"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { ScrollArea } from "@/components/ui/scroll-area";
import { getMyNotifications, markNotificationAsRead } from "@/services/notification.services";
import { Notification } from "@/types/notification.types";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { formatDistanceToNow } from "date-fns";
import { Bell, Check } from "lucide-react";
import Link from "next/link";
import { useGetMe } from "@/hooks/queries";
import { toast } from "sonner";

const getNotificationRoute = (role?: string) => {
    switch (role) {
        case "SUPER_ADMIN":
        case "ADMIN":
            return "/admin/dashboard/notifications";
        case "COURIER":
            return "/courier/dashboard/notifications";
        case "MERCHANT":
            return "/merchant/dashboard/notifications";
        default:
            return "/dashboard/notifications";
    }
};

const NotificationDropdown = () => {
    const queryClient = useQueryClient();
    const { data: userResponse } = useGetMe();
    const userRole = userResponse?.data?.role;

    const { data } = useQuery({
        queryKey: ["notifications-dropdown"],
        queryFn: () => getMyNotifications({ limit: 10 }),
        refetchInterval: 30000,
    });

    const { mutate: markRead, isPending } = useMutation({
        mutationFn: (id: string) => markNotificationAsRead(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["notifications-dropdown"] });
            queryClient.invalidateQueries({ queryKey: ["notifications"] });
            toast.success("Notification marked as read");
        },
        onError: () => toast.error("Failed to mark notification as read"),
    });

    const notifications: Notification[] = data?.data ?? [];
    
    // Sort notifications: unread first, then read (both sorted by newest first)
    const sortedNotifications = [...notifications].sort((a, b) => {
        // If one is unread and other is read, unread comes first
        if (!a.readStatus && b.readStatus) return -1;
        if (a.readStatus && !b.readStatus) return 1;
        // If both have same read status, sort by newest first
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
    
    const unreadCount = notifications.filter((n) => !n.readStatus).length;

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="outline" size="icon" className="relative">
                    <Bell className="h-5 w-5" />
                    {unreadCount > 0 && (
                        <Badge className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 flex items-center justify-center" variant="destructive">
                            <span className="text-[10px]">{unreadCount > 9 ? "9+" : unreadCount}</span>
                        </Badge>
                    )}
                </Button>
            </DropdownMenuTrigger>

            <DropdownMenuContent align="end" className="w-80">
                <DropdownMenuLabel className="flex items-center justify-between">
                    <span>Notifications</span>
                    {unreadCount > 0 && <Badge variant="secondary">{unreadCount} new</Badge>}
                </DropdownMenuLabel>

                <DropdownMenuSeparator />

                <ScrollArea className="h-72">
                    {sortedNotifications.length > 0 ? (
                        sortedNotifications.map((n) => (
                            <div key={n.id} className="flex items-start gap-2 p-3 hover:bg-accent border-b last:border-0">
                                <div className="flex-1 space-y-1">
                                    <p className={`text-sm leading-snug ${n.readStatus ? "text-muted-foreground opacity-70" : "font-medium"}`}>
                                        {n.message}
                                    </p>
                                    {n.shipment && (
                                        <p className="text-xs text-muted-foreground">{n.shipment.trackingNumber}</p>
                                    )}
                                    <p className="text-xs text-muted-foreground">
                                        {formatDistanceToNow(new Date(n.createdAt), { addSuffix: true })}
                                    </p>
                                </div>
                                {n.readStatus ? (
                                    <div className="flex items-center justify-center h-8 w-8 shrink-0">
                                        <Check className="h-4 w-4 text-green-600" />
                                        <Check className="h-4 w-4 text-green-600 -ml-2" />
                                    </div>
                                ) : (
                                    <Button
                                        size="icon"
                                        variant="ghost"
                                        className="h-8 w-8 shrink-0"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            markRead(n.id);
                                        }}
                                        disabled={isPending}
                                    >
                                        <Check className="h-4 w-4" />
                                    </Button>
                                )}
                            </div>
                        ))
                    ) : (
                        <div className="p-6 text-center text-sm text-muted-foreground">
                            No notifications
                        </div>
                    )}
                </ScrollArea>

                <DropdownMenuSeparator />

                <DropdownMenuItem asChild className="justify-center cursor-pointer">
                    <Link href={getNotificationRoute(userRole)} className="text-sm text-center w-full">
                        View All Notifications
                    </Link>
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
};

export default NotificationDropdown;
