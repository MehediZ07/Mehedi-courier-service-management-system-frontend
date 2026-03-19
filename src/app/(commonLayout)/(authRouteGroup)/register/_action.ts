"use server";

import { registerService } from "@/services/auth.services";
import { RegisterInput, registerSchema } from "@/zod/auth.validation";
import { redirect } from "next/navigation";

export const registerAction = async (payload: RegisterInput) => {
    const parsed = registerSchema.safeParse(payload);
    if (!parsed.success) {
        return { success: false, message: parsed.error.issues[0].message };
    }
    try {
        await registerService(parsed.data);
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
        const msg = error instanceof Error ? error.message : "Registration failed";
        return { success: false, message: msg };
    }
};
