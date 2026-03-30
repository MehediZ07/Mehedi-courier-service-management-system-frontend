"use server";

import { httpClient } from "@/lib/axios/httpClient";
import { clientHttpClient } from "@/lib/axios/clientHttpClient";

interface Visit {
  id: string;
  ip?: string;
  userAgent?: string;
  userId?: string;
  userEmail?: string;
  userName?: string;
  userRole?: string;
  page?: string;
  createdAt: string;
}

interface AnalyticsData {
  totalVisits: number;
  todayVisits: number;
  liveUsers: number;
  recentVisits: Visit[];
}

export const trackVisit = async (page?: string) => {
  try {
    await httpClient.post("/analytics/track", { page });
  } catch (error) {
    console.error("Failed to track visit:", error);
  }
};

export const trackGuestVisit = async (page?: string) => {
  try {
    await clientHttpClient.post("/analytics/track-guest", { page });
  } catch (error) {
    console.error("Failed to track guest visit:", error);
  }
};

export const getAnalytics = async (): Promise<AnalyticsData> => {
  const response = await httpClient.get<AnalyticsData>("/analytics/stats");
  return response.data;
};

export const getAllVisits = async (params: Record<string, unknown>) => {
  const response = await httpClient.get("/analytics/visits", { params });
  return response;
};
