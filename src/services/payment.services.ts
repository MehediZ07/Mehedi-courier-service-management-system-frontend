"use server";

import { httpClient } from "@/lib/axios/httpClient";
import { PaginatedResponse } from "@/types/api.types";
import { ConfirmStripePayload, InitiateStripePayload, Payment, StripeInitiateResponse } from "@/types/payment.types";

export async function getAllPayments(params?: Record<string, unknown>) {
    return httpClient.get<PaginatedResponse<Payment>>("/payments", { params });
}

export async function getPaymentByShipmentId(shipmentId: string) {
    return httpClient.get<Payment>(`/payments/${shipmentId}`);
}

export async function initiateStripePayment(shipmentId: string, payload: InitiateStripePayload) {
    return httpClient.post<StripeInitiateResponse>(`/payments/${shipmentId}/initiate-stripe`, payload);
}

export async function confirmStripePayment(payload: ConfirmStripePayload) {
    return httpClient.post<Payment>("/payments/confirm-stripe", payload);
}

export async function markPaymentAsPaid(shipmentId: string) {
    return httpClient.patch<Payment>(`/payments/${shipmentId}/mark-paid`, {});
}
