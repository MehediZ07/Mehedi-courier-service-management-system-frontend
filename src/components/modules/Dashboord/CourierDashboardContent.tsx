"use client";

import StatsCard from "@/components/shared/StatsCard";
import { useGetAssignedShipments, useGetMyCourierProfile } from "@/hooks/queries";
import { useMemo } from "react";

const CourierDashboardContent = () => {
    const { data: courierProfileResponse, isLoading: profileLoading } = useGetMyCourierProfile();
    const { data: shipmentsResponse, isLoading: shipmentsLoading } = useGetAssignedShipments(undefined);

    const stats = useMemo(() => {
        const shipments = shipmentsResponse?.data || [];

        return {
            total: shipments.length,
            inTransit: shipments.filter(s => s.status === "IN_TRANSIT" || s.status === "OUT_FOR_DELIVERY").length,
            delivered: shipments.filter(s => s.status === "DELIVERED").length,
            earnings: courierProfileResponse?.data?.totalEarnings || 0,
        };
    }, [shipmentsResponse, courierProfileResponse]);

    if (profileLoading || shipmentsLoading) {
        return (
            <div className="space-y-6">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight">Courier Dashboard</h2>
                    <p className="text-muted-foreground">Loading dashboard data...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-2xl font-bold tracking-tight">Courier Dashboard</h2>
                <p className="text-muted-foreground">Welcome back! Browse available shipments or check your deliveries.</p>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <StatsCard title="Total Deliveries" value={stats.total} iconName="Package" description="All assigned shipments" />
                <StatsCard title="In Transit" value={stats.inTransit} iconName="Truck" description="Currently delivering" />
                <StatsCard title="Delivered" value={stats.delivered} iconName="PackageCheck" description="Successfully completed" />
                <StatsCard title="Total Earnings" value={`৳${stats.earnings}`} iconName="DollarSign" description="Total earned" />
            </div>
        </div>
    );
};

export default CourierDashboardContent;
