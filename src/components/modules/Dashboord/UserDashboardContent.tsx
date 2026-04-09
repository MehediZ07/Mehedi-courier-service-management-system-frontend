"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useGetMyShipments } from "@/hooks/queries";
import { useMemo } from "react";
import { Package, Clock, Truck, PackageCheck, AlertCircle, ArrowRight, MapPin } from "lucide-react";
import Link from "next/link";
import { AIInsightsWidget } from "@/components/shared/AIInsightsWidget";

const UserDashboardContent = () => {
    const { data: shipmentsResponse, isLoading } = useGetMyShipments({ limit: 100 });

    const stats = useMemo(() => {
        const shipments = shipmentsResponse?.data || [];

        return {
            total: shipments.length,
            pending: shipments.filter(s => s.status === "PENDING" || s.status === "ASSIGNED").length,
            inTransit: shipments.filter(s => s.status === "IN_TRANSIT" || s.status === "OUT_FOR_DELIVERY").length,
            delivered: shipments.filter(s => s.status === "DELIVERED").length,
        };
    }, [shipmentsResponse]);

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
                <h2 className="text-2xl font-bold tracking-tight">My Dashboard</h2>
                <p className="text-muted-foreground">Track your shipments and manage your deliveries.</p>
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
                        <p className="text-xs text-muted-foreground mt-1">All your shipments</p>
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

            {/* Quick Actions */}
            <Card>
                <CardHeader>
                    <CardTitle>Quick Actions</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid gap-3 md:grid-cols-3">
                        <Link href="/dashboard/create-shipment">
                            <Button className="w-full" size="lg">
                                <Package className="h-5 w-5 mr-2" />
                                Create New Shipment
                            </Button>
                        </Link>
                        <Link href="/dashboard/track">
                            <Button variant="outline" className="w-full" size="lg">
                                <MapPin className="h-5 w-5 mr-2" />
                                Track Package
                            </Button>
                        </Link>
                        <Link href="/dashboard/my-shipments">
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
                        <Link href="/dashboard/my-shipments">
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
                            <Link href="/dashboard/create-shipment">
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
                                        <p className="text-xs text-muted-foreground">
                                            {new Date(shipment.createdAt).toLocaleDateString()}
                                        </p>
                                        <Link href="/dashboard/track">
                                            <Button variant="ghost" size="sm" className="mt-1">
                                                Track
                                            </Button>
                                        </Link>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* AI Insights */}
            <AIInsightsWidget
                title="AI Shipment Tips"
                description="Personalized AI insights based on your shipment history."
                apiEndpoint="/api/ai-user-insights"
                payload={{
                    total: stats.total,
                    delivered: stats.delivered,
                    pending: stats.pending,
                    inTransit: stats.inTransit,
                    cancelled: 0,
                }}
                emptyText="Generate personalized insights about your shipment history and delivery success."
            />

            {/* Info Banner */}
            <Card className="bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-800">
                <CardContent className="pt-6">
                    <div className="flex items-start gap-3">
                        <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5" />
                        <div>
                            <p className="font-semibold text-blue-900 dark:text-blue-100">How It Works</p>
                            <p className="text-sm text-blue-800 dark:text-blue-200 mt-1">
                                Create a shipment by providing pickup and delivery details. Our system will calculate the price and assign the best route. 
                                You can track your package in real-time and receive notifications at every step.
                            </p>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};

export default UserDashboardContent;
