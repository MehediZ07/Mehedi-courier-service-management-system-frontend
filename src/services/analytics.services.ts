"use server";

import { httpClient } from "@/lib/axios/httpClient";
import { clientHttpClient } from "@/lib/axios/clientHttpClient";

interface Visit {
  id: string;
  sessionId?: string;
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
  uniqueVisitorsToday: number;
  liveUsers: number;
  recentVisits: Visit[];
}

interface PageViewStat {
  id: string;
  page: string;
  date: string;
  hour: number;
  userRole: string;
  viewCount: number;
  createdAt: string;
}

export const trackVisit = async (data: { page?: string; sessionId?: string; isNewSession?: boolean; visitedPages?: string[] }) => {
  try {
    await httpClient.post("/analytics/track", data);
  } catch (error) {
    console.error("Failed to track visit:", error);
  }
};

export const trackGuestVisit = async (data: { page?: string; sessionId?: string; isNewSession?: boolean; visitedPages?: string[] }) => {
  try {
    await clientHttpClient.post("/analytics/track-guest", data);
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

export const getPageStats = async (params?: { days?: number }): Promise<PageViewStat[]> => {
  const response = await httpClient.get<PageViewStat[]>("/analytics/page-stats", { params });
  return response.data;
};
