import { clientHttpClient } from "@/lib/axios/clientHttpClient";
import { ApiResponse, PaginatedApiResponse } from "@/types/api.types";
import { Hub, CreateHubPayload, UpdateHubPayload } from "@/types/hub.types";
import { Shipment } from "@/types/shipment.types";

export async function getAllHubs(params?: Record<string, unknown>) {
    return clientHttpClient.get<PaginatedApiResponse<Hub>>("/hubs", { params });
}

export async function getHubById(id: string) {
    return clientHttpClient.get<ApiResponse<Hub>>(`/hubs/${id}`);
}

export async function getHubsByCity(city: string) {
    return clientHttpClient.get<ApiResponse<Hub[]>>(`/hubs/city/${city}`);
}

export async function createHub(payload: CreateHubPayload) {
    return clientHttpClient.post<Hub>("/hubs", payload);
}

export async function updateHub(id: string, payload: UpdateHubPayload) {
    return clientHttpClient.patch<Hub>(`/hubs/${id}`, payload);
}

export async function deleteHub(id: string) {
    return clientHttpClient.delete(`/hubs/${id}`);
}

export async function getHubShipments(id: string, params?: Record<string, unknown>) {
    return clientHttpClient.get<PaginatedApiResponse<Shipment>>(`/hubs/${id}/shipments`, { params });
}

export async function getHubCities() {
    return clientHttpClient.get<ApiResponse<string[]>>("/hubs/cities");
}
