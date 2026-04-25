"use client";

import DataTable from "@/components/shared/table/DataTable";
import { useServerManagedDataTable } from "@/hooks/useServerManagedDataTable";
import { useServerManagedDataTableSearch } from "@/hooks/useServerManagedDataTableSearch";
import { useServerManagedDataTableFilters, serverManagedFilter } from "@/hooks/useServerManagedDataTableFilters";
import { getAllVisits } from "@/services/analytics.services";
import { ColumnDef } from "@tanstack/react-table";
import { useQuery } from "@tanstack/react-query";
import { useSearchParams } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { useMemo } from "react";
import type { PaginatedApiResponse } from "@/types/api.types";

interface Visit {
  id: string;
  sessionId?: string;
  ip?: string;
  userAgent?: string;
  userId?: string;
  userEmail?: string;
  userName?: string;
  userRole?: string;
  page?: string;
  createdAt: string;
}

const FILTER_DEFINITIONS = [
  serverManagedFilter.single("userRole"),
];

const columns: ColumnDef<Visit>[] = [
  {
    accessorKey: "userName",
    header: "User",
    cell: ({ row }) => (
      row.original.userName ? (
        <div>
          <div className="font-medium">{row.original.userName}</div>
          <div className="text-xs text-muted-foreground">{row.original.userEmail || "—"}</div>
        </div>
      ) : (
        <span className="text-muted-foreground">Guest</span>
      )
    ),
  },
  {
    accessorKey: "userRole",
    header: "Role",
    cell: ({ row }) => (
      row.original.userRole ? (
        <Badge variant="outline">{row.original.userRole}</Badge>
      ) : (
        <Badge variant="secondary">GUEST</Badge>
      )
    ),
  },
  {
    accessorKey: "sessionId",
    header: "Session",
    cell: ({ row }) => (
      row.original.sessionId ? (
        <span className="font-mono text-xs text-muted-foreground">
          {row.original.sessionId.slice(0, 8)}...
        </span>
      ) : (
        <span className="text-muted-foreground">—</span>
      )
    ),
  },
  {
    accessorKey: "page",
    header: "Page",
    cell: ({ row }) => <span className="font-mono text-xs">{row.original.page || "—"}</span>,
  },
  {
    accessorKey: "ip",
    header: "IP Address",
    cell: ({ row }) => <span className="text-xs text-muted-foreground">{row.original.ip || "—"}</span>,
  },
  {
    accessorKey: "userAgent",
    header: "User Agent",
    cell: ({ row }) => (
      <span className="text-xs text-muted-foreground truncate max-w-xs block" title={row.original.userAgent}>
        {row.original.userAgent || "—"}
      </span>
    ),
  },
  {
    accessorKey: "createdAt",
    header: "Time",
    cell: ({ row }) => (
      <span className="text-xs text-muted-foreground">
        {new Date(row.original.createdAt).toLocaleString()}
      </span>
    ),
  },
];

export function VisitsDataTable() {
  const searchParams = useSearchParams();

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
    ...(filterValues.userRole && { userRole: filterValues.userRole }),
  };

  const { data, isLoading } = useQuery({
    queryKey: ["visits", "list", queryParams],
    queryFn: () => getAllVisits(queryParams),
  });

  const visits: Visit[] = (data as PaginatedApiResponse<Visit>)?.data ?? [];
  const meta = (data as PaginatedApiResponse<Visit>)?.meta;

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-semibold">Recent Visits</h3>
        <p className="text-sm text-muted-foreground">Detailed visitor activity log</p>
      </div>

      <DataTable
        data={visits}
        columns={columns}
        isLoading={isLoading || isRouteRefreshPending}
        emptyMessage="No visits found."
        meta={meta}
        search={{ initialValue: searchTermFromUrl, placeholder: "Search by name, email, IP...", onDebouncedChange: handleDebouncedSearchChange }}
        filters={{
          configs: [
            { id: "userRole", label: "Role", type: "single-select", options: [
              { label: "SUPER ADMIN", value: "SUPER_ADMIN" },
              { label: "ADMIN", value: "ADMIN" },
              { label: "COURIER", value: "COURIER" },
              { label: "MERCHANT", value: "MERCHANT" },
              { label: "USER", value: "USER" },
              { label: "GUEST", value: "GUEST" },
            ]},
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
