"use client";

import { useGetAllLegs, useReleaseHubTransfer, useConfirmHubTransfer } from "@/hooks/useShipmentLegs";
import { ShipmentLeg } from "@/types/shipmentLeg.types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { HubTransferPrint } from "@/components/shared/HubTransferPrint";
import { BulkCartonLabel } from "@/components/shared/BulkCartonLabel";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { Package, ArrowRight, Truck, CheckCircle2, Lock, Search, Calendar, Eye, BarChart3 } from "lucide-react";
import { getHubCities } from "@/services/hub.services";

interface HubTransferGroup {
  route: string;
  originHubId: string;
  destHubId: string;
  originHubName: string;
  destHubName: string;
  legs: ShipmentLeg[];
  count: number;
  isUnlocked: boolean;
  blockedReason?: string;
  readyCount?: number;
  blockedCount?: number;
}

const findFirstIncompletePriorLeg = (
  leg: ShipmentLeg,
): { legNumber: number; legType: string; status: string } | null => {
  if (leg.legNumber <= 1) return null;

  const siblings = (leg.shipment?.legs ?? [])
    .filter((l) => l.legNumber < leg.legNumber)
    .sort((a, b) => a.legNumber - b.legNumber);

  // Allow COMPLETED or FAILED status for prior legs (FAILED is valid for return journeys)
  return siblings.find((l) => l.status !== "COMPLETED" && l.status !== "FAILED") ?? null;
};

const isLegReady = (leg: ShipmentLeg): boolean => {
  return !findFirstIncompletePriorLeg(leg);
};

export default function HubTransfers() {
  const [selectedGroup, setSelectedGroup] = useState<HubTransferGroup | null>(null);
  const [viewGroup, setViewGroup] = useState<HubTransferGroup | null>(null);
  const [action, setAction] = useState<"release" | "confirm" | null>(null);
  const [note, setNote] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [originFilter, setOriginFilter] = useState("");
  const [destFilter, setDestFilter] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [selectedLegIds, setSelectedLegIds] = useState<Set<string>>(new Set());

  const { data, isLoading } = useGetAllLegs({ legType: "HUB_TRANSFER", limit: 1000 });
  const releaseMutation = useReleaseHubTransfer();
  const confirmMutation = useConfirmHubTransfer();

  const { data: hubCitiesData } = useQuery({
    queryKey: ["hub-cities"],
    queryFn: async () => {
      const res = await getHubCities();
      return res.data;
    },
  });

  const hubCities = hubCitiesData || [];

  const filteredLegs = useMemo(() => {
    const legs: ShipmentLeg[] = data?.data ?? [];
    let filtered = legs;

    if (searchTerm) {
      filtered = filtered.filter(leg => 
        leg.shipment?.trackingNumber?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (originFilter && originFilter !== "__all__") {
      filtered = filtered.filter(leg => leg.originHub?.city === originFilter);
    }

    if (destFilter && destFilter !== "__all__") {
      filtered = filtered.filter(leg => leg.destHub?.city === destFilter);
    }

    if (dateFrom) {
      const fromDate = new Date(dateFrom);
      filtered = filtered.filter(leg => new Date(leg.createdAt) >= fromDate);
    }
    if (dateTo) {
      const toDate = new Date(dateTo);
      toDate.setHours(23, 59, 59, 999);
      filtered = filtered.filter(leg => new Date(leg.createdAt) <= toDate);
    }

    return filtered;
  }, [data?.data, searchTerm, originFilter, destFilter, dateFrom, dateTo]);

  const groupedTransfers = filteredLegs.reduce(
    (acc, leg) => {
      const route = `${leg.originHub?.name ?? "Unknown"} → ${leg.destHub?.name ?? "Unknown"}`;
      const key = `${leg.originHubId}-${leg.destHubId}-${leg.status}`;

      if (!acc[key]) {
        acc[key] = {
          route,
          originHubId: leg.originHubId ?? "",
          destHubId: leg.destHubId ?? "",
          originHubName: leg.originHub?.name ?? "Unknown",
          destHubName: leg.destHub?.name ?? "Unknown",
          legs: [],
          count: 0,
          isUnlocked: true,
        };
      }

      acc[key].legs.push(leg);
      acc[key].count++;

      return acc;
    },
    {} as Record<string, HubTransferGroup>,
  );

  // Separate ready and blocked legs for each group
  Object.values(groupedTransfers).forEach((group) => {
    if (group.legs[0]?.status === 'PENDING') {
      const readyLegs = group.legs.filter(isLegReady);
      const blockedLegs = group.legs.filter(leg => !isLegReady(leg));
      
      // Group is fully unlocked if ALL legs are ready
      group.isUnlocked = readyLegs.length === group.legs.length;
      
      // Store counts for partial release
      group.readyCount = readyLegs.length;
      group.blockedCount = blockedLegs.length;
      
      // Generate blocked reason from first blocked leg
      if (blockedLegs.length > 0) {
        const firstBlocked = blockedLegs[0];
        const incomplete = findFirstIncompletePriorLeg(firstBlocked);
        if (incomplete) {
          group.blockedReason = `${blockedLegs.length} shipment${blockedLegs.length !== 1 ? 's' : ''} blocked: Leg ${incomplete.legNumber} (${incomplete.legType}) must be COMPLETED first.`;
        }
      }
    }
  });

  const transfers = Object.values(groupedTransfers);

  const pendingTransfers = transfers.filter((t) => t.legs[0]?.status === "PENDING");
  const unlockedPending = pendingTransfers.filter((t) => t.isUnlocked);
  const partiallyReadyPending = pendingTransfers.filter((t) => !t.isUnlocked && (t.readyCount ?? 0) > 0);
  const fullyLockedPending = pendingTransfers.filter((t) => !t.isUnlocked && (t.readyCount ?? 0) === 0);

  const inProgressTransfers = transfers.filter((t) => t.legs[0]?.status === "IN_PROGRESS");
  const completedTransfers = transfers.filter((t) => t.legs[0]?.status === "COMPLETED");

  const totalShipments = filteredLegs.length;
  const totalPendingShipments = pendingTransfers.reduce((sum, t) => sum + t.count, 0);
  const totalInTransitShipments = inProgressTransfers.reduce((sum, t) => sum + t.count, 0);
  const totalCompletedShipments = completedTransfers.reduce((sum, t) => sum + t.count, 0);

  const handleRelease = () => {
    if (!selectedGroup || selectedLegIds.size === 0) {
      toast.error("Please select at least one shipment");
      return;
    }
    releaseMutation.mutate(
      { legIds: Array.from(selectedLegIds), note: note || undefined },
      {
        onSuccess: () => {
          toast.success(`Released ${selectedLegIds.size} shipment${selectedLegIds.size !== 1 ? 's' : ''} for hub transfer`);
          setSelectedGroup(null);
          setNote("");
          setAction(null);
          setSelectedLegIds(new Set());
        },
        onError: (err: Error) => {
          toast.error(err?.message ?? "Failed to release transfer");
        },
      },
    );
  };

  const handleConfirm = () => {
    if (!selectedGroup || selectedLegIds.size === 0) {
      toast.error("Please select at least one shipment");
      return;
    }
    confirmMutation.mutate(
      { legIds: Array.from(selectedLegIds), note: note || undefined },
      {
        onSuccess: () => {
          toast.success(`Confirmed receipt of ${selectedLegIds.size} shipment${selectedLegIds.size !== 1 ? "s" : ""}`);
          setSelectedGroup(null);
          setNote("");
          setAction(null);
          setSelectedLegIds(new Set());
        },
        onError: (err: Error) => {
          toast.error(err?.message ?? "Failed to confirm receipt");
        },
      },
    );
  };

  const openDialog = (group: HubTransferGroup, actionType: "release" | "confirm") => {
    setSelectedGroup(group);
    setAction(actionType);
    setNote("");
    // For release action on PENDING legs, pre-select only ready legs
    // For confirm action on IN_PROGRESS legs, pre-select all
    if (actionType === "release" && group.legs[0]?.status === 'PENDING') {
      const readyLegIds = group.legs.filter(isLegReady).map(l => l.id);
      setSelectedLegIds(new Set(readyLegIds));
    } else {
      setSelectedLegIds(new Set(group.legs.map(l => l.id)));
    }
  };

  const toggleLegSelection = (legId: string) => {
    setSelectedLegIds(prev => {
      const next = new Set(prev);
      if (next.has(legId)) {
        next.delete(legId);
      } else {
        next.add(legId);
      }
      return next;
    });
  };

  const toggleSelectAll = () => {
    if (!selectedGroup) return;
    if (selectedLegIds.size === selectedGroup.legs.length) {
      setSelectedLegIds(new Set());
    } else {
      setSelectedLegIds(new Set(selectedGroup.legs.map(l => l.id)));
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  return (
    <TooltipProvider>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Hub Transfer Management</h1>
          <p className="text-muted-foreground text-sm">
            Release and confirm shipments for internal hub-to-hub transfer.
          </p>
        </div>

        {/* Statistics Cards */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <BarChart3 className="h-4 w-4" />
                Total Shipments
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalShipments}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <Package className="h-4 w-4" />
                Pending
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">{totalPendingShipments}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <Truck className="h-4 w-4" />
                In Transit
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">{totalInTransitShipments}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4" />
                Completed
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{totalCompletedShipments}</div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="pt-6">
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search by tracking number..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-9"
                  />
                </div>
                <Select value={originFilter} onValueChange={setOriginFilter}>
                  <SelectTrigger className="w-full sm:w-[200px]">
                    <SelectValue placeholder="Origin Hub" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="__all__">All Origins</SelectItem>
                    {hubCities.map((city) => (
                      <SelectItem key={city} value={city}>{city}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select value={destFilter} onValueChange={setDestFilter}>
                  <SelectTrigger className="w-full sm:w-[200px]">
                    <SelectValue placeholder="Destination Hub" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="__all__">All Destinations</SelectItem>
                    {hubCities.map((city) => (
                      <SelectItem key={city} value={city}>{city}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 flex-1">
                  <Calendar className="h-4 w-4 text-muted-foreground hidden sm:block" />
                  <Input
                    type="date"
                    value={dateFrom}
                    onChange={(e) => setDateFrom(e.target.value)}
                    placeholder="From Date"
                    className="w-full sm:w-[160px]"
                  />
                  <span className="text-muted-foreground text-center sm:inline hidden">to</span>
                  <Input
                    type="date"
                    value={dateTo}
                    onChange={(e) => setDateTo(e.target.value)}
                    placeholder="To Date"
                    className="w-full sm:w-[160px]"
                  />
                </div>
                {(searchTerm || originFilter || destFilter || dateFrom || dateTo) && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setSearchTerm("");
                      setOriginFilter("");
                      setDestFilter("");
                      setDateFrom("");
                      setDateTo("");
                    }}
                    className="w-full sm:w-auto"
                  >
                    Clear Filters
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Pending Transfers */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Package className="h-5 w-5 text-muted-foreground" />
            <h2 className="text-lg font-semibold">Pending Hub Transfers</h2>
            <Badge variant="secondary">{pendingTransfers.length}</Badge>
          </div>

          {pendingTransfers.length === 0 ? (
            <Card>
              <CardContent className="pt-6">
                <p className="text-center text-muted-foreground">No pending transfers</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {unlockedPending.length > 0 && (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {unlockedPending.map((group, idx) => (
                    <Card key={idx} className="hover:shadow-md transition-shadow">
                      <CardHeader>
                        <CardTitle className="text-base flex items-center gap-2 flex-wrap">
                          <span className="truncate max-w-[120px]">{group.originHubName}</span>
                          <ArrowRight className="h-4 w-4 shrink-0" />
                          <span className="truncate max-w-[120px]">{group.destHubName}</span>
                        </CardTitle>
                        <CardDescription>
                          {group.count} shipment{group.count !== 1 ? "s" : ""} ready
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="flex flex-wrap gap-2">
                          <Button
                            onClick={() => openDialog(group, "release")}
                            className="flex-1 min-w-[100px]"
                            size="sm"
                          >
                            <Truck className="h-4 w-4 mr-1" />
                            Release
                          </Button>
                          <BulkCartonLabel
                            legs={group.legs}
                            originHubName={group.originHubName}
                            destHubName={group.destHubName}
                            originHubCity={group.legs[0]?.originHub?.city}
                            destHubCity={group.legs[0]?.destHub?.city}
                          />
                          <Button
                            onClick={() => setViewGroup(group)}
                            variant="outline"
                            size="sm"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}

              {partiallyReadyPending.length > 0 && (
                <div>
                  <p className="text-xs font-medium text-muted-foreground mb-2 flex items-center gap-1">
                    <Lock className="h-3 w-3" />
                    Partially ready - some shipments blocked ({partiallyReadyPending.length})
                  </p>
                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {partiallyReadyPending.map((group, idx) => {
                      const readyCount = group.readyCount ?? 0;
                      const blockedCount = group.blockedCount ?? 0;
                      return (
                        <Tooltip key={idx}>
                          <TooltipTrigger asChild>
                            <Card className="hover:shadow-md transition-shadow border-orange-300">
                              <CardHeader>
                                <CardTitle className="text-base flex items-center gap-2 flex-wrap">
                                  <span className="truncate max-w-[120px]">{group.originHubName}</span>
                                  <ArrowRight className="h-4 w-4 shrink-0" />
                                  <span className="truncate max-w-[120px]">{group.destHubName}</span>
                                </CardTitle>
                                <CardDescription>
                                  <span className="text-green-600 font-medium">{readyCount} ready</span>
                                  {" / "}
                                  <span className="text-orange-600">{blockedCount} blocked</span>
                                </CardDescription>
                              </CardHeader>
                              <CardContent>
                                <div className="flex flex-wrap gap-2">
                                  <Button
                                    onClick={() => openDialog(group, "release")}
                                    className="flex-1 min-w-[100px]"
                                    size="sm"
                                  >
                                    <Truck className="h-4 w-4 mr-1" />
                                    Release {readyCount}
                                  </Button>
                                  <BulkCartonLabel
                                    legs={group.legs.filter(isLegReady)}
                                    originHubName={group.originHubName}
                                    destHubName={group.destHubName}
                                    originHubCity={group.legs[0]?.originHub?.city}
                                    destHubCity={group.legs[0]?.destHub?.city}
                                  />
                                  <Button
                                    onClick={() => setViewGroup(group)}
                                    variant="outline"
                                    size="sm"
                                  >
                                    <Eye className="h-4 w-4" />
                                  </Button>
                                </div>
                              </CardContent>
                            </Card>
                          </TooltipTrigger>
                          <TooltipContent side="bottom" className="max-w-xs">
                            <p className="text-xs">{group.blockedReason}</p>
                          </TooltipContent>
                        </Tooltip>
                      );
                    })}
                  </div>
                </div>
              )}

              {fullyLockedPending.length > 0 && (
                <div>
                  <p className="text-xs font-medium text-muted-foreground mb-2 flex items-center gap-1">
                    <Lock className="h-3 w-3" />
                    Waiting for prior legs to complete ({fullyLockedPending.length})
                  </p>
                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {fullyLockedPending.map((group, idx) => (
                      <Tooltip key={idx}>
                        <TooltipTrigger asChild>
                          <Card className="opacity-60 border-dashed cursor-not-allowed">
                            <CardHeader>
                              <CardTitle className="text-base flex items-center gap-2 flex-wrap">
                                <Lock className="h-4 w-4 shrink-0 text-muted-foreground" />
                                <span className="truncate max-w-[100px]">{group.originHubName}</span>
                                <ArrowRight className="h-4 w-4 shrink-0" />
                                <span className="truncate max-w-[100px]">{group.destHubName}</span>
                              </CardTitle>
                              <CardDescription>
                                {group.count} shipment{group.count !== 1 ? "s" : ""} — blocked
                              </CardDescription>
                            </CardHeader>
                            <CardContent>
                              <Button disabled className="w-full" size="sm" variant="outline">
                                <Lock className="h-4 w-4 mr-2" />
                                Prior leg not completed
                              </Button>
                            </CardContent>
                          </Card>
                        </TooltipTrigger>
                        <TooltipContent side="bottom" className="max-w-xs">
                          <p className="text-xs">{group.blockedReason}</p>
                        </TooltipContent>
                      </Tooltip>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* In Transit */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Truck className="h-5 w-5 text-muted-foreground" />
            <h2 className="text-lg font-semibold">In Transit</h2>
            <Badge variant="secondary">{inProgressTransfers.length}</Badge>
          </div>

          {inProgressTransfers.length === 0 ? (
            <Card>
              <CardContent className="pt-6">
                <p className="text-center text-muted-foreground">No transfers in transit</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {inProgressTransfers.map((group, idx) => (
                <Card key={idx} className="hover:shadow-md transition-shadow border-primary/50">
                  <CardHeader>
                    <CardTitle className="text-base flex items-center gap-2 flex-wrap">
                      <span className="truncate max-w-[120px]">{group.originHubName}</span>
                      <ArrowRight className="h-4 w-4 shrink-0" />
                      <span className="truncate max-w-[120px]">{group.destHubName}</span>
                    </CardTitle>
                    <CardDescription>
                      {group.count} shipment{group.count !== 1 ? "s" : ""} in transit
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2">
                      <Button
                        onClick={() => openDialog(group, "confirm")}
                        className="flex-1 min-w-[100px]"
                        size="sm"
                        variant="outline"
                      >
                        <CheckCircle2 className="h-4 w-4 mr-1" />
                        Confirm
                      </Button>
                      <BulkCartonLabel
                        legs={group.legs}
                        originHubName={group.originHubName}
                        destHubName={group.destHubName}
                        originHubCity={group.legs[0]?.originHub?.city}
                        destHubCity={group.legs[0]?.destHub?.city}
                      />
                      <Button
                        onClick={() => setViewGroup(group)}
                        variant="outline"
                        size="sm"
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* Action Dialog */}
        <Dialog open={!!selectedGroup} onOpenChange={(o) => !o && setSelectedGroup(null)}>
          <DialogContent className="sm:max-w-lg md:max-w-xl lg:max-w-2xl xl:max-w-3xl">
            <DialogHeader>
              <DialogTitle className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                <span>{action === "release" ? "Release" : "Confirm"} Hub Transfer</span>
                {selectedGroup && (
                  <div className="flex gap-2">
                    <BulkCartonLabel
                      legs={selectedGroup.legs}
                      originHubName={selectedGroup.originHubName}
                      destHubName={selectedGroup.destHubName}
                      originHubCity={selectedGroup.legs[0]?.originHub?.city}
                      destHubCity={selectedGroup.legs[0]?.destHub?.city}
                    />
                    <HubTransferPrint
                      legs={selectedGroup.legs}
                      originHubName={selectedGroup.originHubName}
                      destHubName={selectedGroup.destHubName}
                    />
                  </div>
                )}
              </DialogTitle>
            </DialogHeader>

            {selectedGroup && (
              <div className="space-y-4 pt-2">
                <div className="text-sm space-y-2">
                  <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                    <div>
                      <p className="font-medium">{selectedGroup.originHubName}</p>
                      <p className="text-xs text-muted-foreground">Origin</p>
                    </div>
                    <ArrowRight className="h-5 w-5 text-muted-foreground" />
                    <div className="text-right">
                      <p className="font-medium">{selectedGroup.destHubName}</p>
                      <p className="text-xs text-muted-foreground">Destination</p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                    <span className="text-muted-foreground">Total Shipments:</span>
                    <Badge variant="secondary" className="text-base">
                      {selectedGroup.count}
                    </Badge>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-primary/10 rounded-lg border border-primary/20">
                    <span className="font-medium">Selected for {action === "release" ? "Release" : "Confirm"}:</span>
                    <Badge variant="default" className="text-base">
                      {selectedLegIds.size} / {selectedGroup.count}
                    </Badge>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label className="text-sm font-semibold">Select Shipments</Label>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={toggleSelectAll}
                      className="h-8 text-xs"
                    >
                      {selectedLegIds.size === selectedGroup.legs.length ? "Deselect All" : "Select All"}
                    </Button>
                  </div>
                  <div className="border rounded-lg overflow-hidden">
                    <div className="max-h-[300px] overflow-y-auto">
                      <table className="w-full">
                        <thead className="bg-muted/50 sticky top-0">
                          <tr>
                            <th className="p-2 text-left w-12">
                              <input
                                type="checkbox"
                                checked={selectedLegIds.size === selectedGroup.legs.length}
                                onChange={toggleSelectAll}
                                className="cursor-pointer"
                              />
                            </th>
                            <th className="p-2 text-left text-xs font-medium">Tracking #</th>
                            <th className="p-2 text-left text-xs font-medium">Leg #</th>
                            <th className="p-2 text-left text-xs font-medium">Status</th>
                            <th className="p-2 text-left text-xs font-medium">Created</th>
                          </tr>
                        </thead>
                        <tbody>
                          {selectedGroup.legs.map((leg) => {
                            const legReady = isLegReady(leg);
                            const isBlocked = !legReady;
                            return (
                              <tr
                                key={leg.id}
                                className={`border-t hover:bg-muted/30 ${
                                  isBlocked ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
                                } ${
                                  selectedLegIds.has(leg.id) ? 'bg-primary/5' : ''
                                }`}
                                onClick={() => !isBlocked && toggleLegSelection(leg.id)}
                              >
                                <td className="p-2">
                                  <input
                                    type="checkbox"
                                    checked={selectedLegIds.has(leg.id)}
                                    onChange={() => toggleLegSelection(leg.id)}
                                    disabled={isBlocked}
                                    className="cursor-pointer disabled:cursor-not-allowed"
                                    onClick={(e) => e.stopPropagation()}
                                  />
                                </td>
                                <td className="p-2 text-xs font-mono">{leg.shipment?.trackingNumber}</td>
                                <td className="p-2 text-xs">Leg {leg.legNumber}</td>
                                <td className="p-2 text-xs">
                                  {isBlocked ? (
                                    <Badge variant="outline" className="text-xs bg-orange-50 text-orange-700 border-orange-300">
                                      <Lock className="h-3 w-3 mr-1" />
                                      Blocked
                                    </Badge>
                                  ) : (
                                    <Badge variant="outline" className="text-xs bg-green-50 text-green-700 border-green-300">
                                      Ready
                                    </Badge>
                                  )}
                                </td>
                                <td className="p-2 text-xs text-muted-foreground">
                                  {new Date(leg.createdAt).toLocaleDateString()}
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label>Transfer Notes (Optional)</Label>
                  <Textarea
                    placeholder="Add any notes about this transfer batch..."
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    rows={3}
                  />
                </div>

                <Button
                  onClick={action === "release" ? handleRelease : handleConfirm}
                  disabled={releaseMutation.isPending || confirmMutation.isPending || selectedLegIds.size === 0}
                  className="w-full"
                >
                  {action === "release" ? (
                    <>
                      <Truck className="h-4 w-4 mr-2" />
                      {releaseMutation.isPending
                        ? "Releasing..."
                        : selectedLegIds.size === 0
                        ? "Select shipments to release"
                        : `Release ${selectedLegIds.size} Shipment${selectedLegIds.size !== 1 ? "s" : ""}`}
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="h-4 w-4 mr-2" />
                      {confirmMutation.isPending
                        ? "Confirming..."
                        : selectedLegIds.size === 0
                        ? "Select shipments to confirm"
                        : `Confirm ${selectedLegIds.size} Shipment${selectedLegIds.size !== 1 ? "s" : ""}`}
                    </>
                  )}
                </Button>
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* View Details Dialog */}
        <Dialog open={!!viewGroup} onOpenChange={(o) => !o && setViewGroup(null)}>
          <DialogContent className="sm:max-w-xl md:max-w-2xl lg:max-w-4xl xl:max-w-5xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                <span>Transfer Details</span>
                {viewGroup && (
                  <div className="flex gap-2">
                    <BulkCartonLabel
                      legs={viewGroup.legs}
                      originHubName={viewGroup.originHubName}
                      destHubName={viewGroup.destHubName}
                      originHubCity={viewGroup.legs[0]?.originHub?.city}
                      destHubCity={viewGroup.legs[0]?.destHub?.city}
                    />
                    <HubTransferPrint
                      legs={viewGroup.legs}
                      originHubName={viewGroup.originHubName}
                      destHubName={viewGroup.destHubName}
                    />
                  </div>
                )}
              </DialogTitle>
            </DialogHeader>

            {viewGroup && (
              <div className="space-y-4 pt-2">
                <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
                  <div>
                    <p className="font-medium">{viewGroup.originHubName}</p>
                    <p className="text-xs text-muted-foreground">Origin Hub</p>
                  </div>
                  <ArrowRight className="h-5 w-5 text-muted-foreground" />
                  <div className="text-right">
                    <p className="font-medium">{viewGroup.destHubName}</p>
                    <p className="text-xs text-muted-foreground">Destination Hub</p>
                  </div>
                </div>

                <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                  <span className="text-sm text-muted-foreground">Status:</span>
                  <Badge variant={viewGroup.legs[0]?.status === "PENDING" ? "secondary" : "default"}>
                    {viewGroup.legs[0]?.status}
                  </Badge>
                </div>

                <div>
                  <p className="text-sm font-semibold mb-2">Shipments in this Transfer ({viewGroup.count})</p>
                  <div className="border rounded-lg overflow-hidden">
                    <div className="max-h-[400px] overflow-y-auto overflow-x-auto">
                      <table className="w-full min-w-[500px]">
                        <thead className="bg-muted/50 sticky top-0">
                          <tr>
                            <th className="p-3 text-left text-sm font-medium">Tracking #</th>
                            <th className="p-3 text-left text-sm font-medium">Leg #</th>
                            <th className="p-3 text-left text-sm font-medium">Status</th>
                            <th className="p-3 text-left text-sm font-medium">Created</th>
                          </tr>
                        </thead>
                        <tbody>
                          {viewGroup.legs.map((leg) => (
                            <tr key={leg.id} className="border-t hover:bg-muted/30">
                              <td className="p-3 text-sm font-mono">{leg.shipment?.trackingNumber}</td>
                              <td className="p-3 text-sm">Leg {leg.legNumber}</td>
                              <td className="p-3 text-sm">
                                <Badge variant="outline" className="text-xs">{leg.status}</Badge>
                              </td>
                              <td className="p-3 text-sm text-muted-foreground">
                                {new Date(leg.createdAt).toLocaleDateString()}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </TooltipProvider>
  );
}
