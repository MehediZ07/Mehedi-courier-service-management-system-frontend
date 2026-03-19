"use client";

import DataTable from "@/components/shared/table/DataTable";
import { useServerManagedDataTable } from "@/hooks/useServerManagedDataTable";
import { getAvailableShipments, acceptShipment } from "@/services/shipment.services";
import { Shipment } from "@/types/shipment.types";
import { ColumnDef } from "@tanstack/react-table";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

const columns: ColumnDef<Shipment>[] = [
    { accessorKey: "trackingNumber", header: "Tracking #" },
    { accessorKey: "pickupCity", header: "From" },
    { accessorKey: "deliveryCity", header: "To" },
    { accessorKey: "packageType", header: "Package" },
    { accessorKey: "weight", header: "Weight (kg)" },
    {
        accessorKey: "priority",
        header: "Priority",
        cell: ({ row }) => (
            <Badge variant={row.original.priority === "EXPRESS" ? "default" : "secondary"}>
                {row.original.priority}
            </Badge>
        ),
    },
    {
        accessorKey: "pricing.totalPrice",
        header: "Value",
        cell: ({ row }) => row.original.pricing ? `${row.original.pricing.totalPrice} BDT` : "—",
    },
];

export default function AvailableShipments() {
    const searchParams = useSearchParams();
    const queryClient = useQueryClient();

    const { optimisticSortingState, optimisticPaginationState, isRouteRefreshPending, handleSortingChange, handlePaginationChange } =
        useServerManagedDataTable({ searchParams });

    const queryParams = {
        page: optimisticPaginationState.pageIndex + 1,
        limit: optimisticPaginationState.pageSize,
        ...(optimisticSortingState[0] && { sortBy: optimisticSortingState[0].id, sortOrder: optimisticSortingState[0].desc ? "desc" : "asc" }),
    };

    const { data, isLoading } = useQuery({
        queryKey: ["available-shipments", queryParams],
        queryFn: () => getAvailableShipments(queryParams),
    });

    const { mutate: accept } = useMutation({
        mutationFn: (id: string) => acceptShipment(id),
        onSuccess: () => { toast.success("Shipment accepted!"); queryClient.invalidateQueries({ queryKey: ["available-shipments"] }); },
        onError: (e: Error) => toast.error(e.message),
    });

    const shipments: Shipment[] = (data?.data as unknown as { data: Shipment[] })?.data ?? [];
    const meta = (data?.data as unknown as { meta: { page: number; limit: number; total: number; totalPages: number } })?.meta;

    const columnsWithAction: ColumnDef<Shipment>[] = [
        ...columns,
        {
            id: "accept",
            header: "Action",
            enableSorting: false,
            cell: ({ row }) => (
                <Button size="sm" onClick={() => accept(row.original.id)}>
                    Accept
                </Button>
            ),
        },
    ];

    return (
        <div className="space-y-4">
            <div>
                <h1 className="text-2xl font-bold">Available Shipments</h1>
                <p className="text-muted-foreground text-sm">Browse and accept pending shipments.</p>
            </div>

            <DataTable
                data={shipments}
                columns={columnsWithAction}
                isLoading={isLoading || isRouteRefreshPending}
                emptyMessage="No available shipments."
                meta={meta}
                sorting={{ state: optimisticSortingState, onSortingChange: handleSortingChange }}
                pagination={{ state: optimisticPaginationState, onPaginationChange: handlePaginationChange }}
            />
        </div>
    );
}
