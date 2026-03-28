"use client";

import { getMyCourierEarnings } from "@/services/courier.services";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Wallet, TrendingUp, Clock, PackageCheck, AlertCircle, ArrowRight } from "lucide-react";
import Link from "next/link";

type EarningLeg = {
    id: string;
    trackingNumber: string;
    legType: string;
    earning: number;
    codCollected: boolean;
    codAmount: number | null;
    completedAt: string;
};

export default function CourierEarnings() {
    const { data, isLoading } = useQuery({
        queryKey: ["courier-earnings"],
        queryFn: getMyCourierEarnings,
    });

    const earnings = data?.data;
    const recentLegs: EarningLeg[] = earnings?.recentLegs || [];

    const stats = {
        totalEarnings: earnings?.totalEarnings || 0,
        pendingCOD: earnings?.pendingCOD || 0,
        completedLegs: recentLegs.length,
        totalCODCollected: recentLegs.reduce((sum, leg) => sum + (leg.codAmount || 0), 0),
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold">My Earnings</h1>
                <p className="text-muted-foreground text-sm">Track your delivery earnings and COD collections.</p>
            </div>

            {/* Stats Cards */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950 dark:to-emerald-950 border-green-200 dark:border-green-800">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-green-900 dark:text-green-100 flex items-center gap-2">
                            <Wallet className="h-4 w-4" />
                            Total Earnings
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-green-700 dark:text-green-300">
                            {stats.totalEarnings.toFixed(2)} BDT
                        </div>
                        <p className="text-xs text-green-600 dark:text-green-400 mt-1">
                            Lifetime delivery earnings
                        </p>
                    </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-yellow-50 to-amber-50 dark:from-yellow-950 dark:to-amber-950 border-yellow-200 dark:border-yellow-800">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-yellow-900 dark:text-yellow-100 flex items-center gap-2">
                            <Clock className="h-4 w-4" />
                            Pending COD
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-yellow-700 dark:text-yellow-300">
                            {stats.pendingCOD.toFixed(2)} BDT
                        </div>
                        <p className="text-xs text-yellow-600 dark:text-yellow-400 mt-1">
                            To be settled by admin
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                            <PackageCheck className="h-4 w-4" />
                            Completed Legs
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.completedLegs}</div>
                        <p className="text-xs text-muted-foreground mt-1">Recent deliveries</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                            <TrendingUp className="h-4 w-4" />
                            Total COD Collected
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.totalCODCollected.toFixed(2)} BDT</div>
                        <p className="text-xs text-muted-foreground mt-1">From recent legs</p>
                    </CardContent>
                </Card>
            </div>

            {/* Quick Actions */}
            <div className="grid gap-4 md:grid-cols-2">
                <Card>
                    <CardHeader>
                        <CardTitle className="text-base">Earnings Breakdown</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                            <span className="text-sm text-muted-foreground">Per Delivery Earning:</span>
                            <span className="font-semibold">10% of shipment charge</span>
                        </div>
                        <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                            <span className="text-sm text-muted-foreground">Total Deliveries:</span>
                            <span className="font-semibold">{stats.completedLegs}</span>
                        </div>
                        <div className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-950/20 rounded-lg border border-green-200 dark:border-green-800">
                            <span className="text-sm font-medium text-green-900 dark:text-green-100">Total Earned:</span>
                            <span className="font-bold text-green-700 dark:text-green-300">{stats.totalEarnings.toFixed(2)} BDT</span>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle className="text-base">COD Management</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                            <span className="text-sm text-muted-foreground">COD Collected:</span>
                            <span className="font-semibold">{stats.totalCODCollected.toFixed(2)} BDT</span>
                        </div>
                        <div className="flex items-center justify-between p-3 bg-yellow-50 dark:bg-yellow-950/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
                            <span className="text-sm font-medium text-yellow-900 dark:text-yellow-100">Pending Settlement:</span>
                            <span className="font-bold text-yellow-700 dark:text-yellow-300">{stats.pendingCOD.toFixed(2)} BDT</span>
                        </div>
                        <Link href="/courier/dashboard/cod-settlement">
                            <Button variant="outline" size="sm" className="w-full">
                                View Settlement History <ArrowRight className="h-4 w-4 ml-2" />
                            </Button>
                        </Link>
                    </CardContent>
                </Card>
            </div>

            {/* Recent Completed Legs */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                        <span>Recent Completed Deliveries</span>
                        <Link href="/courier/dashboard/delivery-history">
                            <Button variant="ghost" size="sm">
                                View All <ArrowRight className="h-4 w-4 ml-2" />
                            </Button>
                        </Link>
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    {recentLegs.length === 0 ? (
                        <div className="text-center py-8 text-muted-foreground">
                            <PackageCheck className="h-12 w-12 mx-auto mb-3 opacity-50" />
                            <p>No completed deliveries yet</p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {recentLegs.map((leg) => (
                                <div key={leg.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2">
                                            <p className="font-mono font-semibold">{leg.trackingNumber}</p>
                                            <Badge variant="outline">{leg.legType}</Badge>
                                            {leg.codCollected && (
                                                <Badge className="bg-yellow-600">COD</Badge>
                                            )}
                                        </div>
                                        <p className="text-xs text-muted-foreground mt-1">
                                            Completed: {new Date(leg.completedAt).toLocaleDateString()}
                                        </p>
                                    </div>
                                    <div className="text-right">
                                        <p className="font-semibold text-green-600">{leg.earning.toFixed(2)} BDT</p>
                                        {leg.codCollected && leg.codAmount && (
                                            <p className="text-xs text-yellow-600">COD: {leg.codAmount.toFixed(2)} BDT</p>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Info Banner */}
            <Card className="bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-800">
                <CardContent className="pt-6">
                    <div className="flex items-start gap-3">
                        <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5" />
                        <div>
                            <p className="font-semibold text-blue-900 dark:text-blue-100">How Earnings Work</p>
                            <ul className="text-sm text-blue-800 dark:text-blue-200 mt-2 space-y-1 list-disc list-inside">
                                <li>You earn 10% of the shipment charge for each delivery leg you complete</li>
                                <li>For COD shipments, you collect cash from customers (product price + shipment charge)</li>
                                <li>COD amounts appear in &quot;Pending COD&quot; until admin settles them</li>
                                <li>Your delivery earnings are separate and tracked in &quot;Total Earnings&quot;</li>
                                <li>All earnings are automatically calculated and updated in real-time</li>
                            </ul>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
