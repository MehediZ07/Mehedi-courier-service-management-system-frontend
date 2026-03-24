"use client";

import ShipmentBarChart from "@/components/shared/ShipmentBarChart";
import ShipmentPieChart from "@/components/shared/ShipmentPieChart";
import StatsCard from "@/components/shared/StatsCard";
import { useGetAllShipments, useGetAllCouriers } from "@/hooks/queries";
import { useMemo } from "react";

const AdminDashboardContent = () => {
    const { data: shipmentsResponse, isLoading: shipmentsLoading } = useGetAllShipments(undefined);
    const { data: couriersResponse, isLoading: couriersLoading } = useGetAllCouriers(undefined);

    const stats = useMemo(() => {
        const shipments = shipmentsResponse?.data || [];
        const couriers = couriersResponse?.data || [];

        return {
            total: shipments.length,
            pending: shipments.filter(s => s.status === "PENDING").length,
            delivered: shipments.filter(s => s.status === "DELIVERED").length,
            activeCouriers: couriers.filter(c => c.availability).length,
        };
    }, [shipmentsResponse, couriersResponse]);

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
            <div className="space-y-6">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight">Dashboard</h2>
                    <p className="text-muted-foreground">Loading dashboard data...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-2xl font-bold tracking-tight">Dashboard</h2>
                <p className="text-muted-foreground">Welcome to SwiftShip admin panel.</p>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <StatsCard title="Total Shipments" value={stats.total} iconName="Package" description="All shipments in system" />
                <StatsCard title="Pending Shipments" value={stats.pending} iconName="Clock" description="Awaiting courier pickup" />
                <StatsCard title="Delivered" value={stats.delivered} iconName="PackageCheck" description="Successfully delivered" />
                <StatsCard title="Active Couriers" value={stats.activeCouriers} iconName="Bike" description="Currently online" />
            </div>

            <div className="grid gap-4 md:grid-cols-6">
                <ShipmentBarChart data={barData} title="Shipment Trends" description="Monthly shipment statistics" />
                <ShipmentPieChart data={pieData} title="Shipment Status" description="Distribution by current status" />
            </div>
        </div>
    );
};

export default AdminDashboardContent;
