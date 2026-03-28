"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
    getAvailableLegs,
    getMyCourierLegs,
    getShipmentLegs,
    getAllLegs,
    assignCourierToLeg,
    releaseHubTransfer,
    confirmHubTransfer,
    acceptLeg,
    markLegPickedUp,
    markLegDelivered,
} from "@/services/shipmentLeg.services";
import type { UpdateLegStatusPayload } from "@/types/shipmentLeg.types";

// Query Keys
export const legKeys = {
    all: ["legs"] as const,
    // Base prefix keys — used for invalidation (matches ALL queries with this prefix)
    availableBase: () => ["legs", "available"] as const,
    myActiveBase: () => ["legs", "my-active"] as const,
    // Full keys with params — used for individual queries
    available: (params?: Record<string, unknown>) => ["legs", "available", params] as const,
    myActive: (params?: Record<string, unknown>) => ["legs", "my-active", params] as const,
    shipmentLegs: (shipmentId: string) => [...["legs"] as const, "shipment", shipmentId] as const,
    adminAll: (params?: Record<string, unknown>) => ["legs", "admin", params] as const,
};

// ============================================
// LEG QUERIES
// ============================================

export function useGetAvailableLegs(params?: Record<string, unknown>) {
    return useQuery({
        queryKey: legKeys.available(params),
        queryFn: () => getAvailableLegs(params),
    });
}

export function useGetMyCourierLegs(params?: Record<string, unknown>) {
    return useQuery({
        queryKey: legKeys.myActive(params),
        queryFn: () => getMyCourierLegs(params),
    });
}

export function useGetShipmentLegs(shipmentId: string, enabled = true) {
    return useQuery({
        queryKey: legKeys.shipmentLegs(shipmentId),
        queryFn: () => getShipmentLegs(shipmentId),
        enabled: enabled && !!shipmentId,
    });
}

export function useGetAllLegs(params?: Record<string, unknown>) {
    return useQuery({
        queryKey: legKeys.adminAll(params),
        queryFn: () => getAllLegs(params),
    });
}

// ============================================
// LEG MUTATIONS
// ============================================

export function useAssignCourierToLeg() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ legId, courierId }: { legId: string; courierId: string }) => assignCourierToLeg(legId, courierId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: legKeys.all });
        },
    });
}

export function useReleaseHubTransfer() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (payload: { legIds: string[]; note?: string }) => releaseHubTransfer(payload),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: legKeys.all });
        },
    });
}

export function useConfirmHubTransfer() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (payload: { legIds: string[]; note?: string }) => confirmHubTransfer(payload),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: legKeys.all });
        },
    });
}

export function useAcceptLeg() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (id: string) => acceptLeg(id),
        onSuccess: () => {
            // Use base prefix keys — matches ALL cached queries regardless of params
            queryClient.invalidateQueries({ queryKey: legKeys.availableBase() });
            queryClient.invalidateQueries({ queryKey: legKeys.myActiveBase() });
        },
    });
}

export function useMarkLegPickedUp() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (id: string) => markLegPickedUp(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: legKeys.myActiveBase() });
        },
    });
}

export function useMarkLegDelivered() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, payload }: { id: string; payload?: UpdateLegStatusPayload }) => markLegDelivered(id, payload),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: legKeys.myActiveBase() });
        },
    });
}