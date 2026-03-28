"use client";

import DataTable from "@/components/shared/table/DataTable";
import StatusBadgeCell from "@/components/shared/cell/StatusBadgeCell";
import { useServerManagedDataTable } from "@/hooks/useServerManagedDataTable";
import { useServerManagedDataTableSearch } from "@/hooks/useServerManagedDataTableSearch";
import { useServerManagedDataTableFilters, serverManagedFilter } from "@/hooks/useServerManagedDataTableFilters";
import { getMyShipments } from "@/services/shipment.services";
import { Shipment, ShipmentStatus } from "@/types/shipment.types";
import { ColumnDef } from "@tanstack/react-table";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useSearchParams } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Package, Clock, Truck, PackageCheck, X, Eye } from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { clientHttpClient } from "@/lib/axios/clientHttpClient";
import type { ApiResponse } from "@/types/api.types";
import { PrintLabel } from "@/components/shared/PrintLabel";

const STATUS_OPTIONS: ShipmentStatus[] = ["PENDING", "ASSIGNED", "PICKED_UP", "IN_TRANSIT", "OUT_FOR_DELIVERY", "DELIVERED", "CANCELLED", "FAILED", "RETURNED"];

const FILTER_DEFINITIONS = [
    serverManagedFilter.single("status"),
    serverManagedFilter.single("priority"),
];

interface MyShipmentsProps {
    title?: string;
    showStats?: boolean;
}

export default function MyShipments({ title = "My Shipments", showStats = true }: MyShipmentsProps) {
    const searchParams = useSearchParams();
    const queryClient = useQueryClient();
    const [cancelShipment, setCancelShipment] = useState<Shipment | null>(null);
    const [viewShipment, setViewShipment] = useState<Shipment | null>(null);
    const [cancelReason, setCancelReason] = useState("");

    const cancelMutation = useMutation({
        mutationFn: async ({ id, reason }: { id: string; reason?: string }) => {
            const res = await clientHttpClient.post<ApiResponse<Shipment>>(`/shipments/${id}/cancel`, { reason });
            return res.data;
        },
        onSuccess: () => {
            toast.success("Shipment cancelled successfully");
            queryClient.invalidateQueries({ queryKey: ["my-shipments"] });
            setCancelShipment(null);
            setCancelReason("");
        },
        onError: (error: unknown) => {
            const message = error instanceof Error && 'response' in error 
                ? (error as { response?: { data?: { message?: string } } }).response?.data?.message 
                : "Failed to cancel shipment";
            toast.error(message || "Failed to cancel shipment");
        },
    });

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
    };

    const { data, isLoading } = useQuery({
        queryKey: ["my-shipments", queryParams],
        queryFn: () => getMyShipments(queryParams),
    });

    const shipments: Shipment[] = useMemo(() => data?.data ?? [], [data?.data]);
    const meta = data?.meta;

    const stats = useMemo(() => {
        if (!showStats) return null;
        return {
            total: meta?.total || 0,
            pending: shipments.filter(s => s.status === "PENDING" || s.status === "ASSIGNED").length,
            inTransit: shipments.filter(s => s.status === "IN_TRANSIT" || s.status === "OUT_FOR_DELIVERY").length,
            delivered: shipments.filter(s => s.status === "DELIVERED").length,
        };
    }, [shipments, meta, showStats]);

    const columns: ColumnDef<Shipment>[] = useMemo(() => [
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
            accessorKey: "status",
            header: "Status",
            cell: ({ row }) => <StatusBadgeCell status={row.original.status} />,
        },
        {
            accessorKey: "pricing.totalPrice",
            header: "Amount",
            cell: ({ row }) => row.original.pricing ? `${row.original.pricing.totalPrice} BDT` : "—",
        },
        {
            id: "actions",
            header: "Actions",
            cell: ({ row }) => {
                const canCancel = row.original.status === "PENDING";
                return (
                    <div className="flex gap-1">
                        <Button size="sm" variant="ghost" onClick={() => setViewShipment(row.original)}>
                            <Eye className="h-4 w-4" />
                        </Button>
                        <PrintLabel shipment={row.original} />
                        {canCancel && (
                            <Button
                                size="sm"
                                variant="destructive"
                                onClick={() => setCancelShipment(row.original)}
                                disabled={cancelMutation.isPending}
                            >
                                <X className="h-4 w-4" />
                            </Button>
                        )}
                    </div>
                );
            },
        },
    ], [cancelMutation.isPending]);

    return (
        <div className="space-y-4">
            <div>
                <h1 className="text-2xl font-bold">{title}</h1>
                <p className="text-muted-foreground text-sm">Track and manage your shipments.</p>
            </div>

            {showStats && stats && (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                                <Package className="h-4 w-4" />
                                Total Shipments
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats.total}</div>
                            <p className="text-xs text-muted-foreground mt-1">All your shipments</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                                <Clock className="h-4 w-4" />
                                Pending
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-yellow-600">{stats.pending}</div>
                            <p className="text-xs text-muted-foreground mt-1">Awaiting pickup</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                                <Truck className="h-4 w-4" />
                                In Transit
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-blue-600">{stats.inTransit}</div>
                            <p className="text-xs text-muted-foreground mt-1">On the way</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                                <PackageCheck className="h-4 w-4" />
                                Delivered
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-green-600">{stats.delivered}</div>
                            <p className="text-xs text-muted-foreground mt-1">Successfully completed</p>
                        </CardContent>
                    </Card>
                </div>
            )}

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
                    ],
                    values: filterValues,
                    onFilterChange: handleFilterChange,
                    onClearAll: clearAllFilters,
                }}
                sorting={{ state: optimisticSortingState, onSortingChange: handleSortingChange }}
                pagination={{ state: optimisticPaginationState, onPaginationChange: handlePaginationChange }}
            />

            <Dialog open={!!viewShipment} onOpenChange={(o) => !o && setViewShipment(null)}>
                <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle className="flex items-center justify-between">
                            <span>Shipment Details</span>
                            {viewShipment && <Badge variant={viewShipment.priority === "EXPRESS" ? "default" : "secondary"}>{viewShipment.priority}</Badge>}
                        </DialogTitle>
                    </DialogHeader>
                    {viewShipment && (
                        <div className="space-y-4 pt-2">
                            <div className="bg-muted p-4 rounded-lg">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm text-muted-foreground">Tracking Number</p>
                                        <p className="text-2xl font-bold font-mono">{viewShipment.trackingNumber}</p>
                                    </div>
                                    <StatusBadgeCell status={viewShipment.status} />
                                </div>
                            </div>

                            <div className="grid md:grid-cols-2 gap-4">
                                <div>
                                    <p className="text-sm font-semibold mb-2">Pickup Details</p>
                                    <div className="bg-green-50 dark:bg-green-950/20 p-3 rounded space-y-1 text-sm">
                                        <p><span className="text-muted-foreground">Address:</span> {viewShipment.pickupAddress}</p>
                                        <p><span className="text-muted-foreground">City:</span> {viewShipment.pickupCity}</p>
                                        <p><span className="text-muted-foreground">Phone:</span> {viewShipment.pickupPhone}</p>
                                    </div>
                                </div>
                                <div>
                                    <p className="text-sm font-semibold mb-2">Delivery Details</p>
                                    <div className="bg-blue-50 dark:bg-blue-950/20 p-3 rounded space-y-1 text-sm">
                                        <p><span className="text-muted-foreground">Address:</span> {viewShipment.deliveryAddress}</p>
                                        <p><span className="text-muted-foreground">City:</span> {viewShipment.deliveryCity}</p>
                                        <p><span className="text-muted-foreground">Phone:</span> {viewShipment.deliveryPhone}</p>
                                    </div>
                                </div>
                            </div>

                            <div>
                                <p className="text-sm font-semibold mb-2">Package Information</p>
                                <div className="grid grid-cols-2 gap-4 text-sm">
                                    <div className="bg-muted/50 p-3 rounded">
                                        <p className="text-muted-foreground">Package Type</p>
                                        <p className="font-medium">{viewShipment.packageType}</p>
                                    </div>
                                    <div className="bg-muted/50 p-3 rounded">
                                        <p className="text-muted-foreground">Weight</p>
                                        <p className="font-medium">{viewShipment.weight} kg</p>
                                    </div>
                                </div>
                            </div>

                            {viewShipment.pricing && (
                                <div>
                                    <p className="text-sm font-semibold mb-2">Pricing</p>
                                    <div className="bg-muted/50 p-3 rounded space-y-1 text-sm">
                                        <div className="flex justify-between">
                                            <span className="text-muted-foreground">Base Price:</span>
                                            <span>{viewShipment.pricing.basePrice} BDT</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-muted-foreground">Weight Charge:</span>
                                            <span>{viewShipment.pricing.weightCharge} BDT</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-muted-foreground">Priority Charge:</span>
                                            <span>{viewShipment.pricing.priorityCharge} BDT</span>
                                        </div>
                                        <div className="flex justify-between pt-2 border-t font-semibold">
                                            <span>Total:</span>
                                            <span>{viewShipment.pricing.totalPrice} BDT</span>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {viewShipment.payment && (
                                <div>
                                    <p className="text-sm font-semibold mb-2">Payment</p>
                                    <div className="bg-muted/50 p-3 rounded space-y-1 text-sm">
                                        <div className="flex justify-between">
                                            <span className="text-muted-foreground">Method:</span>
                                            <Badge variant="outline">{viewShipment.payment.method}</Badge>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-muted-foreground">Status:</span>
                                            <Badge variant={viewShipment.payment.status === "PAID" ? "default" : "secondary"}>{viewShipment.payment.status}</Badge>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {viewShipment.note && (
                                <div>
                                    <p className="text-sm font-semibold mb-2">Special Instructions</p>
                                    <div className="bg-yellow-50 dark:bg-yellow-950/20 p-3 rounded text-sm">{viewShipment.note}</div>
                                </div>
                            )}

                            <div className="flex gap-2 pt-4">
                                <PrintLabel shipment={viewShipment} size="default" variant="default" />
                                <Button variant="outline" onClick={() => setViewShipment(null)} className="flex-1">Close</Button>
                            </div>
                        </div>
                    )}
                </DialogContent>
            </Dialog>

            <Dialog open={!!cancelShipment} onOpenChange={(open) => !open && setCancelShipment(null)}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Cancel Shipment</DialogTitle>
                        <DialogDescription>
                            Are you sure you want to cancel shipment <strong>{cancelShipment?.trackingNumber}</strong>?
                            This action cannot be undone.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label htmlFor="reason">Reason (optional)</Label>
                            <Textarea
                                id="reason"
                                value={cancelReason}
                                onChange={(e) => setCancelReason(e.target.value)}
                                placeholder="Why are you cancelling this shipment?"
                                rows={3}
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setCancelShipment(null)} disabled={cancelMutation.isPending}>
                            Keep Shipment
                        </Button>
                        <Button
                            variant="destructive"
                            onClick={() => cancelShipment && cancelMutation.mutate({ id: cancelShipment.id, reason: cancelReason })}
                            disabled={cancelMutation.isPending}
                        >
                            {cancelMutation.isPending ? "Cancelling..." : "Cancel Shipment"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
