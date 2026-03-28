"use client";

import { useForm } from "@tanstack/react-form";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { calculatePrice, createShipment } from "@/services/shipment.services";
import { initiateStripePayment } from "@/services/payment.services";
import { getHubCities } from "@/services/hub.services";
import { useGetMe } from "@/hooks/useAuth";
import { createShipmentSchema, CreateShipmentInput } from "@/zod/shipment.validation";
import { Priority, PriceQuote } from "@/types/shipment.types";
import AppField from "@/components/shared/form/AppField";
import AppSubmitButton from "@/components/shared/form/AppSubmitButton";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Calculator } from "lucide-react";

const PACKAGE_TYPES = ["Documents", "Electronics", "Clothing", "Food", "Fragile", "Other"];

export default function CreateShipmentForm({ redirectTo }: { redirectTo: string }) {
    const router = useRouter();
    const [quote, setQuote] = useState<PriceQuote | null>(null);
    const [quoteError, setQuoteError] = useState<string | null>(null);

    const { data: meData } = useGetMe();
    const userRole = meData?.data?.role;
    const isMerchant = userRole === "MERCHANT";

    const { data: citiesData } = useQuery({
        queryKey: ["hub-cities"],
        queryFn: getHubCities,
    });

    const cities = citiesData?.data ?? [];

    const { mutateAsync: fetchQuote, isPending: isCalculating } = useMutation({
        mutationFn: calculatePrice,
        onSuccess: (res) => {
            setQuote(res.data);
            setQuoteError(null);
        },
        onError: () => {
            setQuote(null);
            setQuoteError("No pricing configured for this route. Contact admin.");
        },
    });

    const { mutateAsync: submitShipment, isPending } = useMutation({
        mutationFn: createShipment,
        onError: (err: Error) => toast.error(err.message),
    });

    const form = useForm({
        defaultValues: {
            pickupAddress: "",
            pickupCity: "",
            pickupPhone: "",
            deliveryAddress: "",
            deliveryCity: "",
            deliveryPhone: "",
            packageType: "Documents",
            weight: 1,
            productPrice: 0,
            priority: "STANDARD" as Priority,
            paymentMethod: "COD" as "COD" | "STRIPE",
            note: "",
        },
        onSubmit: async ({ value }) => {
            const parsed = createShipmentSchema.safeParse(value);
            if (!parsed.success) return;
            
            const payload = parsed.data as CreateShipmentInput;
            
            if (payload.paymentMethod === "STRIPE") {
                if (!quote) {
                    await triggerQuote();
                    await new Promise(resolve => setTimeout(resolve, 500));
                }
                
                if (!quote) {
                    toast.error("Unable to calculate price. Please try again.");
                    return;
                }
                
                const shipmentRes = await submitShipment(payload);
                if (!shipmentRes?.data) return;
                
                const paymentRes = await initiateStripePayment(shipmentRes.data.id, {
                    amount: quote.totalPrice,
                });
                
                if (paymentRes.data.url) {
                    window.location.replace(paymentRes.data.url);
                } else {
                    toast.error("Failed to initiate payment");
                }
            } else {
                await submitShipment(payload);
                toast.success("Shipment created successfully!");
                router.push(redirectTo);
            }
        },
    });

    const triggerQuote = async () => {
        const { pickupCity, deliveryCity, weight, priority } = form.getFieldValue
            ? {
                  pickupCity: form.getFieldValue("pickupCity" as never),
                  deliveryCity: form.getFieldValue("deliveryCity" as never),
                  weight: form.getFieldValue("weight" as never),
                  priority: form.getFieldValue("priority" as never),
              }
            : { pickupCity: "", deliveryCity: "", weight: 0, priority: "STANDARD" };

        if (pickupCity && deliveryCity && weight > 0) {
            await fetchQuote({ pickupCity, deliveryCity, weight: Number(weight), priority: priority as Priority });
        }
    };

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold">Create Shipment</h1>
                <p className="text-muted-foreground text-sm">Fill in the details — price is calculated automatically.</p>
            </div>

            <form
                onSubmit={(e) => {
                    e.preventDefault();
                    form.handleSubmit();
                }}
                className="space-y-6"
            >
                {/* Pickup */}
                <Card>
                    <CardHeader>
                        <CardTitle className="text-sm text-muted-foreground uppercase tracking-wide">Pickup</CardTitle>
                    </CardHeader>
                    <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <form.Field name="pickupAddress">
                            {(field) => (
                                <AppField
                                    field={field}
                                    label="Pickup Address"
                                    placeholder="123 Main St"
                                    className="sm:col-span-2"
                                />
                            )}
                        </form.Field>
                        <form.Field name="pickupCity">
                            {(field) => (
                                <div className="space-y-1.5">
                                    <Label>Pickup City</Label>
                                    <Select value={field.state.value} onValueChange={(v) => {
                                        field.handleChange(v);
                                        setTimeout(triggerQuote, 0);
                                    }}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select city" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {cities.map((city) => (
                                                <SelectItem key={city} value={city}>
                                                    {city}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            )}
                        </form.Field>
                        <form.Field name="pickupPhone">
                            {(field) => (
                                <AppField
                                    field={field}
                                    label="Pickup Phone"
                                    placeholder="01712345678"
                                    className="sm:col-span-1"
                                />
                            )}
                        </form.Field>
                    </CardContent>
                </Card>

                {/* Delivery */}
                <Card>
                    <CardHeader>
                        <CardTitle className="text-sm text-muted-foreground uppercase tracking-wide">Delivery</CardTitle>
                    </CardHeader>
                    <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <form.Field name="deliveryAddress">
                            {(field) => (
                                <AppField
                                    field={field}
                                    label="Delivery Address"
                                    placeholder="456 Oak Ave"
                                    className="sm:col-span-2"
                                />
                            )}
                        </form.Field>
                        <form.Field name="deliveryCity">
                            {(field) => (
                                <div className="space-y-1.5">
                                    <Label>Delivery City</Label>
                                    <Select value={field.state.value} onValueChange={(v) => {
                                        field.handleChange(v);
                                        setTimeout(triggerQuote, 0);
                                    }}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select city" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {cities.map((city) => (
                                                <SelectItem key={city} value={city}>
                                                    {city}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            )}
                        </form.Field>
                        <form.Field name="deliveryPhone">
                            {(field) => (
                                <AppField
                                    field={field}
                                    label="Delivery Phone"
                                    placeholder="01812345678"
                                    className="sm:col-span-1"
                                />
                            )}
                        </form.Field>
                    </CardContent>
                </Card>

                {/* Package Details */}
                <Card>
                    <CardHeader>
                        <CardTitle className="text-sm text-muted-foreground uppercase tracking-wide">Package</CardTitle>
                    </CardHeader>
                    <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {/* Package Type */}
                        <form.Field name="packageType">
                            {(field) => (
                                <div className="space-y-1.5">
                                    <Label>Package Type</Label>
                                    <Select value={field.state.value} onValueChange={field.handleChange}>
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {PACKAGE_TYPES.map((t) => (
                                                <SelectItem key={t} value={t}>
                                                    {t}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            )}
                        </form.Field>

                        {/* Weight — triggers quote on blur */}
                        <form.Field name="weight">
                            {(field) => (
                                <div className="space-y-1.5">
                                    <Label>Weight (kg)</Label>
                                    <input
                                        type="number"
                                        min={0.1}
                                        step={0.1}
                                        value={field.state.value}
                                        onChange={(e) => field.handleChange(Number(e.target.value))}
                                        onBlur={triggerQuote}
                                        className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                                        placeholder="e.g. 2.5"
                                    />
                                </div>
                            )}
                        </form.Field>

                        {/* Product Price - Only for Merchants */}
                        {isMerchant && (
                            <form.Field name="productPrice">
                                {(field) => (
                                    <div className="space-y-1.5">
                                        <Label>Product Price (BDT) - Optional</Label>
                                        <input
                                            type="number"
                                            min={0}
                                            step={0.01}
                                            value={field.state.value || ''}
                                            onChange={(e) => field.handleChange(e.target.value === '' ? 0 : Number(e.target.value))}
                                            className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                                            placeholder="e.g. 500"
                                        />
                                        <p className="text-xs text-muted-foreground">COD = Product Price + Shipment Charge</p>
                                    </div>
                                )}
                            </form.Field>
                        )}

                        {/* Priority — triggers quote on change */}
                        <form.Field name="priority">
                            {(field) => (
                                <div className="space-y-1.5">
                                    <Label>Priority</Label>
                                    <Select
                                        value={field.state.value}
                                        onValueChange={(v) => {
                                            field.handleChange(v as Priority);
                                            setTimeout(triggerQuote, 0);
                                        }}
                                    >
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="STANDARD">Standard</SelectItem>
                                            <SelectItem value="EXPRESS">Express (+surcharge)</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            )}
                        </form.Field>

                        {/* Payment Method */}
                        <form.Field name="paymentMethod">
                            {(field) => (
                                <div className="space-y-1.5">
                                    <Label>Payment Method</Label>
                                    <Select
                                        value={field.state.value}
                                        onValueChange={(v) =>
                                            field.handleChange(v as "COD" | "STRIPE")
                                        }
                                    >
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="COD">Cash on Delivery</SelectItem>
                                            <SelectItem value="STRIPE">Stripe</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            )}
                        </form.Field>

                        <form.Field name="note">
                            {(field) => (
                                <AppField
                                    field={field}
                                    label="Note (optional)"
                                    placeholder="Handle with care..."
                                    className="sm:col-span-2"
                                />
                            )}
                        </form.Field>
                    </CardContent>
                </Card>

                {/* Price Quote */}
                {(quote || quoteError || isCalculating) && (
                    <Card className="border-primary/30 bg-primary/5">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm flex items-center gap-2">
                                <Calculator className="w-4 h-4" />
                                Price Estimate
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            {isCalculating && (
                                <p className="text-sm text-muted-foreground">Calculating...</p>
                            )}
                            {quoteError && (
                                <p className="text-sm text-destructive">{quoteError}</p>
                            )}
                            {quote && !isCalculating && (
                                <div className="space-y-2 text-sm">
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">Region</span>
                                        <Badge variant="outline">{quote.regionType}</Badge>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">Base Price</span>
                                        <span>{quote.basePrice} BDT</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">Weight Charge</span>
                                        <span>{quote.weightCharge} BDT</span>
                                    </div>
                                    {quote.priorityCharge > 0 && (
                                        <div className="flex justify-between">
                                            <span className="text-muted-foreground">Express Surcharge</span>
                                            <span>{quote.priorityCharge.toFixed(2)} BDT</span>
                                        </div>
                                    )}
                                    <Separator />
                                    <div className="flex justify-between font-semibold text-base">
                                        <span>Shipment Charge</span>
                                        <span className="text-primary">{quote.totalPrice.toFixed(2)} BDT</span>
                                    </div>
                                    {form.getFieldValue && Number(form.getFieldValue("productPrice" as never)) > 0 && (
                                        <>
                                            <div className="flex justify-between">
                                                <span className="text-muted-foreground">Product Price</span>
                                                <span>{Number(form.getFieldValue("productPrice" as never)).toFixed(2)} BDT</span>
                                            </div>
                                            <div className="flex justify-between font-bold text-lg text-primary">
                                                <span>Total COD Amount</span>
                                                <span>{(quote.totalPrice + Number(form.getFieldValue("productPrice" as never))).toFixed(2)} BDT</span>
                                            </div>
                                        </>
                                    )}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                )}

                <AppSubmitButton isPending={isPending} pendingLabel="Creating shipment...">
                    Create Shipment
                </AppSubmitButton>
            </form>
        </div>
    );
}
