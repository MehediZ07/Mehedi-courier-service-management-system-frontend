import { z } from "zod";

export const loginSchema = z.object({
    email: z.string().email("Invalid email address"),
    password: z.string().min(6, "Password must be at least 6 characters"),
});

export const registerSchema = z.object({
    name: z.string().min(1, "Name is required"),
    email: z.string().email("Invalid email address"),
    password: z.string().min(6, "Password must be at least 6 characters"),
    phone: z.string().optional(),
    role: z.enum(["USER", "MERCHANT"]).optional().default("USER"),
});

export const registerCourierSchema = z.object({
    name: z.string().min(1, "Name is required"),
    email: z.string().email("Invalid email address"),
    password: z.string().min(6, "Password must be at least 6 characters"),
    phone: z.string().optional(),
    vehicleType: z.enum(["BIKE", "BICYCLE", "CAR", "VAN", "TRUCK"] as const, {
        error: "Select a valid vehicle type",
    }),
    licenseNumber: z.string().min(1, "License number is required"),
    city: z.string().min(1, "City is required"),
});

export const changePasswordSchema = z
    .object({
        oldPassword: z.string().min(6, "Old password must be at least 6 characters"),
        newPassword: z.string().min(6, "New password must be at least 6 characters"),
        confirmPassword: z.string().min(6, "Please confirm your new password"),
    })
    .refine((data) => data.newPassword === data.confirmPassword, {
        message: "Passwords do not match",
        path: ["confirmPassword"],
    });

export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
export type RegisterCourierInput = z.infer<typeof registerCourierSchema>;
export type ChangePasswordInput = z.infer<typeof changePasswordSchema>;
