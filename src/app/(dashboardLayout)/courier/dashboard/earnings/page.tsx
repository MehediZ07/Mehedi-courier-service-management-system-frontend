"use client";

import { getMyCourierProfile } from "@/services/courier.services";
import { getAssignedShipments } from "@/services/shipment.services";
import { useQuery } from "@tanstack/react-query";
import StatsCard from "@/components/shared/StatsCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function EarningsPage() {
    const { data: profileData, isLoading: profileLoading } = useQuery({
        queryKey: ["courier-profile"],
        queryFn: getMyCourierProfile,
    });

    const { data: deliveriesData, isLoading: deliveriesLoading } = useQuery({
        queryKey: ["courier-deliveries-all"],
        queryFn: () => getAssignedShipments({ limit: 100 }),
    });

    const profile = profileData?.data;
    const deliveries = (deliveriesData?.data as unknown as { data: { id: string; status: string; pricing?: { totalPrice: number }; deliveryCity: string; pickupCity: string }[] })?.data ?? [];
    const delivered = deliveries.filter((d) => d.status === "DELIVERED");

    if (profileLoading || deliveriesLoading) {
        return <div className="text-muted-foreground text-sm">Loading...</div>;
    }

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold">My Earnings</h1>
                <p className="text-muted-foreground text-sm">Your delivery performance and earnings overview.</p>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
                <StatsCard
                    title="Total Earnings"
                    value={`${profile?.totalEarnings ?? 0} BDT`}
                    iconName="Wallet"
                    description="Lifetime earnings"
                />
                <StatsCard
                    title="Total Deliveries"
                    value={deliveries.length}
                    iconName="Package"
                    description="All assigned shipments"
                />
                <StatsCard
                    title="Completed"
                    value={delivered.length}
                    iconName="PackageCheck"
                    description="Successfully delivered"
                />
            </div>

            <Card>
                <CardHeader>
                    <CardTitle className="text-base">Courier Profile</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-sm">
                    <div className="flex justify-between">
                        <span className="text-muted-foreground">Vehicle</span>
                        <Badge variant="outline">{profile?.vehicleType}</Badge>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-muted-foreground">License</span>
                        <span>{profile?.licenseNumber}</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-muted-foreground">Availability</span>
                        <Badge variant={profile?.availability ? "default" : "secondary"}>
                            {profile?.availability ? "Available" : "Unavailable"}
                        </Badge>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-muted-foreground">Approval</span>
                        <Badge variant="outline">{profile?.approvalStatus}</Badge>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
