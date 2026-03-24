import { clientHttpClient } from "@/lib/axios/clientHttpClient";
import { ApiResponse, PaginatedApiResponse } from "@/types/api.types";
import {
    AssignCourierPayload,
    CalculatePricePayload,
    CreateShipmentPayload,
    Pricing,
    PriceQuote,
    Shipment,
    UpdateShipmentStatusPayload,
    UpsertPricingPayload,
} from "@/types/shipment.types";

export async function getMyShipments(params?: Record<string, unknown>) {
    return clientHttpClient.get<PaginatedApiResponse<Shipment>>("/shipments/my", { params });
}

export async function getAllShipments(params?: Record<string, unknown>) {
    return clientHttpClient.get<PaginatedApiResponse<Shipment>>("/shipments", { params });
}

export async function getShipmentById(id: string) {
    return clientHttpClient.get<ApiResponse<Shipment>>(`/shipments/${id}`);
}

export async function trackShipment(trackingNumber: string) {
    return clientHttpClient.get<ApiResponse<Shipment>>(`/shipments/track/${trackingNumber}`);
}

export async function createShipment(payload: CreateShipmentPayload) {
    return clientHttpClient.post<Shipment>("/shipments", payload);
}

export async function assignCourier(id: string, payload: AssignCourierPayload) {
    return clientHttpClient.patch<Shipment>(`/shipments/${id}/assign`, payload);
}

export async function acceptShipment(id: string) {
    return clientHttpClient.post<Shipment>(`/shipments/${id}/accept`, {});
}

export async function updateShipmentStatus(id: string, payload: UpdateShipmentStatusPayload) {
    return clientHttpClient.patch<Shipment>(`/shipments/${id}/status`, payload);
}

export async function getAvailableShipments(params?: Record<string, unknown>) {
    return clientHttpClient.get<PaginatedApiResponse<Shipment>>("/shipments/courier/available", { params });
}

export async function getAssignedShipments(params?: Record<string, unknown>) {
    return clientHttpClient.get<PaginatedApiResponse<Shipment>>("/shipments/courier/assigned", { params });
}

export async function getAllPricing() {
    return clientHttpClient.get<ApiResponse<Pricing[]>>("/pricing");
}

export async function calculatePrice(payload: CalculatePricePayload) {
    return clientHttpClient.post<PriceQuote>("/pricing/calculate", payload);
}

export async function upsertPricing(payload: UpsertPricingPayload) {
    return clientHttpClient.post<Pricing>("/pricing", payload);
}
