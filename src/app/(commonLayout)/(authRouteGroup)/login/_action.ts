/* eslint-disable @typescript-eslint/no-explicit-any */
"use server";

import { getDefaultDashboardRoute, isValidRedirectForRole, UserRole } from "@/lib/authUtils";
import { httpClient } from "@/lib/axios/httpClient";
import { setTokenInCookies } from "@/lib/tokenUtils";
import { ApiErrorResponse } from "@/types/api.types";
import { LoginResponse } from "@/types/auth.types";
import { LoginInput, loginSchema } from "@/zod/auth.validation";
import { redirect } from "next/navigation";

export const loginAction = async (
    payload: LoginInput,
    redirectPath?: string
): Promise<LoginResponse | ApiErrorResponse> => {
    const parsedPayload = loginSchema.safeParse(payload);

    if (!parsedPayload.success) {
        const firstError = parsedPayload.error.issues[0].message || "Invalid input";
        return { success: false, message: firstError };
    }

    try {
        const response = await httpClient.post<LoginResponse>("/auth/login", parsedPayload.data);
        const { accessToken, refreshToken, user } = response.data;
        const { role } = user;

        await setTokenInCookies("accessToken", accessToken);
        await setTokenInCookies("refreshToken", refreshToken);

        const targetPath =
            redirectPath && isValidRedirectForRole(redirectPath, role as UserRole)
                ? redirectPath
                : getDefaultDashboardRoute(role as UserRole);

        redirect(targetPath);
    } catch (error: any) {
        if (
            error &&
            typeof error === "object" &&
            "digest" in error &&
            typeof error.digest === "string" &&
            error.digest.startsWith("NEXT_REDIRECT")
        ) {
            throw error;
        }
        return {
            success: false,
            message: error?.response?.data?.message || error?.message || "Login failed",
        };
    }
};
