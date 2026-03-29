"use client";

import DataTable from "@/components/shared/table/DataTable";
import StatusBadgeCell from "@/components/shared/cell/StatusBadgeCell";
import { useServerManagedDataTable } from "@/hooks/useServerManagedDataTable";
import { useServerManagedDataTableSearch } from "@/hooks/useServerManagedDataTableSearch";
import { useServerManagedDataTableFilters } from "@/hooks/useServerManagedDataTableFilters";
import { useGetAvailableLegs, useAcceptLeg } from "@/hooks/useShipmentLegs";
import { ShipmentLeg } from "@/types/shipmentLeg.types";
import { ColumnDef } from "@tanstack/react-table";
import { useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { LegSticker } from "@/components/shared/LegSticker";
import { useMemo, useState } from "react";

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
    cell: ({ row }) => (
      <span className="text-muted-foreground text-sm">Leg {row.original.legNumber}</span>
    ),
  },
  {
    accessorKey: "legType",
    header: "Leg Type",
    cell: ({ row }) => <Badge variant="outline">{row.original.legType}</Badge>,
  },
  {
    accessorKey: "originAddress",
    header: "From",
    cell: ({ row }) => {
      if (row.original.originType === "HUB") return row.original.originHub?.name ?? "Hub";
      return row.original.originAddress ?? "—";
    },
    enableSorting: false,
  },
  {
    accessorKey: "destAddress",
    header: "To",
    cell: ({ row }) => {
      if (row.original.destType === "HUB") return row.original.destHub?.name ?? "Hub";
      return row.original.destAddress ?? "—";
    },
    enableSorting: false,
  },
  {
    accessorKey: "shipment.pricing.totalPrice",
    header: "Amount",
    cell: ({ row }) =>
      row.original.shipment?.pricing
        ? `${row.original.shipment.pricing.totalPrice} BDT`
        : "—",
    enableSorting: false,
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => <StatusBadgeCell status={row.original.status} />,
  },
];

/**
 * Extracts the most useful error message from whatever the API / axios throws.
 */
const getErrorMessage = (error: unknown): string => {
  if (error && typeof error === "object") {
    const axiosErr = error as { response?: { data?: { message?: string } }; message?: string };
    if (axiosErr.response?.data?.message) return axiosErr.response.data.message;
    if (axiosErr.message) return axiosErr.message;
  }
  return "Something went wrong. Please try again.";
};

export default function AvailableLegs() {
  const searchParams = useSearchParams();
  const [viewLeg, setViewLeg] = useState<ShipmentLeg | null>(null);

  // Track per-row loading state and optimistically removed rows
  const [acceptingIds, setAcceptingIds] = useState<Set<string>>(new Set());
  const [removedIds, setRemovedIds] = useState<Set<string>>(new Set());

  const {
    optimisticSortingState,
    optimisticPaginationState,
    isRouteRefreshPending,
    updateParams,
    handleSortingChange,
    handlePaginationChange,
  } = useServerManagedDataTable({ searchParams });

  const { searchTermFromUrl, handleDebouncedSearchChange } =
    useServerManagedDataTableSearch({ searchParams, updateParams });

  const { filterValues, handleFilterChange, clearAllFilters } =
    useServerManagedDataTableFilters({ searchParams, definitions: useMemo(() => [], []), updateParams });

  const queryParams = {
    page: optimisticPaginationState.pageIndex + 1,
    limit: optimisticPaginationState.pageSize,
    ...(optimisticSortingState[0] && {
      sortBy: optimisticSortingState[0].id,
      sortOrder: optimisticSortingState[0].desc ? "desc" : "asc",
    }),
    ...(searchTermFromUrl && { searchTerm: searchTermFromUrl }),
  };

  const { data, isLoading } = useGetAvailableLegs(queryParams);
  const { mutate: accept } = useAcceptLeg();

  // Filter out optimistically removed legs so the row disappears immediately on success
  const legs: ShipmentLeg[] = (data?.data ?? []).filter((leg) => !removedIds.has(leg.id));
  const meta = data?.meta;

  const handleAccept = (id: string) => {
    // Mark this specific row as loading
    setAcceptingIds((prev) => new Set(prev).add(id));

    accept(id, {
      onSuccess: () => {
        toast.success("Leg accepted successfully!");
        // Optimistically remove the row from the list
        setRemovedIds((prev) => new Set(prev).add(id));
        if (viewLeg?.id === id) setViewLeg(null);
      },
      onError: (error: unknown) => {
        toast.error(getErrorMessage(error));
      },
      onSettled: () => {
        // Always clear the per-row loading state when done
        setAcceptingIds((prev) => {
          const next = new Set(prev);
          next.delete(id);
          return next;
        });
      },
    });
  };

  const columnsWithAction: ColumnDef<ShipmentLeg>[] = [
    ...columns,
    {
      id: "accept",
      header: "Action",
      enableSorting: false,
      cell: ({ row }) => {
        const id = row.original.id;
        const isPending = acceptingIds.has(id);
        return (
          <Button
            size="sm"
            onClick={() => handleAccept(id)}
            disabled={isPending}
          >
            {isPending ? "Accepting..." : "Accept"}
          </Button>
        );
      },
    },
  ];

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold">Available Legs</h1>
        <p className="text-muted-foreground text-sm">
          Browse and accept delivery legs in your area.
        </p>
      </div>

      <DataTable
        data={legs}
        columns={columnsWithAction}
        isLoading={isLoading || isRouteRefreshPending}
        emptyMessage="No available legs."
        meta={meta}
        search={{
          initialValue: searchTermFromUrl,
          placeholder: "Search by tracking number...",
          onDebouncedChange: handleDebouncedSearchChange,
        }}
        filters={{
          configs: [],
          values: filterValues,
          onFilterChange: handleFilterChange,
          onClearAll: clearAllFilters,
        }}
        sorting={{ state: optimisticSortingState, onSortingChange: handleSortingChange }}
        pagination={{ state: optimisticPaginationState, onPaginationChange: handlePaginationChange }}
        actions={{ onView: setViewLeg }}
      />

      {/* ── Leg Detail Dialog ──────────────────────────────────────────────── */}
      <Dialog open={!!viewLeg} onOpenChange={(o) => !o && setViewLeg(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-between">
              <span>
                Leg Details — {viewLeg?.shipment?.trackingNumber}
                {viewLeg && (
                  <span className="ml-2 text-sm font-normal text-muted-foreground">
                    (Leg {viewLeg.legNumber})
                  </span>
                )}
              </span>
              {viewLeg && <LegSticker leg={viewLeg} />}
            </DialogTitle>
          </DialogHeader>

          {viewLeg && (
            <div className="space-y-4 pt-2">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Leg Type</p>
                  <Badge variant="outline">{viewLeg.legType}</Badge>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Leg Number</p>
                  <p className="text-sm">Leg {viewLeg.legNumber}</p>
                </div>
              </div>

              <div className="space-y-2">
                <p className="text-sm font-semibold">Origin</p>
                <div className="text-sm space-y-1 pl-2">
                  {viewLeg.originType === "HUB" ? (
                    <>
                      <p>
                        <span className="text-muted-foreground">Hub:</span>{" "}
                        {viewLeg.originHub?.name}
                      </p>
                      <p>
                        <span className="text-muted-foreground">Address:</span>{" "}
                        {viewLeg.originHub?.address}
                      </p>
                    </>
                  ) : (
                    <p>
                      <span className="text-muted-foreground">Address:</span>{" "}
                      {viewLeg.originAddress}
                    </p>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <p className="text-sm font-semibold">Destination</p>
                <div className="text-sm space-y-1 pl-2">
                  {viewLeg.destType === "HUB" ? (
                    <>
                      <p>
                        <span className="text-muted-foreground">Hub:</span>{" "}
                        {viewLeg.destHub?.name}
                      </p>
                      <p>
                        <span className="text-muted-foreground">Address:</span>{" "}
                        {viewLeg.destHub?.address}
                      </p>
                    </>
                  ) : (
                    <p>
                      <span className="text-muted-foreground">Address:</span>{" "}
                      {viewLeg.destAddress}
                    </p>
                  )}
                </div>
              </div>

              {viewLeg.shipment && (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Package Type</p>
                      <p className="text-sm">{viewLeg.shipment.packageType}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Weight</p>
                      <p className="text-sm">{viewLeg.shipment.weight} kg</p>
                    </div>
                  </div>

                  {viewLeg.shipment.pricing && (
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">
                        Total Shipment Amount
                      </p>
                      <p className="text-lg font-semibold">
                        {viewLeg.shipment.pricing.totalPrice} BDT
                      </p>
                    </div>
                  )}
                </>
              )}

              <Button
                onClick={() => handleAccept(viewLeg.id)}
                className="w-full"
                disabled={acceptingIds.has(viewLeg.id)}
              >
                {acceptingIds.has(viewLeg.id) ? "Accepting..." : "Accept This Leg"}
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}