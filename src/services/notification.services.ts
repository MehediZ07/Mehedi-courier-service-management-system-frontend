"use server";

import { httpClient } from "@/lib/axios/httpClient";
import { PaginatedResponse } from "@/types/api.types";
import { Notification } from "@/types/notification.types";

export async function getMyNotifications(params?: Record<string, unknown>) {
    return httpClient.get<PaginatedResponse<Notification>>("/notifications", { params });
}

export async function markNotificationAsRead(id: string) {
    return httpClient.patch<Notification>(`/notifications/${id}/read`, {});
}

export async function markAllNotificationsAsRead() {
    return httpClient.patch<{ count: number }>("/notifications/mark-all-read", {});
}
