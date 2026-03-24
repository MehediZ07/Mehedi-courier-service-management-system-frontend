"use client";

import DataTable from "@/components/shared/table/DataTable";
import { useServerManagedDataTable } from "@/hooks/useServerManagedDataTable";
import { useServerManagedDataTableSearch } from "@/hooks/useServerManagedDataTableSearch";
import { getAllMerchants, updateMerchant, deleteMerchant } from "@/services/merchant.services";
import { Merchant } from "@/types/merchant.types";
import { ColumnDef } from "@tanstack/react-table";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useState } from "react";

const columns: ColumnDef<Merchant>[] = [
    { accessorKey: "user.name", header: "Owner", cell: ({ row }) => row.original.user?.name ?? "—" },
    { accessorKey: "user.email", header: "Email", cell: ({ row }) => row.original.user?.email ?? "—" },
    { accessorKey: "companyName", header: "Company" },
    { accessorKey: "address", header: "Address" },
];

export default function MerchantsManagement() {
    const searchParams = useSearchParams();
    const queryClient = useQueryClient();
    const [selected, setSelected] = useState<Merchant | null>(null);
    const [form, setForm] = useState({ companyName: "", address: "" });

    const { optimisticSortingState, optimisticPaginationState, isRouteRefreshPending, updateParams, handleSortingChange, handlePaginationChange } =
        useServerManagedDataTable({ searchParams });

    const { searchTermFromUrl, handleDebouncedSearchChange } = useServerManagedDataTableSearch({ searchParams, updateParams });

    const queryParams = {
        page: optimisticPaginationState.pageIndex + 1,
        limit: optimisticPaginationState.pageSize,
        ...(optimisticSortingState[0] && { sortBy: optimisticSortingState[0].id, sortOrder: optimisticSortingState[0].desc ? "desc" : "asc" }),
        ...(searchTermFromUrl && { searchTerm: searchTermFromUrl }),
    };

    const { data, isLoading } = useQuery({
        queryKey: ["merchants", queryParams],
        queryFn: () => getAllMerchants(queryParams),
    });

    const { mutate: editMerchant, isPending } = useMutation({
        mutationFn: ({ id, payload }: { id: string; payload: { companyName?: string; address?: string } }) =>
            updateMerchant(id, payload),
        onSuccess: () => { toast.success("Merchant updated"); queryClient.invalidateQueries({ queryKey: ["merchants"] }); setSelected(null); },
        onError: (e: Error) => toast.error(e.message),
    });

    const { mutate: removeMerchant } = useMutation({
        mutationFn: (id: string) => deleteMerchant(id),
        onSuccess: () => { toast.success("Merchant deleted"); queryClient.invalidateQueries({ queryKey: ["merchants"] }); },
        onError: (e: Error) => toast.error(e.message),
    });

    const merchants: Merchant[] = data?.data ?? [];
    const meta = data?.meta;

    const openEdit = (m: Merchant) => {
        setSelected(m);
        setForm({ companyName: m.companyName, address: m.address });
    };

    return (
        <div className="space-y-4">
            <div>
                <h1 className="text-2xl font-bold">Merchants Management</h1>
                <p className="text-muted-foreground text-sm">Manage merchant profiles.</p>
            </div>

            <DataTable
                data={merchants}
                columns={columns}
                isLoading={isLoading || isRouteRefreshPending}
                emptyMessage="No merchants found."
                meta={meta}
                search={{ initialValue: searchTermFromUrl, placeholder: "Search by company, name, email...", onDebouncedChange: handleDebouncedSearchChange }}
                sorting={{ state: optimisticSortingState, onSortingChange: handleSortingChange }}
                pagination={{ state: optimisticPaginationState, onPaginationChange: handlePaginationChange }}
                actions={{ onEdit: openEdit, onDelete: (m) => removeMerchant(m.id) }}
            />

            <Dialog open={!!selected} onOpenChange={(o) => !o && setSelected(null)}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Edit Merchant — {selected?.companyName}</DialogTitle>
                    </DialogHeader>
                    {selected && (
                        <div className="space-y-4 pt-2">
                            <div className="space-y-1.5">
                                <Label>Company Name</Label>
                                <Input value={form.companyName} onChange={(e) => setForm((f) => ({ ...f, companyName: e.target.value }))} />
                            </div>
                            <div className="space-y-1.5">
                                <Label>Address</Label>
                                <Input value={form.address} onChange={(e) => setForm((f) => ({ ...f, address: e.target.value }))} />
                            </div>
                            <Button
                                disabled={isPending}
                                onClick={() => editMerchant({ id: selected.id, payload: form })}
                                className="w-full"
                            >
                                {isPending ? "Saving..." : "Save Changes"}
                            </Button>
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    );
}
