"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

export function PageTracker() {
  const pathname = usePathname();

  useEffect(() => {
    const trackVisit = async () => {
      try {
        const SESSION_KEY = 'visit_session';
        const SESSION_DURATION = 24 * 60 * 60 * 1000;
        
        const now = Date.now();
        const storedSession = sessionStorage.getItem(SESSION_KEY);
        
        let sessionId = '';
        let isNewSession = false;
        let visitedPages: string[] = [];
        
        if (storedSession) {
          const { id, timestamp, pages } = JSON.parse(storedSession);
          const isExpired = now - timestamp > SESSION_DURATION;
          
          if (isExpired) {
            sessionId = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
            isNewSession = true;
            visitedPages = [pathname];
          } else {
            sessionId = id;
            visitedPages = pages.includes(pathname) ? pages : [...pages, pathname];
          }
        } else {
          sessionId = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
          isNewSession = true;
          visitedPages = [pathname];
        }
        
        sessionStorage.setItem(SESSION_KEY, JSON.stringify({
          id: sessionId,
          timestamp: now,
          pages: visitedPages
        }));
        
        const hasToken = document.cookie.includes('accessToken');
        const endpoint = hasToken ? "/analytics/track" : "/analytics/track-guest";
        
        await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}${endpoint}`, {
          method: "POST",
          headers: { 
            "Content-Type": "application/json",
            ...(hasToken && { "Authorization": `Bearer ${document.cookie.split('accessToken=')[1]?.split(';')[0]}` })
          },
          body: JSON.stringify({ 
            page: pathname, 
            sessionId,
            isNewSession,
            visitedPages 
          }),
          credentials: "include",
        });
      } catch (error) {
        console.error("Failed to track visit:", error);
      }
    };

    trackVisit();
  }, [pathname]);

  return null;
}
