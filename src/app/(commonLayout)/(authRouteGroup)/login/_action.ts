/* eslint-disable @typescript-eslint/no-explicit-any */
"use server";

import { getDefaultDashboardRoute, isValidRedirectForRole, UserRole } from "@/lib/authUtils";
import { setTokenInCookies } from "@/lib/tokenUtils";
import { LoginInput, loginSchema } from "@/zod/auth.validation";
import { revalidatePath } from "next/cache";

const getBaseApiUrl = () => {
    const BASE_API_URL = process.env.NEXT_PUBLIC_API_BASE_URL;
    if (!BASE_API_URL) {
        throw new Error("NEXT_PUBLIC_API_BASE_URL is not defined");
    }
    return BASE_API_URL;
};

interface LoginSuccessResponse {
    success: true;
    message: string;
    data: {
        accessToken: string;
        refreshToken: string;
        user: {
            id: string;
            name: string;
            email: string;
            role: string;
            status: string;
        };
    };
    redirectTo: string;
}

interface LoginErrorResponse {
    success: false;
    message: string;
}

export const loginAction = async (
    payload: LoginInput,
    redirectPath?: string
): Promise<LoginSuccessResponse | LoginErrorResponse> => {
    const parsedPayload = loginSchema.safeParse(payload);

    if (!parsedPayload.success) {
        const firstError = parsedPayload.error.issues[0].message || "Invalid input";
        return { success: false, message: firstError };
    }

    try {
        console.log('[loginAction] Starting login...');
        
        // Call backend login
        const response = await fetch(`${getBaseApiUrl()}/auth/login`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(parsedPayload.data),
        });

        const data = await response.json();
        
        if (!response.ok) {
            console.log('[loginAction] Login failed:', data.message);
            return {
                success: false,
                message: data.message || "Login failed",
            };
        }

        // Extract tokens from response and set them in Next.js cookies
        const { accessToken, refreshToken, user } = data.data;
        const { role } = user;

        console.log('[loginAction] Login successful, setting cookies for role:', role);

        // Set cookies in Next.js (these will be httpOnly and secure)
        await setTokenInCookies("accessToken", accessToken);
        await setTokenInCookies("refreshToken", refreshToken);

        const targetPath =
            redirectPath && isValidRedirectForRole(redirectPath, role as UserRole)
                ? redirectPath
                : getDefaultDashboardRoute(role as UserRole);

        console.log('[loginAction] Cookies set, target path:', targetPath);

        // Revalidate to ensure middleware sees new cookies
        revalidatePath("/", "layout");

        // Return success with redirect path instead of using redirect()
        return {
            success: true,
            message: "Login successful",
            data: data.data,
            redirectTo: targetPath,
        };
    } catch (error: any) {
        console.error('[loginAction] Error:', error);
        return {
            success: false,
            message: error?.message || "Login failed",
        };
    }
};
