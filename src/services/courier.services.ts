import { clientHttpClient } from "@/lib/axios/clientHttpClient";
import { ApiResponse, PaginatedApiResponse } from "@/types/api.types";
import { Courier, UpdateCourierPayload, ApproveCourierPayload } from "@/types/courier.types";

export async function getAllCouriers(params?: Record<string, unknown>) {
    return clientHttpClient.get<PaginatedApiResponse<Courier>>("/couriers", { params });
}

export async function getMyCourierProfile() {
    return clientHttpClient.get<ApiResponse<Courier>>("/couriers/my-profile");
}

export async function getCourierById(id: string) {
    return clientHttpClient.get<ApiResponse<Courier>>(`/couriers/${id}`);
}

export async function createCourierProfile(payload: { userId: string; vehicleType: string; licenseNumber: string }) {
    return clientHttpClient.post<Courier>("/couriers", payload);
}

export async function updateCourier(id: string, payload: UpdateCourierPayload) {
    return clientHttpClient.patch<Courier>(`/couriers/${id}`, payload);
}

export async function approveCourier(id: string, payload: ApproveCourierPayload) {
    return clientHttpClient.patch<Courier>(`/couriers/${id}/approve`, payload);
}

export async function toggleAvailability() {
    return clientHttpClient.patch<Courier>("/couriers/toggle-availability", {});
}

export async function deleteCourier(id: string) {
    return clientHttpClient.delete<Courier>(`/couriers/${id}`);
}
