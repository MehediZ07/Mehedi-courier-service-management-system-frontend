"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { ScrollArea } from "@/components/ui/scroll-area";
import { getMyNotifications, markNotificationAsRead } from "@/services/notification.services";
import { Notification } from "@/types/notification.types";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { formatDistanceToNow } from "date-fns";
import { Bell } from "lucide-react";
import Link from "next/link";

const NotificationDropdown = () => {
    const queryClient = useQueryClient();

    const { data } = useQuery({
        queryKey: ["notifications-dropdown"],
        queryFn: () => getMyNotifications({ limit: 10, readStatus: false }),
        refetchInterval: 30000,
    });

    const { mutate: markRead } = useMutation({
        mutationFn: (id: string) => markNotificationAsRead(id),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ["notifications-dropdown"] }),
    });

    const notifications: Notification[] = (data?.data as unknown as { data: Notification[] })?.data ?? [];
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
                    {notifications.length > 0 ? (
                        notifications.map((n) => (
                            <DropdownMenuItem
                                key={n.id}
                                className="flex flex-col items-start gap-1 p-3 cursor-pointer"
                                onClick={() => !n.readStatus && markRead(n.id)}
                            >
                                <div className="flex items-start justify-between w-full gap-2">
                                    <p className={`text-sm leading-snug flex-1 ${n.readStatus ? "text-muted-foreground" : "font-medium"}`}>
                                        {n.message}
                                    </p>
                                    {!n.readStatus && <div className="mt-1 h-2 w-2 rounded-full bg-primary shrink-0" />}
                                </div>
                                {n.shipment && (
                                    <p className="text-xs text-muted-foreground">{n.shipment.trackingNumber}</p>
                                )}
                                <p className="text-xs text-muted-foreground">
                                    {formatDistanceToNow(new Date(n.createdAt), { addSuffix: true })}
                                </p>
                            </DropdownMenuItem>
                        ))
                    ) : (
                        <div className="p-6 text-center text-sm text-muted-foreground">
                            No new notifications
                        </div>
                    )}
                </ScrollArea>

                <DropdownMenuSeparator />

                <DropdownMenuItem asChild className="justify-center cursor-pointer">
                    <Link href="/dashboard/notifications" className="text-sm text-center w-full">
                        View All Notifications
                    </Link>
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
};

export default NotificationDropdown;
