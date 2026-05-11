// Advanced Analytics Service for frontend
// Interfaces with backend advanced analytics API

export interface UserBehaviorMetrics {
  userId: string;
  sessionId: string;
  timestamp: Date;
  pageUrl: string;
  actions: UserAction[];
  scrollDepth: number;
  timeOnPage: number;
  mouseMovements: MouseMovement[];
  clicks: ClickEvent[];
  deviceInfo: DeviceInfo;
  performance: PagePerformance;
}

export interface UserAction {
  type: 'click' | 'scroll' | 'hover' | 'keypress' | 'focus' | 'blur';
  element: string;
  timestamp: number;
  coordinates: { x: number; y: number };
  metadata?: Record<string, any>;
}

export interface MouseMovement {
  x: number;
  y: number;
  timestamp: number;
  velocity?: number;
}

export interface ClickEvent {
  x: number;
  y: number;
  target: string;
  timestamp: number;
  rightClick: boolean;
}

export interface DeviceInfo {
  userAgent: string;
  screenResolution: string;
  viewportSize: string;
  deviceType: 'mobile' | 'tablet' | 'desktop';
  browser: string;
  os: string;
  connectionSpeed?: string;
}

export interface PagePerformance {
  loadTime: number;
  domContentLoaded: number;
  firstContentfulPaint: number;
  largestContentfulPaint: number;
  cumulativeLayoutShift: number;
  firstInputDelay: number;
}

export interface HeatmapData {
  pageUrl: string;
  dateRange: { start: Date; end: Date };
  totalClicks: number;
  clickDensity: Array<{
    x: number;
    y: number;
    intensity: number;
    element?: string;
  }>;
  scrollMap: Array<{
    y: number;
    percentage: number;
    dropOffRate: number;
  }>;
  movementPaths: Array<{
    path: Array<{ x: number; y: number; timestamp: number }>;
    speed: number;
    duration: number;
  }>;
}

export interface RealTimeMetrics {
  timestamp: Date;
  activeUsers: number;
  currentPageViews: number;
  averageSessionDuration: number;
  bounceRate: number;
  topPages: Array<{
    url: string;
    views: number;
    avgTimeOnPage: number;
  }>;
  eventsPerSecond: number;
  errorRate: number;
  conversionRate: number;
}

export interface ContentPerformanceAdvanced {
  contentId: string;
  title: string;
  basicMetrics: {
    views: number;
    uniqueViews: number;
    averageWatchTime: number;
    completionRate: number;
  };
  engagementMetrics: {
    likeRate: number;
    commentRate: number;
    shareRate: number;
    saveRate: number;
    downloadRate: number;
  };
  qualityMetrics: {
    videoQualityScore: number;
    audioQualityScore: number;
    loadingTime: number;
    bufferingEvents: number;
    errorRate: number;
  };
  audienceMetrics: {
    demographics: Record<string, number>;
    geographicDistribution: Record<string, number>;
    deviceBreakdown: Record<string, number>;
    sourceBreakdown: Record<string, number>;
  };
  temporalMetrics: {
    viewsByHour: Array<{ hour: number; views: number }>;
    viewsByDay: Array<{ day: string; views: number }>;
    peakTimes: Array<{ hour: number; views: number }>;
    seasonality: number;
  };
  conversionMetrics: {
    subscriptionConversion: number;
    sponsorClickThrough: number;
    contentShareConversion: number;
    quizCompletionRate: number;
  };
}

export interface CohortAnalysis {
  cohortDate: Date;
  cohortSize: number;
  retentionByDay: Array<{
    day: number;
    retainedUsers: number;
    retentionRate: number;
  }>;
  metricsByDay: Array<{
    day: number;
    averageSessionDuration: number;
    averageActionsPerSession: number;
    conversionRate: number;
  }>;
}

class AdvancedAnalyticsService {
  private baseUrl: string;

  constructor() {
    this.baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:4000';
  }

  /**
   * Get real-time metrics
   */
  async getRealTimeMetrics(): Promise<RealTimeMetrics> {
    try {
      const response = await fetch(`${this.baseUrl}/api/analytics/realtime`);
      if (!response.ok) {
        throw new Error('Failed to fetch real-time metrics');
      }
      return await response.json();
    } catch (error) {
      console.error('Error fetching real-time metrics:', error);
      // Return mock data for development
      return this.getMockRealTimeMetrics();
    }
  }

  /**
   * Generate heatmap data for a page
   */
  async generateHeatmap(pageUrl: string, startDate: Date, endDate: Date): Promise<HeatmapData> {
    try {
      const response = await fetch(`${this.baseUrl}/api/analytics/heatmap`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          pageUrl,
          startDate: startDate.toISOString(),
          endDate: endDate.toISOString(),
        }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to generate heatmap');
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error generating heatmap:', error);
      return this.getMockHeatmapData(pageUrl, startDate, endDate);
    }
  }

  /**
   * Get advanced content performance metrics
   */
  async getContentPerformanceAdvanced(contentId: string, startDate?: Date, endDate?: Date): Promise<ContentPerformanceAdvanced> {
    try {
      const params = new URLSearchParams();
      if (startDate) params.append('startDate', startDate.toISOString());
      if (endDate) params.append('endDate', endDate.toISOString());
      
      const response = await fetch(`${this.baseUrl}/api/analytics/content/${contentId}/advanced?${params}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch content performance');
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error fetching content performance:', error);
      return this.getMockContentPerformance(contentId);
    }
  }

  /**
   * Generate cohort analysis
   */
  async generateCohortAnalysis(cohortDate: Date): Promise<CohortAnalysis> {
    try {
      const response = await fetch(`${this.baseUrl}/api/analytics/cohort`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          cohortDate: cohortDate.toISOString(),
        }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to generate cohort analysis');
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error generating cohort analysis:', error);
      return this.getMockCohortAnalysis(cohortDate);
    }
  }

  /**
   * Track user behavior
   */
  async trackUserBehavior(behavior: Partial<UserBehaviorMetrics>): Promise<void> {
    try {
      await fetch(`${this.baseUrl}/api/analytics/behavior`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(behavior),
      });
    } catch (error) {
      console.error('Error tracking user behavior:', error);
    }
  }

  // Mock data methods for development
  private getMockRealTimeMetrics(): RealTimeMetrics {
    return {
      timestamp: new Date(),
      activeUsers: Math.floor(Math.random() * 1000 + 100),
      currentPageViews: Math.floor(Math.random() * 5000 + 500),
      averageSessionDuration: Math.random() * 300 + 60,
      bounceRate: Math.random() * 50 + 20,
      topPages: [
        { url: "/feed", views: 1000, avgTimeOnPage: 180 },
        { url: "/content/123", views: 500, avgTimeOnPage: 300 },
        { url: "/profile", views: 300, avgTimeOnPage: 120 },
        { url: "/listen", views: 200, avgTimeOnPage: 240 },
        { url: "/upload", views: 100, avgTimeOnPage: 420 }
      ],
      eventsPerSecond: Math.random() * 10 + 1,
      errorRate: Math.random() * 5 + 0.5,
      conversionRate: Math.random() * 3 + 1
    };
  }

  private getMockHeatmapData(pageUrl: string, startDate: Date, endDate: Date): HeatmapData {
    const clickDensity = Array.from({ length: 50 }, () => ({
      x: Math.random() * 1920,
      y: Math.random() * 1080,
      intensity: Math.random() * 20
    }));

    const scrollMap = Array.from({ length: 10 }, (_, i) => ({
      y: i * 10,
      percentage: 100 - (i * 10),
      dropOffRate: Math.random() * 20
    }));

    return {
      pageUrl,
      dateRange: { start: startDate, end: endDate },
      totalClicks: Math.floor(Math.random() * 1000 + 100),
      clickDensity,
      scrollMap,
      movementPaths: []
    };
  }

  private getMockContentPerformance(contentId: string): ContentPerformanceAdvanced {
    return {
      contentId,
      title: "Sample Content",
      basicMetrics: {
        views: Math.floor(Math.random() * 10000 + 1000),
        uniqueViews: Math.floor(Math.random() * 8000 + 800),
        averageWatchTime: Math.random() * 300 + 60,
        completionRate: Math.random() * 50 + 30
      },
      engagementMetrics: {
        likeRate: Math.random() * 10 + 2,
        commentRate: Math.random() * 5 + 1,
        shareRate: Math.random() * 3 + 0.5,
        saveRate: Math.random() * 8 + 1,
        downloadRate: Math.random() * 2 + 0.2
      },
      qualityMetrics: {
        videoQualityScore: Math.random() * 2 + 3,
        audioQualityScore: Math.random() * 2 + 3,
        loadingTime: Math.random() * 3000 + 500,
        bufferingEvents: Math.floor(Math.random() * 10),
        errorRate: Math.random() * 2
      },
      audienceMetrics: {
        demographics: { "18-24": 25, "25-34": 35, "35-44": 25, "45-54": 10, "55+": 5 },
        geographicDistribution: { "Nigeria": 30, "South Africa": 20, "Kenya": 15, "Ghana": 10, "Other": 25 },
        deviceBreakdown: { "mobile": 70, "desktop": 25, "tablet": 5 },
        sourceBreakdown: { "feed": 40, "search": 25, "social": 20, "direct": 10, "other": 5 }
      },
      temporalMetrics: {
        viewsByHour: Array.from({ length: 24 }, (_, i) => ({ hour: i, views: Math.floor(Math.random() * 100 + 20) })),
        viewsByDay: Array.from({ length: 7 }, (_, i) => ({ day: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"][i], views: Math.floor(Math.random() * 500 + 100) })),
        peakTimes: Array.from({ length: 5 }, (_, i) => ({ hour: 18 + i, views: Math.floor(Math.random() * 200 + 50) })),
        seasonality: Math.random() * 0.3 + 0.8
      },
      conversionMetrics: {
        subscriptionConversion: Math.random() * 2 + 0.5,
        sponsorClickThrough: Math.random() * 5 + 1,
        contentShareConversion: Math.random() * 3 + 0.5,
        quizCompletionRate: Math.random() * 20 + 60
      }
    };
  }

  private getMockCohortAnalysis(cohortDate: Date): CohortAnalysis {
    const cohortSize = Math.floor(Math.random() * 1000 + 500);
    
    return {
      cohortDate,
      cohortSize,
      retentionByDay: Array.from({ length: 30 }, (_, i) => ({
        day: i + 1,
        retainedUsers: Math.floor(cohortSize * Math.pow(0.95, i + 1)),
        retentionRate: Math.pow(0.95, i + 1) * 100
      })),
      metricsByDay: Array.from({ length: 30 }, (_, i) => ({
        day: i + 1,
        averageSessionDuration: Math.random() * 300 + 60,
        averageActionsPerSession: Math.random() * 20 + 5,
        conversionRate: Math.random() * 3 + 1
      }))
    };
  }
}

export const advancedAnalyticsService = new AdvancedAnalyticsService();
