import { z } from "zod";

export const createShipmentSchema = z.object({
    pickupAddress: z.string().min(5, "Pickup address must be at least 5 characters"),
    pickupCity: z.string().min(1, "Pickup city is required"),
    deliveryAddress: z.string().min(5, "Delivery address must be at least 5 characters"),
    deliveryCity: z.string().min(1, "Delivery city is required"),
    packageType: z.string().min(1, "Package type is required"),
    weight: z.coerce.number().positive("Weight must be positive"),
    priority: z.enum(["STANDARD", "EXPRESS"] as const).optional().default("STANDARD"),
    paymentMethod: z.enum(["COD", "STRIPE", "SSLCOMMERZ"] as const, {
        error: "Select a valid payment method",
    }),
    note: z.string().optional(),
});

export const calculatePriceSchema = z.object({
    pickupCity: z.string().min(1, "Pickup city is required"),
    deliveryCity: z.string().min(1, "Delivery city is required"),
    weight: z.coerce.number().positive("Weight must be positive"),
    priority: z.enum(["STANDARD", "EXPRESS"] as const).optional().default("STANDARD"),
});

export const upsertPricingSchema = z.object({
    regionType: z.enum(["LOCAL", "NATIONAL", "INTERNATIONAL"] as const),
    basePrice: z.coerce.number().positive("Base price must be positive"),
    perKgPrice: z.coerce.number().positive("Per kg price must be positive"),
    expressMult: z.coerce.number().min(1, "Express multiplier must be >= 1").optional(),
});

export const updateShipmentStatusSchema = z.object({
    status: z.enum(["PICKED_UP", "IN_TRANSIT", "OUT_FOR_DELIVERY", "DELIVERED", "FAILED", "RETURNED"] as const),
    note: z.string().optional(),
    proofOfDelivery: z.string().optional(),
});

export type CreateShipmentInput = z.infer<typeof createShipmentSchema>;
export type CalculatePriceInput = z.infer<typeof calculatePriceSchema>;
export type UpsertPricingInput = z.infer<typeof upsertPricingSchema>;
export type UpdateShipmentStatusInput = z.infer<typeof updateShipmentStatusSchema>;
