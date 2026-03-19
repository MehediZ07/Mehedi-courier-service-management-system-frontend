"use client";

import DataTable from "@/components/shared/table/DataTable";
import StatusBadgeCell from "@/components/shared/cell/StatusBadgeCell";
import { useServerManagedDataTable } from "@/hooks/useServerManagedDataTable";
import { useServerManagedDataTableFilters, serverManagedFilter } from "@/hooks/useServerManagedDataTableFilters";
import { getAllPayments, markPaymentAsPaid } from "@/services/payment.services";
import { Payment } from "@/types/payment.types";
import { ColumnDef } from "@tanstack/react-table";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useMemo } from "react";

const FILTER_DEFINITIONS = [
    serverManagedFilter.single("status"),
    serverManagedFilter.single("method"),
];

const columns: ColumnDef<Payment>[] = [
    { accessorKey: "shipment.trackingNumber", header: "Tracking #", cell: ({ row }) => row.original.shipment?.trackingNumber ?? "—" },
    { accessorKey: "amount", header: "Amount", cell: ({ row }) => `${row.original.amount} BDT` },
    {
        accessorKey: "method",
        header: "Method",
        cell: ({ row }) => <Badge variant="outline">{row.original.method}</Badge>,
    },
    {
        accessorKey: "status",
        header: "Status",
        cell: ({ row }) => <StatusBadgeCell status={row.original.status} />,
    },
    { accessorKey: "transactionId", header: "Transaction ID", cell: ({ row }) => row.original.transactionId ?? "—" },
];

export default function PaymentsManagement() {
    const searchParams = useSearchParams();
    const queryClient = useQueryClient();

    const { optimisticSortingState, optimisticPaginationState, isRouteRefreshPending, updateParams, handleSortingChange, handlePaginationChange } =
        useServerManagedDataTable({ searchParams });

    const filterDefs = useMemo(() => FILTER_DEFINITIONS, []);
    const { filterValues, handleFilterChange, clearAllFilters } = useServerManagedDataTableFilters({ searchParams, definitions: filterDefs, updateParams });

    const queryParams = {
        page: optimisticPaginationState.pageIndex + 1,
        limit: optimisticPaginationState.pageSize,
        ...(optimisticSortingState[0] && { sortBy: optimisticSortingState[0].id, sortOrder: optimisticSortingState[0].desc ? "desc" : "asc" }),
        ...(filterValues.status && { status: filterValues.status }),
        ...(filterValues.method && { method: filterValues.method }),
    };

    const { data, isLoading } = useQuery({
        queryKey: ["payments", queryParams],
        queryFn: () => getAllPayments(queryParams),
    });

    const { mutate: markPaid } = useMutation({
        mutationFn: (shipmentId: string) => markPaymentAsPaid(shipmentId),
        onSuccess: () => { toast.success("Payment marked as paid"); queryClient.invalidateQueries({ queryKey: ["payments"] }); },
        onError: (e: Error) => toast.error(e.message),
    });

    const payments: Payment[] = (data?.data as unknown as { data: Payment[] })?.data ?? [];
    const meta = (data?.data as unknown as { meta: { page: number; limit: number; total: number; totalPages: number } })?.meta;

    const columnsWithAction: ColumnDef<Payment>[] = [
        ...columns,
        {
            id: "markPaid",
            header: "Action",
            enableSorting: false,
            cell: ({ row }) =>
                row.original.status !== "PAID" ? (
                    <Button size="sm" variant="outline" onClick={() => markPaid(row.original.shipmentId)}>
                        Mark Paid
                    </Button>
                ) : null,
        },
    ];

    return (
        <div className="space-y-4">
            <div>
                <h1 className="text-2xl font-bold">Payments Management</h1>
                <p className="text-muted-foreground text-sm">View and manage all payments.</p>
            </div>

            <DataTable
                data={payments}
                columns={columnsWithAction}
                isLoading={isLoading || isRouteRefreshPending}
                emptyMessage="No payments found."
                meta={meta}
                filters={{
                    configs: [
                        { id: "status", label: "Status", type: "single-select", options: ["PENDING", "PAID", "COD", "FAILED"].map((s) => ({ label: s, value: s })) },
                        { id: "method", label: "Method", type: "single-select", options: ["STRIPE", "SSLCOMMERZ", "COD"].map((m) => ({ label: m, value: m })) },
                    ],
                    values: filterValues,
                    onFilterChange: handleFilterChange,
                    onClearAll: clearAllFilters,
                }}
                sorting={{ state: optimisticSortingState, onSortingChange: handleSortingChange }}
                pagination={{ state: optimisticPaginationState, onPaginationChange: handlePaginationChange }}
            />
        </div>
    );
}
