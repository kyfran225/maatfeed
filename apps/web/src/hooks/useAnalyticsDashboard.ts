import { useState, useEffect, useCallback } from "react";
import {
  getDashboardData,
  getRetentionMetrics,
  getLearningAnalytics,
  getEngagementMetrics,
  getContentPerformance,
  type DashboardData,
  type RetentionMetrics,
  type LearningAnalytics,
  type EngagementMetrics,
  type ContentPerformance
} from "../services/analyticsDashboardService";

interface UseDashboardResult {
  data: DashboardData | null;
  loading: boolean;
  error: Error | null;
  refresh: () => Promise<void>;
}

export function useAnalyticsDashboard(days: number = 30): UseDashboardResult {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const dashboardData = await getDashboardData(days);
      setData(dashboardData);
    } catch (err) {
      setError(err instanceof Error ? err : new Error("Failed to load dashboard"));
    } finally {
      setLoading(false);
    }
  }, [days]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { data, loading, error, refresh: fetchData };
}

interface UseRetentionResult {
  metrics: RetentionMetrics | null;
  loading: boolean;
  error: Error | null;
  refresh: () => Promise<void>;
}

export function useRetentionMetrics(days: number = 30): UseRetentionResult {
  const [metrics, setMetrics] = useState<RetentionMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getRetentionMetrics(days);
      setMetrics(data);
    } catch (err) {
      setError(err instanceof Error ? err : new Error("Failed to load retention metrics"));
    } finally {
      setLoading(false);
    }
  }, [days]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { metrics, loading, error, refresh: fetchData };
}

interface UseLearningResult {
  analytics: LearningAnalytics | null;
  loading: boolean;
  error: Error | null;
  refresh: () => Promise<void>;
}

export function useLearningAnalytics(days: number = 30): UseLearningResult {
  const [analytics, setAnalytics] = useState<LearningAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getLearningAnalytics(days);
      setAnalytics(data);
    } catch (err) {
      setError(err instanceof Error ? err : new Error("Failed to load learning analytics"));
    } finally {
      setLoading(false);
    }
  }, [days]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { analytics, loading, error, refresh: fetchData };
}

interface UseEngagementResult {
  metrics: EngagementMetrics | null;
  loading: boolean;
  error: Error | null;
  refresh: () => Promise<void>;
}

export function useEngagementMetrics(days: number = 30): UseEngagementResult {
  const [metrics, setMetrics] = useState<EngagementMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getEngagementMetrics(days);
      setMetrics(data);
    } catch (err) {
      setError(err instanceof Error ? err : new Error("Failed to load engagement metrics"));
    } finally {
      setLoading(false);
    }
  }, [days]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { metrics, loading, error, refresh: fetchData };
}

interface UseContentPerformanceResult {
  performance: ContentPerformance | null;
  loading: boolean;
  error: Error | null;
  refresh: () => Promise<void>;
}

export function useContentPerformance(
  days: number = 30,
  limit: number = 10
): UseContentPerformanceResult {
  const [performance, setPerformance] = useState<ContentPerformance | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getContentPerformance(days, limit);
      setPerformance(data);
    } catch (err) {
      setError(err instanceof Error ? err : new Error("Failed to load content performance"));
    } finally {
      setLoading(false);
    }
  }, [days, limit]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { performance, loading, error, refresh: fetchData };
}
