"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useGetMyCourierProfile } from "@/hooks/queries";
import { useQuery } from "@tanstack/react-query";
import { clientHttpClient } from "@/lib/axios/clientHttpClient";
import { useMemo } from "react";
import { Package, Truck, PackageCheck, Wallet, Clock, AlertCircle, ArrowRight, Bike } from "lucide-react";
import Link from "next/link";
import type { ApiResponse } from "@/types/api.types";
import type { ShipmentLeg } from "@/types/shipmentLeg.types";
import { AIInsightsWidget } from "@/components/shared/AIInsightsWidget";

interface CourierCODSettlement {
    pendingCOD: number;
    totalSettled: number;
}

const CourierDashboardContent = () => {
    const { data: courierProfileResponse, isLoading: profileLoading } = useGetMyCourierProfile();

    const { data: completedLegsData, isLoading: legsLoading } = useQuery({
        queryKey: ["my-completed-legs"],
        queryFn: async () => {
            const res = await clientHttpClient.get<ApiResponse<ShipmentLeg[]>>("/legs/my-active?status=COMPLETED&limit=5");
            return res.data;
        },
    });

    const { data: settlementData } = useQuery({
        queryKey: ["courier-cod-settlement"],
        queryFn: async () => {
            const res = await clientHttpClient.get<ApiResponse<CourierCODSettlement>>("/couriers/my-cod-settlement");
            return res.data;
        },
    });

    const courierProfile = courierProfileResponse?.data;

    const completedLegs = useMemo(() => completedLegsData || [], [completedLegsData]);

    const stats = useMemo(() => {
        return {
            totalEarnings: courierProfile?.totalEarnings || 0,
            pendingCOD: settlementData?.pendingCOD || 0,
            activeLegs: 0, // We'll get this from a different query if needed
            completedLegs: completedLegs.length,
            availability: courierProfile?.availability || false,
            approvalStatus: courierProfile?.approvalStatus || "PENDING",
        };
    }, [courierProfile, completedLegs, settlementData]);

    const recentLegs = useMemo(() => {
        return completedLegs.slice(0, 5);
    }, [completedLegs]);

    const statusColors: Record<string, string> = {
        PENDING: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
        IN_PROGRESS: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
        COMPLETED: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
    };

    if (profileLoading || legsLoading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-2xl font-bold tracking-tight">Courier Dashboard</h2>
                <p className="text-muted-foreground">Welcome back! Manage your deliveries and track your earnings.</p>
            </div>

            {/* Approval Status Alert */}
            {stats.approvalStatus !== "APPROVED" && (
                <Card className="bg-yellow-50 dark:bg-yellow-950/20 border-yellow-200 dark:border-yellow-800">
                    <CardContent className="pt-6">
                        <div className="flex items-start gap-3">
                            <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5" />
                            <div>
                                <p className="font-semibold text-yellow-900 dark:text-yellow-100">
                                    Account Status: {stats.approvalStatus}
                                </p>
                                <p className="text-sm text-yellow-800 dark:text-yellow-200 mt-1">
                                    {stats.approvalStatus === "PENDING" 
                                        ? "Your courier account is pending admin approval. You will be able to accept deliveries once approved."
                                        : "Your courier account has been rejected. Please contact admin for more information."}
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Stats Cards */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                            <Wallet className="h-4 w-4" />
                            Total Earnings
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-green-600">{stats.totalEarnings.toFixed(2)} BDT</div>
                        <p className="text-xs text-muted-foreground mt-1">All time earnings</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                            <Clock className="h-4 w-4" />
                            Pending COD
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-yellow-600">{stats.pendingCOD.toFixed(2)} BDT</div>
                        <p className="text-xs text-muted-foreground mt-1">To be settled</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                            <Truck className="h-4 w-4" />
                            Active Deliveries
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-blue-600">{stats.activeLegs}</div>
                        <p className="text-xs text-muted-foreground mt-1">Currently in progress</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                            <PackageCheck className="h-4 w-4" />
                            Completed
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-green-600">{stats.completedLegs}</div>
                        <p className="text-xs text-muted-foreground mt-1">Recent deliveries</p>
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
                        <Link href="/courier/dashboard/available-legs">
                            <Button className="w-full" size="lg" disabled={stats.approvalStatus !== "APPROVED"}>
                                <Package className="h-5 w-5 mr-2" />
                                Browse Available Legs
                            </Button>
                        </Link>
                        <Link href="/courier/dashboard/my-active-legs">
                            <Button variant="outline" className="w-full" size="lg">
                                <Truck className="h-5 w-5 mr-2" />
                                My Active Deliveries
                            </Button>
                        </Link>
                        <Link href="/courier/dashboard/earnings">
                            <Button variant="outline" className="w-full" size="lg">
                                <Wallet className="h-5 w-5 mr-2" />
                                View Earnings
                            </Button>
                        </Link>
                    </div>
                </CardContent>
            </Card>

            {/* Availability Status */}
            <Card className={stats.availability 
                ? "bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950 dark:to-emerald-950 border-green-200 dark:border-green-800"
                : "bg-gradient-to-br from-gray-50 to-slate-50 dark:from-gray-950 dark:to-slate-950 border-gray-200 dark:border-gray-800"
            }>
                <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                        <span className="flex items-center gap-2">
                            <Bike className="h-5 w-5" />
                            Availability Status
                        </span>
                        <Badge variant={stats.availability ? "default" : "secondary"} className={stats.availability ? "bg-green-600" : ""}>
                            {stats.availability ? "Available" : "Unavailable"}
                        </Badge>
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-sm text-muted-foreground mb-4">
                        {stats.availability 
                            ? "You are currently available for new deliveries. New legs will be assigned to you."
                            : "You are currently unavailable. Toggle your availability to start receiving new deliveries."}
                    </p>
                    <Link href="/my-profile">
                        <Button variant="outline" size="sm">
                            Manage Availability
                        </Button>
                    </Link>
                </CardContent>
            </Card>

            {/* AI Insights — row 3 */}
            <AIInsightsWidget
                title="AI Performance Insights"
                description="AI analysis of your delivery performance and earnings."
                apiEndpoint="/api/ai-courier-insights"
                payload={{
                    totalEarnings: stats.totalEarnings,
                    pendingCOD: stats.pendingCOD,
                    completedLegs: stats.completedLegs,
                    availability: stats.availability,
                    approvalStatus: stats.approvalStatus,
                }}
                emptyText="Generate AI insights about your earnings, COD status, and delivery performance."
            />

            {/* Recent Legs */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                        <span>Recent Deliveries</span>
                        <Link href="/courier/dashboard/my-active-legs">
                            <Button variant="ghost" size="sm">
                                View All <ArrowRight className="h-4 w-4 ml-2" />
                            </Button>
                        </Link>
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    {recentLegs.length === 0 ? (
                        <div className="text-center py-8 text-muted-foreground">
                            <Package className="h-12 w-12 mx-auto mb-3 opacity-50" />
                            <p>No active deliveries</p>
                            {stats.approvalStatus === "APPROVED" && (
                                <Link href="/courier/dashboard/available-legs">
                                    <Button className="mt-4">
                                        Browse Available Legs
                                    </Button>
                                </Link>
                            )}
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {recentLegs.map((leg) => (
                                <div key={leg.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2">
                                            <p className="font-mono font-semibold">{leg.shipment?.trackingNumber}</p>
                                            <Badge className={statusColors[leg.status] || ""}>
                                                {leg.status}
                                            </Badge>
                                            <Badge variant="outline">{leg.legType}</Badge>
                                        </div>
                                        <p className="text-sm text-muted-foreground mt-1">
                                            {leg.originHub?.name} → {leg.destHub?.name}
                                        </p>
                                    </div>
                                    <div className="text-right">
                                        <p className="font-semibold text-green-600">{leg.courierEarning?.toFixed(2)} BDT</p>
                                        <p className="text-xs text-muted-foreground">Earning</p>
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
                            <p className="text-sm text-blue-800 dark:text-blue-200 mt-1">
                                You earn money for each delivery leg you complete. For COD shipments, you collect cash from customers which appears in 
                                &quot;Pending COD&quot;. Admin settles this amount periodically. Your delivery earnings are tracked separately in Total Earnings.
                            </p>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};

export default CourierDashboardContent;
