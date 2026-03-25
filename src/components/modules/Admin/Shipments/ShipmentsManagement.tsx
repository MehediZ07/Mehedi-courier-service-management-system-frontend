"use client";

import DataTable from "@/components/shared/table/DataTable";
import StatusBadgeCell from "@/components/shared/cell/StatusBadgeCell";
import { useServerManagedDataTable } from "@/hooks/useServerManagedDataTable";
import { useServerManagedDataTableSearch } from "@/hooks/useServerManagedDataTableSearch";
import { useServerManagedDataTableFilters, serverManagedFilter } from "@/hooks/useServerManagedDataTableFilters";
import { getAllShipments, assignCourier } from "@/services/shipment.services";
import { getAllCouriers } from "@/services/courier.services";
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

const STATUS_OPTIONS: ShipmentStatus[] = ["PENDING", "ASSIGNED", "PICKED_UP", "IN_TRANSIT", "OUT_FOR_DELIVERY", "DELIVERED", "FAILED", "RETURNED"];

const FILTER_DEFINITIONS = [
    serverManagedFilter.single("status"),
    serverManagedFilter.single("priority"),
    serverManagedFilter.single("paymentStatus"),
];

const columns: ColumnDef<Shipment>[] = [
    { accessorKey: "trackingNumber", header: "Tracking #" },
    { accessorKey: "sender.name", header: "Sender", cell: ({ row }) => row.original.sender?.name ?? "—" },
    { accessorKey: "pickupCity", header: "From" },
    { accessorKey: "deliveryCity", header: "To" },
    { accessorKey: "weight", header: "Weight (kg)" },
    {
        accessorKey: "status",
        header: "Status",
        cell: ({ row }) => <StatusBadgeCell status={row.original.status} />,
    },
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
        header: "Amount",
        cell: ({ row }) => row.original.pricing ? `${row.original.pricing.totalPrice} BDT` : "—",
    },
];

export default function ShipmentsManagement() {
    const searchParams = useSearchParams();
    const queryClient = useQueryClient();
    const [selected, setSelected] = useState<Shipment | null>(null);
    const [viewShipment, setViewShipment] = useState<Shipment | null>(null);
    const [courierId, setCourierId] = useState("");

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
        ...(filterValues.status && { status: filterValues.status }),
        ...(filterValues.priority && { priority: filterValues.priority }),
        ...(filterValues.paymentStatus && { paymentStatus: filterValues.paymentStatus }),
    };

    const { data, isLoading } = useQuery({
        queryKey: ["shipments-admin", queryParams],
        queryFn: () => getAllShipments(queryParams),
    });

    const { data: couriersData } = useQuery({
        queryKey: ["couriers-available"],
        queryFn: () => getAllCouriers({ availability: true, limit: 100 }),
    });

    const { mutate: assign, isPending } = useMutation({
        mutationFn: ({ id, courierId }: { id: string; courierId: string }) => assignCourier(id, { courierId }),
        onSuccess: () => { toast.success("Courier assigned"); queryClient.invalidateQueries({ queryKey: ["shipments-admin"] }); setSelected(null); },
        onError: (e: Error) => toast.error(e.message),
    });

    const shipments: Shipment[] = data?.data ?? [];
    const meta = data?.meta;
    const couriers = couriersData?.data ?? [];

    const openAssign = (s: Shipment) => { setSelected(s); setCourierId(""); };

    return (
        <div className="space-y-4">
            <div>
                <h1 className="text-2xl font-bold">Shipments Management</h1>
                <p className="text-muted-foreground text-sm">View all shipments and assign couriers.</p>
            </div>

            <DataTable
                data={shipments}
                columns={columns}
                isLoading={isLoading || isRouteRefreshPending}
                emptyMessage="No shipments found."
                meta={meta}
                search={{ initialValue: searchTermFromUrl, placeholder: "Search by tracking number...", onDebouncedChange: handleDebouncedSearchChange }}
                filters={{
                    configs: [
                        { id: "status", label: "Status", type: "single-select", options: STATUS_OPTIONS.map((s) => ({ label: s, value: s })) },
                        { id: "priority", label: "Priority", type: "single-select", options: [{ label: "STANDARD", value: "STANDARD" }, { label: "EXPRESS", value: "EXPRESS" }] },
                        { id: "paymentStatus", label: "Payment", type: "single-select", options: ["PENDING", "PAID", "COD", "FAILED"].map((s) => ({ label: s, value: s })) },
                    ],
                    values: filterValues,
                    onFilterChange: handleFilterChange,
                    onClearAll: clearAllFilters,
                }}
                sorting={{ state: optimisticSortingState, onSortingChange: handleSortingChange }}
                pagination={{ state: optimisticPaginationState, onPaginationChange: handlePaginationChange }}
                actions={{ 
                    onEdit: openAssign,
                    canEdit: (s) => s.status === "PENDING",
                    onView: setViewShipment
                }}
            />

            <Dialog open={!!selected} onOpenChange={(o) => !o && setSelected(null)}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Assign Courier — {selected?.trackingNumber}</DialogTitle>
                    </DialogHeader>
                    {selected && (
                        <div className="space-y-4 pt-2">
                            <div className="text-sm text-muted-foreground space-y-1">
                                <p>From: <span className="text-foreground">{selected.pickupCity}</span></p>
                                <p>To: <span className="text-foreground">{selected.deliveryCity}</span></p>
                                <p>Status: <span className="text-foreground">{selected.status}</span></p>
                            </div>
                            <div className="space-y-1.5">
                                <Label>Select Courier</Label>
                                <Select value={courierId} onValueChange={setCourierId}>
                                    <SelectTrigger><SelectValue placeholder="Choose a courier..." /></SelectTrigger>
                                    <SelectContent>
                                        {couriers.map((c) => (
                                            <SelectItem key={c.id} value={c.id}>{c.user?.name ?? c.id} - {c.vehicleType}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <Button
                                disabled={!courierId || isPending}
                                onClick={() => assign({ id: selected.id, courierId })}
                                className="w-full"
                            >
                                {isPending ? "Assigning..." : "Assign Courier"}
                            </Button>
                        </div>
                    )}
                </DialogContent>
            </Dialog>

            <Dialog open={!!viewShipment} onOpenChange={(o) => !o && setViewShipment(null)}>
                <DialogContent className="max-w-2xl">
                    <DialogHeader>
                        <DialogTitle>Shipment Details — {viewShipment?.trackingNumber}</DialogTitle>
                    </DialogHeader>
                    {viewShipment && (
                        <div className="space-y-4 pt-2">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground">Status</p>
                                    <StatusBadgeCell status={viewShipment.status} />
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground">Priority</p>
                                    <Badge variant={viewShipment.priority === "EXPRESS" ? "default" : "secondary"}>
                                        {viewShipment.priority}
                                    </Badge>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <p className="text-sm font-semibold">Pickup Details</p>
                                <div className="text-sm space-y-1 pl-2">
                                    <p><span className="text-muted-foreground">Address:</span> {viewShipment.pickupAddress}</p>
                                    <p><span className="text-muted-foreground">City:</span> {viewShipment.pickupCity}</p>
                                    <p><span className="text-muted-foreground">Phone:</span> {viewShipment.pickupPhone}</p>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <p className="text-sm font-semibold">Delivery Details</p>
                                <div className="text-sm space-y-1 pl-2">
                                    <p><span className="text-muted-foreground">Address:</span> {viewShipment.deliveryAddress}</p>
                                    <p><span className="text-muted-foreground">City:</span> {viewShipment.deliveryCity}</p>
                                    <p><span className="text-muted-foreground">Phone:</span> {viewShipment.deliveryPhone}</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground">Package Type</p>
                                    <p className="text-sm">{viewShipment.packageType}</p>
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground">Weight</p>
                                    <p className="text-sm">{viewShipment.weight} kg</p>
                                </div>
                            </div>

                            {viewShipment.note && (
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground">Notes</p>
                                    <p className="text-sm">{viewShipment.note}</p>
                                </div>
                            )}

                            {viewShipment.courier && (
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground">Assigned Courier</p>
                                    <p className="text-sm">{viewShipment.courier.user?.name} - {viewShipment.courier.user?.phone}</p>
                                </div>
                            )}

                            {viewShipment.pricing && (
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground">Pricing</p>
                                    <div className="text-sm space-y-1 pl-2">
                                        <p>Base: {viewShipment.pricing.basePrice} BDT</p>
                                        <p>Weight Charge: {viewShipment.pricing.weightCharge} BDT</p>
                                        <p>Priority Charge: {viewShipment.pricing.priorityCharge} BDT</p>
                                        <p className="font-semibold">Total: {viewShipment.pricing.totalPrice} BDT</p>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    );
}
