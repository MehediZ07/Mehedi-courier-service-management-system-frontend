"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  acceptShipment,
  assignCourier,
  calculatePrice,
  createShipment,
  getAllPricing,
  getAllShipments,
  getAssignedShipments,
  getAvailableShipments,
  getMyShipments,
  getShipmentById,
  trackShipment,
  updateShipmentStatus,
  upsertPricing,
} from "@/services/shipment.services";
import type {
  AssignCourierPayload,
  CalculatePricePayload,
  CreateShipmentPayload,
  UpdateShipmentStatusPayload,
  UpsertPricingPayload,
} from "@/types/shipment.types";

// Query Keys
export const shipmentKeys = {
  all: ["shipments"] as const,
  lists: () => [...shipmentKeys.all, "list"] as const,
  list: (params?: Record<string, unknown>) => [...shipmentKeys.lists(), params] as const,
  myShipments: (params?: Record<string, unknown>) => [...shipmentKeys.all, "my", params] as const,
  availableShipments: (params?: Record<string, unknown>) => [...shipmentKeys.all, "available", params] as const,
  assignedShipments: (params?: Record<string, unknown>) => [...shipmentKeys.all, "assigned", params] as const,
  details: () => [...shipmentKeys.all, "detail"] as const,
  detail: (id: string) => [...shipmentKeys.details(), id] as const,
  track: (trackingNumber: string) => [...shipmentKeys.all, "track", trackingNumber] as const,
};

export const pricingKeys = {
  all: ["pricing"] as const,
  list: () => [...pricingKeys.all, "list"] as const,
  calculate: (params: CalculatePricePayload) => [...pricingKeys.all, "calculate", params] as const,
};

// ============================================
// SHIPMENT QUERIES
// ============================================

// Get My Shipments
export function useGetMyShipments(params?: Record<string, unknown>) {
  return useQuery({
    queryKey: shipmentKeys.myShipments(params),
    queryFn: () => getMyShipments(params),
  });
}

// Get All Shipments (Admin)
export function useGetAllShipments(params?: Record<string, unknown>) {
  return useQuery({
    queryKey: shipmentKeys.list(params),
    queryFn: () => getAllShipments(params),
  });
}

// Get Available Shipments (Courier)
export function useGetAvailableShipments(params?: Record<string, unknown>) {
  return useQuery({
    queryKey: shipmentKeys.availableShipments(params),
    queryFn: () => getAvailableShipments(params),
  });
}

// Get Assigned Shipments (Courier)
export function useGetAssignedShipments(params?: Record<string, unknown>) {
  return useQuery({
    queryKey: shipmentKeys.assignedShipments(params),
    queryFn: () => getAssignedShipments(params),
  });
}

// Get Shipment By ID
export function useGetShipmentById(id: string, enabled = true) {
  return useQuery({
    queryKey: shipmentKeys.detail(id),
    queryFn: () => getShipmentById(id),
    enabled: enabled && !!id,
  });
}

// Track Shipment (Public)
export function useTrackShipment(trackingNumber: string, enabled = true) {
  return useQuery({
    queryKey: shipmentKeys.track(trackingNumber),
    queryFn: () => trackShipment(trackingNumber),
    enabled: enabled && !!trackingNumber,
  });
}

// ============================================
// SHIPMENT MUTATIONS
// ============================================

// Create Shipment
export function useCreateShipment() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (payload: CreateShipmentPayload) => createShipment(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: shipmentKeys.myShipments() });
      queryClient.invalidateQueries({ queryKey: shipmentKeys.lists() });
    },
  });
}

export function useAssignCourier() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: AssignCourierPayload }) => assignCourier(id, payload),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: shipmentKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: shipmentKeys.lists() });
      queryClient.invalidateQueries({ queryKey: shipmentKeys.availableShipments() });
    },
  });
}

export function useAcceptShipment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => acceptShipment(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: shipmentKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: shipmentKeys.availableShipments() });
      queryClient.invalidateQueries({ queryKey: shipmentKeys.assignedShipments() });
    },
  });
}

export function useUpdateShipmentStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateShipmentStatusPayload }) => updateShipmentStatus(id, payload),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: shipmentKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: shipmentKeys.assignedShipments() });
      queryClient.invalidateQueries({ queryKey: shipmentKeys.myShipments() });
      queryClient.invalidateQueries({ queryKey: shipmentKeys.lists() });
    },
  });
}

// ============================================
// PRICING QUERIES
// ============================================

// Get All Pricing Tiers (Public)
export function useGetAllPricing() {
  return useQuery({
    queryKey: pricingKeys.list(),
    queryFn: getAllPricing,
    staleTime: 10 * 60 * 1000, // 10 minutes - pricing doesn't change often
  });
}

// Calculate Price Quote (Public)
export function useCalculatePrice(payload: CalculatePricePayload, enabled = false) {
  return useQuery({
    queryKey: pricingKeys.calculate(payload),
    queryFn: () => calculatePrice(payload),
    enabled: enabled && !!payload.pickupCity && !!payload.deliveryCity && !!payload.weight,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

// Upsert Pricing (Admin)
export function useUpsertPricing() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (payload: UpsertPricingPayload) => upsertPricing(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: pricingKeys.list() });
      queryClient.invalidateQueries({ queryKey: pricingKeys.all });
    },
  });
}
