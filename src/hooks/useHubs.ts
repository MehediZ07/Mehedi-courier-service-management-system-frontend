"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
    getAllHubs,
    getHubById,
    getHubsByCity,
    createHub,
    updateHub,
    deleteHub,
    getHubShipments,
} from "@/services/hub.services";
import type { CreateHubPayload, UpdateHubPayload } from "@/types/hub.types";

// Query Keys
export const hubKeys = {
    all: ["hubs"] as const,
    lists: () => [...hubKeys.all, "list"] as const,
    list: (params?: Record<string, unknown>) => [...hubKeys.lists(), params] as const,
    details: () => [...hubKeys.all, "detail"] as const,
    detail: (id: string) => [...hubKeys.details(), id] as const,
    byCity: (city: string) => [...hubKeys.all, "city", city] as const,
    shipments: (id: string, params?: Record<string, unknown>) => [...hubKeys.detail(id), "shipments", params] as const,
};

// ============================================
// HUB QUERIES
// ============================================

export function useGetAllHubs(params?: Record<string, unknown>) {
    return useQuery({
        queryKey: hubKeys.list(params),
        queryFn: () => getAllHubs(params),
    });
}

export function useGetHubById(id: string, enabled = true) {
    return useQuery({
        queryKey: hubKeys.detail(id),
        queryFn: () => getHubById(id),
        enabled: enabled && !!id,
    });
}

export function useGetHubsByCity(city: string, enabled = true) {
    return useQuery({
        queryKey: hubKeys.byCity(city),
        queryFn: () => getHubsByCity(city),
        enabled: enabled && !!city,
    });
}

export function useGetHubShipments(id: string, params?: Record<string, unknown>, enabled = true) {
    return useQuery({
        queryKey: hubKeys.shipments(id, params),
        queryFn: () => getHubShipments(id, params),
        enabled: enabled && !!id,
    });
}

// ============================================
// HUB MUTATIONS
// ============================================

export function useCreateHub() {
    const queryClient = useQueryClient();
    
    return useMutation({
        mutationFn: (payload: CreateHubPayload) => createHub(payload),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: hubKeys.lists() });
        },
    });
}

export function useUpdateHub() {
    const queryClient = useQueryClient();
    
    return useMutation({
        mutationFn: ({ id, payload }: { id: string; payload: UpdateHubPayload }) => updateHub(id, payload),
        onSuccess: (_, { id }) => {
            queryClient.invalidateQueries({ queryKey: hubKeys.detail(id) });
            queryClient.invalidateQueries({ queryKey: hubKeys.lists() });
        },
    });
}

export function useDeleteHub() {
    const queryClient = useQueryClient();
    
    return useMutation({
        mutationFn: (id: string) => deleteHub(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: hubKeys.lists() });
        },
    });
}
