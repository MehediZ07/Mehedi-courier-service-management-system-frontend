"use client";

import { trackShipment } from "@/services/shipment.services";
import { getShipmentLegs } from "@/services/shipmentLeg.services";
import { Shipment } from "@/types/shipment.types";
import { ShipmentLeg } from "@/types/shipmentLeg.types";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Search } from "lucide-react";

export default function TrackShipment() {
    const [trackingNumber, setTrackingNumber] = useState("");
    const [result, setResult] = useState<Shipment | null>(null);

    const { mutate: track, isPending, error } = useMutation({
        mutationFn: (tn: string) => trackShipment(tn),
        onSuccess: (res) => setResult(res.data),
        onError: () => setResult(null),
    });

    const { data: legsData } = useQuery({
        queryKey: ["shipment-legs", result?.id],
        queryFn: () => getShipmentLegs(result!.id),
        enabled: !!result?.id && result?.deliveryType === "HUB_BASED",
    });

    const legs = legsData?.data ?? [];

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold">Track Package</h1>
                <p className="text-muted-foreground text-sm">Enter your tracking number to see live status.</p>
            </div>

            <div className="flex gap-2">
                <div className="flex-1 space-y-1.5">
                    <Label htmlFor="tracking">Tracking Number</Label>
                    <Input
                        id="tracking"
                        value={trackingNumber}
                        onChange={(e) => setTrackingNumber(e.target.value)}
                        placeholder="TRK-XXXXXXXX-..."
                        onKeyDown={(e) => e.key === "Enter" && trackingNumber && track(trackingNumber)}
                    />
                </div>
                <div className="flex items-end">
                    <Button disabled={!trackingNumber || isPending} onClick={() => track(trackingNumber)}>
                        <Search className="w-4 h-4 mr-2" />
                        {isPending ? "Tracking..." : "Track"}
                    </Button>
                </div>
            </div>

            {error && (
                <p className="text-sm text-destructive">Shipment not found. Check your tracking number.</p>
            )}

            {result && (
                <Card>
                    <CardHeader>
                        <CardTitle className="text-base flex items-center justify-between">
                            <span>{result.trackingNumber}</span>
                            <Badge>{result.status}</Badge>
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3 text-sm">
                        <div className="grid grid-cols-2 gap-2">
                            <div>
                                <p className="text-muted-foreground">From</p>
                                <p className="font-medium">{result.pickupCity}</p>
                                <p className="text-xs text-muted-foreground">{result.pickupAddress}</p>
                            </div>
                            <div>
                                <p className="text-muted-foreground">To</p>
                                <p className="font-medium">{result.deliveryCity}</p>
                                <p className="text-xs text-muted-foreground">{result.deliveryAddress}</p>
                            </div>
                        </div>

                        {result.deliveryType && (
                            <>
                                <Separator />
                                <div>
                                    <p className="text-muted-foreground">Delivery Type</p>
                                    <Badge variant="outline">{result.deliveryType}</Badge>
                                </div>
                            </>
                        )}

                        {result.courier && (
                            <>
                                <Separator />
                                <div>
                                    <p className="text-muted-foreground">Courier</p>
                                    <p className="font-medium">{result.courier.user?.name}</p>
                                    <p className="text-xs text-muted-foreground">{result.courier.user?.phone}</p>
                                </div>
                            </>
                        )}

                        {legs.length > 0 && (
                            <>
                                <Separator />
                                <div>
                                    <p className="text-muted-foreground mb-2">Multi-Leg Journey</p>
                                    <div className="space-y-3">
                                        {legs.map((leg: ShipmentLeg, idx: number) => (
                                            <div key={leg.id} className="flex items-start gap-3 p-3 border rounded-md">
                                                <div className="mt-1 h-6 w-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-bold shrink-0">
                                                    {idx + 1}
                                                </div>
                                                <div className="flex-1">
                                                    <div className="flex items-center justify-between mb-1">
                                                        <Badge variant="outline">{leg.legType}</Badge>
                                                        <Badge>{leg.status}</Badge>
                                                    </div>
                                                    <p className="text-xs text-muted-foreground">
                                                        {leg.originType === "HUB" ? leg.originHub?.name : leg.originAddress}
                                                        {" → "}
                                                        {leg.destType === "HUB" ? leg.destHub?.name : leg.destAddress}
                                                    </p>
                                                    {leg.courier && (
                                                        <p className="text-xs text-muted-foreground mt-1">
                                                            Courier: {leg.courier.user?.name}
                                                        </p>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </>
                        )}

                        {result.events && result.events.length > 0 && (
                            <>
                                <Separator />
                                <div>
                                    <p className="text-muted-foreground mb-2">Timeline</p>
                                    <div className="space-y-2">
                                        {result.events.map((event) => (
                                            <div key={event.id} className="flex items-start gap-3">
                                                <div className="mt-1 h-2 w-2 rounded-full bg-primary shrink-0" />
                                                <div>
                                                    <p className="font-medium">{event.status}</p>
                                                    {event.note && <p className="text-xs text-muted-foreground">{event.note}</p>}
                                                    <p className="text-xs text-muted-foreground">
                                                        {new Date(event.createdAt).toLocaleString()}
                                                    </p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </>
                        )}
                    </CardContent>
                </Card>
            )}
        </div>
    );
}
