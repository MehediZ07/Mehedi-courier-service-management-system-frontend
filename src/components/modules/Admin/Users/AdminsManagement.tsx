"use client";

import DataTable from "@/components/shared/table/DataTable";
import StatusBadgeCell from "@/components/shared/cell/StatusBadgeCell";
import { useServerManagedDataTable } from "@/hooks/useServerManagedDataTable";
import { useServerManagedDataTableSearch } from "@/hooks/useServerManagedDataTableSearch";
import { useServerManagedDataTableFilters, serverManagedFilter } from "@/hooks/useServerManagedDataTableFilters";
import { getAllUsers, updateUserStatus, deleteUser } from "@/services/user.services";
import { User, UserStatus } from "@/types/user.types";
import { ColumnDef } from "@tanstack/react-table";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useState, useMemo } from "react";

const STATUS_OPTIONS: UserStatus[] = ["ACTIVE", "INACTIVE", "SUSPENDED"];

const FILTER_DEFINITIONS = [
    serverManagedFilter.single("role"),
    serverManagedFilter.single("status"),
];

const columns: ColumnDef<User>[] = [
    { accessorKey: "name", header: "Name" },
    { accessorKey: "email", header: "Email" },
    { accessorKey: "phone", header: "Phone", cell: ({ row }) => row.original.phone ?? "—" },
    {
        accessorKey: "role",
        header: "Role",
        cell: ({ row }) => (
            <Badge variant="outline" className="capitalize">
                {row.original.role.toLowerCase().replace("_", " ")}
            </Badge>
        ),
    },
    {
        accessorKey: "status",
        header: "Status",
        cell: ({ row }) => <StatusBadgeCell status={row.original.status} />,
    },
];

export default function AdminsManagement() {
    const searchParams = useSearchParams();
    const queryClient = useQueryClient();
    const [selectedUser, setSelectedUser] = useState<User | null>(null);

    const { optimisticSortingState, optimisticPaginationState, isRouteRefreshPending, updateParams, handleSortingChange, handlePaginationChange } =
        useServerManagedDataTable({ searchParams });

    const { searchTermFromUrl, handleDebouncedSearchChange } = useServerManagedDataTableSearch({ searchParams, updateParams });

    const filterDefs = useMemo(() => FILTER_DEFINITIONS, []);
    const { filterValues, handleFilterChange, clearAllFilters } = useServerManagedDataTableFilters({
        searchParams,
        definitions: filterDefs,
        updateParams,
    });

    const queryParams: Record<string, unknown> = {
        page: optimisticPaginationState.pageIndex + 1,
        limit: optimisticPaginationState.pageSize,
        ...(optimisticSortingState[0] && { sortBy: optimisticSortingState[0].id, sortOrder: optimisticSortingState[0].desc ? "desc" : "asc" }),
        ...(searchTermFromUrl && { searchTerm: searchTermFromUrl }),
        ...(filterValues.status && { status: filterValues.status }),
    };

    // Add role filter - either specific role or both admin roles
    if (filterValues.role) {
        queryParams.role = filterValues.role;
    } else {
        queryParams["role[in]"] = ["ADMIN", "SUPER_ADMIN"];
    }

    const { data, isLoading } = useQuery({
        queryKey: ["admins", "list", queryParams],
        queryFn: () => getAllUsers(queryParams),
    });

    const users: User[] = data?.data ?? [];
    const meta = data?.meta;

    const { mutate: changeStatus, isPending: isStatusPending } = useMutation({
        mutationFn: ({ id, status }: { id: string; status: UserStatus }) => updateUserStatus(id, { status }),
        onSuccess: () => { toast.success("Status updated"); queryClient.invalidateQueries({ queryKey: ["admins", "list"] }); setSelectedUser(null); },
        onError: (e: Error) => toast.error(e.message),
    });

    const { mutate: removeUser } = useMutation({
        mutationFn: (id: string) => deleteUser(id),
        onSuccess: () => { toast.success("Admin deleted"); queryClient.invalidateQueries({ queryKey: ["admins", "list"] }); },
        onError: (e: Error) => toast.error(e.message),
    });

    return (
        <div className="space-y-4">
            <div>
                <h1 className="text-2xl font-bold">Admins Management</h1>
                <p className="text-muted-foreground text-sm">Manage admin accounts (ADMIN & SUPER_ADMIN roles).</p>
            </div>

            <DataTable
                data={users}
                columns={columns}
                isLoading={isLoading || isRouteRefreshPending}
                emptyMessage="No admins found."
                meta={meta}
                search={{ initialValue: searchTermFromUrl, placeholder: "Search by name, email...", onDebouncedChange: handleDebouncedSearchChange }}
                filters={{
                    configs: [
                        { id: "role", label: "Role", type: "single-select", options: [{label: "ADMIN", value: "ADMIN"}, {label: "SUPER ADMIN", value: "SUPER_ADMIN"}] },
                        { id: "status", label: "Status", type: "single-select", options: STATUS_OPTIONS.map((s) => ({ label: s, value: s })) },
                    ],
                    values: filterValues,
                    onFilterChange: handleFilterChange,
                    onClearAll: clearAllFilters,
                }}
                sorting={{ state: optimisticSortingState, onSortingChange: handleSortingChange }}
                pagination={{ state: optimisticPaginationState, onPaginationChange: handlePaginationChange }}
                actions={{ onEdit: setSelectedUser, onDelete: (u) => removeUser(u.id) }}
            />

            <Dialog open={!!selectedUser} onOpenChange={(o) => !o && setSelectedUser(null)}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Edit Admin — {selectedUser?.name}</DialogTitle>
                    </DialogHeader>
                    {selectedUser && (
                        <div className="space-y-4 pt-2">
                            <div className="space-y-1.5">
                                <p className="text-sm font-medium">Status</p>
                                <Select
                                    value={selectedUser.status}
                                    disabled={isStatusPending}
                                    onValueChange={(v) => changeStatus({ id: selectedUser.id, status: v as UserStatus })}
                                >
                                    <SelectTrigger><SelectValue /></SelectTrigger>
                                    <SelectContent>
                                        {STATUS_OPTIONS.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
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
