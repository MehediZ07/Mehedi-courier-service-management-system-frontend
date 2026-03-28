"use client";

import { useQuery } from "@tanstack/react-query";
import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { clientHttpClient } from "@/lib/axios/clientHttpClient";
import type { ApiResponse } from "@/types/api.types";
import { Search, Calendar, DollarSign, TrendingUp, Clock } from "lucide-react";

interface SettlementTransaction {
    id: string;
    amount: number;
    settledAt: string;
    note?: string;
}

interface MerchantSettlement {
    pendingSettlement: number;
    totalSettled: number;
    transactions: SettlementTransaction[];
}

export default function MerchantSettlementHistory() {
    const [searchTerm, setSearchTerm] = useState("");
    const [dateFrom, setDateFrom] = useState("");
    const [dateTo, setDateTo] = useState("");

    const { data, isLoading } = useQuery({
        queryKey: ["merchant-settlement-history"],
        queryFn: async () => {
            const res = await clientHttpClient.get<ApiResponse<MerchantSettlement>>("/merchants/my-settlement");
            return res.data;
        },
    });

    const settlement = data || { pendingSettlement: 0, totalSettled: 0, transactions: [] };

    const filteredTransactions = useMemo(() => {
        let filtered = settlement.transactions;

        if (searchTerm) {
            filtered = filtered.filter(t =>
                t.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                t.note?.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        if (dateFrom) {
            const fromDate = new Date(dateFrom);
            filtered = filtered.filter(t => new Date(t.settledAt) >= fromDate);
        }
        if (dateTo) {
            const toDate = new Date(dateTo);
            toDate.setHours(23, 59, 59, 999);
            filtered = filtered.filter(t => new Date(t.settledAt) <= toDate);
        }

        return filtered.sort((a, b) => new Date(b.settledAt).getTime() - new Date(a.settledAt).getTime());
    }, [settlement.transactions, searchTerm, dateFrom, dateTo]);

    if (isLoading) return <div>Loading...</div>;

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold">Settlement History</h1>
                <p className="text-muted-foreground text-sm">
                    Track your product price settlements (after 1.85% commission)
                </p>
            </div>

            {/* Summary Cards */}
            <div className="grid gap-4 md:grid-cols-3">
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                            <Clock className="h-4 w-4" />
                            Pending Settlement
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-yellow-600">
                            {settlement.pendingSettlement.toFixed(2)} BDT
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                            Awaiting admin approval
                        </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                            <TrendingUp className="h-4 w-4" />
                            Total Settled
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-green-600">
                            {settlement.totalSettled.toFixed(2)} BDT
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                            All-time settlements
                        </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                            <DollarSign className="h-4 w-4" />
                            Transactions
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {settlement.transactions.length}
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                            Settlement records
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* Filters */}
            <Card>
                <CardContent className="pt-6">
                    <div className="space-y-4">
                        <div className="flex items-center gap-4">
                            <div className="relative flex-1">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                <Input
                                    placeholder="Search by transaction ID or note..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="pl-9"
                                />
                            </div>
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
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Transactions Table */}
            {filteredTransactions.length === 0 ? (
                <Card>
                    <CardContent className="py-8 text-center text-muted-foreground">
                        {searchTerm || dateFrom || dateTo ? "No transactions found" : "No settlement history yet"}
                    </CardContent>
                </Card>
            ) : (
                <Card>
                    <CardContent className="p-0">
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="border-b bg-muted/50">
                                    <tr>
                                        <th className="p-3 text-left text-sm font-medium">Transaction ID</th>
                                        <th className="p-3 text-left text-sm font-medium">Amount</th>
                                        <th className="p-3 text-left text-sm font-medium">Settled Date</th>
                                        <th className="p-3 text-left text-sm font-medium">Note</th>
                                        <th className="p-3 text-left text-sm font-medium">Status</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredTransactions.map((transaction) => (
                                        <tr key={transaction.id} className="border-b hover:bg-muted/30">
                                            <td className="p-3">
                                                <p className="font-mono text-sm">{transaction.id.slice(0, 8)}</p>
                                            </td>
                                            <td className="p-3">
                                                <Badge variant="default" className="font-mono bg-green-600">
                                                    {transaction.amount.toFixed(2)} BDT
                                                </Badge>
                                            </td>
                                            <td className="p-3 text-sm">
                                                {new Date(transaction.settledAt).toLocaleString()}
                                            </td>
                                            <td className="p-3 text-sm text-muted-foreground">
                                                {transaction.note || "—"}
                                            </td>
                                            <td className="p-3">
                                                <Badge variant="outline" className="text-green-600 border-green-600">
                                                    Completed
                                                </Badge>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Info Card */}
            <Card className="bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-800">
                <CardContent className="pt-6">
                    <div className="space-y-2 text-sm">
                        <p className="font-semibold text-blue-900 dark:text-blue-100">How Settlement Works:</p>
                        <ul className="space-y-1 text-blue-800 dark:text-blue-200 list-disc list-inside">
                            <li>When customers pay product price via COD, the amount is collected by couriers</li>
                            <li>After delivery confirmation, 1.85% commission is deducted</li>
                            <li>Remaining amount appears in &quot;Pending Settlement&quot;</li>
                            <li>Admin reviews and processes settlements periodically</li>
                            <li>Once settled, the transaction appears in your history</li>
                        </ul>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
