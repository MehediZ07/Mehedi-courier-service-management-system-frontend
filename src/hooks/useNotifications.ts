"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  getMyNotifications,
  markAllNotificationsAsRead,
  markNotificationAsRead,
} from "@/services/notification.services";

// Query Keys
export const notificationKeys = {
  all: ["notifications"] as const,
  lists: () => [...notificationKeys.all, "list"] as const,
  list: (params?: Record<string, unknown>) => [...notificationKeys.lists(), params] as const,
};

// Get My Notifications
export function useGetMyNotifications(params?: Record<string, unknown>) {
  return useQuery({
    queryKey: notificationKeys.list(params),
    queryFn: () => getMyNotifications(params),
    refetchInterval: 30000, // Refetch every 30 seconds for real-time updates
  });
}

// Mark Notification as Read
export function useMarkNotificationAsRead() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: string) => markNotificationAsRead(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: notificationKeys.lists() });
    },
  });
}

// Mark All Notifications as Read
export function useMarkAllNotificationsAsRead() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: markAllNotificationsAsRead,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: notificationKeys.lists() });
    },
  });
}
