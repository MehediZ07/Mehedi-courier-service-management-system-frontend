"use client";

import { trackShipment } from "@/services/shipment.services";
import { Shipment } from "@/types/shipment.types";
import { useMutation } from "@tanstack/react-query";
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
