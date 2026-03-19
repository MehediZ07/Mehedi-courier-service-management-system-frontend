"use client";

import ShipmentBarChart from "@/components/shared/ShipmentBarChart";
import ShipmentPieChart from "@/components/shared/ShipmentPieChart";
import StatsCard from "@/components/shared/StatsCard";

const AdminDashboardContent = () => {
    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-2xl font-bold tracking-tight">Dashboard</h2>
                <p className="text-muted-foreground">Welcome to SwiftShip admin panel.</p>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <StatsCard title="Total Shipments" value={0} iconName="Package" description="All shipments in system" />
                <StatsCard title="Pending Shipments" value={0} iconName="Clock" description="Awaiting courier pickup" />
                <StatsCard title="Delivered" value={0} iconName="PackageCheck" description="Successfully delivered" />
                <StatsCard title="Active Couriers" value={0} iconName="Bike" description="Currently online" />
            </div>

            <div className="grid gap-4 md:grid-cols-6">
                <ShipmentBarChart data={[]} title="Shipment Trends" description="Monthly shipment statistics" />
                <ShipmentPieChart data={[]} title="Shipment Status" description="Distribution by current status" />
            </div>
        </div>
    );
};

export default AdminDashboardContent;
