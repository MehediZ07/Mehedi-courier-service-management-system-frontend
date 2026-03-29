"use client";

import DataTable from "@/components/shared/table/DataTable";
import StatusBadgeCell from "@/components/shared/cell/StatusBadgeCell";
import { useServerManagedDataTable } from "@/hooks/useServerManagedDataTable";
import { useServerManagedDataTableSearch } from "@/hooks/useServerManagedDataTableSearch";
import { useServerManagedDataTableFilters, serverManagedFilter } from "@/hooks/useServerManagedDataTableFilters";
import { useGetAllLegs, useAssignCourierToLeg } from "@/hooks/useShipmentLegs";
import { getAllCouriers } from "@/services/courier.services";
import { ShipmentLeg, LegStatus, LegType } from "@/types/shipmentLeg.types";
import { ColumnDef } from "@tanstack/react-table";
import { useQuery } from "@tanstack/react-query";
import { useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { LegSticker } from "@/components/shared/LegSticker";
import { useMemo, useState } from "react";
import { getHubCities } from "@/services/hub.services";

const LEG_STATUS_OPTIONS: LegStatus[] = ["PENDING", "ASSIGNED", "IN_PROGRESS", "COMPLETED", "FAILED"];
const LEG_TYPE_OPTIONS: LegType[] = ["PICKUP", "HUB_TRANSFER", "DELIVERY"];

const FILTER_DEFINITIONS = [
    serverManagedFilter.single("status"),
    serverManagedFilter.single("legType"),
    serverManagedFilter.single("originCity"),
    serverManagedFilter.single("destCity"),
];

const columns: ColumnDef<ShipmentLeg>[] = [
    {
        accessorKey: "shipment.trackingNumber",
        header: "Tracking #",
        cell: ({ row }) => row.original.shipment?.trackingNumber ?? "—",
        enableSorting: false,
    },
    {
        accessorKey: "legNumber",
        header: "Leg",
        cell: ({ row }) => `Leg ${row.original.legNumber}`
    },
    {
        accessorKey: "legType",
        header: "Type",
        cell: ({ row }) => (
            <Badge variant={row.original.legType === "HUB_TRANSFER" ? "outline" : "secondary"}>
                {row.original.legType}
            </Badge>
        ),
    },
    {
        accessorKey: "origin",
        header: "From",
        cell: ({ row }) => {
            const leg = row.original;
            if (leg.originType === "HUB") return leg.originHub?.name ?? "Hub";
            return leg.originAddress ?? "—";
        },
        enableSorting: false,
    },
    {
        accessorKey: "destination",
        header: "To",
        cell: ({ row }) => {
            const leg = row.original;
            if (leg.destType === "HUB") return leg.destHub?.name ?? "Hub";
            return leg.destAddress ?? "—";
        },
        enableSorting: false,
    },
    {
        accessorKey: "status",
        header: "Status",
        cell: ({ row }) => <StatusBadgeCell status={row.original.status} />,
    },
    {
        accessorKey: "courier.user.name",
        header: "Courier",
        cell: ({ row }) => row.original.courier?.user?.name ?? "Unassigned",
        enableSorting: false,
    },
];

export default function LegsManagement() {
    const searchParams = useSearchParams();
    const [selectedLeg, setSelectedLeg] = useState<ShipmentLeg | null>(null);
    const [viewLeg, setViewLeg] = useState<ShipmentLeg | null>(null);
    const [courierId, setCourierId] = useState("");

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
        ...(filterValues.legType && { legType: filterValues.legType }),
        ...(filterValues.originCity && { originCity: filterValues.originCity }),
        ...(filterValues.destCity && { destCity: filterValues.destCity }),
    };

    const { data, isLoading } = useGetAllLegs(queryParams);

    const { data: couriersData } = useQuery({
        queryKey: ["couriers-available"],
        queryFn: () => getAllCouriers({ availability: true, limit: 100 }),
    });

    const assignMutation = useAssignCourierToLeg();

    const assignCourier = (legId: string, courierId: string) => {
        assignMutation.mutate({ legId, courierId }, {
            onSuccess: () => {
                toast.success("Courier assigned to leg");
                setSelectedLeg(null);
            },
            onError: (e: Error) => toast.error(e.message),
        });
    };

    const legs: ShipmentLeg[] = data?.data ?? [];
    const meta = data?.meta;
    const couriers = couriersData?.data ?? [];

    const openAssign = (leg: ShipmentLeg) => {
        if (leg.legType === "HUB_TRANSFER") {
            toast.info("Hub transfers are managed separately");
            return;
        }
        setSelectedLeg(leg);
        setCourierId("");
    };

    const getMatchingCouriers = () => {
        if (!selectedLeg) return [];
        const legCity = selectedLeg.legType === "PICKUP"
            ? selectedLeg.shipment?.pickupCity
            : selectedLeg.shipment?.deliveryCity;
        return couriers.filter(c => c.city === legCity);
    };

    const matchingCouriers = getMatchingCouriers();

    return (
        <div className="space-y-4">
            <div>
                <h1 className="text-2xl font-bold">Legs Management</h1>
                <p className="text-muted-foreground text-sm">View and assign couriers to shipment legs.</p>
            </div>

            <DataTable
                data={legs}
                columns={columns}
                isLoading={isLoading || isRouteRefreshPending}
                emptyMessage="No legs found."
                meta={meta}
                search={{ initialValue: searchTermFromUrl, placeholder: "Search by tracking number...", onDebouncedChange: handleDebouncedSearchChange }}
                filters={{
                    configs: [
                        { id: "status", label: "Status", type: "single-select", options: LEG_STATUS_OPTIONS.map((s) => ({ label: s, value: s })) },
                        { id: "legType", label: "Type", type: "single-select", options: LEG_TYPE_OPTIONS.map((t) => ({ label: t, value: t })) },
                        { id: "originCity", label: "Origin Hub", type: "single-select", options: hubCities.map((city) => ({ label: city, value: city })) },
                        { id: "destCity", label: "Destination Hub", type: "single-select", options: hubCities.map((city) => ({ label: city, value: city })) },
                    ],
                    values: filterValues,
                    onFilterChange: handleFilterChange,
                    onClearAll: clearAllFilters,
                }}
                sorting={{ state: optimisticSortingState, onSortingChange: handleSortingChange }}
                pagination={{ state: optimisticPaginationState, onPaginationChange: handlePaginationChange }}
                actions={{
                    onEdit: openAssign,
                    canEdit: (leg) => leg.legType !== "HUB_TRANSFER" && leg.status === "PENDING",
                    onView: setViewLeg,
                }}
            />

            <Dialog open={!!selectedLeg} onOpenChange={(o) => !o && setSelectedLeg(null)}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle className="flex items-center justify-between">
                            <span>Assign Courier — {selectedLeg?.shipment?.trackingNumber} (Leg {selectedLeg?.legNumber})</span>
                            {selectedLeg && <LegSticker leg={selectedLeg} />}
                        </DialogTitle>
                    </DialogHeader>
                    {selectedLeg && (
                        <div className="space-y-4 pt-2">
                            <div className="text-sm text-muted-foreground space-y-1">
                                <p>Type: <span className="text-foreground">{selectedLeg.legType}</span></p>
                                <p>From: <span className="text-foreground">
                                    {selectedLeg.originType === "HUB" ? selectedLeg.originHub?.name : selectedLeg.originAddress}
                                </span></p>
                                <p>To: <span className="text-foreground">
                                    {selectedLeg.destType === "HUB" ? selectedLeg.destHub?.name : selectedLeg.destAddress}
                                </span></p>
                                <p>Status: <span className="text-foreground">{selectedLeg.status}</span></p>
                            </div>
                            <div className="space-y-1.5">
                                <Label>Select Courier (City Match Only)</Label>
                                <Select value={courierId} onValueChange={setCourierId}>
                                    <SelectTrigger><SelectValue placeholder="Choose a courier..." /></SelectTrigger>
                                    <SelectContent>
                                        {matchingCouriers.length === 0 ? (
                                            <div className="p-2 text-sm text-muted-foreground">No couriers available in this city</div>
                                        ) : (
                                            matchingCouriers.map((c) => (
                                                <SelectItem key={c.id} value={c.id}>
                                                    {c.user?.name ?? c.id} - {c.vehicleType} ({c.city})
                                                </SelectItem>
                                            ))
                                        )}
                                    </SelectContent>
                                </Select>
                            </div>
                            <Button
                                disabled={!courierId || assignMutation.isPending}
                                onClick={() => assignCourier(selectedLeg.id, courierId)}
                                className="w-full"
                            >
                                {assignMutation.isPending ? "Assigning..." : "Assign Courier"}
                            </Button>
                        </div>
                    )}
                </DialogContent>
            </Dialog>
            <Dialog open={!!viewLeg} onOpenChange={(o) => !o && setViewLeg(null)}>
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle className="flex items-center justify-between">
                            <span>Leg {viewLeg?.legNumber} Details</span>
                            {viewLeg && <LegSticker leg={viewLeg} />}
                        </DialogTitle>
                    </DialogHeader>
                    {viewLeg && (
                        <div className="space-y-6 pt-2">
                            {/* Shipment & Leg Info */}
                            <div className="bg-muted p-4 rounded-lg">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm text-muted-foreground">Shipment Tracking</p>
                                        <p className="text-xl font-bold font-mono">{viewLeg.shipment?.trackingNumber}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-sm text-muted-foreground">Leg Number</p>
                                        <p className="text-xl font-bold">Leg {viewLeg.legNumber}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Type & Status */}
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <p className="text-sm font-semibold mb-2">Leg Type</p>
                                    <Badge variant={viewLeg.legType === "HUB_TRANSFER" ? "outline" : "secondary"} className="text-base px-3 py-1">
                                        {viewLeg.legType}
                                    </Badge>
                                </div>
                                <div>
                                    <p className="text-sm font-semibold mb-2">Status</p>
                                    <StatusBadgeCell status={viewLeg.status} />
                                </div>
                            </div>

                            {/* Origin & Destination */}
                            <div className="grid md:grid-cols-2 gap-4">
                                <div>
                                    <p className="text-sm font-semibold mb-2">Origin</p>
                                    <div className="bg-green-50 dark:bg-green-950/20 p-3 rounded space-y-1 text-sm">
                                        <p><span className="text-muted-foreground">Type:</span> {viewLeg.originType}</p>
                                        {viewLeg.originType === "HUB" ? (
                                            <>
                                                <p><span className="text-muted-foreground">Hub:</span> {viewLeg.originHub?.name}</p>
                                                <p><span className="text-muted-foreground">City:</span> {viewLeg.originHub?.city}</p>
                                                <p><span className="text-muted-foreground">Address:</span> {viewLeg.originHub?.address}</p>
                                            </>
                                        ) : (
                                            <p><span className="text-muted-foreground">Address:</span> {viewLeg.originAddress}</p>
                                        )}
                                    </div>
                                </div>

                                <div>
                                    <p className="text-sm font-semibold mb-2">Destination</p>
                                    <div className="bg-blue-50 dark:bg-blue-950/20 p-3 rounded space-y-1 text-sm">
                                        <p><span className="text-muted-foreground">Type:</span> {viewLeg.destType}</p>
                                        {viewLeg.destType === "HUB" ? (
                                            <>
                                                <p><span className="text-muted-foreground">Hub:</span> {viewLeg.destHub?.name}</p>
                                                <p><span className="text-muted-foreground">City:</span> {viewLeg.destHub?.city}</p>
                                                <p><span className="text-muted-foreground">Address:</span> {viewLeg.destHub?.address}</p>
                                            </>
                                        ) : (
                                            <p><span className="text-muted-foreground">Address:</span> {viewLeg.destAddress}</p>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Courier Info */}
                            {viewLeg.courier && (
                                <div>
                                    <p className="text-sm font-semibold mb-2">Assigned Courier</p>
                                    <div className="bg-muted/50 p-3 rounded space-y-1 text-sm">
                                        <p><span className="text-muted-foreground">Name:</span> {viewLeg.courier.user?.name}</p>
                                        <p><span className="text-muted-foreground">Phone:</span> {viewLeg.courier.user?.phone}</p>
                                        <p><span className="text-muted-foreground">Vehicle:</span> {viewLeg.courier.vehicleType}</p>
                                        <p><span className="text-muted-foreground">City:</span> {viewLeg.courier.city}</p>
                                    </div>
                                </div>
                            )}

                            {/* Financial Info */}
                            {(viewLeg.courierEarning !== null && viewLeg.courierEarning !== undefined) && (
                                <div>
                                    <p className="text-sm font-semibold mb-2">Financial Details</p>
                                    <div className="bg-muted/50 p-4 rounded space-y-2 text-sm">
                                        <div className="flex justify-between">
                                            <span className="text-muted-foreground">Courier Earning:</span>
                                            <span className="font-semibold">{viewLeg.courierEarning.toFixed(2)} BDT</span>
                                        </div>
                                        {viewLeg.codCollected !== null && viewLeg.codCollected !== undefined && (
                                            <div className="flex justify-between">
                                                <span className="text-muted-foreground">COD Collected:</span>
                                                <Badge variant={viewLeg.codCollected ? "default" : "secondary"}>
                                                    {viewLeg.codCollected ? "Yes" : "No"}
                                                </Badge>
                                            </div>
                                        )}
                                        {viewLeg.codAmount !== null && viewLeg.codAmount !== undefined && viewLeg.codAmount > 0 && (
                                            <div className="flex justify-between">
                                                <span className="text-muted-foreground">COD Amount:</span>
                                                <span className="font-semibold">{viewLeg.codAmount.toFixed(2)} BDT</span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}

                            {/* Timeline */}
                            <div>
                                <p className="text-sm font-semibold mb-2">Timeline</p>
                                <div className="bg-muted/50 p-3 rounded space-y-2 text-sm">
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">Created:</span>
                                        <span>{new Date(viewLeg.createdAt).toLocaleString()}</span>
                                    </div>
                                    {viewLeg.assignedAt && (
                                        <div className="flex justify-between">
                                            <span className="text-muted-foreground">Assigned:</span>
                                            <span>{new Date(viewLeg.assignedAt).toLocaleString()}</span>
                                        </div>
                                    )}
                                    {viewLeg.pickedUpAt && (
                                        <div className="flex justify-between">
                                            <span className="text-muted-foreground">Picked Up:</span>
                                            <span>{new Date(viewLeg.pickedUpAt).toLocaleString()}</span>
                                        </div>
                                    )}
                                    {viewLeg.deliveredAt && (
                                        <div className="flex justify-between">
                                            <span className="text-muted-foreground">Delivered:</span>
                                            <span>{new Date(viewLeg.deliveredAt).toLocaleString()}</span>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Notes */}
                            {viewLeg.note && (
                                <div>
                                    <p className="text-sm font-semibold mb-2">Notes</p>
                                    <div className="bg-yellow-50 dark:bg-yellow-950/20 p-3 rounded text-sm">
                                        {viewLeg.note}
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