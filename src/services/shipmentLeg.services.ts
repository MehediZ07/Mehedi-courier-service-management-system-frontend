import { clientHttpClient } from "@/lib/axios/clientHttpClient";
import { ApiResponse, PaginatedApiResponse } from "@/types/api.types";
import { ShipmentLeg, UpdateLegStatusPayload } from "@/types/shipmentLeg.types";

export async function getAvailableLegs(params?: Record<string, unknown>) {
    return clientHttpClient.get<PaginatedApiResponse<ShipmentLeg>>("/legs/available", { params });
}

export async function getMyCourierLegs(params?: Record<string, unknown>) {
    return clientHttpClient.get<PaginatedApiResponse<ShipmentLeg>>("/legs/my-active", { params });
}

export async function getShipmentLegs(shipmentId: string) {
    return clientHttpClient.get<ApiResponse<ShipmentLeg[]>>(`/legs/shipment/${shipmentId}`);
}

export async function getAllLegs(params?: Record<string, unknown>) {
    return clientHttpClient.get<PaginatedApiResponse<ShipmentLeg>>("/legs", { params });
}

export async function assignCourierToLeg(legId: string, courierId: string) {
    return clientHttpClient.post<ApiResponse<ShipmentLeg>>(`/legs/${legId}/assign`, { courierId });
}

export async function releaseHubTransfer(payload: { legIds: string[]; note?: string }) {
    return clientHttpClient.post<ApiResponse<ShipmentLeg[]>>("/legs/hub-transfer/release", payload);
}

export async function confirmHubTransfer(payload: { legIds: string[]; note?: string }) {
    return clientHttpClient.post<ApiResponse<ShipmentLeg[]>>("/legs/hub-transfer/confirm", payload);
}

export async function acceptLeg(id: string) {
    return clientHttpClient.post<ShipmentLeg>(`/legs/${id}/accept`, {});
}

export async function markLegPickedUp(id: string) {
    return clientHttpClient.patch<ShipmentLeg>(`/legs/${id}/pickup`, {});
}

export async function markLegDelivered(id: string, payload?: UpdateLegStatusPayload) {
    return clientHttpClient.patch<ShipmentLeg>(`/legs/${id}/deliver`, payload || {});
}

export async function markDeliveryRefused(id: string, reason?: string) {
    return clientHttpClient.patch<{
        leg: ShipmentLeg; 
        returnLegs: ShipmentLeg[]; 
        returnShippingCost: number;
        storedAtHub?: { id: string; name: string; address: string; city: string };
    }>(`/legs/${id}/refuse-delivery`, { reason });
}
