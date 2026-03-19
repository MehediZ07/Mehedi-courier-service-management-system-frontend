"use server";

import { httpClient } from "@/lib/axios/httpClient";
import { PaginatedResponse } from "@/types/api.types";
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
    return httpClient.get<PaginatedResponse<Shipment>>("/shipments/my", { params });
}

export async function getAllShipments(params?: Record<string, unknown>) {
    return httpClient.get<PaginatedResponse<Shipment>>("/shipments", { params });
}

export async function getShipmentById(id: string) {
    return httpClient.get<Shipment>(`/shipments/${id}`);
}

export async function trackShipment(trackingNumber: string) {
    return httpClient.get<Shipment>(`/shipments/track/${trackingNumber}`);
}

export async function createShipment(payload: CreateShipmentPayload) {
    return httpClient.post<Shipment>("/shipments", payload);
}

export async function assignCourier(id: string, payload: AssignCourierPayload) {
    return httpClient.patch<Shipment>(`/shipments/${id}/assign`, payload);
}

export async function acceptShipment(id: string) {
    return httpClient.post<Shipment>(`/shipments/${id}/accept`, {});
}

export async function updateShipmentStatus(id: string, payload: UpdateShipmentStatusPayload) {
    return httpClient.patch<Shipment>(`/shipments/${id}/status`, payload);
}

export async function getAvailableShipments(params?: Record<string, unknown>) {
    return httpClient.get<PaginatedResponse<Shipment>>("/shipments/courier/available", { params });
}

export async function getAssignedShipments(params?: Record<string, unknown>) {
    return httpClient.get<PaginatedResponse<Shipment>>("/shipments/courier/assigned", { params });
}

// Pricing
export async function getAllPricing() {
    return httpClient.get<Pricing[]>("/pricing");
}

export async function calculatePrice(payload: CalculatePricePayload) {
    return httpClient.post<PriceQuote>("/pricing/calculate", payload);
}

export async function upsertPricing(payload: UpsertPricingPayload) {
    return httpClient.post<Pricing>("/pricing", payload);
}
