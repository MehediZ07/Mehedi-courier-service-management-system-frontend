"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState, useMemo } from "react";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { clientHttpClient } from "@/lib/axios/clientHttpClient";
import type { ApiResponse } from "@/types/api.types";
import { DollarSign, Search, CheckCircle2 } from "lucide-react";

interface Merchant {
    id: string;
    companyName: string;
    pendingSettlement: number;
    user: {
        name: string;
        email: string;
        phone: string;
    };
}

export default function MerchantSettlementManagement() {
    const queryClient = useQueryClient();
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedMerchants, setSelectedMerchants] = useState<Set<string>>(new Set());
    const [settlementAmounts, setSettlementAmounts] = useState<Record<string, string>>({});
    const [bulkSettleDialog, setBulkSettleDialog] = useState(false);

    const { data, isLoading } = useQuery({
        queryKey: ["merchants-pending-settlement"],
        queryFn: async () => {
            const res = await clientHttpClient.get<ApiResponse<Merchant[]>>("/merchants/pending-settlement");
            return res.data;
        },
    });

    const { mutateAsync: settle, isPending } = useMutation({
        mutationFn: async ({ merchantId, amount }: { merchantId: string; amount: number }) => {
            return clientHttpClient.post(`/merchants/${merchantId}/settle`, { amount });
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["merchants-pending-settlement"] });
        },
    });

    const merchants = useMemo(() => data || [], [data]);
    
    const filteredMerchants = useMemo(() => {
        return merchants.filter(m => 
            m.companyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            m.user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            m.user.email.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [merchants, searchTerm]);

    const totalPending = merchants.reduce((sum, m) => sum + m.pendingSettlement, 0);
    const selectedTotal = Array.from(selectedMerchants).reduce((sum, id) => {
        const merchant = merchants.find(m => m.id === id);
        return sum + (merchant?.pendingSettlement || 0);
    }, 0);

    const handleSelectAll = (checked: boolean) => {
        if (checked) {
            setSelectedMerchants(new Set(filteredMerchants.map(m => m.id)));
        } else {
            setSelectedMerchants(new Set());
        }
    };

    const handleSelectMerchant = (merchantId: string, checked: boolean) => {
        const newSet = new Set(selectedMerchants);
        if (checked) {
            newSet.add(merchantId);
        } else {
            newSet.delete(merchantId);
        }
        setSelectedMerchants(newSet);
    };

    const handleSingleSettle = async (merchantId: string, maxAmount: number) => {
        const amount = Number(settlementAmounts[merchantId] || maxAmount);
        if (amount <= 0 || amount > maxAmount) {
            toast.error("Invalid amount");
            return;
        }
        await settle({ merchantId, amount });
        toast.success("Settlement completed");
        setSettlementAmounts(prev => {
            const next = { ...prev };
            delete next[merchantId];
            return next;
        });
    };

    const handleBulkSettle = async () => {
        if (selectedMerchants.size === 0) return;
        
        const promises = Array.from(selectedMerchants).map(merchantId => {
            const merchant = merchants.find(m => m.id === merchantId);
            if (!merchant) return Promise.resolve();
            return settle({ merchantId, amount: merchant.pendingSettlement });
        });

        await Promise.all(promises);
        toast.success(`Settled ${selectedMerchants.size} merchants`);
        setSelectedMerchants(new Set());
        setBulkSettleDialog(false);
    };

    if (isLoading) return <div>Loading...</div>;

    return (
        <div className="space-y-6">
            {/* Summary Cards */}
            <div className="grid gap-4 md:grid-cols-3">
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">
                            Total Merchants
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{merchants.length}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">
                            Total Pending
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-primary">
                            {totalPending.toFixed(2)} BDT
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">
                            Selected ({selectedMerchants.size})
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
            <div className="flex items-center gap-4">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Search by company, name, or email..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-9"
                    />
                </div>
                {selectedMerchants.size > 0 && (
                    <Button onClick={() => setBulkSettleDialog(true)}>
                        <DollarSign className="h-4 w-4 mr-2" />
                        Settle {selectedMerchants.size} Selected
                    </Button>
                )}
            </div>

            {/* Merchants Table */}
            {filteredMerchants.length === 0 ? (
                <Card>
                    <CardContent className="py-8 text-center text-muted-foreground">
                        {searchTerm ? "No merchants found" : "No merchants with pending settlements"}
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
                                                checked={selectedMerchants.size === filteredMerchants.length}
                                                onCheckedChange={handleSelectAll}
                                            />
                                        </th>
                                        <th className="p-3 text-left text-sm font-medium">Company</th>
                                        <th className="p-3 text-left text-sm font-medium">Contact</th>
                                        <th className="p-3 text-right text-sm font-medium">Pending</th>
                                        <th className="p-3 text-right text-sm font-medium">Amount</th>
                                        <th className="p-3 text-right text-sm font-medium">Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredMerchants.map((merchant) => (
                                        <tr key={merchant.id} className="border-b hover:bg-muted/30">
                                            <td className="p-3">
                                                <Checkbox
                                                    checked={selectedMerchants.has(merchant.id)}
                                                    onCheckedChange={(checked) => 
                                                        handleSelectMerchant(merchant.id, checked as boolean)
                                                    }
                                                />
                                            </td>
                                            <td className="p-3">
                                                <div>
                                                    <p className="font-medium">{merchant.companyName}</p>
                                                    <p className="text-xs text-muted-foreground">{merchant.user.name}</p>
                                                </div>
                                            </td>
                                            <td className="p-3">
                                                <div className="text-sm">
                                                    <p>{merchant.user.email}</p>
                                                    <p className="text-muted-foreground">{merchant.user.phone}</p>
                                                </div>
                                            </td>
                                            <td className="p-3 text-right">
                                                <Badge variant="secondary" className="font-mono">
                                                    {merchant.pendingSettlement.toFixed(2)} BDT
                                                </Badge>
                                            </td>
                                            <td className="p-3 text-right">
                                                <Input
                                                    type="number"
                                                    min={0}
                                                    max={merchant.pendingSettlement}
                                                    step={0.01}
                                                    placeholder="Full amount"
                                                    value={settlementAmounts[merchant.id] || ""}
                                                    onChange={(e) =>
                                                        setSettlementAmounts((prev) => ({
                                                            ...prev,
                                                            [merchant.id]: e.target.value,
                                                        }))
                                                    }
                                                    className="w-32 text-right"
                                                />
                                            </td>
                                            <td className="p-3 text-right">
                                                <Button
                                                    size="sm"
                                                    onClick={() => handleSingleSettle(merchant.id, merchant.pendingSettlement)}
                                                    disabled={isPending}
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

            {/* Bulk Settle Confirmation Dialog */}
            <Dialog open={bulkSettleDialog} onOpenChange={setBulkSettleDialog}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Confirm Bulk Settlement</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 pt-2">
                        <div className="bg-muted p-4 rounded-lg space-y-2">
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Merchants:</span>
                                <span className="font-semibold">{selectedMerchants.size}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Total Amount:</span>
                                <span className="font-bold text-lg">{selectedTotal.toFixed(2)} BDT</span>
                            </div>
                        </div>
                        <p className="text-sm text-muted-foreground">
                            This will settle the full pending amount for each selected merchant.
                        </p>
                        <div className="flex gap-2">
                            <Button variant="outline" onClick={() => setBulkSettleDialog(false)} className="flex-1">
                                Cancel
                            </Button>
                            <Button onClick={handleBulkSettle} disabled={isPending} className="flex-1">
                                <CheckCircle2 className="h-4 w-4 mr-2" />
                                {isPending ? "Processing..." : "Confirm Settlement"}
                            </Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}
