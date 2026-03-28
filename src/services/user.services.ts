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
    // Convert file to base64
    const base64 = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => {
            const result = reader.result as string;
            // Remove data:image/xxx;base64, prefix
            const base64String = result.split(',')[1];
            resolve(base64String);
        };
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });
    
    return clientHttpClient.post<User>(
        `/users/${userId}/upload-profile-image`,
        {
            image: base64,
            filename: file.name,
            mimetype: file.type,
        }
    );
}
