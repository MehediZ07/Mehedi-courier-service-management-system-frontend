"use client";

import { useQuery } from "@tanstack/react-query";
import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { clientHttpClient } from "@/lib/axios/clientHttpClient";
import type { ApiResponse } from "@/types/api.types";
import { Search, Calendar, Wallet, TrendingUp, Clock, AlertCircle, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

interface CODTransaction {
    id: string;
    amount: number;
    settledAt: string;
    note?: string;
}

interface CourierCODSettlement {
    pendingCOD: number;
    totalSettled: number;
    totalEarnings: number;
    companyEarnings: number;
    transactions: CODTransaction[];
}

export default function CourierCODSettlement() {
    const [searchTerm, setSearchTerm] = useState("");
    const [dateFrom, setDateFrom] = useState("");
    const [dateTo, setDateTo] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    const { data, isLoading } = useQuery({
        queryKey: ["courier-cod-settlement"],
        queryFn: async () => {
            const res = await clientHttpClient.get<ApiResponse<CourierCODSettlement>>("/couriers/my-cod-settlement");
            return res.data;
        },
    });

    const settlement = data || { pendingCOD: 0, totalSettled: 0, totalEarnings: 0, companyEarnings: 0, transactions: [] };

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

    const currentPageClamped = Math.min(currentPage, Math.max(1, Math.ceil(filteredTransactions.length / itemsPerPage)));
    const totalPages = Math.ceil(filteredTransactions.length / itemsPerPage);
    const startIndex = (currentPageClamped - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const paginatedTransactions = filteredTransactions.slice(startIndex, endIndex);

    if (isLoading) return <div>Loading...</div>;

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold">COD Settlement</h1>
                <p className="text-muted-foreground text-sm">
                    Track COD amounts you&apos;ve collected and settlements received
                </p>
            </div>

            {/* Summary Cards */}
            <div className="grid gap-4 md:grid-cols-3">
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                            <Clock className="h-4 w-4" />
                            Pending COD
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-yellow-600">
                            {settlement.pendingCOD.toFixed(2)} BDT
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                            To be settled by admin
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
                            All COD collected
                        </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                            <Wallet className="h-4 w-4" />
                            Your Earnings
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-blue-600">
                            {settlement.totalEarnings.toFixed(2)} BDT
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                            From deliveries
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* Alert for Pending COD */}
            {settlement.pendingCOD > 0 && (
                <Card className="bg-yellow-50 dark:bg-yellow-950/20 border-yellow-200 dark:border-yellow-800">
                    <CardContent className="pt-6">
                        <div className="flex items-start gap-3">
                            <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5" />
                            <div className="space-y-1">
                                <p className="font-semibold text-yellow-900 dark:text-yellow-100">
                                    You have {settlement.pendingCOD.toFixed(2)} BDT pending COD
                                </p>
                                <p className="text-sm text-yellow-800 dark:text-yellow-200">
                                    This amount will be settled by admin after verification. Settlements are typically processed within 3-5 business days.
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            )}

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
                                    {paginatedTransactions.map((transaction) => (
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

                        {totalPages > 1 && (
                            <div className="flex items-center justify-between p-4 border-t">
                                <p className="text-sm text-muted-foreground">
                                    Showing {startIndex + 1}-{Math.min(endIndex, filteredTransactions.length)} of {filteredTransactions.length}
                                </p>
                                <div className="flex items-center gap-2">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                        disabled={currentPageClamped === 1}
                                    >
                                        <ChevronLeft className="h-4 w-4" />
                                    </Button>
                                    <span className="text-sm">
                                        Page {currentPageClamped} of {totalPages}
                                    </span>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                                        disabled={currentPageClamped === totalPages}
                                    >
                                        <ChevronRight className="h-4 w-4" />
                                    </Button>
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>
            )}

            {/* Info Card */}
            <Card className="bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-800">
                <CardContent className="pt-6">
                    <div className="space-y-2 text-sm">
                        <p className="font-semibold text-blue-900 dark:text-blue-100">Settlement Breakdown:</p>
                        <ul className="space-y-1 text-blue-800 dark:text-blue-200 list-disc list-inside">
                            <li>Total COD Collected: {settlement.totalSettled.toFixed(2)} BDT</li>
                            <li>Your Delivery Earnings: {settlement.totalEarnings.toFixed(2)} BDT</li>
                            <li>Pending COD (Not Yet Settled): {settlement.pendingCOD.toFixed(2)} BDT</li>
                        </ul>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
