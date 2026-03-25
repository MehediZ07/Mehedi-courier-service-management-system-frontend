"use client";

import DataTable from "@/components/shared/table/DataTable";
import StatusBadgeCell from "@/components/shared/cell/StatusBadgeCell";
import { useServerManagedDataTable } from "@/hooks/useServerManagedDataTable";
import { useGetAvailableLegs, useAcceptLeg } from "@/hooks/useShipmentLegs";
import { ShipmentLeg } from "@/types/shipmentLeg.types";
import { ColumnDef } from "@tanstack/react-table";
import { useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useState } from "react";

const columns: ColumnDef<ShipmentLeg>[] = [
    {
        accessorKey: "shipment.trackingNumber",
        header: "Tracking #",
        cell: ({ row }) => row.original.shipment?.trackingNumber ?? "—",
    },
    {
        accessorKey: "legType",
        header: "Leg Type",
        cell: ({ row }) => <Badge variant="outline">{row.original.legType}</Badge>,
    },
    {
        accessorKey: "originAddress",
        header: "From",
        cell: ({ row }) => {
            if (row.original.originType === "HUB") {
                return row.original.originHub?.name ?? "Hub";
            }
            return row.original.originAddress ?? "—";
        },
    },
    {
        accessorKey: "destAddress",
        header: "To",
        cell: ({ row }) => {
            if (row.original.destType === "HUB") {
                return row.original.destHub?.name ?? "Hub";
            }
            return row.original.destAddress ?? "—";
        },
    },
    {
        accessorKey: "shipment.pricing.totalPrice",
        header: "Amount",
        cell: ({ row }) => row.original.shipment?.pricing ? `${row.original.shipment.pricing.totalPrice} BDT` : "—",
    },
    {
        accessorKey: "status",
        header: "Status",
        cell: ({ row }) => <StatusBadgeCell status={row.original.status} />,
    },
];

export default function AvailableLegs() {
    const searchParams = useSearchParams();
    const [viewLeg, setViewLeg] = useState<ShipmentLeg | null>(null);

    const { optimisticSortingState, optimisticPaginationState, isRouteRefreshPending, handleSortingChange, handlePaginationChange } =
        useServerManagedDataTable({ searchParams });

    const queryParams = {
        page: optimisticPaginationState.pageIndex + 1,
        limit: optimisticPaginationState.pageSize,
        ...(optimisticSortingState[0] && { sortBy: optimisticSortingState[0].id, sortOrder: optimisticSortingState[0].desc ? "desc" : "asc" }),
    };

    const { data, isLoading } = useGetAvailableLegs(queryParams);
    const { mutate: accept } = useAcceptLeg();

    const legs: ShipmentLeg[] = data?.data ?? [];
    const meta = data?.meta;

    const handleAccept = (id: string) => {
        accept(id, {
            onSuccess: () => toast.success("Leg accepted successfully!"),
            onError: (e: Error) => toast.error(e.message),
        });
    };

    const columnsWithAction: ColumnDef<ShipmentLeg>[] = [
        ...columns,
        {
            id: "accept",
            header: "Action",
            enableSorting: false,
            cell: ({ row }) => (
                <Button size="sm" onClick={() => handleAccept(row.original.id)}>
                    Accept
                </Button>
            ),
        },
    ];

    return (
        <div className="space-y-4">
            <div>
                <h1 className="text-2xl font-bold">Available Legs</h1>
                <p className="text-muted-foreground text-sm">Browse and accept delivery legs in your area.</p>
            </div>

            <DataTable
                data={legs}
                columns={columnsWithAction}
                isLoading={isLoading || isRouteRefreshPending}
                emptyMessage="No available legs."
                meta={meta}
                sorting={{ state: optimisticSortingState, onSortingChange: handleSortingChange }}
                pagination={{ state: optimisticPaginationState, onPaginationChange: handlePaginationChange }}
                actions={{ onView: setViewLeg }}
            />

            <Dialog open={!!viewLeg} onOpenChange={(o) => !o && setViewLeg(null)}>
                <DialogContent className="max-w-2xl">
                    <DialogHeader>
                        <DialogTitle>Leg Details — {viewLeg?.shipment?.trackingNumber}</DialogTitle>
                    </DialogHeader>
                    {viewLeg && (
                        <div className="space-y-4 pt-2">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground">Leg Type</p>
                                    <Badge variant="outline">{viewLeg.legType}</Badge>
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground">Leg Number</p>
                                    <p className="text-sm">Leg {viewLeg.legNumber}</p>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <p className="text-sm font-semibold">Origin</p>
                                <div className="text-sm space-y-1 pl-2">
                                    {viewLeg.originType === "HUB" ? (
                                        <>
                                            <p><span className="text-muted-foreground">Hub:</span> {viewLeg.originHub?.name}</p>
                                            <p><span className="text-muted-foreground">Address:</span> {viewLeg.originHub?.address}</p>
                                        </>
                                    ) : (
                                        <p><span className="text-muted-foreground">Address:</span> {viewLeg.originAddress}</p>
                                    )}
                                </div>
                            </div>

                            <div className="space-y-2">
                                <p className="text-sm font-semibold">Destination</p>
                                <div className="text-sm space-y-1 pl-2">
                                    {viewLeg.destType === "HUB" ? (
                                        <>
                                            <p><span className="text-muted-foreground">Hub:</span> {viewLeg.destHub?.name}</p>
                                            <p><span className="text-muted-foreground">Address:</span> {viewLeg.destHub?.address}</p>
                                        </>
                                    ) : (
                                        <p><span className="text-muted-foreground">Address:</span> {viewLeg.destAddress}</p>
                                    )}
                                </div>
                            </div>

                            {viewLeg.shipment && (
                                <>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <p className="text-sm font-medium text-muted-foreground">Package Type</p>
                                            <p className="text-sm">{viewLeg.shipment.packageType}</p>
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium text-muted-foreground">Weight</p>
                                            <p className="text-sm">{viewLeg.shipment.weight} kg</p>
                                        </div>
                                    </div>

                                    {viewLeg.shipment.pricing && (
                                        <div>
                                            <p className="text-sm font-medium text-muted-foreground">Total Shipment Amount</p>
                                            <p className="text-lg font-semibold">{viewLeg.shipment.pricing.totalPrice} BDT</p>
                                        </div>
                                    )}
                                </>
                            )}

                            <Button onClick={() => handleAccept(viewLeg.id)} className="w-full">
                                Accept This Leg
                            </Button>
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    );
}
