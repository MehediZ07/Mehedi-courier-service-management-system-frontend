"use server";

import { httpClient } from "@/lib/axios/httpClient";
import { PaginatedResponse } from "@/types/api.types";
import { UpdateUserPayload, UpdateUserRolePayload, UpdateUserStatusPayload, User } from "@/types/user.types";

export async function getAllUsers(params?: Record<string, unknown>) {
    return httpClient.get<PaginatedResponse<User>>("/users", { params });
}

export async function getUserById(id: string) {
    return httpClient.get<User>(`/users/${id}`);
}

export async function updateUser(id: string, payload: UpdateUserPayload) {
    return httpClient.patch<User>(`/users/${id}`, payload);
}

export async function updateUserStatus(id: string, payload: UpdateUserStatusPayload) {
    return httpClient.patch<User>(`/users/${id}/status`, payload);
}

export async function updateUserRole(id: string, payload: UpdateUserRolePayload) {
    return httpClient.patch<User>(`/users/${id}/role`, payload);
}

export async function deleteUser(id: string) {
    return httpClient.delete<User>(`/users/${id}`);
}
