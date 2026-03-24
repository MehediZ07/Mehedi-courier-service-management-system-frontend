import { clientHttpClient } from "@/lib/axios/clientHttpClient";
import { ApiResponse, PaginatedApiResponse } from "@/types/api.types";
import { CreateMerchantPayload, Merchant, UpdateMerchantPayload } from "@/types/merchant.types";

export async function getAllMerchants(params?: Record<string, unknown>) {
    return clientHttpClient.get<PaginatedApiResponse<Merchant>>("/merchants", { params });
}

export async function getMyMerchantProfile() {
    return clientHttpClient.get<ApiResponse<Merchant>>("/merchants/my-profile");
}

export async function getMerchantById(id: string) {
    return clientHttpClient.get<ApiResponse<Merchant>>(`/merchants/${id}`);
}

export async function createMerchant(payload: CreateMerchantPayload) {
    return clientHttpClient.post<Merchant>("/merchants", payload);
}

export async function updateMerchant(id: string, payload: UpdateMerchantPayload) {
    return clientHttpClient.patch<Merchant>(`/merchants/${id}`, payload);
}

export async function deleteMerchant(id: string) {
    return clientHttpClient.delete<Merchant>(`/merchants/${id}`);
}
