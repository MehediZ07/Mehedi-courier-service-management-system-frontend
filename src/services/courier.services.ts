"use server";

import { httpClient } from "@/lib/axios/httpClient";
import { PaginatedResponse } from "@/types/api.types";
import { ApproveCourierPayload, Courier, UpdateCourierPayload } from "@/types/courier.types";

export async function getAllCouriers(params?: Record<string, unknown>) {
    return httpClient.get<PaginatedResponse<Courier>>("/couriers", { params });
}

export async function getMyCourierProfile() {
    return httpClient.get<Courier>("/couriers/my-profile");
}

export async function getCourierById(id: string) {
    return httpClient.get<Courier>(`/couriers/${id}`);
}

export async function createCourierProfile(payload: { userId: string; vehicleType: string; licenseNumber: string }) {
    return httpClient.post<Courier>("/couriers", payload);
}

export async function updateCourier(id: string, payload: UpdateCourierPayload) {
    return httpClient.patch<Courier>(`/couriers/${id}`, payload);
}

export async function approveCourier(id: string, payload: ApproveCourierPayload) {
    return httpClient.patch<Courier>(`/couriers/${id}/approve`, payload);
}

export async function toggleAvailability() {
    return httpClient.patch<Courier>("/couriers/toggle-availability", {});
}

export async function deleteCourier(id: string) {
    return httpClient.delete<Courier>(`/couriers/${id}`);
}
