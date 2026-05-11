import { useState, useEffect, useCallback } from "react";
import { RealTimeMetrics } from "../services/advancedAnalyticsService";

interface UseRealTimeAnalyticsReturn {
  metrics: RealTimeMetrics | null;
  isConnected: boolean;
  error: string | null;
  lastUpdate: Date | null;
}

export function useRealTimeAnalytics(): UseRealTimeAnalyticsReturn {
  const [metrics, setMetrics] = useState<RealTimeMetrics | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);

  const connect = useCallback(() => {
    // Simulate WebSocket connection for real-time analytics
    // In production, this would use actual WebSocket or Server-Sent Events
    setIsConnected(true);
    setError(null);

    // Mock real-time updates every 5 seconds
    const interval = setInterval(() => {
      const mockMetrics: RealTimeMetrics = {
        timestamp: new Date(),
        activeUsers: Math.floor(Math.random() * 1000 + 100),
        currentPageViews: Math.floor(Math.random() * 5000 + 500),
        averageSessionDuration: Math.random() * 300 + 60,
        bounceRate: Math.random() * 50 + 20,
        topPages: [
          { url: "/feed", views: Math.floor(Math.random() * 1000 + 500), avgTimeOnPage: Math.random() * 300 + 60 },
          { url: "/content/123", views: Math.floor(Math.random() * 500 + 200), avgTimeOnPage: Math.random() * 400 + 120 },
          { url: "/profile", views: Math.floor(Math.random() * 300 + 100), avgTimeOnPage: Math.random() * 200 + 80 },
          { url: "/listen", views: Math.floor(Math.random() * 200 + 50), avgTimeOnPage: Math.random() * 350 + 150 },
          { url: "/upload", views: Math.floor(Math.random() * 100 + 20), avgTimeOnPage: Math.random() * 500 + 200 }
        ],
        eventsPerSecond: Math.random() * 10 + 1,
        errorRate: Math.random() * 5 + 0.5,
        conversionRate: Math.random() * 3 + 1
      };

      setMetrics(mockMetrics);
      setLastUpdate(new Date());
    }, 5000);

    return () => {
      clearInterval(interval);
      setIsConnected(false);
    };
  }, []);

  useEffect(() => {
    const disconnect = connect();

    return () => {
      disconnect();
    };
  }, [connect]);

  return {
    metrics,
    isConnected,
    error,
    lastUpdate
  };
}
