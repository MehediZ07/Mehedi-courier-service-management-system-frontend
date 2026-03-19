"use server";

import { registerCourierService } from "@/services/auth.services";
import { RegisterCourierInput, registerCourierSchema } from "@/zod/auth.validation";
import { redirect } from "next/navigation";

export const registerCourierAction = async (payload: RegisterCourierInput) => {
    const parsed = registerCourierSchema.safeParse(payload);
    if (!parsed.success) {
        return { success: false, message: parsed.error.issues[0].message };
    }
    try {
        await registerCourierService(parsed.data);
        redirect("/login");
    } catch (error: unknown) {
        if (
            error &&
            typeof error === "object" &&
            "digest" in error &&
            typeof (error as { digest: string }).digest === "string" &&
            (error as { digest: string }).digest.startsWith("NEXT_REDIRECT")
        ) {
            throw error;
        }
        const msg = error instanceof Error ? error.message : "Courier registration failed";
        return { success: false, message: msg };
    }
};
