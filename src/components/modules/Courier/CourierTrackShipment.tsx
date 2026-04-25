"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import StatusBadgeCell from "@/components/shared/cell/StatusBadgeCell";
import { PrintLabel } from "@/components/shared/PrintLabel";
import { useQuery } from "@tanstack/react-query";
import { trackShipment } from "@/services/shipment.services";
import { Shipment } from "@/types/shipment.types";
import { toast } from "sonner";
import { Search, Package, MapPin, Clock, User, Phone, CheckCircle2, Truck, AlertCircle, Sparkles, Loader2 } from "lucide-react";

export default function CourierTrackShipment() {
    const [trackingNumber, setTrackingNumber] = useState("");
    const [searchTerm, setSearchTerm] = useState("");
    const [aiSummary, setAiSummary] = useState<string | null>(null);
    const [isSummarizing, setIsSummarizing] = useState(false);

    const summarizeShipment = async (shipment: Shipment) => {
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
                    legs: shipment.legs ?? [],
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
        setAiSummary(null);
        setSearchTerm(trackingNumber.trim());
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case "COMPLETED":
                return <CheckCircle2 className="h-4 w-4 text-green-600" />;
            case "IN_PROGRESS":
            case "ASSIGNED":
                return <Truck className="h-4 w-4 text-blue-600" />;
            case "PENDING":
                return <Clock className="h-4 w-4 text-yellow-600" />;
            case "FAILED":
                return <AlertCircle className="h-4 w-4 text-red-600" />;
            default:
                return <Package className="h-4 w-4 text-muted-foreground" />;
        }
    };

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold">Track Shipment</h1>
                <p className="text-muted-foreground text-sm">Track any shipment by tracking number.</p>
            </div>

            {/* Search Bar */}
            <Card>
                <CardContent className="pt-6">
                    <div className="flex flex-col sm:flex-row gap-3">
                        <div className="flex-1 space-y-1.5">
                            <Label>Tracking Number</Label>
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                <Input
                                    value={trackingNumber}
                                    onChange={(e) => setTrackingNumber(e.target.value)}
                                    placeholder="TRK-XXXXX-XXXXXXXXXX"
                                    onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                                    className="pl-9"
                                />
                            </div>
                        </div>
                        <div className="flex items-end">
                            <Button onClick={handleSearch} disabled={isLoading} className="w-full sm:w-auto">
                                {isLoading ? "Searching..." : "Track Shipment"}
                            </Button>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Error State */}
            {error && (
                <Card className="border-destructive/50 bg-destructive/10">
                    <CardContent className="pt-6">
                        <div className="flex items-center gap-3 text-destructive">
                            <AlertCircle className="h-5 w-5" />
                            <p className="text-sm font-medium">
                                {error instanceof Error ? error.message : "Shipment not found"}
                            </p>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Shipment Details */}
            {shipment && (
                <div className="space-y-6">
                    {/* Header Card */}
                    <Card>
                        <CardHeader>
                            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                                <div>
                                    <CardTitle className="text-2xl font-bold font-mono">{shipment.trackingNumber}</CardTitle>
                                    <p className="text-sm text-muted-foreground mt-1">Shipment Status</p>
                                </div>
                                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
                                    <StatusBadgeCell status={shipment.status} />
                                    <Badge variant={shipment.priority === "EXPRESS" ? "default" : "secondary"}>
                                        {shipment.priority}
                                    </Badge>
                                    <PrintLabel shipment={shipment} size="sm" variant="outline" />
                                </div>
                            </div>
                        </CardHeader>
                    </Card>

                    {/* AI Journey Summary */}
                    <Card className="border-primary/20 bg-primary/5">
                        <CardContent className="pt-4 pb-4">
                            <div className="flex items-center justify-between mb-2">
                                <div className="flex items-center gap-1.5">
                                    <Sparkles className="size-4 text-primary" />
                                    <span className="text-sm font-semibold text-primary">AI Journey Summary</span>
                                </div>
                                {!aiSummary && !isSummarizing && (
                                    <Button
                                        size="sm"
                                        variant="outline"
                                        className="h-7 text-xs gap-1.5 border-primary/30 text-primary hover:bg-primary/10"
                                        onClick={() => summarizeShipment(shipment)}
                                    >
                                        <Sparkles className="size-3" />
                                        Generate
                                    </Button>
                                )}
                            </div>
                            {isSummarizing ? (
                                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                    <Loader2 className="size-4 animate-spin text-primary" />
                                    Analyzing shipment journey...
                                </div>
                            ) : aiSummary ? (
                                <p className="text-sm text-muted-foreground leading-relaxed">{aiSummary}</p>
                            ) : (
                                <p className="text-xs text-muted-foreground">Click Generate for an AI-powered summary of this shipment&apos;s journey.</p>
                            )}
                        </CardContent>
                    </Card>

                    {/* Pickup & Delivery Cards */}
                    <div className="grid md:grid-cols-2 gap-6">
                        <Card className="bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-900">
                            <CardHeader>
                                <CardTitle className="text-base flex items-center gap-2">
                                    <MapPin className="h-5 w-5 text-green-600" />
                                    Pickup Location
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-2 text-sm">
                                <div className="flex items-start gap-2">
                                    <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
                                    <div>
                                        <p className="font-medium">{shipment.pickupAddress}</p>
                                        <p className="text-muted-foreground">{shipment.pickupCity}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Phone className="h-4 w-4 text-muted-foreground" />
                                    <p>{shipment.pickupPhone}</p>
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-900">
                            <CardHeader>
                                <CardTitle className="text-base flex items-center gap-2">
                                    <MapPin className="h-5 w-5 text-blue-600" />
                                    Delivery Location
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-2 text-sm">
                                <div className="flex items-start gap-2">
                                    <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
                                    <div>
                                        <p className="font-medium">{shipment.deliveryAddress}</p>
                                        <p className="text-muted-foreground">{shipment.deliveryCity}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Phone className="h-4 w-4 text-muted-foreground" />
                                    <p>{shipment.deliveryPhone}</p>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Package Info */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-base flex items-center gap-2">
                                <Package className="h-5 w-5" />
                                Package Information
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                                <div className="bg-muted/50 p-3 rounded">
                                    <p className="text-xs text-muted-foreground">Package Type</p>
                                    <p className="text-sm font-medium mt-1">{shipment.packageType}</p>
                                </div>
                                <div className="bg-muted/50 p-3 rounded">
                                    <p className="text-xs text-muted-foreground">Weight</p>
                                    <p className="text-sm font-medium mt-1">{shipment.weight} kg</p>
                                </div>
                                {shipment.pricing && (
                                    <div className="bg-muted/50 p-3 rounded">
                                        <p className="text-xs text-muted-foreground">Total Price</p>
                                        <p className="text-sm font-medium mt-1">{shipment.pricing.totalPrice} BDT</p>
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Delivery Journey */}
                    {shipment.legs && shipment.legs.length > 0 && (
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-base flex items-center gap-2">
                                    <Truck className="h-5 w-5" />
                                    Delivery Journey
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-3">
                                    {shipment.legs.map((leg, index) => (
                                        <div key={leg.id} className="relative">
                                            {index !== shipment.legs!.length - 1 && (
                                                <div className="absolute left-[19px] top-12 bottom-0 w-0.5 bg-border" />
                                            )}
                                            <div className="flex items-start gap-4 p-4 border rounded-lg bg-card hover:bg-muted/50 transition-colors">
                                                <div className="flex-shrink-0 mt-1">
                                                    {getStatusIcon(leg.status)}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                                                        <div className="flex items-center gap-2">
                                                            <Badge variant="outline" className="text-xs">Leg {leg.legNumber}</Badge>
                                                            <p className="text-sm font-medium">{leg.legType.replace("_", " ")}</p>
                                                        </div>
                                                        <Badge variant={leg.status === "COMPLETED" ? "default" : leg.status === "IN_PROGRESS" ? "secondary" : "outline"}>
                                                            {leg.status}
                                                        </Badge>
                                                    </div>
                                                    <p className="text-xs text-muted-foreground break-words">
                                                        {leg.originType === "HUB" ? leg.originHub?.name : leg.originAddress} → {leg.destType === "HUB" ? leg.destHub?.name : leg.destAddress}
                                                    </p>
                                                    {leg.courier && (
                                                        <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
                                                            <User className="h-3 w-3" />
                                                            <span>Courier: {leg.courier.user?.name}</span>
                                                        </div>
                                                    )}
                                                    {leg.note && (
                                                        <p className="text-xs text-muted-foreground mt-2 italic">{leg.note}</p>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    {/* Status History */}
                    {shipment.events && shipment.events.length > 0 && (
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-base flex items-center gap-2">
                                    <Clock className="h-5 w-5" />
                                    Status History
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-3">
                                    {shipment.events.map((event, index) => (
                                        <div key={event.id} className="relative">
                                            {index !== shipment.events!.length - 1 && (
                                                <div className="absolute left-[19px] top-10 bottom-0 w-0.5 bg-border" />
                                            )}
                                            <div className="flex items-start gap-4">
                                                <div className="flex-shrink-0 mt-1">
                                                    {getStatusIcon(event.status)}
                                                </div>
                                                <div className="flex-1 pb-4">
                                                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                                                        <StatusBadgeCell status={event.status} />
                                                        <p className="text-xs text-muted-foreground">
                                                            {new Date(event.timestamp).toLocaleString()}
                                                        </p>
                                                    </div>
                                                    {event.note && (
                                                        <p className="text-sm text-muted-foreground mt-1">{event.note}</p>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    )}
                </div>
            )}
        </div>
    );
}
