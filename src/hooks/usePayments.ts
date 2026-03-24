"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  confirmStripePayment,
  getAllPayments,
  getPaymentByShipmentId,
  initiateStripePayment,
  markPaymentAsPaid,
} from "@/services/payment.services";
import type { ConfirmStripePayload, InitiateStripePayload } from "@/types/payment.types";
import { shipmentKeys } from "./useShipments";

// Query Keys
export const paymentKeys = {
  all: ["payments"] as const,
  lists: () => [...paymentKeys.all, "list"] as const,
  list: (params?: Record<string, unknown>) => [...paymentKeys.lists(), params] as const,
  details: () => [...paymentKeys.all, "detail"] as const,
  detail: (shipmentId: string) => [...paymentKeys.details(), shipmentId] as const,
};

// Get All Payments (Admin)
export function useGetAllPayments(params?: Record<string, unknown>) {
  return useQuery({
    queryKey: paymentKeys.list(params),
    queryFn: () => getAllPayments(params),
  });
}

// Get Payment By Shipment ID
export function useGetPaymentByShipmentId(shipmentId: string, enabled = true) {
  return useQuery({
    queryKey: paymentKeys.detail(shipmentId),
    queryFn: () => getPaymentByShipmentId(shipmentId),
    enabled: enabled && !!shipmentId,
  });
}

export function useInitiateStripePayment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ shipmentId, payload }: { shipmentId: string; payload: InitiateStripePayload }) => initiateStripePayment(shipmentId, payload),
    onSuccess: (_, { shipmentId }) => {
      queryClient.invalidateQueries({ queryKey: paymentKeys.detail(shipmentId) });
    },
  });
}

// Confirm Stripe Payment
export function useConfirmStripePayment() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (payload: ConfirmStripePayload) => confirmStripePayment(payload),
    onSuccess: (data) => {
      if (data.data?.shipmentId) {
        queryClient.invalidateQueries({ queryKey: paymentKeys.detail(data.data.shipmentId) });
        queryClient.invalidateQueries({ queryKey: shipmentKeys.detail(data.data.shipmentId) });
      }
      queryClient.invalidateQueries({ queryKey: paymentKeys.lists() });
    },
  });
}

// Mark Payment as Paid (Admin)
export function useMarkPaymentAsPaid() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (shipmentId: string) => markPaymentAsPaid(shipmentId),
    onSuccess: (_, shipmentId) => {
      queryClient.invalidateQueries({ queryKey: paymentKeys.detail(shipmentId) });
      queryClient.invalidateQueries({ queryKey: shipmentKeys.detail(shipmentId) });
      queryClient.invalidateQueries({ queryKey: paymentKeys.lists() });
    },
  });
}
