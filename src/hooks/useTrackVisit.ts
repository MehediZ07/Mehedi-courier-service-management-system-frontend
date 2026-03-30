"use client";

import { useEffect } from "react";

export const useTrackVisit = (page?: string) => {
  useEffect(() => {
    if (!page) return;

    const trackVisitClient = async () => {
      try {
        // Check if user is authenticated by checking cookies
        const hasToken = document.cookie.includes('accessToken');
        const endpoint = hasToken ? "/analytics/track" : "/analytics/track-guest";
        
        await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}${endpoint}`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ page }),
          credentials: "include",
        });
      } catch (error) {
        console.error("Failed to track visit:", error);
      }
    };

    trackVisitClient();
  }, [page]);
};
