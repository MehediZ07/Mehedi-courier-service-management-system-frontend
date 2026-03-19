import { z } from "zod";

export const approveCourierSchema = z.object({
    approvalStatus: z.enum(["APPROVED", "REJECTED"]),
});

export const updateCourierSchema = z.object({
    vehicleType: z.enum(["BIKE", "BICYCLE", "CAR", "VAN", "TRUCK"]).optional(),
    licenseNumber: z.string().min(1).optional(),
    availability: z.boolean().optional(),
});

export type ApproveCourierInput = z.infer<typeof approveCourierSchema>;
export type UpdateCourierInput = z.infer<typeof updateCourierSchema>;
