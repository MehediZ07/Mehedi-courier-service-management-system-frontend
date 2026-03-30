"use client";

import { useEffect, useState } from "react";
import { useTrackVisit } from "@/hooks/useTrackVisit";

export function TrackPageVisit({ page }: { page?: string }) {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  useTrackVisit(isClient ? page : undefined);
  
  return null;
}
