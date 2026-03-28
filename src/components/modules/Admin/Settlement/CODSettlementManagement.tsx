"use client";

import { getAllCouriers, settleCOD } from "@/services/courier.services";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { useState, useMemo } from "react";
import { Courier } from "@/types/courier.types";
import { Search, DollarSign, CheckCircle2, Wallet, Calendar } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { getHubCities } from "@/services/hub.services";

export default function CODSettlementManagement() {
    const queryClient = useQueryClient();
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedHub, setSelectedHub] = useState<string>("");
    const [dateFrom, setDateFrom] = useState<string>("");
    const [dateTo, setDateTo] = useState<string>("");
    const [selectedCouriers, setSelectedCouriers] = useState<Set<string>>(new Set());
    const [settlementAmounts, setSettlementAmounts] = useState<Record<string, string>>({});
    const [singleSettleDialog, setSingleSettleDialog] = useState<Courier | null>(null);
    const [bulkSettleDialog, setBulkSettleDialog] = useState(false);

    const { data: hubCitiesData } = useQuery({
        queryKey: ["hub-cities"],
        queryFn: async () => {
            const res = await getHubCities();
            return res.data;
        },
    });

    const hubCities = hubCitiesData || [];

    const { data, isLoading } = useQuery({
        queryKey: ["couriers-cod"],
        queryFn: () => getAllCouriers({ limit: 1000 }),
    });

    const settleMutation = useMutation({
        mutationFn: ({ courierId, amount }: { courierId: string; amount: number }) =>
            settleCOD(courierId, amount),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["couriers-cod"] });
        },
    });

    const couriers = data?.data ?? [];
    const couriersWithCOD = couriers.filter((c) => c.pendingCOD > 0);

    const filteredCouriers = useMemo(() => {
        let filtered = couriersWithCOD.filter(c =>
            c.user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            c.user.phone?.includes(searchTerm) ||
            c.city?.toLowerCase().includes(searchTerm.toLowerCase())
        );

        if (selectedHub) {
            filtered = filtered.filter(c => c.city === selectedHub);
        }

        return filtered;
    }, [couriersWithCOD, searchTerm, selectedHub]);

    const totalPendingCOD = couriersWithCOD.reduce((sum, c) => sum + c.pendingCOD, 0);
    const selectedTotal = Array.from(selectedCouriers).reduce((sum, id) => {
        const courier = couriersWithCOD.find(c => c.id === id);
        return sum + (courier?.pendingCOD || 0);
    }, 0);

    const handleSelectAll = (checked: boolean) => {
        if (checked) {
            setSelectedCouriers(new Set(filteredCouriers.map(c => c.id)));
        } else {
            setSelectedCouriers(new Set());
        }
    };

    const handleSelectCourier = (courierId: string, checked: boolean) => {
        const newSet = new Set(selectedCouriers);
        if (checked) {
            newSet.add(courierId);
        } else {
            newSet.delete(courierId);
        }
        setSelectedCouriers(newSet);
    };

    const handleSingleSettle = async () => {
        if (!singleSettleDialog) return;
        const amount = Number(settlementAmounts[singleSettleDialog.id] || singleSettleDialog.pendingCOD);
        if (amount <= 0 || amount > singleSettleDialog.pendingCOD) {
            toast.error("Invalid amount");
            return;
        }
        await settleMutation.mutateAsync({ courierId: singleSettleDialog.id, amount });
        toast.success("COD settled successfully");
        setSingleSettleDialog(null);
        setSettlementAmounts(prev => {
            const next = { ...prev };
            delete next[singleSettleDialog.id];
            return next;
        });
    };

    const handleBulkSettle = async () => {
        if (selectedCouriers.size === 0) return;

        const promises = Array.from(selectedCouriers).map(courierId => {
            const courier = couriersWithCOD.find(c => c.id === courierId);
            if (!courier) return Promise.resolve();
            return settleMutation.mutateAsync({ courierId, amount: courier.pendingCOD });
        });

        await Promise.all(promises);
        toast.success(`Settled COD for ${selectedCouriers.size} couriers`);
        setSelectedCouriers(new Set());
        setBulkSettleDialog(false);
    };

    if (isLoading) {
        return <div className="text-muted-foreground text-sm">Loading...</div>;
    }

    return (
        <div className="space-y-6">
            {/* Summary Cards */}
            <div className="grid gap-4 md:grid-cols-3">
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                            <Wallet className="h-4 w-4" />
                            Couriers with COD
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{couriersWithCOD.length}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">
                            Total Pending COD
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-yellow-600">
                            {totalPendingCOD.toFixed(2)} BDT
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">
                            Selected ({selectedCouriers.size})
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-green-600">
                            {selectedTotal.toFixed(2)} BDT
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Actions Bar */}
            <div className="flex flex-col gap-4">
                <div className="flex items-center gap-4">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Search by name, phone, or city..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-9"
                        />
                    </div>
                    <Select value={selectedHub} onValueChange={setSelectedHub}>
                        <SelectTrigger className="w-[200px]">
                            <SelectValue placeholder="Filter by Hub" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="__all__">All Hubs</SelectItem>
                            {hubCities.map((city) => (
                                <SelectItem key={city} value={city}>{city}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    {selectedCouriers.size > 0 && (
                        <Button onClick={() => setBulkSettleDialog(true)}>
                            <DollarSign className="h-4 w-4 mr-2" />
                            Settle {selectedCouriers.size} Selected
                        </Button>
                    )}
                </div>
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <Input
                            type="date"
                            value={dateFrom}
                            onChange={(e) => setDateFrom(e.target.value)}
                            placeholder="From Date"
                            className="w-[160px]"
                        />
                        <span className="text-muted-foreground">to</span>
                        <Input
                            type="date"
                            value={dateTo}
                            onChange={(e) => setDateTo(e.target.value)}
                            placeholder="To Date"
                            className="w-[160px]"
                        />
                    </div>
                    {(selectedHub || dateFrom || dateTo) && (
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                                setSelectedHub("");
                                setDateFrom("");
                                setDateTo("");
                            }}
                        >
                            Clear Filters
                        </Button>
                    )}
                </div>
            </div>

            {/* Couriers Table */}
            {filteredCouriers.length === 0 ? (
                <Card>
                    <CardContent className="py-8 text-center text-muted-foreground">
                        {searchTerm ? "No couriers found" : "No couriers with pending COD"}
                    </CardContent>
                </Card>
            ) : (
                <Card>
                    <CardContent className="p-0">
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="border-b bg-muted/50">
                                    <tr>
                                        <th className="p-3 text-left">
                                            <Checkbox
                                                checked={selectedCouriers.size === filteredCouriers.length}
                                                onCheckedChange={handleSelectAll}
                                            />
                                        </th>
                                        <th className="p-3 text-left text-sm font-medium">Courier</th>
                                        <th className="p-3 text-left text-sm font-medium">Contact</th>
                                        <th className="p-3 text-left text-sm font-medium">City</th>
                                        <th className="p-3 text-left text-sm font-medium">Vehicle</th>
                                        <th className="p-3 text-right text-sm font-medium">Pending COD</th>
                                        <th className="p-3 text-right text-sm font-medium">Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredCouriers.map((courier) => (
                                        <tr key={courier.id} className="border-b hover:bg-muted/30">
                                            <td className="p-3">
                                                <Checkbox
                                                    checked={selectedCouriers.has(courier.id)}
                                                    onCheckedChange={(checked) =>
                                                        handleSelectCourier(courier.id, checked as boolean)
                                                    }
                                                />
                                            </td>
                                            <td className="p-3">
                                                <p className="font-medium">{courier.user.name}</p>
                                            </td>
                                            <td className="p-3 text-sm">
                                                <p>{courier.user.phone}</p>
                                            </td>
                                            <td className="p-3">
                                                <Badge variant="outline">{courier.city}</Badge>
                                            </td>
                                            <td className="p-3">
                                                <Badge variant="secondary">{courier.vehicleType}</Badge>
                                            </td>
                                            <td className="p-3 text-right">
                                                <Badge variant="default" className="font-mono bg-yellow-600">
                                                    {courier.pendingCOD.toFixed(2)} BDT
                                                </Badge>
                                            </td>
                                            <td className="p-3 text-right">
                                                <Button
                                                    size="sm"
                                                    onClick={() => {
                                                        setSingleSettleDialog(courier);
                                                        setSettlementAmounts(prev => ({
                                                            ...prev,
                                                            [courier.id]: courier.pendingCOD.toString()
                                                        }));
                                                    }}
                                                >
                                                    Settle
                                                </Button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Single Settle Dialog */}
            <Dialog open={!!singleSettleDialog} onOpenChange={(o) => !o && setSingleSettleDialog(null)}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Settle COD Payment</DialogTitle>
                    </DialogHeader>
                    {singleSettleDialog && (
                        <div className="space-y-4 pt-2">
                            <div className="bg-muted p-4 rounded-lg space-y-2 text-sm">
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Courier:</span>
                                    <span className="font-medium">{singleSettleDialog.user.name}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Phone:</span>
                                    <span>{singleSettleDialog.user.phone}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Pending COD:</span>
                                    <span className="font-bold">{singleSettleDialog.pendingCOD.toFixed(2)} BDT</span>
                                </div>
                            </div>
                            <div className="space-y-1.5">
                                <Label>Settlement Amount (BDT)</Label>
                                <Input
                                    type="number"
                                    value={settlementAmounts[singleSettleDialog.id] || ""}
                                    onChange={(e) => setSettlementAmounts(prev => ({
                                        ...prev,
                                        [singleSettleDialog.id]: e.target.value
                                    }))}
                                    placeholder="Enter amount"
                                    step="0.01"
                                />
                                <p className="text-xs text-muted-foreground">
                                    Maximum: {singleSettleDialog.pendingCOD.toFixed(2)} BDT
                                </p>
                            </div>
                            <Button
                                onClick={handleSingleSettle}
                                disabled={settleMutation.isPending}
                                className="w-full"
                            >
                                {settleMutation.isPending ? "Processing..." : "Confirm Settlement"}
                            </Button>
                        </div>
                    )}
                </DialogContent>
            </Dialog>

            {/* Bulk Settle Dialog */}
            <Dialog open={bulkSettleDialog} onOpenChange={setBulkSettleDialog}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Confirm Bulk COD Settlement</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 pt-2">
                        <div className="bg-muted p-4 rounded-lg space-y-2">
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Couriers:</span>
                                <span className="font-semibold">{selectedCouriers.size}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Total COD Amount:</span>
                                <span className="font-bold text-lg">{selectedTotal.toFixed(2)} BDT</span>
                            </div>
                        </div>
                        <p className="text-sm text-muted-foreground">
                            This will settle the full pending COD amount for each selected courier.
                        </p>
                        <div className="flex gap-2">
                            <Button variant="outline" onClick={() => setBulkSettleDialog(false)} className="flex-1">
                                Cancel
                            </Button>
                            <Button onClick={handleBulkSettle} disabled={settleMutation.isPending} className="flex-1">
                                <CheckCircle2 className="h-4 w-4 mr-2" />
                                {settleMutation.isPending ? "Processing..." : "Confirm Settlement"}
                            </Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}
