import { useCallback, useRef } from "react";
import { postJson } from "../services/httpClient";

interface WatchTrackingData {
  contentId: string;
  watchDurationMs: number;
  completionRatio: number;
}

interface WatchTrackingResponse {
  status: "ok";
  action: "watch_tracked";
  contentId: string;
  watchDurationMs: number;
  completionRatio: number;
}

export function useTrackWatch(contentId: string) {
  const startTimeRef = useRef<number>(Date.now());
  const lastTrackedRef = useRef<number>(0);
  const isTrackingRef = useRef<boolean>(false);

  const trackWatch = useCallback(async (completionRatio: number) => {
    if (!contentId || isTrackingRef.current) return;

    const now = Date.now();
    const watchDurationMs = now - startTimeRef.current;
    
    // Only track if we have meaningful watch time and haven't tracked recently
    if (watchDurationMs < 1000 || now - lastTrackedRef.current < 5000) {
      return;
    }

    isTrackingRef.current = true;
    lastTrackedRef.current = now;

    try {
      await postJson<WatchTrackingResponse>("/api/interactions/watch", {
        contentId,
        watchDurationMs,
        completionRatio
      });
    } catch (error) {
      console.error("Failed to track watch:", error);
    } finally {
      isTrackingRef.current = false;
    }
  }, [contentId]);

  const startTracking = useCallback(() => {
    startTimeRef.current = Date.now();
    lastTrackedRef.current = 0;
  }, []);

  const resetTracking = useCallback(() => {
    startTimeRef.current = Date.now();
    lastTrackedRef.current = 0;
    isTrackingRef.current = false;
  }, []);

  return {
    trackWatch,
    startTracking,
    resetTracking
  };
}
