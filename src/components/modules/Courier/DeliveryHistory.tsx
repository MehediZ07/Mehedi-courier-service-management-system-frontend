"use client";

import DataTable from "@/components/shared/table/DataTable";
import { useServerManagedDataTable } from "@/hooks/useServerManagedDataTable";
import { useServerManagedDataTableSearch } from "@/hooks/useServerManagedDataTableSearch";
import { useServerManagedDataTableFilters, serverManagedFilter } from "@/hooks/useServerManagedDataTableFilters";
import { useGetMyCourierLegs } from "@/hooks/useShipmentLegs";
import { ShipmentLeg } from "@/types/shipmentLeg.types";
import { ColumnDef } from "@tanstack/react-table";
import { useSearchParams } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { LegSticker } from "@/components/shared/LegSticker";
import { useMemo, useState } from "react";

const FILTER_DEFINITIONS = [
    serverManagedFilter.single("legType"),
];

const columns: ColumnDef<ShipmentLeg>[] = [
    {
        accessorKey: "shipment.trackingNumber",
        header: "Tracking #",
        cell: ({ row }) => row.original.shipment?.trackingNumber ?? "—",
    },
    {
        accessorKey: "legType",
        header: "Type",
        cell: ({ row }) => <Badge variant="outline">{row.original.legType}</Badge>,
    },
    {
        accessorKey: "deliveredAt",
        header: "Completed At",
        cell: ({ row }) => row.original.deliveredAt ? new Date(row.original.deliveredAt).toLocaleDateString() : "—",
    },
    {
        accessorKey: "shipment.pricing.totalPrice",
        header: "Amount",
        cell: ({ row }) => row.original.shipment?.pricing ? `${row.original.shipment.pricing.totalPrice} BDT` : "—",
    },
    {
        accessorKey: "status",
        header: "Status",
        cell: ({ row }) => <Badge variant="outline">{row.original.status}</Badge>,
    },
];

export default function DeliveryHistory() {
    const searchParams = useSearchParams();
    const [viewLeg, setViewLeg] = useState<ShipmentLeg | null>(null);

    const { optimisticSortingState, optimisticPaginationState, isRouteRefreshPending, updateParams, handleSortingChange, handlePaginationChange } =
        useServerManagedDataTable({ searchParams });

    const { searchTermFromUrl, handleDebouncedSearchChange } = useServerManagedDataTableSearch({ searchParams, updateParams });

    const filterDefs = useMemo(() => FILTER_DEFINITIONS, []);
    const { filterValues, handleFilterChange, clearAllFilters } = useServerManagedDataTableFilters({ searchParams, definitions: filterDefs, updateParams });

    const queryParams = {
        page: optimisticPaginationState.pageIndex + 1,
        limit: optimisticPaginationState.pageSize,
        ...(optimisticSortingState[0] && { sortBy: optimisticSortingState[0].id, sortOrder: optimisticSortingState[0].desc ? "desc" : "asc" }),
        ...(searchTermFromUrl && { searchTerm: searchTermFromUrl }),
        ...(filterValues.legType && { legType: filterValues.legType }),
        status: "COMPLETED",
    };

    const { data, isLoading } = useGetMyCourierLegs(queryParams);

    const legs: ShipmentLeg[] = data?.data ?? [];
    const meta = data?.meta;

    return (
        <div className="space-y-4">
            <div>
                <h1 className="text-2xl font-bold">Delivery History</h1>
                <p className="text-muted-foreground text-sm">View your completed deliveries and earnings.</p>
            </div>

            <DataTable
                data={legs}
                columns={columns}
                isLoading={isLoading || isRouteRefreshPending}
                emptyMessage="No completed deliveries yet."
                meta={meta}
                search={{ initialValue: searchTermFromUrl, placeholder: "Search by tracking number...", onDebouncedChange: handleDebouncedSearchChange }}
                filters={{
                    configs: [
                        { id: "legType", label: "Type", type: "single-select", options: ["PICKUP", "HUB_TRANSFER", "DELIVERY"].map((t) => ({ label: t, value: t })) },
                    ],
                    values: filterValues,
                    onFilterChange: handleFilterChange,
                    onClearAll: clearAllFilters,
                }}
                sorting={{ state: optimisticSortingState, onSortingChange: handleSortingChange }}
                pagination={{ state: optimisticPaginationState, onPaginationChange: handlePaginationChange }}
                actions={{ onView: setViewLeg }}
            />

            <Dialog open={!!viewLeg} onOpenChange={(o) => !o && setViewLeg(null)}>
                <DialogContent className="max-w-2xl">
                    <DialogHeader>
                        <DialogTitle className="flex items-center justify-between">
                            <span>Delivery Details — {viewLeg?.shipment?.trackingNumber}</span>
                            {viewLeg && <LegSticker leg={viewLeg} />}
                        </DialogTitle>
                    </DialogHeader>
                    {viewLeg && (
                        <div className="space-y-4 pt-2">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground">Leg Type</p>
                                    <Badge variant="outline">{viewLeg.legType}</Badge>
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground">Status</p>
                                    <Badge variant="outline">{viewLeg.status}</Badge>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <p className="text-sm font-semibold">Timeline</p>
                                <div className="text-sm space-y-1 pl-2">
                                    {viewLeg.assignedAt && <p><span className="text-muted-foreground">Assigned:</span> {new Date(viewLeg.assignedAt).toLocaleString()}</p>}
                                    {viewLeg.pickedUpAt && <p><span className="text-muted-foreground">Picked Up:</span> {new Date(viewLeg.pickedUpAt).toLocaleString()}</p>}
                                    {viewLeg.deliveredAt && <p><span className="text-muted-foreground">Delivered:</span> {new Date(viewLeg.deliveredAt).toLocaleString()}</p>}
                                </div>
                            </div>

                            <div className="space-y-2">
                                <p className="text-sm font-semibold">Route</p>
                                <div className="text-sm space-y-1 pl-2">
                                    <p><span className="text-muted-foreground">From:</span> {viewLeg.originType === "HUB" ? viewLeg.originHub?.name : viewLeg.originAddress}</p>
                                    <p><span className="text-muted-foreground">To:</span> {viewLeg.destType === "HUB" ? viewLeg.destHub?.name : viewLeg.destAddress}</p>
                                </div>
                            </div>

                            {viewLeg.shipment?.pricing && (
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground">Shipment Amount</p>
                                    <p className="text-lg font-semibold">{viewLeg.shipment.pricing.totalPrice} BDT</p>
                                </div>
                            )}
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    );
}
