"use client";

import DataTable from "@/components/shared/table/DataTable";
import { useServerManagedDataTable } from "@/hooks/useServerManagedDataTable";
import { getMyNotifications, markNotificationAsRead, markAllNotificationsAsRead } from "@/services/notification.services";
import { Notification } from "@/types/notification.types";
import { ColumnDef } from "@tanstack/react-table";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatDistanceToNow } from "date-fns";
import { useGetMe } from "@/hooks/queries";

const columns: ColumnDef<Notification>[] = [
    {
        accessorKey: "message",
        header: "Message",
        cell: ({ row }) => (
            <span className={row.original.readStatus ? "text-muted-foreground" : "font-medium"}>
                {row.original.message}
            </span>
        ),
    },
    {
        accessorKey: "shipment.trackingNumber",
        header: "Shipment",
        cell: ({ row }) => row.original.shipment?.trackingNumber ?? "—",
    },
    {
        accessorKey: "readStatus",
        header: "Status",
        cell: ({ row }) => (
            <Badge variant={row.original.readStatus ? "secondary" : "default"}>
                {row.original.readStatus ? "Read" : "Unread"}
            </Badge>
        ),
    },
    {
        accessorKey: "createdAt",
        header: "Time",
        cell: ({ row }) => formatDistanceToNow(new Date(row.original.createdAt), { addSuffix: true }),
    },
];

const adminColumns: ColumnDef<Notification>[] = [
    {
        accessorKey: "user.name",
        header: "User",
        cell: ({ row }) => row.original.user?.name ?? "—",
    },
    ...columns,
];

export default function NotificationsView() {
    const searchParams = useSearchParams();
    const queryClient = useQueryClient();
    const { data: userResponse } = useGetMe();
    const isAdmin = userResponse?.data?.role === "SUPER_ADMIN" || userResponse?.data?.role === "ADMIN";

    const { optimisticSortingState, optimisticPaginationState, isRouteRefreshPending, handleSortingChange, handlePaginationChange } =
        useServerManagedDataTable({ searchParams });

    const queryParams = {
        page: optimisticPaginationState.pageIndex + 1,
        limit: optimisticPaginationState.pageSize,
    };

    const { data, isLoading } = useQuery({
        queryKey: ["notifications", queryParams],
        queryFn: () => getMyNotifications(queryParams),
    });

    const { mutate: markRead, isPending: isMarkingRead } = useMutation({
        mutationFn: (id: string) => markNotificationAsRead(id),
        onSuccess: () => {
            toast.success("Notification marked as read");
            // Immediately refetch to get updated data from backend
            queryClient.invalidateQueries({ queryKey: ["notifications"] });
            queryClient.invalidateQueries({ queryKey: ["notifications-dropdown"] });
        },
        onError: () => {
            toast.error("Failed to mark notification as read");
        },
    });

    const { mutate: markAll, isPending: isMarkingAll } = useMutation({
        mutationFn: markAllNotificationsAsRead,
        onSuccess: () => { 
            toast.success("All notifications marked as read");
            // Invalidate after a short delay
            setTimeout(() => {
                queryClient.invalidateQueries({ queryKey: ["notifications"] }); 
                queryClient.invalidateQueries({ queryKey: ["notifications-dropdown"] });
            }, 100);
        },
        onError: () => {
            toast.error("Failed to mark all notifications as read");
        },
    });

    const notifications: Notification[] = data?.data ?? [];
    const meta = data?.meta;

    const displayColumns = isAdmin ? adminColumns : columns;
    const columnsWithAction: ColumnDef<Notification>[] = [
        ...displayColumns,
        {
            id: "markRead",
            header: "",
            enableSorting: false,
            cell: ({ row }) =>
                !row.original.readStatus ? (
                    <Button 
                        size="sm" 
                        variant="ghost" 
                        onClick={() => markRead(row.original.id)}
                        disabled={isMarkingRead}
                    >
                        Mark Read
                    </Button>
                ) : null,
        },
    ];

    const unreadCount = notifications.filter((n) => !n.readStatus).length;

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold">Notifications</h1>
                    <p className="text-muted-foreground text-sm">
                        {unreadCount > 0 ? `${unreadCount} unread notification${unreadCount > 1 ? "s" : ""}` : "All caught up!"}
                    </p>
                </div>
                {unreadCount > 0 && (
                    <Button variant="outline" size="sm" disabled={isMarkingAll} onClick={() => markAll()}>
                        Mark All Read
                    </Button>
                )}
            </div>

            <DataTable
                data={notifications}
                columns={columnsWithAction}
                isLoading={isLoading || isRouteRefreshPending}
                emptyMessage="No notifications."
                meta={meta}
                sorting={{ state: optimisticSortingState, onSortingChange: handleSortingChange }}
                pagination={{ state: optimisticPaginationState, onPaginationChange: handlePaginationChange }}
            />
        </div>
    );
}
