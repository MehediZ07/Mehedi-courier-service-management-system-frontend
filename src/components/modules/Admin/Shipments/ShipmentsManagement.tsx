"use client";

import DataTable from "@/components/shared/table/DataTable";
import StatusBadgeCell from "@/components/shared/cell/StatusBadgeCell";
import { useServerManagedDataTable } from "@/hooks/useServerManagedDataTable";
import { useServerManagedDataTableSearch } from "@/hooks/useServerManagedDataTableSearch";
import { useServerManagedDataTableFilters, serverManagedFilter } from "@/hooks/useServerManagedDataTableFilters";
import { getAllShipments } from "@/services/shipment.services";
import { Shipment, ShipmentStatus } from "@/types/shipment.types";
import { ColumnDef } from "@tanstack/react-table";
import { useQuery } from "@tanstack/react-query";
import { useSearchParams } from "next/navigation";

import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useMemo, useState } from "react";
import { getHubCities } from "@/services/hub.services";
import { PrintLabel } from "@/components/shared/PrintLabel";

const STATUS_OPTIONS: ShipmentStatus[] = ["PENDING", "ASSIGNED", "PICKED_UP", "IN_TRANSIT", "OUT_FOR_DELIVERY", "DELIVERED", "FAILED", "RETURNED"];

const FILTER_DEFINITIONS = [
    serverManagedFilter.single("status"),
    serverManagedFilter.single("priority"),
    serverManagedFilter.single("paymentStatus"),
    serverManagedFilter.single("pickupCity"),
    serverManagedFilter.single("deliveryCity"),
];

const columns: ColumnDef<Shipment>[] = [
    { accessorKey: "trackingNumber", header: "Tracking #" },
    { accessorKey: "sender.name", header: "Sender", cell: ({ row }) => row.original.sender?.name ?? "—", enableSorting: false },
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
        enableSorting: false,
    },
];

export default function ShipmentsManagement() {
    const searchParams = useSearchParams();
    const [viewShipment, setViewShipment] = useState<Shipment | null>(null);

    const { data: hubCitiesData } = useQuery({
        queryKey: ["hub-cities"],
        queryFn: async () => {
            const res = await getHubCities();
            return res.data;
        },
    });

    const hubCities = hubCitiesData || [];

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
        ...(filterValues.pickupCity && { pickupCity: filterValues.pickupCity }),
        ...(filterValues.deliveryCity && { deliveryCity: filterValues.deliveryCity }),
    };

    const { data, isLoading } = useQuery({
        queryKey: ["shipments-admin", queryParams],
        queryFn: () => getAllShipments(queryParams),
    });

    const shipments: Shipment[] = data?.data ?? [];
    const meta = data?.meta;

    return (
        <div className="space-y-4">
            <div>
                <h1 className="text-2xl font-bold">Shipments Management</h1>
                <p className="text-muted-foreground text-sm">View all shipments.</p>
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
                        { id: "pickupCity", label: "Pickup Hub", type: "single-select", options: hubCities.map((city) => ({ label: city, value: city })) },
                        { id: "deliveryCity", label: "Delivery Hub", type: "single-select", options: hubCities.map((city) => ({ label: city, value: city })) },
                    ],
                    values: filterValues,
                    onFilterChange: handleFilterChange,
                    onClearAll: clearAllFilters,
                }}
                sorting={{ state: optimisticSortingState, onSortingChange: handleSortingChange }}
                pagination={{ state: optimisticPaginationState, onPaginationChange: handlePaginationChange }}
                actions={{ 
                    onView: setViewShipment
                }}
            />

            <Dialog open={!!viewShipment} onOpenChange={(o) => !o && setViewShipment(null)}>
                <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle className="text-xl">Shipment Details</DialogTitle>
                    </DialogHeader>
                    {viewShipment && (
                        <div className="space-y-6 pt-2">
                            {/* Tracking & Status */}
                            <div className="bg-muted p-4 rounded-lg">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm text-muted-foreground">Tracking Number</p>
                                        <p className="text-2xl font-bold font-mono">{viewShipment.trackingNumber}</p>
                                    </div>
                                    <div className="text-right">
                                        <StatusBadgeCell status={viewShipment.status} />
                                        <Badge variant={viewShipment.priority === "EXPRESS" ? "default" : "secondary"} className="mt-2">
                                            {viewShipment.priority}
                                        </Badge>
                                    </div>
                                </div>
                            </div>

                            {/* Sender Info */}
                            {viewShipment.sender && (
                                <div>
                                    <p className="text-sm font-semibold mb-2">Sender Information</p>
                                    <div className="bg-muted/50 p-3 rounded space-y-1 text-sm">
                                        <p><span className="text-muted-foreground">Name:</span> {viewShipment.sender.name}</p>
                                        <p><span className="text-muted-foreground">Email:</span> {viewShipment.sender.email}</p>
                                        {viewShipment.sender.phone && <p><span className="text-muted-foreground">Phone:</span> {viewShipment.sender.phone}</p>}
                                    </div>
                                </div>
                            )}

                            {/* Pickup & Delivery */}
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

                            {/* Package Info */}
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

                            {/* Pricing */}
                            {viewShipment.pricing && (
                                <div>
                                    <p className="text-sm font-semibold mb-2">Pricing Breakdown</p>
                                    <div className="bg-muted/50 p-4 rounded space-y-2 text-sm">
                                        <div className="flex justify-between">
                                            <span className="text-muted-foreground">Region Type:</span>
                                            <Badge variant="outline">{viewShipment.pricing.regionType}</Badge>
                                        </div>
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
                                        <div className="flex justify-between pt-2 border-t font-semibold text-base">
                                            <span>Total:</span>
                                            <span>{viewShipment.pricing.totalPrice} BDT</span>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Payment Info */}
                            {viewShipment.payment && (
                                <div>
                                    <p className="text-sm font-semibold mb-2">Payment Information</p>
                                    <div className="bg-muted/50 p-3 rounded space-y-1 text-sm">
                                        <div className="flex justify-between">
                                            <span className="text-muted-foreground">Method:</span>
                                            <Badge variant="outline">{viewShipment.payment.method}</Badge>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-muted-foreground">Status:</span>
                                            <Badge variant={viewShipment.payment.status === "PAID" ? "default" : "secondary"}>
                                                {viewShipment.payment.status}
                                            </Badge>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-muted-foreground">Amount:</span>
                                            <span className="font-medium">{viewShipment.payment.amount} BDT</span>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Courier Info */}
                            {viewShipment.courier && (
                                <div>
                                    <p className="text-sm font-semibold mb-2">Assigned Courier</p>
                                    <div className="bg-muted/50 p-3 rounded space-y-1 text-sm">
                                        <p><span className="text-muted-foreground">Name:</span> {viewShipment.courier.user?.name}</p>
                                        <p><span className="text-muted-foreground">Phone:</span> {viewShipment.courier.user?.phone}</p>
                                        <p><span className="text-muted-foreground">Vehicle:</span> {viewShipment.courier.vehicleType}</p>
                                    </div>
                                </div>
                            )}

                            {/* Notes */}
                            {viewShipment.note && (
                                <div>
                                    <p className="text-sm font-semibold mb-2">Special Instructions</p>
                                    <div className="bg-yellow-50 dark:bg-yellow-950/20 p-3 rounded text-sm">
                                        {viewShipment.note}
                                    </div>
                                </div>
                            )}

                            {/* Timestamps */}
                            <div>
                                <p className="text-sm font-semibold mb-2">Timeline</p>
                                <div className="bg-muted/50 p-3 rounded space-y-1 text-xs text-muted-foreground">
                                    <p>Created: {new Date(viewShipment.createdAt).toLocaleString()}</p>
                                    <p>Last Updated: {new Date(viewShipment.updatedAt).toLocaleString()}</p>
                                </div>
                            </div>

                            <div className="flex gap-2 pt-4">
                                <PrintLabel shipment={viewShipment} size="default" variant="default" />
                                <Button variant="outline" onClick={() => setViewShipment(null)} className="flex-1">Close</Button>
                            </div>
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    );
}
