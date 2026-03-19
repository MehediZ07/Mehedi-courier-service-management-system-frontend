"use client";

import DataTable from "@/components/shared/table/DataTable";
import StatusBadgeCell from "@/components/shared/cell/StatusBadgeCell";
import { useServerManagedDataTable } from "@/hooks/useServerManagedDataTable";
import { useServerManagedDataTableSearch } from "@/hooks/useServerManagedDataTableSearch";
import { useServerManagedDataTableFilters, serverManagedFilter } from "@/hooks/useServerManagedDataTableFilters";
import { getAllUsers, updateUserStatus, updateUserRole, deleteUser } from "@/services/user.services";
import { User, UserStatus, UserRole } from "@/types/user.types";
import { ColumnDef } from "@tanstack/react-table";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useState, useMemo } from "react";

const STATUS_OPTIONS: UserStatus[] = ["ACTIVE", "INACTIVE", "SUSPENDED"];
const ROLE_OPTIONS: UserRole[] = ["ADMIN", "COURIER", "MERCHANT", "USER"];

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

export default function UsersManagement() {
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

    const queryParams = {
        page: optimisticPaginationState.pageIndex + 1,
        limit: optimisticPaginationState.pageSize,
        ...(optimisticSortingState[0] && { sortBy: optimisticSortingState[0].id, sortOrder: optimisticSortingState[0].desc ? "desc" : "asc" }),
        ...(searchTermFromUrl && { searchTerm: searchTermFromUrl }),
        ...(filterValues.role && { role: filterValues.role }),
        ...(filterValues.status && { status: filterValues.status }),
    };

    const { data, isLoading } = useQuery({
        queryKey: ["users", queryParams],
        queryFn: () => getAllUsers(queryParams),
    });

    const { mutate: changeStatus, isPending: isStatusPending } = useMutation({
        mutationFn: ({ id, status }: { id: string; status: UserStatus }) => updateUserStatus(id, { status }),
        onSuccess: () => { toast.success("Status updated"); queryClient.invalidateQueries({ queryKey: ["users"] }); setSelectedUser(null); },
        onError: (e: Error) => toast.error(e.message),
    });

    const { mutate: changeRole, isPending: isRolePending } = useMutation({
        mutationFn: ({ id, role }: { id: string; role: UserRole }) => updateUserRole(id, { role }),
        onSuccess: () => { toast.success("Role updated"); queryClient.invalidateQueries({ queryKey: ["users"] }); setSelectedUser(null); },
        onError: (e: Error) => toast.error(e.message),
    });

    const { mutate: removeUser } = useMutation({
        mutationFn: (id: string) => deleteUser(id),
        onSuccess: () => { toast.success("User deleted"); queryClient.invalidateQueries({ queryKey: ["users"] }); },
        onError: (e: Error) => toast.error(e.message),
    });

    const users: User[] = (data?.data as unknown as { data: User[] })?.data ?? [];
    const meta = (data?.data as unknown as { meta: { page: number; limit: number; total: number; totalPages: number } })?.meta;

    return (
        <div className="space-y-4">
            <div>
                <h1 className="text-2xl font-bold">Users Management</h1>
                <p className="text-muted-foreground text-sm">Manage user accounts, roles and statuses.</p>
            </div>

            <DataTable
                data={users}
                columns={columns}
                isLoading={isLoading || isRouteRefreshPending}
                emptyMessage="No users found."
                meta={meta}
                search={{ initialValue: searchTermFromUrl, placeholder: "Search by name, email...", onDebouncedChange: handleDebouncedSearchChange }}
                filters={{
                    configs: [
                        { id: "role", label: "Role", type: "single-select", options: ROLE_OPTIONS.map((r) => ({ label: r, value: r })) },
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
                        <DialogTitle>Edit User — {selectedUser?.name}</DialogTitle>
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
                            <div className="space-y-1.5">
                                <p className="text-sm font-medium">Role</p>
                                <Select
                                    value={selectedUser.role}
                                    disabled={isRolePending}
                                    onValueChange={(v) => changeRole({ id: selectedUser.id, role: v as UserRole })}
                                >
                                    <SelectTrigger><SelectValue /></SelectTrigger>
                                    <SelectContent>
                                        {ROLE_OPTIONS.map((r) => <SelectItem key={r} value={r}>{r}</SelectItem>)}
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
