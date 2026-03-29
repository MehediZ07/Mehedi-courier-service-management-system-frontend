"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useGetAllShipments, useGetAllCouriers, useGetAllMerchants, useGetAllUsers } from "@/hooks/queries";
import { useMemo } from "react";
import { Package, Clock, PackageCheck, Bike, Users, Store, TrendingUp, AlertCircle, DollarSign, Wallet } from "lucide-react";
import Link from "next/link";
import ShipmentBarChart from "@/components/shared/ShipmentBarChart";
import ShipmentPieChart from "@/components/shared/ShipmentPieChart";

const AdminDashboardContent = () => {
    const { data: shipmentsResponse, isLoading: shipmentsLoading } = useGetAllShipments({ limit: 1000 });
    const { data: couriersResponse, isLoading: couriersLoading } = useGetAllCouriers({ limit: 1000 });
    const { data: merchantsResponse } = useGetAllMerchants({ limit: 1000 });
    const { data: usersResponse } = useGetAllUsers({ limit: 1000 });

    const stats = useMemo(() => {
        const shipments = shipmentsResponse?.data || [];
        const couriers = couriersResponse?.data || [];
        const merchants = merchantsResponse?.data || [];
        const users = usersResponse?.data || [];

        const totalPendingCOD = couriers.reduce((sum, c) => sum + (c.pendingCOD || 0), 0);
        const totalPendingMerchantSettlement = merchants.reduce((sum, m) => sum + (m.pendingSettlement || 0), 0);
        const totalCourierEarnings = couriers.reduce((sum, c) => sum + (c.totalEarnings || 0), 0);

        return {
            totalShipments: shipments.length,
            pending: shipments.filter(s => s.status === "PENDING" || s.status === "ASSIGNED").length,
            inTransit: shipments.filter(s => s.status === "IN_TRANSIT" || s.status === "OUT_FOR_DELIVERY").length,
            delivered: shipments.filter(s => s.status === "DELIVERED").length,
            activeCouriers: couriers.filter(c => c.availability && c.approvalStatus === "APPROVED").length,
            totalCouriers: couriers.length,
            pendingCouriers: couriers.filter(c => c.approvalStatus === "PENDING").length,
            totalMerchants: merchants.length,
            totalUsers: users.length,
            totalPendingCOD,
            totalPendingMerchantSettlement,
            totalCourierEarnings,
        };
    }, [shipmentsResponse, couriersResponse, merchantsResponse, usersResponse]);

    const pieData = useMemo(() => {
        const shipments = shipmentsResponse?.data || [];
        const statusCounts: Record<string, number> = {};

        shipments.forEach(s => {
            statusCounts[s.status] = (statusCounts[s.status] || 0) + 1;
        });

        return Object.entries(statusCounts).map(([name, value]) => ({ name, value }));
    }, [shipmentsResponse]);

    const barData = useMemo(() => {
        const shipments = shipmentsResponse?.data || [];
        const monthCounts: Record<string, number> = {};

        shipments.forEach(s => {
            const month = new Date(s.createdAt).toLocaleString('default', { month: 'short' });
            monthCounts[month] = (monthCounts[month] || 0) + 1;
        });

        return Object.entries(monthCounts).map(([name, value]) => ({ name, value }));
    }, [shipmentsResponse]);

    if (shipmentsLoading || couriersLoading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-2xl font-bold tracking-tight">Admin Dashboard</h2>
                <p className="text-muted-foreground">Welcome to SwiftShip admin panel. Monitor and manage your courier system.</p>
            </div>

            {/* Alerts */}
            {stats.pendingCouriers > 0 && (
                <Card className="bg-yellow-50 dark:bg-yellow-950/20 border-yellow-200 dark:border-yellow-800">
                    <CardContent className="pt-6">
                        <div className="flex items-start gap-3">
                            <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5" />
                            <div className="flex-1">
                                <p className="font-semibold text-yellow-900 dark:text-yellow-100">
                                    {stats.pendingCouriers} courier{stats.pendingCouriers > 1 ? 's' : ''} pending approval
                                </p>
                                <p className="text-sm text-yellow-800 dark:text-yellow-200 mt-1">
                                    Review and approve courier applications to expand your delivery network.
                                </p>
                            </div>
                            <Link href="/admin/dashboard/couriers-management">
                                <Button variant="outline" size="sm" className="border-yellow-600 text-yellow-700 hover:bg-yellow-100">
                                    Review Now
                                </Button>
                            </Link>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Primary Stats */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                            <Package className="h-4 w-4" />
                            Total Shipments
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.totalShipments}</div>
                        <p className="text-xs text-muted-foreground mt-1">
                            {stats.delivered} delivered ({((stats.delivered / stats.totalShipments) * 100 || 0).toFixed(1)}%)
                        </p>
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
                        <p className="text-xs text-muted-foreground mt-1">Awaiting courier assignment</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                            <TrendingUp className="h-4 w-4" />
                            In Transit
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-blue-600">{stats.inTransit}</div>
                        <p className="text-xs text-muted-foreground mt-1">Currently being delivered</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                            <Bike className="h-4 w-4" />
                            Active Couriers
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-green-600">{stats.activeCouriers}</div>
                        <p className="text-xs text-muted-foreground mt-1">Out of {stats.totalCouriers} total</p>
                    </CardContent>
                </Card>
            </div>

            {/* Secondary Stats */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
                <Card className="bg-gradient-to-br from-purple-50 to-violet-50 dark:from-purple-950 dark:to-violet-950 border-purple-200 dark:border-purple-800">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-purple-900 dark:text-purple-100">
                            <Store className="h-5 w-5" />
                            Merchants
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold text-purple-700 dark:text-purple-300">
                            {stats.totalMerchants}
                        </div>
                        <Link href="/admin/dashboard/merchants-management">
                            <Button variant="outline" size="sm" className="mt-3 border-purple-600 text-purple-700 hover:bg-purple-100">
                                Manage Merchants
                            </Button>
                        </Link>
                    </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-950 dark:to-cyan-950 border-blue-200 dark:border-blue-800">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-blue-900 dark:text-blue-100">
                            <Users className="h-5 w-5" />
                            Users
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold text-blue-700 dark:text-blue-300">
                            {stats.totalUsers}
                        </div>
                        <Link href="/admin/dashboard/users-management">
                            <Button variant="outline" size="sm" className="mt-3 border-blue-600 text-blue-700 hover:bg-blue-100">
                                Manage Users
                            </Button>
                        </Link>
                    </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950 dark:to-emerald-950 border-green-200 dark:border-green-800">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-green-900 dark:text-green-100">
                            <PackageCheck className="h-5 w-5" />
                            Delivery Rate
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold text-green-700 dark:text-green-300">
                            {((stats.delivered / stats.totalShipments) * 100 || 0).toFixed(1)}%
                        </div>
                        <p className="text-sm text-green-600 dark:text-green-400 mt-2">
                            {stats.delivered} of {stats.totalShipments} delivered
                        </p>
                    </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-yellow-50 to-orange-50 dark:from-yellow-950 dark:to-orange-950 border-yellow-200 dark:border-yellow-800">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-yellow-900 dark:text-yellow-100">
                            <DollarSign className="h-5 w-5" />
                            Pending COD
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold text-yellow-700 dark:text-yellow-300">
                            {stats.totalPendingCOD.toFixed(0)}
                        </div>
                        <Link href="/admin/dashboard/cod-settlement">
                            <Button variant="outline" size="sm" className="mt-3 border-yellow-600 text-yellow-700 hover:bg-yellow-100">
                                Settle COD
                            </Button>
                        </Link>
                    </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-pink-50 to-rose-50 dark:from-pink-950 dark:to-rose-950 border-pink-200 dark:border-pink-800">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-pink-900 dark:text-pink-100">
                            <Wallet className="h-5 w-5" />
                            Merchant Pending
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold text-pink-700 dark:text-pink-300">
                            {stats.totalPendingMerchantSettlement.toFixed(0)}
                        </div>
                        <Link href="/admin/dashboard/merchant-settlement">
                            <Button variant="outline" size="sm" className="mt-3 border-pink-600 text-pink-700 hover:bg-pink-100">
                                Settle Merchants
                            </Button>
                        </Link>
                    </CardContent>
                </Card>
            </div>

            {/* Charts */}
            <div className="grid gap-4 md:grid-cols-6">
                <ShipmentBarChart data={barData} title="Shipment Trends" description="Monthly shipment statistics" />
                <ShipmentPieChart data={pieData} title="Shipment Status" description="Distribution by current status" />
            </div>

            {/* Quick Actions */}
            <Card>
                <CardHeader>
                    <CardTitle>Quick Actions</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid gap-3 md:grid-cols-4">
                        <Link href="/admin/dashboard/shipments-management">
                            <Button variant="outline" className="w-full">
                                <Package className="h-4 w-4 mr-2" />
                                Manage Shipments
                            </Button>
                        </Link>
                        <Link href="/admin/dashboard/legs-management">
                            <Button variant="outline" className="w-full">
                                <TrendingUp className="h-4 w-4 mr-2" />
                                Manage Legs
                            </Button>
                        </Link>
                        <Link href="/admin/dashboard/merchant-settlement">
                            <Button variant="outline" className="w-full">
                                <Store className="h-4 w-4 mr-2" />
                                Merchant Settlement
                            </Button>
                        </Link>
                        <Link href="/admin/dashboard/cod-settlement">
                            <Button variant="outline" className="w-full">
                                <Bike className="h-4 w-4 mr-2" />
                                COD Settlement
                            </Button>
                        </Link>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};

export default AdminDashboardContent;
