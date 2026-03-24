"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  changePasswordService,
  loginService,
  logoutService,
  registerCourierService,
  registerService,
} from "@/services/auth.services";
import { clientHttpClient } from "@/lib/axios/clientHttpClient";
import type { ChangePasswordPayload, LoginPayload, RegisterCourierPayload, RegisterPayload } from "@/types/auth.types";
import type { ApiResponse } from "@/types/api.types";
import type { User } from "@/types/user.types";

export const authKeys = {
  all: ["auth"] as const,
  me: () => [...authKeys.all, "me"] as const,
};

export function useGetMe() {
  return useQuery({
    queryKey: authKeys.me(),
    queryFn: async () => {
      try {
        const response = await clientHttpClient.get<ApiResponse<User>>("/auth/me");
        return response;
      } catch (error) {
        console.error("Failed to fetch user:", error);
        return null;
      }
    },
    staleTime: 5 * 60 * 1000,
    retry: false,
  });
}

export function useLogin() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: LoginPayload) => loginService(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: authKeys.me() });
    },
  });
}

export function useRegister() {
  return useMutation({
    mutationFn: (payload: RegisterPayload) => registerService(payload),
  });
}

export function useRegisterCourier() {
  return useMutation({
    mutationFn: (payload: RegisterCourierPayload) => registerCourierService(payload),
  });
}

export function useLogout() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: logoutService,
    onSuccess: () => {
      queryClient.clear();
    },
  });
}

export function useChangePassword() {
  return useMutation({
    mutationFn: (payload: ChangePasswordPayload) => changePasswordService(payload),
  });
}
