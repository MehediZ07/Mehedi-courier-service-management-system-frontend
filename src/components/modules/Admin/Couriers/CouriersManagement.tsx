"use client";

import DataTable from "@/components/shared/table/DataTable";
import StatusBadgeCell from "@/components/shared/cell/StatusBadgeCell";
import { useServerManagedDataTable } from "@/hooks/useServerManagedDataTable";
import { useServerManagedDataTableSearch } from "@/hooks/useServerManagedDataTableSearch";
import { useServerManagedDataTableFilters, serverManagedFilter } from "@/hooks/useServerManagedDataTableFilters";
import { getAllCouriers, updateCourier, deleteCourier } from "@/services/courier.services";
import { Courier, VehicleType } from "@/types/courier.types";
import { ColumnDef } from "@tanstack/react-table";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { useState, useMemo } from "react";

const VEHICLE_TYPES: VehicleType[] = ["BIKE", "BICYCLE", "CAR", "VAN", "TRUCK"];

const FILTER_DEFINITIONS = [
    serverManagedFilter.single("vehicleType"),
    serverManagedFilter.single("availability"),
];

const columns: ColumnDef<Courier>[] = [
    { accessorKey: "user.name", header: "Name", cell: ({ row }) => row.original.user?.name ?? "—" },
    { accessorKey: "user.email", header: "Email", cell: ({ row }) => row.original.user?.email ?? "—" },
    {
        accessorKey: "vehicleType",
        header: "Vehicle",
        cell: ({ row }) => <Badge variant="outline">{row.original.vehicleType}</Badge>,
    },
    { accessorKey: "licenseNumber", header: "License" },
    {
        accessorKey: "availability",
        header: "Available",
        cell: ({ row }) => (
            <Badge variant={row.original.availability ? "default" : "secondary"}>
                {row.original.availability ? "Yes" : "No"}
            </Badge>
        ),
    },
    {
        accessorKey: "approvalStatus",
        header: "Approval",
        cell: ({ row }) => <StatusBadgeCell status={row.original.approvalStatus} />,
    },
];

export default function CouriersManagement() {
    const searchParams = useSearchParams();
    const queryClient = useQueryClient();
    const [selected, setSelected] = useState<Courier | null>(null);

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
        ...(filterValues.vehicleType && { vehicleType: filterValues.vehicleType }),
        ...(filterValues.availability && { availability: filterValues.availability }),
    };

    const { data, isLoading } = useQuery({
        queryKey: ["couriers", queryParams],
        queryFn: () => getAllCouriers(queryParams),
    });

    const { mutate: editCourier, isPending } = useMutation({
        mutationFn: ({ id, payload }: { id: string; payload: { vehicleType?: VehicleType; availability?: boolean } }) =>
            updateCourier(id, payload),
        onSuccess: () => { toast.success("Courier updated"); queryClient.invalidateQueries({ queryKey: ["couriers"] }); setSelected(null); },
        onError: (e: Error) => toast.error(e.message),
    });

    const { mutate: removeCourier } = useMutation({
        mutationFn: (id: string) => deleteCourier(id),
        onSuccess: () => { toast.success("Courier deleted"); queryClient.invalidateQueries({ queryKey: ["couriers"] }); },
        onError: (e: Error) => toast.error(e.message),
    });

    const couriers: Courier[] = (data?.data as unknown as { data: Courier[] })?.data ?? [];
    const meta = (data?.data as unknown as { meta: { page: number; limit: number; total: number; totalPages: number } })?.meta;

    return (
        <div className="space-y-4">
            <div>
                <h1 className="text-2xl font-bold">Couriers Management</h1>
                <p className="text-muted-foreground text-sm">Manage courier profiles and availability.</p>
            </div>

            <DataTable
                data={couriers}
                columns={columns}
                isLoading={isLoading || isRouteRefreshPending}
                emptyMessage="No couriers found."
                meta={meta}
                search={{ initialValue: searchTermFromUrl, placeholder: "Search by name, email, license...", onDebouncedChange: handleDebouncedSearchChange }}
                filters={{
                    configs: [
                        { id: "vehicleType", label: "Vehicle", type: "single-select", options: VEHICLE_TYPES.map((v) => ({ label: v, value: v })) },
                        { id: "availability", label: "Available", type: "single-select", options: [{ label: "Yes", value: "true" }, { label: "No", value: "false" }] },
                    ],
                    values: filterValues,
                    onFilterChange: handleFilterChange,
                    onClearAll: clearAllFilters,
                }}
                sorting={{ state: optimisticSortingState, onSortingChange: handleSortingChange }}
                pagination={{ state: optimisticPaginationState, onPaginationChange: handlePaginationChange }}
                actions={{ onEdit: setSelected, onDelete: (c) => removeCourier(c.id) }}
            />

            <Dialog open={!!selected} onOpenChange={(o) => !o && setSelected(null)}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Edit Courier — {selected?.user?.name}</DialogTitle>
                    </DialogHeader>
                    {selected && (
                        <div className="space-y-4 pt-2">
                            <div className="space-y-1.5">
                                <Label>Vehicle Type</Label>
                                <Select
                                    value={selected.vehicleType}
                                    disabled={isPending}
                                    onValueChange={(v) => editCourier({ id: selected.id, payload: { vehicleType: v as VehicleType } })}
                                >
                                    <SelectTrigger><SelectValue /></SelectTrigger>
                                    <SelectContent>
                                        {VEHICLE_TYPES.map((v) => <SelectItem key={v} value={v}>{v}</SelectItem>)}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-1.5">
                                <Label>Availability</Label>
                                <Select
                                    value={selected.availability ? "true" : "false"}
                                    disabled={isPending}
                                    onValueChange={(v) => editCourier({ id: selected.id, payload: { availability: v === "true" } })}
                                >
                                    <SelectTrigger><SelectValue /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="true">Available</SelectItem>
                                        <SelectItem value="false">Unavailable</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    );
}
