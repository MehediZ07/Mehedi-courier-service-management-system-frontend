"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createMerchant,
  deleteMerchant,
  getAllMerchants,
  getMerchantById,
  getMyMerchantProfile,
  updateMerchant,
} from "@/services/merchant.services";
import type { CreateMerchantPayload, UpdateMerchantPayload } from "@/types/merchant.types";

// Query Keys
export const merchantKeys = {
  all: ["merchants"] as const,
  lists: () => [...merchantKeys.all, "list"] as const,
  list: (params?: Record<string, unknown>) => [...merchantKeys.lists(), params] as const,
  details: () => [...merchantKeys.all, "detail"] as const,
  detail: (id: string) => [...merchantKeys.details(), id] as const,
  myProfile: () => [...merchantKeys.all, "my-profile"] as const,
};

// Get All Merchants (Admin)
export function useGetAllMerchants(params?: Record<string, unknown>) {
  return useQuery({
    queryKey: merchantKeys.list(params),
    queryFn: () => getAllMerchants(params),
  });
}

// Get My Merchant Profile
export function useGetMyMerchantProfile(enabled = true) {
  return useQuery({
    queryKey: merchantKeys.myProfile(),
    queryFn: getMyMerchantProfile,
    enabled,
  });
}

// Get Merchant By ID
export function useGetMerchantById(id: string, enabled = true) {
  return useQuery({
    queryKey: merchantKeys.detail(id),
    queryFn: () => getMerchantById(id),
    enabled: enabled && !!id,
  });
}

// Create Merchant
export function useCreateMerchant() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (payload: CreateMerchantPayload) => createMerchant(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: merchantKeys.lists() });
    },
  });
}

export function useUpdateMerchant() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateMerchantPayload }) => updateMerchant(id, payload),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: merchantKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: merchantKeys.lists() });
      queryClient.invalidateQueries({ queryKey: merchantKeys.myProfile() });
    },
  });
}

// Delete Merchant
export function useDeleteMerchant() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: string) => deleteMerchant(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: merchantKeys.lists() });
    },
  });
}
