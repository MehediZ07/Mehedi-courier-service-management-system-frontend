import { clientHttpClient } from "@/lib/axios/clientHttpClient";
import { ApiResponse, PaginatedApiResponse } from "@/types/api.types";
import { UpdateUserPayload, UpdateUserRolePayload, UpdateUserStatusPayload, User } from "@/types/user.types";

export async function getAllUsers(params?: Record<string, unknown>) {
    return clientHttpClient.get<PaginatedApiResponse<User>>("/users", { params });
}

export async function getUserById(id: string) {
    return clientHttpClient.get<ApiResponse<User>>(`/users/${id}`);
}

export async function updateUser(id: string, payload: UpdateUserPayload) {
    return clientHttpClient.patch<User>(`/users/${id}`, payload);
}

export async function updateUserStatus(id: string, payload: UpdateUserStatusPayload) {
    return clientHttpClient.patch<User>(`/users/${id}/status`, payload);
}

export async function updateUserRole(id: string, payload: UpdateUserRolePayload) {
    return clientHttpClient.patch<User>(`/users/${id}/role`, payload);
}

export async function deleteUser(id: string) {
    return clientHttpClient.delete<User>(`/users/${id}`);
}

export async function uploadProfileImage(userId: string, file: File) {
    const formData = new FormData();
    formData.append('file', file);
    
    const url = `${process.env.NEXT_PUBLIC_API_BASE_URL}/users/${userId}/upload-profile-image`;
    const token = getAccessToken();
    
    const response = await fetch(url, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${token}`,
        },
        body: formData,
    });
    
    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Upload failed');
    }
    
    return await response.json();
}

function getAccessToken() {
    const cookies = document.cookie.split('; ');
    const accessTokenCookie = cookies.find(row => row.startsWith('accessToken='));
    return accessTokenCookie?.split('=')[1] || '';
}
