import { clientHttpClient } from "@/lib/axios/clientHttpClient";
import { ApiResponse, PaginatedApiResponse } from "@/types/api.types";
import { ConfirmStripePayload, InitiateStripePayload, Payment, StripeInitiateResponse } from "@/types/payment.types";

export async function getAllPayments(params?: Record<string, unknown>) {
    return clientHttpClient.get<PaginatedApiResponse<Payment>>("/payments", { params });
}

export async function getPaymentByShipmentId(shipmentId: string) {
    return clientHttpClient.get<ApiResponse<Payment>>(`/payments/${shipmentId}`);
}

export async function initiateStripePayment(shipmentId: string, payload: InitiateStripePayload) {
    return clientHttpClient.post<StripeInitiateResponse>(`/payments/${shipmentId}/initiate-stripe`, payload);
}

export async function confirmStripePayment(payload: ConfirmStripePayload) {
    return clientHttpClient.post<Payment>("/payments/confirm-stripe", payload);
}

export async function markPaymentAsPaid(shipmentId: string) {
    return clientHttpClient.patch<Payment>(`/payments/${shipmentId}/mark-paid`, {});
}
