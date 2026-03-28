"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useGetMyShipments } from "@/hooks/queries";
import { useQuery } from "@tanstack/react-query";
import { clientHttpClient } from "@/lib/axios/clientHttpClient";
import { useMemo } from "react";
import { Package, Clock, Truck, PackageCheck, TrendingUp, DollarSign, AlertCircle, ArrowRight } from "lucide-react";
import Link from "next/link";
import type { ApiResponse } from "@/types/api.types";

interface MerchantSettlement {
    pendingSettlement: number;
    totalSettled: number;
}

const MerchantDashboardContent = () => {
    const { data: shipmentsResponse, isLoading } = useGetMyShipments({ limit: 100 });

    const { data: settlementData } = useQuery({
        queryKey: ["merchant-settlement"],
        queryFn: async () => {
            const res = await clientHttpClient.get<ApiResponse<MerchantSettlement>>("/merchants/my-settlement");
            return res.data;
        },
    });

    const stats = useMemo(() => {
        const shipments = shipmentsResponse?.data || [];
        const totalRevenue = shipments
            .filter(s => s.status === "DELIVERED")
            .reduce((sum, s) => sum + (s.productPrice || 0), 0);

        return {
            total: shipments.length,
            pending: shipments.filter(s => s.status === "PENDING" || s.status === "ASSIGNED").length,
            inTransit: shipments.filter(s => s.status === "IN_TRANSIT" || s.status === "OUT_FOR_DELIVERY").length,
            delivered: shipments.filter(s => s.status === "DELIVERED").length,
            totalRevenue,
            pendingSettlement: settlementData?.pendingSettlement || 0,
        };
    }, [shipmentsResponse, settlementData]);

    const recentShipments = useMemo(() => {
        const shipments = shipmentsResponse?.data || [];
        return shipments.slice(0, 5);
    }, [shipmentsResponse]);

    const statusColors: Record<string, string> = {
        PENDING: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
        ASSIGNED: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
        IN_TRANSIT: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200",
        OUT_FOR_DELIVERY: "bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200",
        DELIVERED: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
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
                <h2 className="text-2xl font-bold tracking-tight">Merchant Dashboard</h2>
                <p className="text-muted-foreground">Manage your shipments and track your business performance.</p>
            </div>

            {/* Stats Cards */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                            <Package className="h-4 w-4" />
                            Total Shipments
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.total}</div>
                        <p className="text-xs text-muted-foreground mt-1">All time shipments</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                            <Clock className="h-4 w-4" />
                            Pending
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-yellow-600">{stats.pending}</div>
                        <p className="text-xs text-muted-foreground mt-1">Awaiting pickup</p>
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
                        <div className="text-2xl font-bold text-blue-600">{stats.inTransit}</div>
                        <p className="text-xs text-muted-foreground mt-1">On the way</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                            <PackageCheck className="h-4 w-4" />
                            Delivered
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-green-600">{stats.delivered}</div>
                        <p className="text-xs text-muted-foreground mt-1">Successfully completed</p>
                    </CardContent>
                </Card>
            </div>

            {/* Financial Overview */}
            <div className="grid gap-4 md:grid-cols-2">
                <Card className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950 dark:to-emerald-950 border-green-200 dark:border-green-800">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-green-900 dark:text-green-100">
                            <TrendingUp className="h-5 w-5" />
                            Total Revenue
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold text-green-700 dark:text-green-300">
                            {stats.totalRevenue.toFixed(2)} BDT
                        </div>
                        <p className="text-sm text-green-600 dark:text-green-400 mt-2">
                            From {stats.delivered} delivered shipments
                        </p>
                        <Link href="/merchant/dashboard/my-shipments">
                            <Button variant="outline" size="sm" className="mt-4 border-green-600 text-green-700 hover:bg-green-100 dark:border-green-400 dark:text-green-300">
                                View All Shipments <ArrowRight className="h-4 w-4 ml-2" />
                            </Button>
                        </Link>
                    </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-yellow-50 to-amber-50 dark:from-yellow-950 dark:to-amber-950 border-yellow-200 dark:border-yellow-800">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-yellow-900 dark:text-yellow-100">
                            <DollarSign className="h-5 w-5" />
                            Pending Settlement
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold text-yellow-700 dark:text-yellow-300">
                            {stats.pendingSettlement.toFixed(2)} BDT
                        </div>
                        <p className="text-sm text-yellow-600 dark:text-yellow-400 mt-2">
                            After 1.85% commission deduction
                        </p>
                        <Link href="/merchant/dashboard/settlement-history">
                            <Button variant="outline" size="sm" className="mt-4 border-yellow-600 text-yellow-700 hover:bg-yellow-100 dark:border-yellow-400 dark:text-yellow-300">
                                View Settlement History <ArrowRight className="h-4 w-4 ml-2" />
                            </Button>
                        </Link>
                    </CardContent>
                </Card>
            </div>

            {/* Quick Actions */}
            <Card>
                <CardHeader>
                    <CardTitle>Quick Actions</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid gap-3 md:grid-cols-3">
                        <Link href="/merchant/dashboard/create-shipment">
                            <Button className="w-full" size="lg">
                                <Package className="h-5 w-5 mr-2" />
                                Create New Shipment
                            </Button>
                        </Link>
                        <Link href="/merchant/dashboard/track-shipment">
                            <Button variant="outline" className="w-full" size="lg">
                                <Truck className="h-5 w-5 mr-2" />
                                Track Shipment
                            </Button>
                        </Link>
                        <Link href="/merchant/dashboard/my-shipments">
                            <Button variant="outline" className="w-full" size="lg">
                                <PackageCheck className="h-5 w-5 mr-2" />
                                View All Shipments
                            </Button>
                        </Link>
                    </div>
                </CardContent>
            </Card>

            {/* Recent Shipments */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                        <span>Recent Shipments</span>
                        <Link href="/merchant/dashboard/my-shipments">
                            <Button variant="ghost" size="sm">
                                View All <ArrowRight className="h-4 w-4 ml-2" />
                            </Button>
                        </Link>
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    {recentShipments.length === 0 ? (
                        <div className="text-center py-8 text-muted-foreground">
                            <Package className="h-12 w-12 mx-auto mb-3 opacity-50" />
                            <p>No shipments yet</p>
                            <Link href="/merchant/dashboard/create-shipment">
                                <Button className="mt-4">
                                    Create Your First Shipment
                                </Button>
                            </Link>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {recentShipments.map((shipment) => (
                                <div key={shipment.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2">
                                            <p className="font-mono font-semibold">{shipment.trackingNumber}</p>
                                            <Badge className={statusColors[shipment.status] || ""}>
                                                {shipment.status}
                                            </Badge>
                                        </div>
                                        <p className="text-sm text-muted-foreground mt-1">
                                            {shipment.pickupCity} → {shipment.deliveryCity}
                                        </p>
                                    </div>
                                    <div className="text-right">
                                        <p className="font-semibold">{shipment.productPrice?.toFixed(2)} BDT</p>
                                        <p className="text-xs text-muted-foreground">
                                            {new Date(shipment.createdAt).toLocaleDateString()}
                                        </p>
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
                            <p className="font-semibold text-blue-900 dark:text-blue-100">How Settlement Works</p>
                            <p className="text-sm text-blue-800 dark:text-blue-200 mt-1">
                                When your shipments are delivered, we collect the product price from customers. After deducting 1.85% commission, 
                                the remaining amount appears in your pending settlement. Admin processes settlements periodically.
                            </p>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};

export default MerchantDashboardContent;
