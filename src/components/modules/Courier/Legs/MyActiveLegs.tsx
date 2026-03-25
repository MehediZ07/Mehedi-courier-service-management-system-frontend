"use client";

import DataTable from "@/components/shared/table/DataTable";
import StatusBadgeCell from "@/components/shared/cell/StatusBadgeCell";
import { useServerManagedDataTable } from "@/hooks/useServerManagedDataTable";
import { useGetMyCourierLegs, useMarkLegPickedUp, useMarkLegDelivered } from "@/hooks/useShipmentLegs";
import { ShipmentLeg } from "@/types/shipmentLeg.types";
import { ColumnDef } from "@tanstack/react-table";
import { useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useState } from "react";

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

export default function MyActiveLegs() {
    const searchParams = useSearchParams();
    const [selectedLeg, setSelectedLeg] = useState<ShipmentLeg | null>(null);
    const [note, setNote] = useState("");

    const { optimisticSortingState, optimisticPaginationState, isRouteRefreshPending, handleSortingChange, handlePaginationChange } =
        useServerManagedDataTable({ searchParams });

    const queryParams = {
        page: optimisticPaginationState.pageIndex + 1,
        limit: optimisticPaginationState.pageSize,
        ...(optimisticSortingState[0] && { sortBy: optimisticSortingState[0].id, sortOrder: optimisticSortingState[0].desc ? "desc" : "asc" }),
    };

    const { data, isLoading } = useGetMyCourierLegs(queryParams);
    const { mutate: markPickedUp } = useMarkLegPickedUp();
    const { mutate: markDelivered, isPending: isDelivering } = useMarkLegDelivered();

    const legs: ShipmentLeg[] = data?.data ?? [];
    const meta = data?.meta;

    const handlePickup = (id: string) => {
        markPickedUp(id, {
            onSuccess: () => toast.success("Marked as picked up"),
            onError: (e: Error) => toast.error(e.message),
        });
    };

    const handleDeliver = () => {
        if (!selectedLeg) return;
        const payload = note ? { note } : undefined;
        markDelivered(
            { id: selectedLeg.id, payload },
            {
                onSuccess: () => {
                    toast.success("Leg completed successfully");
                    setSelectedLeg(null);
                    setNote("");
                },
                onError: (e: Error) => toast.error(e.message),
            }
        );
    };

    const columnsWithAction: ColumnDef<ShipmentLeg>[] = [
        ...columns,
        {
            id: "actions",
            header: "Actions",
            enableSorting: false,
            cell: ({ row }) => {
                const leg = row.original;
                if (leg.status === "ASSIGNED") {
                    return (
                        <Button size="sm" onClick={() => handlePickup(leg.id)}>
                            Mark Picked Up
                        </Button>
                    );
                }
                if (leg.status === "IN_PROGRESS") {
                    return (
                        <Button size="sm" onClick={() => setSelectedLeg(leg)}>
                            Mark Delivered
                        </Button>
                    );
                }
                return <span className="text-muted-foreground text-sm">—</span>;
            },
        },
    ];

    return (
        <div className="space-y-4">
            <div>
                <h1 className="text-2xl font-bold">My Active Legs</h1>
                <p className="text-muted-foreground text-sm">Manage your assigned delivery legs.</p>
            </div>

            <DataTable
                data={legs}
                columns={columnsWithAction}
                isLoading={isLoading || isRouteRefreshPending}
                emptyMessage="No active legs."
                meta={meta}
                sorting={{ state: optimisticSortingState, onSortingChange: handleSortingChange }}
                pagination={{ state: optimisticPaginationState, onPaginationChange: handlePaginationChange }}
            />

            <Dialog open={!!selectedLeg} onOpenChange={(open) => !open && setSelectedLeg(null)}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Complete Leg Delivery</DialogTitle>
                    </DialogHeader>
                    {selectedLeg && (
                        <div className="space-y-4 pt-2">
                            <div className="text-sm space-y-1">
                                <p><strong>Tracking:</strong> {selectedLeg.shipment?.trackingNumber}</p>
                                <p><strong>Type:</strong> {selectedLeg.legType}</p>
                            </div>
                            <div className="space-y-1.5">
                                <Label>Note (optional)</Label>
                                <Textarea
                                    value={note}
                                    onChange={(e) => setNote(e.target.value)}
                                    placeholder="Delivered successfully..."
                                    rows={3}
                                />
                            </div>
                            <Button onClick={handleDeliver} disabled={isDelivering} className="w-full">
                                {isDelivering ? "Completing..." : "Complete Delivery"}
                            </Button>
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    );
}
