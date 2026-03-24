"use client";

import DataTable from "@/components/shared/table/DataTable";
import StatusBadgeCell from "@/components/shared/cell/StatusBadgeCell";
import { useServerManagedDataTable } from "@/hooks/useServerManagedDataTable";
import { useServerManagedDataTableFilters, serverManagedFilter } from "@/hooks/useServerManagedDataTableFilters";
import { getAssignedShipments, updateShipmentStatus } from "@/services/shipment.services";
import { Shipment, ShipmentStatus } from "@/types/shipment.types";
import { ColumnDef } from "@tanstack/react-table";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useState, useMemo } from "react";

const COURIER_STATUS_OPTIONS: ShipmentStatus[] = ["PICKED_UP", "IN_TRANSIT", "OUT_FOR_DELIVERY", "DELIVERED", "FAILED", "RETURNED"];

const FILTER_DEFINITIONS = [serverManagedFilter.single("status")];

const columns: ColumnDef<Shipment>[] = [
    { accessorKey: "trackingNumber", header: "Tracking #" },
    { accessorKey: "pickupCity", header: "From" },
    { accessorKey: "deliveryCity", header: "To" },
    { accessorKey: "weight", header: "Weight (kg)" },
    {
        accessorKey: "priority",
        header: "Priority",
        cell: ({ row }) => <Badge variant={row.original.priority === "EXPRESS" ? "default" : "secondary"}>{row.original.priority}</Badge>,
    },
    {
        accessorKey: "status",
        header: "Status",
        cell: ({ row }) => <StatusBadgeCell status={row.original.status} />,
    },
];

export default function MyDeliveries() {
    const searchParams = useSearchParams();
    const queryClient = useQueryClient();
    const [selected, setSelected] = useState<Shipment | null>(null);
    const [newStatus, setNewStatus] = useState<ShipmentStatus>("PICKED_UP");
    const [note, setNote] = useState("");

    const { optimisticSortingState, optimisticPaginationState, isRouteRefreshPending, updateParams, handleSortingChange, handlePaginationChange } =
        useServerManagedDataTable({ searchParams });

    const filterDefs = useMemo(() => FILTER_DEFINITIONS, []);
    const { filterValues, handleFilterChange, clearAllFilters } = useServerManagedDataTableFilters({ searchParams, definitions: filterDefs, updateParams });

    const queryParams = {
        page: optimisticPaginationState.pageIndex + 1,
        limit: optimisticPaginationState.pageSize,
        ...(optimisticSortingState[0] && { sortBy: optimisticSortingState[0].id, sortOrder: optimisticSortingState[0].desc ? "desc" : "asc" }),
        ...(filterValues.status && { status: filterValues.status }),
    };

    const { data, isLoading } = useQuery({
        queryKey: ["my-deliveries", queryParams],
        queryFn: () => getAssignedShipments(queryParams),
    });

    const { mutate: updateStatus, isPending } = useMutation({
        mutationFn: ({ id, status, note }: { id: string; status: ShipmentStatus; note?: string }) =>
            updateShipmentStatus(id, { status, note }),
        onSuccess: () => { toast.success("Status updated"); queryClient.invalidateQueries({ queryKey: ["my-deliveries"] }); setSelected(null); },
        onError: (e: Error) => toast.error(e.message),
    });

    const shipments: Shipment[] = data?.data ?? [];
    const meta = data?.meta;

    const openUpdate = (s: Shipment) => { setSelected(s); setNewStatus("PICKED_UP"); setNote(""); };

    return (
        <div className="space-y-4">
            <div>
                <h1 className="text-2xl font-bold">My Deliveries</h1>
                <p className="text-muted-foreground text-sm">Track and update your assigned shipments.</p>
            </div>

            <DataTable
                data={shipments}
                columns={columns}
                isLoading={isLoading || isRouteRefreshPending}
                emptyMessage="No deliveries assigned."
                meta={meta}
                filters={{
                    configs: [{ id: "status", label: "Status", type: "single-select", options: COURIER_STATUS_OPTIONS.map((s) => ({ label: s, value: s })) }],
                    values: filterValues,
                    onFilterChange: handleFilterChange,
                    onClearAll: clearAllFilters,
                }}
                sorting={{ state: optimisticSortingState, onSortingChange: handleSortingChange }}
                pagination={{ state: optimisticPaginationState, onPaginationChange: handlePaginationChange }}
                actions={{ onEdit: openUpdate }}
            />

            <Dialog open={!!selected} onOpenChange={(o) => !o && setSelected(null)}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Update Status — {selected?.trackingNumber}</DialogTitle>
                    </DialogHeader>
                    {selected && (
                        <div className="space-y-4 pt-2">
                            <div className="space-y-1.5">
                                <Label>New Status</Label>
                                <Select value={newStatus} onValueChange={(v) => setNewStatus(v as ShipmentStatus)}>
                                    <SelectTrigger><SelectValue /></SelectTrigger>
                                    <SelectContent>
                                        {COURIER_STATUS_OPTIONS.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-1.5">
                                <Label>Note (optional)</Label>
                                <input
                                    className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                                    value={note}
                                    onChange={(e) => setNote(e.target.value)}
                                    placeholder="e.g. Delivered to recipient"
                                />
                            </div>
                            <Button
                                disabled={isPending}
                                onClick={() => updateStatus({ id: selected.id, status: newStatus, note: note || undefined })}
                                className="w-full"
                            >
                                {isPending ? "Updating..." : "Update Status"}
                            </Button>
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    );
}
