"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import StatusBadgeCell from "@/components/shared/cell/StatusBadgeCell";
import { useQuery } from "@tanstack/react-query";
import { trackShipment } from "@/services/shipment.services";
import { Shipment } from "@/types/shipment.types";
import { toast } from "sonner";

export default function CourierTrackShipment() {
    const [trackingNumber, setTrackingNumber] = useState("");
    const [searchTerm, setSearchTerm] = useState("");

    const { data, isLoading, error } = useQuery({
        queryKey: ["track-shipment", searchTerm],
        queryFn: () => trackShipment(searchTerm),
        enabled: !!searchTerm,
    });

    const shipment: Shipment | undefined = data?.data;

    const handleSearch = () => {
        if (!trackingNumber.trim()) {
            toast.error("Please enter a tracking number");
            return;
        }
        setSearchTerm(trackingNumber.trim());
    };

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold">Track Shipment</h1>
                <p className="text-muted-foreground text-sm">Track any shipment by tracking number.</p>
            </div>

            <div className="flex gap-2">
                <div className="flex-1 space-y-1.5">
                    <Label>Tracking Number</Label>
                    <Input
                        value={trackingNumber}
                        onChange={(e) => setTrackingNumber(e.target.value)}
                        placeholder="TRK-XXXXX-XXXXXXXXXX"
                        onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                    />
                </div>
                <div className="flex items-end">
                    <Button onClick={handleSearch} disabled={isLoading}>
                        {isLoading ? "Searching..." : "Track"}
                    </Button>
                </div>
            </div>

            {error && (
                <div className="p-4 border border-destructive/50 bg-destructive/10 rounded-lg text-destructive text-sm">
                    {error instanceof Error ? error.message : "Shipment not found"}
                </div>
            )}

            {shipment && (
                <div className="space-y-6 border rounded-lg p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <h2 className="text-xl font-semibold">{shipment.trackingNumber}</h2>
                            <p className="text-sm text-muted-foreground">Shipment Details</p>
                        </div>
                        <StatusBadgeCell status={shipment.status} />
                    </div>

                    <div className="grid grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <p className="text-sm font-semibold">Pickup Details</p>
                            <div className="text-sm space-y-1 pl-2">
                                <p><span className="text-muted-foreground">Address:</span> {shipment.pickupAddress}</p>
                                <p><span className="text-muted-foreground">City:</span> {shipment.pickupCity}</p>
                                <p><span className="text-muted-foreground">Phone:</span> {shipment.pickupPhone}</p>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <p className="text-sm font-semibold">Delivery Details</p>
                            <div className="text-sm space-y-1 pl-2">
                                <p><span className="text-muted-foreground">Address:</span> {shipment.deliveryAddress}</p>
                                <p><span className="text-muted-foreground">City:</span> {shipment.deliveryCity}</p>
                                <p><span className="text-muted-foreground">Phone:</span> {shipment.deliveryPhone}</p>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-3 gap-4">
                        <div>
                            <p className="text-sm font-medium text-muted-foreground">Package Type</p>
                            <p className="text-sm">{shipment.packageType}</p>
                        </div>
                        <div>
                            <p className="text-sm font-medium text-muted-foreground">Weight</p>
                            <p className="text-sm">{shipment.weight} kg</p>
                        </div>
                        <div>
                            <p className="text-sm font-medium text-muted-foreground">Priority</p>
                            <Badge variant={shipment.priority === "EXPRESS" ? "default" : "secondary"}>
                                {shipment.priority}
                            </Badge>
                        </div>
                    </div>

                    {shipment.legs && shipment.legs.length > 0 && (
                        <div className="space-y-3">
                            <p className="text-sm font-semibold">Delivery Journey</p>
                            <div className="space-y-2">
                                {shipment.legs.map((leg) => (
                                    <div key={leg.id} className="flex items-center gap-3 p-3 border rounded-lg">
                                        <div className="flex-shrink-0">
                                            <Badge variant="outline">Leg {leg.legNumber}</Badge>
                                        </div>
                                        <div className="flex-1">
                                            <p className="text-sm font-medium">{leg.legType}</p>
                                            <p className="text-xs text-muted-foreground">
                                                {leg.originType === "HUB" ? leg.originHub?.name : leg.originAddress} → {leg.destType === "HUB" ? leg.destHub?.name : leg.destAddress}
                                            </p>
                                        </div>
                                        <Badge variant={leg.status === "COMPLETED" ? "outline" : "default"}>
                                            {leg.status}
                                        </Badge>
                                        {leg.courier && (
                                            <p className="text-xs text-muted-foreground">
                                                {leg.courier.user?.name}
                                            </p>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {shipment.events && shipment.events.length > 0 && (
                        <div className="space-y-3">
                            <p className="text-sm font-semibold">Status History</p>
                            <div className="space-y-2">
                                {shipment.events.map((event) => (
                                    <div key={event.id} className="flex items-start gap-3 text-sm">
                                        <StatusBadgeCell status={event.status} />
                                        <div className="flex-1">
                                            {event.note && <p className="text-muted-foreground">{event.note}</p>}
                                            <p className="text-xs text-muted-foreground">
                                                {new Date(event.createdAt).toLocaleString()}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
