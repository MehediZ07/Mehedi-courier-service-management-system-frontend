"use client";

import StatsCard from "@/components/shared/StatsCard";
import { useGetMyShipments } from "@/hooks/queries";
import { useMemo } from "react";

const UserDashboardContent = () => {
    const { data: shipmentsResponse, isLoading } = useGetMyShipments(undefined);

    const stats = useMemo(() => {
        const shipments = shipmentsResponse?.data || [];

        return {
            total: shipments.length,
            pending: shipments.filter(s => s.status === "PENDING" || s.status === "ASSIGNED").length,
            inTransit: shipments.filter(s => s.status === "IN_TRANSIT" || s.status === "OUT_FOR_DELIVERY").length,
            delivered: shipments.filter(s => s.status === "DELIVERED").length,
        };
    }, [shipmentsResponse]);

    if (isLoading) {
        return (
            <div className="space-y-6">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight">My Dashboard</h2>
                    <p className="text-muted-foreground">Loading dashboard data...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-2xl font-bold tracking-tight">My Dashboard</h2>
                <p className="text-muted-foreground">Track your shipments and manage your account.</p>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <StatsCard title="Total Shipments" value={stats.total} iconName="Package" description="All your shipments" />
                <StatsCard title="Pending" value={stats.pending} iconName="Clock" description="Awaiting pickup" />
                <StatsCard title="In Transit" value={stats.inTransit} iconName="Truck" description="On the way" />
                <StatsCard title="Delivered" value={stats.delivered} iconName="PackageCheck" description="Successfully delivered" />
            </div>
        </div>
    );
};

export default UserDashboardContent;
