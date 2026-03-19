"use server";

import { httpClient } from "@/lib/axios/httpClient";
import { PaginatedResponse } from "@/types/api.types";
import { CreateMerchantPayload, Merchant, UpdateMerchantPayload } from "@/types/merchant.types";

export async function getAllMerchants(params?: Record<string, unknown>) {
    return httpClient.get<PaginatedResponse<Merchant>>("/merchants", { params });
}

export async function getMyMerchantProfile() {
    return httpClient.get<Merchant>("/merchants/my-profile");
}

export async function getMerchantById(id: string) {
    return httpClient.get<Merchant>(`/merchants/${id}`);
}

export async function createMerchant(payload: CreateMerchantPayload) {
    return httpClient.post<Merchant>("/merchants", payload);
}

export async function updateMerchant(id: string, payload: UpdateMerchantPayload) {
    return httpClient.patch<Merchant>(`/merchants/${id}`, payload);
}

export async function deleteMerchant(id: string) {
    return httpClient.delete<Merchant>(`/merchants/${id}`);
}
