import { clientHttpClient } from "@/lib/axios/clientHttpClient";
import { ApiResponse, PaginatedApiResponse } from "@/types/api.types";
import { Notification } from "@/types/notification.types";

export async function getMyNotifications(params?: Record<string, unknown>) {
    return clientHttpClient.get<PaginatedApiResponse<Notification>>("/notifications", { params });
}

export async function markNotificationAsRead(id: string) {
    return clientHttpClient.patch<ApiResponse<Notification>>(`/notifications/${id}/read`, {});
}

export async function markAllNotificationsAsRead() {
    return clientHttpClient.patch<ApiResponse<{ count: number }>>("/notifications/mark-all-read", {});
}
