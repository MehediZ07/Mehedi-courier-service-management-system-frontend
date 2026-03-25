"use client";

import DataTable from "@/components/shared/table/DataTable";
import { useServerManagedDataTable } from "@/hooks/useServerManagedDataTable";
import { useGetAllHubs, useCreateHub, useUpdateHub, useDeleteHub } from "@/hooks/useHubs";
import { Hub, HubType, CreateHubPayload, UpdateHubPayload } from "@/types/hub.types";
import { ColumnDef } from "@tanstack/react-table";
import { useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";

const HUB_TYPES: HubType[] = ["LOCAL", "REGIONAL", "INTERNATIONAL"];

const columns: ColumnDef<Hub>[] = [
    { accessorKey: "name", header: "Hub Name" },
    { accessorKey: "city", header: "City" },
    { accessorKey: "address", header: "Address" },
    {
        accessorKey: "hubType",
        header: "Type",
        cell: ({ row }) => <Badge variant="outline">{row.original.hubType}</Badge>,
    },
    {
        accessorKey: "isActive",
        header: "Status",
        cell: ({ row }) => (
            <Badge variant={row.original.isActive ? "default" : "secondary"}>
                {row.original.isActive ? "Active" : "Inactive"}
            </Badge>
        ),
    },
];

export default function HubsManagement() {
    const searchParams = useSearchParams();
    const [createOpen, setCreateOpen] = useState(false);
    const [editHub, setEditHub] = useState<Hub | null>(null);
    const [deleteHub, setDeleteHub] = useState<Hub | null>(null);
    const [isActive, setIsActive] = useState(true);

    const { optimisticSortingState, optimisticPaginationState, isRouteRefreshPending, handleSortingChange, handlePaginationChange } =
        useServerManagedDataTable({ searchParams });

    const queryParams = {
        page: optimisticPaginationState.pageIndex + 1,
        limit: optimisticPaginationState.pageSize,
        ...(optimisticSortingState[0] && { sortBy: optimisticSortingState[0].id, sortOrder: optimisticSortingState[0].desc ? "desc" : "asc" }),
    };

    const { data, isLoading, error } = useGetAllHubs(queryParams);
    const { mutate: create, isPending: isCreating } = useCreateHub();
    const { mutate: update, isPending: isUpdating } = useUpdateHub();
    const { mutate: remove, isPending: isDeleting } = useDeleteHub();

    const hubs: Hub[] = data?.data ?? [];
    const meta = data?.meta;

    const handleCreate = (payload: CreateHubPayload) => {
        create(payload, {
            onSuccess: () => {
                toast.success("Hub created successfully");
                setCreateOpen(false);
            },
            onError: (e: Error) => toast.error(e.message),
        });
    };

    const handleUpdate = (id: string, payload: UpdateHubPayload) => {
        update({ id, payload }, {
            onSuccess: () => {
                toast.success("Hub updated successfully");
                setEditHub(null);
            },
            onError: (e: Error) => toast.error(e.message),
        });
    };

    const handleDelete = (id: string) => {
        remove(id, {
            onSuccess: () => {
                toast.success("Hub deleted successfully");
                setDeleteHub(null);
            },
            onError: (e: Error) => toast.error(e.message),
        });
    };

    const openEdit = (hub: Hub) => {
        setEditHub(hub);
        setIsActive(hub.isActive);
    };

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold">Hub Management</h1>
                    <p className="text-muted-foreground text-sm">Manage delivery hubs for multi-leg shipments.</p>
                </div>
                <Button onClick={() => setCreateOpen(true)}>Create Hub</Button>
            </div>

            {error && (
                <div className="p-4 border border-destructive/50 bg-destructive/10 rounded-lg text-destructive text-sm">
                    Error loading hubs: {error instanceof Error ? error.message : 'Unknown error'}
                </div>
            )}

            <DataTable
                data={hubs}
                columns={columns}
                isLoading={isLoading || isRouteRefreshPending}
                emptyMessage="No hubs found."
                meta={meta}
                sorting={{ state: optimisticSortingState, onSortingChange: handleSortingChange }}
                pagination={{ state: optimisticPaginationState, onPaginationChange: handlePaginationChange }}
                actions={{ onEdit: openEdit, onDelete: setDeleteHub }}
            />

            <HubFormDialog
                open={createOpen}
                onOpenChange={setCreateOpen}
                onSubmit={handleCreate}
                isPending={isCreating}
                title="Create Hub"
            />

            {editHub && (
                <HubFormDialog
                    open={!!editHub}
                    onOpenChange={(open) => !open && setEditHub(null)}
                    onSubmit={(payload) => handleUpdate(editHub.id, { ...payload, isActive })}
                    isPending={isUpdating}
                    title="Edit Hub"
                    initialData={editHub}
                    parentIsActive={isActive}
                    setParentIsActive={setIsActive}
                />
            )}

            <AlertDialog open={!!deleteHub} onOpenChange={(open) => !open && setDeleteHub(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Delete Hub</AlertDialogTitle>
                        <AlertDialogDescription>
                            Are you sure you want to delete {deleteHub?.name}? This action cannot be undone.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={() => deleteHub && handleDelete(deleteHub.id)}
                            disabled={isDeleting}
                        >
                            {isDeleting ? "Deleting..." : "Delete"}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}

function HubFormDialog({
    open,
    onOpenChange,
    onSubmit,
    isPending,
    title,
    initialData,
    parentIsActive,
    setParentIsActive,
}: {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSubmit: (payload: CreateHubPayload) => void;
    isPending: boolean;
    title: string;
    initialData?: Hub;
    parentIsActive?: boolean;
    setParentIsActive?: (value: boolean) => void;
}) {
    const [name, setName] = useState(initialData?.name ?? "");
    const [city, setCity] = useState(initialData?.city ?? "");
    const [address, setAddress] = useState(initialData?.address ?? "");
    const [hubType, setHubType] = useState<HubType>(initialData?.hubType ?? "LOCAL");

    const handleSubmit = () => {
        if (!name || !city || !address) {
            toast.error("Please fill all required fields");
            return;
        }

        const payload: CreateHubPayload = { name, city, address, hubType };
        onSubmit(payload);
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>{title}</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                    <div className="space-y-1.5">
                        <Label>Hub Name *</Label>
                        <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Dhaka Central Hub" />
                    </div>
                    <div className="space-y-1.5">
                        <Label>City *</Label>
                        <Input value={city} onChange={(e) => setCity(e.target.value)} placeholder="Dhaka" />
                    </div>
                    <div className="space-y-1.5">
                        <Label>Address *</Label>
                        <Input value={address} onChange={(e) => setAddress(e.target.value)} placeholder="123 Main St" />
                    </div>
                    <div className="space-y-1.5">
                        <Label>Hub Type</Label>
                        <Select value={hubType} onValueChange={(v) => setHubType(v as HubType)}>
                            <SelectTrigger>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                {HUB_TYPES.map((type) => (
                                    <SelectItem key={type} value={type}>
                                        {type}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    {initialData && parentIsActive !== undefined && setParentIsActive && (
                        <div className="flex items-center gap-2">
                            <input
                                type="checkbox"
                                id="isActive"
                                checked={parentIsActive}
                                onChange={(e) => setParentIsActive(e.target.checked)}
                                className="h-4 w-4"
                            />
                            <Label htmlFor="isActive">Active</Label>
                        </div>
                    )}
                    <Button onClick={handleSubmit} disabled={isPending} className="w-full">
                        {isPending ? "Saving..." : "Save Hub"}
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}
