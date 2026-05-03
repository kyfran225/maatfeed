import { getJson } from "./httpClient";

// Types matching backend
export interface RetentionMetrics {
  dailyActiveUsers: number;
  weeklyActiveUsers: number;
  monthlyActiveUsers: number;
  userRetentionRate7d: number;
  userRetentionRate30d: number;
  averageSessionDuration: number;
  averageSessionsPerUser: number;
}

export interface LearningAnalytics {
  totalQuizzesTaken: number;
  averageQuizScore: number;
  completionRate: number;
  contentMasteredCount: number;
  contentInReviewCount: number;
  averageTimeToMastery: number;
  spacedRepetitionAdherence: number;
}

export interface EngagementMetrics {
  averageWatchTimeSeconds: number;
  completionRate75: number;
  likeRate: number;
  saveRate: number;
  shareRate: number;
  commentRate: number;
}

export interface ContentPerformanceItem {
  contentId: string;
  title: string;
  views: number;
  avgWatchTime: number;
  engagementScore: number;
}

export interface ContentPerformance {
  topPerformingContent: ContentPerformanceItem[];
  bucketDistribution: {
    viral: number;
    educational: number;
    deep: number;
  };
}

export interface DashboardData {
  dateRange: {
    start: string;
    end: string;
  };
  retention: RetentionMetrics;
  learning: LearningAnalytics;
  engagement: EngagementMetrics;
  content: ContentPerformance;
}

// API functions
export async function getDashboardData(days: number = 30): Promise<DashboardData> {
  return getJson<DashboardData>(`/api/analytics/dashboard?days=${days}`);
}

export async function getRetentionMetrics(days: number = 30): Promise<RetentionMetrics> {
  return getJson<RetentionMetrics>(`/api/analytics/retention?days=${days}`);
}

export async function getLearningAnalytics(days: number = 30): Promise<LearningAnalytics> {
  return getJson<LearningAnalytics>(`/api/analytics/learning?days=${days}`);
}

export async function getEngagementMetrics(days: number = 30): Promise<EngagementMetrics> {
  return getJson<EngagementMetrics>(`/api/analytics/engagement?days=${days}`);
}

export async function getContentPerformance(
  days: number = 30,
  limit: number = 10
): Promise<ContentPerformance> {
  return getJson<ContentPerformance>(
    `/api/analytics/content?days=${days}&limit=${limit}`
  );
}
