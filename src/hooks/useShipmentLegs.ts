"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
    getAvailableLegs,
    getMyCourierLegs,
    getShipmentLegs,
    acceptLeg,
    markLegPickedUp,
    markLegDelivered,
} from "@/services/shipmentLeg.services";
import type { UpdateLegStatusPayload } from "@/types/shipmentLeg.types";

// Query Keys
export const legKeys = {
    all: ["legs"] as const,
    available: (params?: Record<string, unknown>) => [...legKeys.all, "available", params] as const,
    myActive: (params?: Record<string, unknown>) => [...legKeys.all, "my-active", params] as const,
    shipmentLegs: (shipmentId: string) => [...legKeys.all, "shipment", shipmentId] as const,
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

// ============================================
// LEG MUTATIONS
// ============================================

export function useAcceptLeg() {
    const queryClient = useQueryClient();
    
    return useMutation({
        mutationFn: (id: string) => acceptLeg(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: legKeys.available() });
            queryClient.invalidateQueries({ queryKey: legKeys.myActive() });
        },
    });
}

export function useMarkLegPickedUp() {
    const queryClient = useQueryClient();
    
    return useMutation({
        mutationFn: (id: string) => markLegPickedUp(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: legKeys.myActive() });
        },
    });
}

export function useMarkLegDelivered() {
    const queryClient = useQueryClient();
    
    return useMutation({
        mutationFn: ({ id, payload }: { id: string; payload?: UpdateLegStatusPayload }) => markLegDelivered(id, payload),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: legKeys.myActive() });
        },
    });
}
