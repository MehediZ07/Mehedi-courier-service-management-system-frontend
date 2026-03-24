"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  approveCourier,
  createCourierProfile,
  deleteCourier,
  getAllCouriers,
  getCourierById,
  getMyCourierProfile,
  toggleAvailability,
  updateCourier,
} from "@/services/courier.services";
import type { ApproveCourierPayload, UpdateCourierPayload } from "@/types/courier.types";

// Query Keys
export const courierKeys = {
  all: ["couriers"] as const,
  lists: () => [...courierKeys.all, "list"] as const,
  list: (params?: Record<string, unknown>) => [...courierKeys.lists(), params] as const,
  details: () => [...courierKeys.all, "detail"] as const,
  detail: (id: string) => [...courierKeys.details(), id] as const,
  myProfile: () => [...courierKeys.all, "my-profile"] as const,
};

// Get All Couriers (Admin)
export function useGetAllCouriers(params?: Record<string, unknown>) {
  return useQuery({
    queryKey: courierKeys.list(params),
    queryFn: () => getAllCouriers(params),
  });
}

// Get My Courier Profile
export function useGetMyCourierProfile(enabled = true) {
  return useQuery({
    queryKey: courierKeys.myProfile(),
    queryFn: getMyCourierProfile,
    enabled,
  });
}

// Get Courier By ID
export function useGetCourierById(id: string, enabled = true) {
  return useQuery({
    queryKey: courierKeys.detail(id),
    queryFn: () => getCourierById(id),
    enabled: enabled && !!id,
  });
}

// Create Courier Profile
export function useCreateCourierProfile() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (payload: { userId: string; vehicleType: string; licenseNumber: string }) =>
      createCourierProfile(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: courierKeys.lists() });
    },
  });
}

export function useUpdateCourier() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateCourierPayload }) => updateCourier(id, payload),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: courierKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: courierKeys.lists() });
      queryClient.invalidateQueries({ queryKey: courierKeys.myProfile() });
    },
  });
}

export function useApproveCourier() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: ApproveCourierPayload }) => approveCourier(id, payload),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: courierKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: courierKeys.lists() });
    },
  });
}

// Toggle Availability
export function useToggleAvailability() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: toggleAvailability,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: courierKeys.myProfile() });
      queryClient.invalidateQueries({ queryKey: courierKeys.lists() });
    },
  });
}

// Delete Courier
export function useDeleteCourier() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: string) => deleteCourier(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: courierKeys.lists() });
    },
  });
}
