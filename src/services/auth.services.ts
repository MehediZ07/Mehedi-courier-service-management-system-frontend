"use server";

import { setTokenInCookies } from "@/lib/tokenUtils";
import { LoginPayload, RegisterCourierPayload, RegisterPayload } from "@/types/auth.types";
import { cookies } from "next/headers";

const BASE_API_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

if (!BASE_API_URL) {
    throw new Error("NEXT_PUBLIC_API_BASE_URL is not defined");
}

export async function loginService(payload: LoginPayload) {
    const res = await fetch(`${BASE_API_URL}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || "Login failed");

    if (data.data?.accessToken) {
        await setTokenInCookies("accessToken", data.data.accessToken);
    }
    if (data.data?.refreshToken) {
        await setTokenInCookies("refreshToken", data.data.refreshToken);
    }
    return data;
}

export async function registerService(payload: RegisterPayload) {
    const res = await fetch(`${BASE_API_URL}/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || "Registration failed");
    return data;
}

// Courier registration: registers user account only.
// Admin must then create the courier profile via /couriers.
export async function registerCourierService(payload: RegisterCourierPayload) {
    const { name, email, password, phone } = payload;
    const res = await fetch(`${BASE_API_URL}/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password, phone, role: "USER" }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || "Courier registration failed");
    return data;
}

export async function logoutService() {
    const cookieStore = await cookies();
    cookieStore.delete("accessToken");
    cookieStore.delete("refreshToken");
}

export async function getNewTokensWithRefreshToken(refreshToken: string): Promise<boolean> {
    try {
        const res = await fetch(`${BASE_API_URL}/auth/refresh-token`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "x-refresh-token": refreshToken,
            },
        });
        if (!res.ok) return false;
        const { data } = await res.json();
        if (data?.accessToken) await setTokenInCookies("accessToken", data.accessToken);
        if (data?.refreshToken) await setTokenInCookies("refreshToken", data.refreshToken);
        return true;
    } catch {
        return false;
    }
}

export async function getUserInfo() {
    try {
        const cookieStore = await cookies();
        const accessToken = cookieStore.get("accessToken")?.value;
        if (!accessToken) return null;

        const res = await fetch(`${BASE_API_URL}/auth/me`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                Cookie: `accessToken=${accessToken}`,
            },
        });
        if (!res.ok) return null;
        const { data } = await res.json();
        return data;
    } catch {
        return null;
    }
}

export async function changePasswordService(payload: { oldPassword: string; newPassword: string }) {
    const cookieStore = await cookies();
    const accessToken = cookieStore.get("accessToken")?.value;

    const res = await fetch(`${BASE_API_URL}/auth/change-password`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || "Password change failed");
    return data;
}
