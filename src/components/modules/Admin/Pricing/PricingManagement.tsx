"use client";

import { useForm } from "@tanstack/react-form";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { getAllPricing, upsertPricing } from "@/services/shipment.services";
import { upsertPricingSchema, UpsertPricingInput } from "@/zod/shipment.validation";
import { RegionType } from "@/types/shipment.types";
import AppField from "@/components/shared/form/AppField";
import AppSubmitButton from "@/components/shared/form/AppSubmitButton";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";

const REGION_LABELS: Record<RegionType, string> = {
    LOCAL: "Local (Same City)",
    NATIONAL: "National (Different City)",
    INTERNATIONAL: "International",
};

export default function PricingManagement() {
    const queryClient = useQueryClient();
    const { data: pricingResponse, isLoading } = useQuery({
        queryKey: ["pricing"],
        queryFn: () => getAllPricing(),
    });

    const pricingList = pricingResponse?.data ?? [];

    const { mutateAsync, isPending } = useMutation({
        mutationFn: upsertPricing,
        onSuccess: () => {
            toast.success("Pricing saved successfully.");
            queryClient.invalidateQueries({ queryKey: ["pricing"] });
        },
        onError: (err: Error) => toast.error(err.message),
    });

    const form = useForm({
        defaultValues: {
            regionType: "LOCAL" as RegionType,
            basePrice: 0,
            perKgPrice: 0,
            expressMult: 1.2,
        },
        onSubmit: async ({ value }) => {
            const parsed = upsertPricingSchema.safeParse(value);
            if (!parsed.success) return;
            await mutateAsync(parsed.data as UpsertPricingInput);
        },
    });

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold">Pricing Management</h1>
                <p className="text-muted-foreground text-sm">Configure shipping rates by region type.</p>
            </div>

            {/* Current Rates */}
            <Card>
                <CardHeader>
                    <CardTitle className="text-base">Current Rates</CardTitle>
                </CardHeader>
                <CardContent>
                    {isLoading ? (
                        <p className="text-sm text-muted-foreground">Loading...</p>
                    ) : !pricingList?.length ? (
                        <p className="text-sm text-muted-foreground">No pricing configured yet.</p>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="border-b text-muted-foreground">
                                        <th className="text-left py-2 pr-4">Region</th>
                                        <th className="text-right py-2 pr-4">Base Price</th>
                                        <th className="text-right py-2 pr-4">Per Kg</th>
                                        <th className="text-right py-2">Express Multiplier</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {pricingList.map((p) => (
                                        <tr key={p.id} className="border-b last:border-0">
                                            <td className="py-2 pr-4">
                                                <Badge variant="outline">{REGION_LABELS[p.regionType]}</Badge>
                                            </td>
                                            <td className="text-right py-2 pr-4 font-medium">{p.basePrice} BDT</td>
                                            <td className="text-right py-2 pr-4">{p.perKgPrice} BDT/kg</td>
                                            <td className="text-right py-2">×{p.expressMult}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Upsert Form */}
            <Card>
                <CardHeader>
                    <CardTitle className="text-base">Set / Update Rate</CardTitle>
                </CardHeader>
                <CardContent>
                    <form
                        onSubmit={(e) => {
                            e.preventDefault();
                            form.handleSubmit();
                        }}
                        className="grid grid-cols-1 sm:grid-cols-2 gap-4"
                    >
                        {/* Region Type Select */}
                        <form.Field name="regionType">
                            {(field) => (
                                <div className="space-y-1.5">
                                    <Label>Region Type</Label>
                                    <Select
                                        value={field.state.value}
                                        onValueChange={(v) => field.handleChange(v as RegionType)}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select region" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {(Object.keys(REGION_LABELS) as RegionType[]).map((r) => (
                                                <SelectItem key={r} value={r}>
                                                    {REGION_LABELS[r]}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            )}
                        </form.Field>

                        <form.Field name="basePrice">
                            {(field) => (
                                <AppField field={field} label="Base Price (BDT)" type="number" placeholder="e.g. 100" />
                            )}
                        </form.Field>

                        <form.Field name="perKgPrice">
                            {(field) => (
                                <AppField field={field} label="Per Kg Price (BDT)" type="number" placeholder="e.g. 30" />
                            )}
                        </form.Field>

                        <form.Field name="expressMult">
                            {(field) => (
                                <AppField
                                    field={field}
                                    label="Express Multiplier (e.g. 1.25 = +25%)"
                                    type="number"
                                    placeholder="e.g. 1.2"
                                />
                            )}
                        </form.Field>

                        <div className="sm:col-span-2">
                            <AppSubmitButton isPending={isPending} pendingLabel="Saving...">
                                Save Pricing
                            </AppSubmitButton>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}
