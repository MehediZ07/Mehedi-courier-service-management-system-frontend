"use client";

import DataTable from "@/components/shared/table/DataTable";
import StatusBadgeCell from "@/components/shared/cell/StatusBadgeCell";
import { useServerManagedDataTable } from "@/hooks/useServerManagedDataTable";
import { useServerManagedDataTableSearch } from "@/hooks/useServerManagedDataTableSearch";
import { useServerManagedDataTableFilters, serverManagedFilter } from "@/hooks/useServerManagedDataTableFilters";
import { useGetMyCourierLegs, useMarkLegPickedUp, useMarkLegDelivered, useMarkDeliveryRefused } from "@/hooks/useShipmentLegs";
import { ShipmentLeg } from "@/types/shipmentLeg.types";
import { ColumnDef } from "@tanstack/react-table";
import { useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { LegSticker } from "@/components/shared/LegSticker";
import { PhoneButton } from "@/components/shared/PhoneButton";
import { PrintLabel } from "@/components/shared/PrintLabel";
import { useMemo, useState } from "react";
import { Eye } from "lucide-react";

const FILTER_DEFINITIONS = [
    serverManagedFilter.single("status"),
];

const columns: ColumnDef<ShipmentLeg>[] = [
    {
        accessorKey: "shipment.trackingNumber",
        header: "Tracking #",
        cell: ({ row }) => row.original.shipment?.trackingNumber ?? "—",
        enableSorting: false,
    },
    {
        accessorKey: "legType",
        header: "Type",
        cell: ({ row }) => <Badge variant="outline">{row.original.legType}</Badge>,
    },
    {
        accessorKey: "originAddress",
        header: "From",
        cell: ({ row }) => {
            if (row.original.originType === "HUB") {
                return row.original.originHub?.name ?? "Hub";
            }
            return row.original.originAddress ?? "—";
        },
        enableSorting: false,
    },
    {
        accessorKey: "destAddress",
        header: "To",
        cell: ({ row }) => {
            if (row.original.destType === "HUB") {
                return row.original.destHub?.name ?? "Hub";
            }
            return row.original.destAddress ?? "—";
        },
        enableSorting: false,
    },
    {
        accessorKey: "shipment.pricing.totalPrice",
        header: "Amount",
        cell: ({ row }) => row.original.shipment?.pricing ? `${row.original.shipment.pricing.totalPrice} BDT` : "—",
        enableSorting: false,
    },
    {
        accessorKey: "status",
        header: "Status",
        cell: ({ row }) => <StatusBadgeCell status={row.original.status} />,
    },
];

interface ViewLegDetailsProps {
    leg: ShipmentLeg;
    onClose: () => void;
}

function ViewLegDetails({ leg, onClose }: ViewLegDetailsProps) {
    return (
        <Dialog open onOpenChange={onClose}>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="flex items-center justify-between">
                        <span>Leg Details</span>
                        <LegSticker leg={leg} />
                    </DialogTitle>
                </DialogHeader>
                <div className="space-y-4 pt-2">
                    <div className="bg-muted p-4 rounded-lg">
                        <p className="text-sm text-muted-foreground">Tracking Number</p>
                        <p className="text-xl font-bold font-mono">{leg.shipment?.trackingNumber}</p>
                    </div>

                    <div className="grid md:grid-cols-2 gap-4">
                        <div>
                            <p className="text-sm font-semibold mb-2">Origin</p>
                            <div className="bg-green-50 dark:bg-green-950/20 p-3 rounded space-y-1 text-sm">
                                <p><span className="text-muted-foreground">Type:</span> {leg.originType}</p>
                                {leg.originType === "HUB" ? (
                                    <p><span className="text-muted-foreground">Hub:</span> {leg.originHub?.name}</p>
                                ) : (
                                    <p><span className="text-muted-foreground">Address:</span> {leg.originAddress}</p>
                                )}
                            </div>
                        </div>
                        <div>
                            <p className="text-sm font-semibold mb-2">Destination</p>
                            <div className="bg-blue-50 dark:bg-blue-950/20 p-3 rounded space-y-1 text-sm">
                                <p><span className="text-muted-foreground">Type:</span> {leg.destType}</p>
                                {leg.destType === "HUB" ? (
                                    <p><span className="text-muted-foreground">Hub:</span> {leg.destHub?.name}</p>
                                ) : (
                                    <p><span className="text-muted-foreground">Address:</span> {leg.destAddress}</p>
                                )}
                            </div>
                        </div>
                    </div>

                    {leg.shipment && (
                        <>
                            <div>
                                <p className="text-sm font-semibold mb-2">Shipment Details</p>
                                <div className="bg-muted/50 p-3 rounded space-y-1 text-sm">
                                    <p><span className="text-muted-foreground">Package:</span> {leg.shipment.packageType}</p>
                                    <p><span className="text-muted-foreground">Weight:</span> {leg.shipment.weight} kg</p>
                                    <p><span className="text-muted-foreground">Priority:</span> <Badge variant={leg.shipment.priority === "EXPRESS" ? "default" : "secondary"}>{leg.shipment.priority}</Badge></p>
                                    {leg.shipment.pricing && <p><span className="text-muted-foreground">Amount:</span> {leg.shipment.pricing.totalPrice} BDT</p>}
                                </div>
                            </div>

                            <div className="grid md:grid-cols-2 gap-4">
                                <div>
                                    <p className="text-sm font-semibold mb-2">Pickup Contact</p>
                                    <div className="bg-muted/50 p-3 rounded space-y-2 text-sm">
                                        <p><span className="text-muted-foreground">Address:</span> {leg.shipment.pickupAddress}</p>
                                        <p><span className="text-muted-foreground">City:</span> {leg.shipment.pickupCity}</p>
                                        {leg.shipment.pickupPhone && (
                                            <div className="flex items-center gap-2">
                                                <span className="text-muted-foreground">Phone:</span>
                                                <PhoneButton phone={leg.shipment.pickupPhone} />
                                            </div>
                                        )}
                                    </div>
                                </div>
                                <div>
                                    <p className="text-sm font-semibold mb-2">Delivery Contact</p>
                                    <div className="bg-muted/50 p-3 rounded space-y-2 text-sm">
                                        <p><span className="text-muted-foreground">Address:</span> {leg.shipment.deliveryAddress}</p>
                                        <p><span className="text-muted-foreground">City:</span> {leg.shipment.deliveryCity}</p>
                                        {leg.shipment.deliveryPhone && (
                                            <div className="flex items-center gap-2">
                                                <span className="text-muted-foreground">Phone:</span>
                                                <PhoneButton phone={leg.shipment.deliveryPhone} />
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </>
                    )}

                    <div className="flex gap-2 pt-4">
                        <PrintLabel leg={leg} size="default" variant="default" />
                        <Button variant="outline" onClick={onClose} className="flex-1">Close</Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}

export default function MyActiveLegs() {
    const searchParams = useSearchParams();
    const [selectedLeg, setSelectedLeg] = useState<ShipmentLeg | null>(null);
    const [viewLeg, setViewLeg] = useState<ShipmentLeg | null>(null);
    const [note, setNote] = useState("");
    const [codCollected, setCodCollected] = useState(false);
    const [returnReason, setReturnReason] = useState("");
    const [showReturnDialog, setShowReturnDialog] = useState(false);
    const [legToReturn, setLegToReturn] = useState<ShipmentLeg | null>(null);

    const [pickingUpIds, setPickingUpIds] = useState<Set<string>>(new Set());

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
    };

    const { data, isLoading } = useGetMyCourierLegs(queryParams);
    const { mutate: markPickedUp } = useMarkLegPickedUp();
    const { mutate: markDelivered, isPending: isDelivering } = useMarkLegDelivered();
    const { mutate: markRefused, isPending: isRefusing } = useMarkDeliveryRefused();

    const legs: ShipmentLeg[] = data?.data ?? [];
    const meta = data?.meta;

    const handlePickup = (id: string) => {
        // Mark only this specific row as loading
        setPickingUpIds((prev) => new Set(prev).add(id));
        markPickedUp(id, {
            onSuccess: () => toast.success("Marked as picked up"),
            onError: (e: Error) => toast.error(e.message),
            onSettled: () => {
                setPickingUpIds((prev) => {
                    const next = new Set(prev);
                    next.delete(id);
                    return next;
                });
            },
        });
    };

    const handleDeliver = () => {
        if (!selectedLeg) return;

        const isCOD = selectedLeg.shipment?.payment?.method === "COD";
        const isDeliveryLeg = selectedLeg.legType === "DELIVERY" || selectedLeg.legType === "DIRECT";
        const hasProductPrice = selectedLeg.shipment?.productPrice && selectedLeg.shipment.productPrice > 0;

        // Require confirmation if COD or if there's a product price to collect
        if (isDeliveryLeg && (isCOD || hasProductPrice) && !codCollected) {
            toast.error(isCOD ? "Please confirm COD payment collection" : "Please confirm product price collection");
            return;
        }

        const payload = note ? { note } : undefined;
        markDelivered(
            { id: selectedLeg.id, payload },
            {
                onSuccess: () => {
                    toast.success("Leg completed successfully");
                    if (isDeliveryLeg && (isCOD || hasProductPrice)) {
                        const amount = isCOD 
                            ? (selectedLeg.shipment?.productPrice || 0) + (selectedLeg.shipment?.pricing?.totalPrice || 0)
                            : selectedLeg.shipment?.productPrice || 0;
                        toast.success(`Payment collected: ${amount.toFixed(2)} BDT`);
                    }
                    setSelectedLeg(null);
                    setNote("");
                    setCodCollected(false);
                },
                onError: (e: Error) => toast.error(e.message),
            }
        );
    };

    const handleReturn = () => {
        if (!legToReturn || !returnReason.trim()) {
            toast.error("Please provide a reason for return");
            return;
        }

        markRefused(
            { id: legToReturn.id, reason: returnReason },
            {
                onSuccess: (response) => {
                    // Response is ApiResponse<{ leg, returnLegs, returnShippingCost, storedAtHub? }>
                    const result = response.data;
                    
                    if (result.returnLegs && result.returnLegs.length > 0) {
                        toast.success("Return initiated. Package will be sent back to sender.");
                    } else if (result.storedAtHub) {
                        toast.success(`Package stored at ${result.storedAtHub.name}. Both parties refused delivery.`);
                    } else {
                        toast.success("Return processed successfully.");
                    }
                    setShowReturnDialog(false);
                    setLegToReturn(null);
                    setReturnReason("");
                },
                onError: (e: Error) => toast.error(e.message),
            }
        );
    };

    const columnsWithAction: ColumnDef<ShipmentLeg>[] = [
        ...columns,
        {
            id: "actions",
            header: "Actions",
            enableSorting: false,
            cell: ({ row }) => {
                const leg = row.original;
                if (leg.status === "ASSIGNED") {
                    const isPending = pickingUpIds.has(leg.id);
                    return (
                        <div className="flex gap-1">
                            {leg.shipment?.pickupPhone && <PhoneButton phone={leg.shipment.pickupPhone} />}
                            <Button size="sm" variant="ghost" onClick={() => setViewLeg(leg)}>
                                <Eye className="h-4 w-4" />
                            </Button>
                            <PrintLabel leg={leg} />
                            <Button size="sm" onClick={() => handlePickup(leg.id)} disabled={isPending}>
                                {isPending ? "Processing..." : "Pickup"}
                            </Button>
                        </div>
                    );
                }
                if (leg.status === "IN_PROGRESS") {
                    // Return button only for customer-facing deliveries (not hub-to-hub transfers)
                    const isCustomerDelivery = leg.legType === "DIRECT" || (leg.legType === "DELIVERY" && leg.destType === "ADDRESS");
                    
                    return (
                        <div className="flex gap-1">
                            {leg.shipment?.deliveryPhone && <PhoneButton phone={leg.shipment.deliveryPhone} />}
                            <Button size="sm" variant="ghost" onClick={() => setViewLeg(leg)}>
                                <Eye className="h-4 w-4" />
                            </Button>
                            <PrintLabel leg={leg} />
                            <Button size="sm" onClick={() => setSelectedLeg(leg)}>
                                Deliver
                            </Button>
                            {isCustomerDelivery && (
                                <Button size="sm" variant="destructive" onClick={() => {
                                    setLegToReturn(leg);
                                    setShowReturnDialog(true);
                                }}>
                                    Return
                                </Button>
                            )}
                        </div>
                    );
                }
                return <span className="text-muted-foreground text-sm">—</span>;
            },
        },
    ];

    return (
        <div className="space-y-4">
            <div>
                <h1 className="text-2xl font-bold">My Active Legs</h1>
                <p className="text-muted-foreground text-sm">Manage your assigned delivery legs.</p>
            </div>

            <DataTable
                data={legs}
                columns={columnsWithAction}
                isLoading={isLoading || isRouteRefreshPending}
                emptyMessage="No active legs."
                meta={meta}
                search={{ initialValue: searchTermFromUrl, placeholder: "Search by tracking number...", onDebouncedChange: handleDebouncedSearchChange }}
                filters={{
                    configs: [
                        { id: "status", label: "Status", type: "single-select", options: ["ASSIGNED", "IN_PROGRESS"].map((s) => ({ label: s, value: s })) },
                    ],
                    values: filterValues,
                    onFilterChange: handleFilterChange,
                    onClearAll: clearAllFilters,
                }}
                sorting={{ state: optimisticSortingState, onSortingChange: handleSortingChange }}
                pagination={{ state: optimisticPaginationState, onPaginationChange: handlePaginationChange }}
            />

            {viewLeg && <ViewLegDetails leg={viewLeg} onClose={() => setViewLeg(null)} />}

            <Dialog open={showReturnDialog} onOpenChange={(open) => {
                if (!open) {
                    setShowReturnDialog(false);
                    setLegToReturn(null);
                    setReturnReason("");
                }
            }}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Return Package to Sender</DialogTitle>
                    </DialogHeader>
                    {legToReturn && (
                        <div className="space-y-4 pt-2">
                            <div className="bg-yellow-50 dark:bg-yellow-950/20 p-4 rounded-lg">
                                <p className="text-sm font-semibold mb-2">⚠️ Delivery Failed</p>
                                <p className="text-sm text-muted-foreground">
                                    This will create return legs to send the package back to the sender.
                                    The sender will be charged for return shipping (same as original delivery cost).
                                </p>
                            </div>
                            <div className="text-sm space-y-1">
                                <p><strong>Tracking:</strong> {legToReturn.shipment?.trackingNumber}</p>
                                <p><strong>Return Cost:</strong> {legToReturn.shipment?.pricing?.totalPrice} BDT</p>
                            </div>
                            <div className="space-y-1.5">
                                <Label>Reason for Return *</Label>
                                <Textarea
                                    value={returnReason}
                                    onChange={(e) => setReturnReason(e.target.value)}
                                    placeholder="e.g., Receiver refused delivery, Wrong address, COD payment refused..."
                                    rows={3}
                                />
                            </div>
                            <div className="flex gap-2">
                                <Button variant="outline" onClick={() => setShowReturnDialog(false)} className="flex-1">
                                    Cancel
                                </Button>
                                <Button variant="destructive" onClick={handleReturn} disabled={isRefusing} className="flex-1">
                                    {isRefusing ? "Processing..." : "Confirm Return"}
                                </Button>
                            </div>
                        </div>
                    )}
                </DialogContent>
            </Dialog>

            <Dialog open={!!selectedLeg} onOpenChange={(open) => {
                if (!open) {
                    setSelectedLeg(null);
                    setCodCollected(false);
                }
            }}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle className="flex items-center justify-between">
                            <span>Complete Leg Delivery</span>
                            {selectedLeg && <LegSticker leg={selectedLeg} />}
                        </DialogTitle>
                    </DialogHeader>
                    {selectedLeg && (
                        <div className="space-y-4 pt-2">
                            <div className="text-sm space-y-1">
                                <p><strong>Tracking:</strong> {selectedLeg.shipment?.trackingNumber}</p>
                                <p><strong>Type:</strong> {selectedLeg.legType}</p>
                                {selectedLeg.shipment?.pricing?.totalPrice && (
                                    <p><strong>Amount:</strong> {selectedLeg.shipment.pricing.totalPrice} BDT</p>
                                )}
                                {selectedLeg.shipment?.deliveryPhone && (
                                    <div className="flex items-center gap-2 mt-2">
                                        <strong>Receiver Contact:</strong>
                                        <a href={`tel:${selectedLeg.shipment.deliveryPhone}`} className="text-blue-600 hover:underline">
                                            {selectedLeg.shipment.deliveryPhone}
                                        </a>
                                        <Button size="sm" variant="outline" asChild>
                                            <a href={`tel:${selectedLeg.shipment.deliveryPhone}`}>📞 Call</a>
                                        </Button>
                                    </div>
                                )}
                            </div>

                            {(selectedLeg.legType === "DELIVERY" || selectedLeg.legType === "DIRECT") && selectedLeg.shipment?.pricing && (
                                selectedLeg.shipment?.payment?.method === "COD" || 
                                (selectedLeg.shipment?.productPrice && selectedLeg.shipment.productPrice > 0)
                            ) && (
                                <div className="bg-yellow-50 dark:bg-yellow-950/20 p-4 rounded-lg space-y-3">
                                    <div className="flex items-start gap-2">
                                        <div className="text-yellow-600 dark:text-yellow-400 mt-0.5">⚠️</div>
                                        <div className="flex-1">
                                            <p className="font-semibold text-sm">
                                                {selectedLeg.shipment?.payment?.method === "COD" 
                                                    ? "Cash on Delivery (COD)" 
                                                    : "Product Price Collection"}
                                            </p>
                                            <p className="text-sm text-muted-foreground">
                                                {selectedLeg.shipment?.payment?.method === "COD"
                                                    ? "Collect payment from customer"
                                                    : "Collect product price from customer (Shipment paid via Stripe)"}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="bg-white dark:bg-gray-900 p-3 rounded border">
                                        <p className="text-xs text-muted-foreground mb-1">Amount to Collect:</p>
                                        {selectedLeg.shipment?.payment?.method === "COD" ? (
                                            selectedLeg.shipment.productPrice && selectedLeg.shipment.productPrice > 0 ? (
                                                <div className="space-y-1">
                                                    <div className="flex justify-between text-sm">
                                                        <span className="text-muted-foreground">Product Price:</span>
                                                        <span>{selectedLeg.shipment.productPrice.toFixed(2)} BDT</span>
                                                    </div>
                                                    <div className="flex justify-between text-sm">
                                                        <span className="text-muted-foreground">Shipment Charge:</span>
                                                        <span>{selectedLeg.shipment.pricing.totalPrice.toFixed(2)} BDT</span>
                                                    </div>
                                                    <div className="border-t pt-1 mt-1">
                                                        <div className="flex justify-between">
                                                            <span className="font-semibold">Total COD:</span>
                                                            <span className="text-2xl font-bold">
                                                                {((selectedLeg.shipment.productPrice || 0) + selectedLeg.shipment.pricing.totalPrice).toFixed(2)} BDT
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>
                                            ) : (
                                                <p className="text-2xl font-bold">
                                                    {selectedLeg.shipment.pricing.totalPrice.toFixed(2)} BDT
                                                </p>
                                            )
                                        ) : (
                                            <div className="space-y-1">
                                                <div className="flex justify-between text-sm">
                                                    <span className="text-muted-foreground">Product Price:</span>
                                                    <span className="text-2xl font-bold">{selectedLeg.shipment.productPrice?.toFixed(2)} BDT</span>
                                                </div>
                                                <p className="text-xs text-green-600 dark:text-green-400 mt-2">
                                                    ✓ Shipment charge already paid via Stripe
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <Checkbox
                                            id="cod-collected"
                                            checked={codCollected}
                                            onCheckedChange={(checked) => setCodCollected(checked as boolean)}
                                        />
                                        <label
                                            htmlFor="cod-collected"
                                            className="text-sm font-medium leading-none cursor-pointer"
                                        >
                                            {selectedLeg.shipment?.payment?.method === "COD"
                                                ? "I have collected the COD payment from customer"
                                                : "I have collected the product price from customer"}
                                        </label>
                                    </div>
                                </div>
                            )}

                            <div className="space-y-1.5">
                                <Label>Note (optional)</Label>
                                <Textarea
                                    value={note}
                                    onChange={(e) => setNote(e.target.value)}
                                    placeholder="Delivered successfully..."
                                    rows={3}
                                />
                            </div>
                            <Button onClick={handleDeliver} disabled={isDelivering} className="w-full">
                                {isDelivering ? "Completing..." : "Complete Delivery"}
                            </Button>
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    );
}