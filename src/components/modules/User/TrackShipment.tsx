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
import { Search, Sparkles, Loader2 } from "lucide-react";

export default function TrackShipment() {
    const [trackingNumber, setTrackingNumber] = useState("");
    const [result, setResult] = useState<Shipment | null>(null);
    const [aiSummary, setAiSummary] = useState<string | null>(null);
    const [isSummarizing, setIsSummarizing] = useState(false);

    const summarizeShipment = async (shipment: Shipment, shipmentLegs: ShipmentLeg[]) => {
        setIsSummarizing(true);
        setAiSummary(null);
        try {
            const res = await fetch("/api/summarize-shipment", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    trackingNumber: shipment.trackingNumber,
                    status: shipment.status,
                    pickupCity: shipment.pickupCity,
                    deliveryCity: shipment.deliveryCity,
                    events: shipment.events ?? [],
                    legs: shipmentLegs,
                }),
            });
            const data = await res.json();
            setAiSummary(data.summary ?? null);
        } catch {
            setAiSummary("Unable to generate summary right now.");
        } finally {
            setIsSummarizing(false);
        }
    };

    const { mutate: track, isPending, error } = useMutation({
        mutationFn: (tn: string) => trackShipment(tn),
        onSuccess: (res) => {
            setResult(res.data);
            setAiSummary(null);
        },
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

                        {/* AI Summary */}
                        <div className="rounded-xl border border-primary/20 bg-primary/5 p-3">
                            <div className="flex items-center justify-between mb-1.5">
                                <div className="flex items-center gap-1.5">
                                    <Sparkles className="size-3.5 text-primary" />
                                    <span className="text-xs font-semibold text-primary">AI Journey Summary</span>
                                </div>
                                {!aiSummary && !isSummarizing && (
                                    <button
                                        type="button"
                                        onClick={() => summarizeShipment(result, legs)}
                                        className="text-xs text-primary hover:underline"
                                    >
                                        Generate
                                    </button>
                                )}
                            </div>
                            {isSummarizing ? (
                                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                    <Loader2 className="size-3.5 animate-spin" />
                                    Analyzing your shipment...
                                </div>
                            ) : aiSummary ? (
                                <p className="text-xs text-muted-foreground leading-relaxed">{aiSummary}</p>
                            ) : (
                                <p className="text-xs text-muted-foreground">Click Generate for an AI summary of your shipment journey.</p>
                            )}
                        </div>
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
