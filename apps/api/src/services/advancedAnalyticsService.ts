import { InteractionModel } from "../models/Interaction.js";
import { UserModel } from "../models/User.js";
import { ContentModel } from "../models/Content.js";
import { logger } from "../config/logger.js";
import { Types } from "mongoose";

// Advanced analytics types
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
  private realTimeMetrics: RealTimeMetrics[] = [];
  private heatmapCache = new Map<string, HeatmapData>();
  private behaviorBuffer = new Map<string, UserBehaviorMetrics[]>();

  /**
   * Track granular user behavior
   */
  async trackUserBehavior(userId: string, sessionId: string, behavior: Partial<UserBehaviorMetrics>): Promise<void> {
    try {
      const behaviorData: UserBehaviorMetrics = {
        userId,
        sessionId,
        timestamp: new Date(),
        pageUrl: behavior.pageUrl || '',
        actions: behavior.actions || [],
        scrollDepth: behavior.scrollDepth || 0,
        timeOnPage: behavior.timeOnPage || 0,
        mouseMovements: behavior.mouseMovements || [],
        clicks: behavior.clicks || [],
        deviceInfo: behavior.deviceInfo || {} as DeviceInfo,
        performance: behavior.performance || {} as PagePerformance
      };

      // Store in buffer for batch processing
      if (!this.behaviorBuffer.has(userId)) {
        this.behaviorBuffer.set(userId, []);
      }
      this.behaviorBuffer.get(userId)!.push(behaviorData);

      // Process batch if buffer is full
      if (this.behaviorBuffer.get(userId)!.length >= 10) {
        await this.processBehaviorBatch(userId);
      }

      logger.info(`[AdvancedAnalytics] Tracked behavior for user ${userId}`);
    } catch (error) {
      logger.error({
        msg: "Failed to track user behavior",
        error: error instanceof Error ? error.message : String(error),
        userId
      });
    }
  }

  /**
   * Process batched behavior data
   */
  private async processBehaviorBatch(userId: string): Promise<void> {
    try {
      const behaviors = this.behaviorBuffer.get(userId) || [];
      if (behaviors.length === 0) return;

      // Store aggregated behavior data
      await this.storeAggregatedBehavior(behaviors);
      
      // Clear buffer
      this.behaviorBuffer.set(userId, []);

      logger.info(`[AdvancedAnalytics] Processed behavior batch for user ${userId}: ${behaviors.length} events`);
    } catch (error) {
      logger.error({
        msg: "Failed to process behavior batch",
        error: error instanceof Error ? error.message : String(error),
        userId
      });
    }
  }

  /**
   * Store aggregated behavior data
   */
  private async storeAggregatedBehavior(behaviors: UserBehaviorMetrics[]): Promise<void> {
    // Implementation would store in MongoDB or analytics database
    // For now, we'll just log the aggregation
    const aggregated = {
      userId: behaviors[0].userId,
      sessionId: behaviors[0].sessionId,
      totalActions: behaviors.reduce((sum, b) => sum + b.actions.length, 0),
      totalClicks: behaviors.reduce((sum, b) => sum + b.clicks.length, 0),
      averageScrollDepth: behaviors.reduce((sum, b) => sum + b.scrollDepth, 0) / behaviors.length,
      totalTimeOnPage: behaviors.reduce((sum, b) => sum + b.timeOnPage, 0),
      deviceType: behaviors[0].deviceInfo.deviceType,
      performance: behaviors[0].performance
    };

    // In production, store in dedicated analytics collection
    logger.debug(`[AdvancedAnalytics] Aggregated behavior: ${JSON.stringify(aggregated)}`);
  }

  /**
   * Generate heatmap data for a page
   */
  async generateHeatmap(pageUrl: string, startDate: Date, endDate: Date): Promise<HeatmapData> {
    try {
      const cacheKey = `${pageUrl}_${startDate.getTime()}_${endDate.getTime()}`;
      
      // Check cache first
      if (this.heatmapCache.has(cacheKey)) {
        return this.heatmapCache.get(cacheKey)!;
      }

      // Get user behavior data for the page
      const behaviors = await this.getPageBehaviors(pageUrl, startDate, endDate);
      
      // Generate click density map
      const clickDensity = this.generateClickDensity(behaviors);
      
      // Generate scroll map
      const scrollMap = this.generateScrollMap(behaviors);
      
      // Generate movement paths
      const movementPaths = this.generateMovementPaths(behaviors);

      const heatmapData: HeatmapData = {
        pageUrl,
        dateRange: { start: startDate, end: endDate },
        totalClicks: behaviors.reduce((sum, b) => sum + b.clicks.length, 0),
        clickDensity,
        scrollMap,
        movementPaths
      };

      // Cache the result
      this.heatmapCache.set(cacheKey, heatmapData);

      return heatmapData;
    } catch (error) {
      logger.error({
        msg: "Failed to generate heatmap",
        error: error instanceof Error ? error.message : String(error),
        pageUrl
      });
      throw error;
    }
  }

  /**
   * Get page behaviors from database
   */
  private async getPageBehaviors(pageUrl: string, startDate: Date, endDate: Date): Promise<UserBehaviorMetrics[]> {
    // Mock implementation - in production, query behavior database
    const mockBehaviors: UserBehaviorMetrics[] = [];
    
    // Generate sample data
    for (let i = 0; i < 100; i++) {
      mockBehaviors.push({
        userId: new Types.ObjectId().toString(),
        sessionId: `session_${i}`,
        timestamp: new Date(startDate.getTime() + Math.random() * (endDate.getTime() - startDate.getTime())),
        pageUrl,
        actions: [],
        scrollDepth: Math.random() * 100,
        timeOnPage: Math.random() * 300000, // 5 minutes max
        mouseMovements: this.generateMockMovements(),
        clicks: this.generateMockClicks(),
        deviceInfo: {
          userAgent: "Mozilla/5.0...",
          screenResolution: "1920x1080",
          viewportSize: "1200x800",
          deviceType: Math.random() > 0.3 ? "desktop" : Math.random() > 0.5 ? "mobile" : "tablet",
          browser: "Chrome",
          os: "Windows"
        },
        performance: {
          loadTime: Math.random() * 5000,
          domContentLoaded: Math.random() * 3000,
          firstContentfulPaint: Math.random() * 2000,
          largestContentfulPaint: Math.random() * 4000,
          cumulativeLayoutShift: Math.random() * 0.3,
          firstInputDelay: Math.random() * 200
        }
      });
    }

    return mockBehaviors;
  }

  /**
   * Generate click density map
   */
  private generateClickDensity(behaviors: UserBehaviorMetrics[]): Array<{ x: number; y: number; intensity: number; element?: string }> {
    const clickMap = new Map<string, number>();

    behaviors.forEach(behavior => {
      behavior.clicks.forEach(click => {
        const key = `${Math.round(click.x / 50)}_${Math.round(click.y / 50)}`; // Grid of 50px
        clickMap.set(key, (clickMap.get(key) || 0) + 1);
      });
    });

    const densityMap = Array.from(clickMap.entries()).map(([key, count]) => {
      const [x, y] = key.split('_').map(Number);
      return {
        x: x * 50,
        y: y * 50,
        intensity: count,
        element: undefined
      };
    });

    return densityMap;
  }

  /**
   * Generate scroll map
   */
  private generateScrollMap(behaviors: UserBehaviorMetrics[]): Array<{ y: number; percentage: number; dropOffRate: number }> {
    const scrollPoints = behaviors.map(b => b.scrollDepth);
    
    // Create scroll distribution
    const scrollMap = [];
    for (let i = 0; i <= 100; i += 10) {
      const usersAtThisPoint = scrollPoints.filter(depth => depth >= i).length;
      const dropOffRate = i > 0 ? ((scrollPoints.filter(depth => depth >= i - 10).length - usersAtThisPoint) / Math.max(scrollPoints.filter(depth => depth >= i - 10).length, 1)) * 100 : 0;
      
      scrollMap.push({
        y: i,
        percentage: (usersAtThisPoint / scrollPoints.length) * 100,
        dropOffRate
      });
    }

    return scrollMap;
  }

  /**
   * Generate movement paths
   */
  private generateMovementPaths(behaviors: UserBehaviorMetrics[]): Array<{ path: Array<{ x: number; y: number; timestamp: number }>; speed: number; duration: number }> {
    return behaviors.slice(0, 20).map(behavior => ({
      path: behavior.mouseMovements.slice(0, 50).map(m => ({ x: m.x, y: m.y, timestamp: m.timestamp })),
      speed: Math.random() * 1000,
      duration: behavior.timeOnPage
    }));
  }

  /**
   * Get real-time metrics
   */
  async getRealTimeMetrics(): Promise<RealTimeMetrics> {
    try {
      const now = new Date();
      const fiveMinutesAgo = new Date(now.getTime() - 5 * 60 * 1000);

      // Get active users in last 5 minutes
      const activeUsers = await this.getActiveUsersCount(fiveMinutesAgo, now);
      
      // Get current page views
      const currentPageViews = await this.getCurrentPageViews(fiveMinutesAgo, now);
      
      // Calculate other metrics
      const averageSessionDuration = await this.getAverageSessionDuration(fiveMinutesAgo, now);
      const bounceRate = await this.getBounceRate(fiveMinutesAgo, now);
      const topPages = await this.getTopPages(fiveMinutesAgo, now, 5);
      const eventsPerSecond = await this.getEventsPerSecond(fiveMinutesAgo, now);
      const errorRate = await this.getErrorRate(fiveMinutesAgo, now);
      const conversionRate = await this.getConversionRate(fiveMinutesAgo, now);

      const metrics: RealTimeMetrics = {
        timestamp: now,
        activeUsers,
        currentPageViews,
        averageSessionDuration,
        bounceRate,
        topPages,
        eventsPerSecond,
        errorRate,
        conversionRate
      };

      // Store in real-time metrics array
      this.realTimeMetrics.push(metrics);
      
      // Keep only last 100 entries
      if (this.realTimeMetrics.length > 100) {
        this.realTimeMetrics = this.realTimeMetrics.slice(-100);
      }

      return metrics;
    } catch (error) {
      logger.error({
        msg: "Failed to get real-time metrics",
        error: error instanceof Error ? error.message : String(error)
      });
      throw error;
    }
  }

  /**
   * Get advanced content performance metrics
   */
  async getContentPerformanceAdvanced(contentId: string, startDate?: Date, endDate?: Date): Promise<ContentPerformanceAdvanced> {
    try {
      const content = await ContentModel.findById(contentId);
      if (!content) {
        throw new Error("Content not found");
      }

      const defaultStartDate = startDate || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
      const defaultEndDate = endDate || new Date();

      // Get all metrics
      const [basicMetrics, engagementMetrics, qualityMetrics, audienceMetrics, temporalMetrics, conversionMetrics] = await Promise.all([
        this.getBasicContentMetrics(contentId, defaultStartDate, defaultEndDate),
        this.getEngagementMetrics(contentId, defaultStartDate, defaultEndDate),
        this.getQualityMetrics(contentId, defaultStartDate, defaultEndDate),
        this.getAudienceMetrics(contentId, defaultStartDate, defaultEndDate),
        this.getTemporalMetrics(contentId, defaultStartDate, defaultEndDate),
        this.getConversionMetrics(contentId, defaultStartDate, defaultEndDate)
      ]);

      return {
        contentId,
        title: content.title,
        basicMetrics,
        engagementMetrics,
        qualityMetrics,
        audienceMetrics,
        temporalMetrics,
        conversionMetrics
      };
    } catch (error) {
      logger.error({
        msg: "Failed to get advanced content performance",
        error: error instanceof Error ? error.message : String(error),
        contentId
      });
      throw error;
    }
  }

  /**
   * Generate cohort analysis
   */
  async generateCohortAnalysis(cohortDate: Date): Promise<CohortAnalysis> {
    try {
      // Get users who signed up on the cohort date
      const cohortUsers = await UserModel.find({
        createdAt: {
          $gte: new Date(cohortDate.getTime()),
          $lt: new Date(cohortDate.getTime() + 24 * 60 * 60 * 1000)
        }
      });

      const cohortSize = cohortUsers.length;

      // Calculate retention for each day
      const retentionByDay = [];
      const metricsByDay = [];

      for (let day = 1; day <= 30; day++) {
        const targetDate = new Date(cohortDate.getTime() + day * 24 * 60 * 60 * 1000);
        const nextDate = new Date(cohortDate.getTime() + (day + 1) * 24 * 60 * 60 * 1000);

        // Get users who were active on this day
        const activeUsers = await InteractionModel.distinct('userId', {
          userId: { $in: cohortUsers.map(u => u._id) },
          createdAt: { $gte: targetDate, $lt: nextDate }
        });

        const retainedUsers = activeUsers.length;
        const retentionRate = cohortSize > 0 ? (retainedUsers / cohortSize) * 100 : 0;

        // Get metrics for this day
        const dayMetrics = await this.getCohortDayMetrics(activeUsers, targetDate, nextDate);

        retentionByDay.push({
          day,
          retainedUsers,
          retentionRate: Math.round(retentionRate * 100) / 100
        });

        metricsByDay.push({
          day,
          ...dayMetrics
        });
      }

      return {
        cohortDate,
        cohortSize,
        retentionByDay,
        metricsByDay
      };
    } catch (error) {
      logger.error({
        msg: "Failed to generate cohort analysis",
        error: error instanceof Error ? error.message : String(error),
        cohortDate
      });
      throw error;
    }
  }

  // Helper methods (mock implementations for now)
  private generateMockMovements(): MouseMovement[] {
    const movements: MouseMovement[] = [];
    for (let i = 0; i < 100; i++) {
      movements.push({
        x: Math.random() * 1920,
        y: Math.random() * 1080,
        timestamp: Date.now() + i * 100,
        velocity: Math.random() * 1000
      });
    }
    return movements;
  }

  private generateMockClicks(): ClickEvent[] {
    const clicks: ClickEvent[] = [];
    for (let i = 0; i < Math.floor(Math.random() * 10); i++) {
      clicks.push({
        x: Math.random() * 1920,
        y: Math.random() * 1080,
        target: "button",
        timestamp: Date.now() + i * 1000,
        rightClick: Math.random() > 0.8
      });
    }
    return clicks;
  }

  private async getActiveUsersCount(startDate: Date, endDate: Date): Promise<number> {
    // Mock implementation
    return Math.floor(Math.random() * 1000 + 100);
  }

  private async getCurrentPageViews(startDate: Date, endDate: Date): Promise<number> {
    // Mock implementation
    return Math.floor(Math.random() * 5000 + 500);
  }

  private async getAverageSessionDuration(startDate: Date, endDate: Date): Promise<number> {
    // Mock implementation
    return Math.random() * 300 + 60; // 1-6 minutes
  }

  private async getBounceRate(startDate: Date, endDate: Date): Promise<number> {
    // Mock implementation
    return Math.random() * 50 + 20; // 20-70%
  }

  private async getTopPages(startDate: Date, endDate: Date, limit: number): Promise<Array<{ url: string; views: number; avgTimeOnPage: number }>> {
    // Mock implementation
    return [
      { url: "/feed", views: 1000, avgTimeOnPage: 180 },
      { url: "/content/123", views: 500, avgTimeOnPage: 300 },
      { url: "/profile", views: 300, avgTimeOnPage: 120 },
      { url: "/listen", views: 200, avgTimeOnPage: 240 },
      { url: "/upload", views: 100, avgTimeOnPage: 420 }
    ].slice(0, limit);
  }

  private async getEventsPerSecond(startDate: Date, endDate: Date): Promise<number> {
    // Mock implementation
    return Math.random() * 10 + 1;
  }

  private async getErrorRate(startDate: Date, endDate: Date): Promise<number> {
    // Mock implementation
    return Math.random() * 5 + 0.5; // 0.5-5.5%
  }

  private async getConversionRate(startDate: Date, endDate: Date): Promise<number> {
    // Mock implementation
    return Math.random() * 3 + 1; // 1-4%
  }

  private async getBasicContentMetrics(contentId: string, startDate: Date, endDate: Date): Promise<any> {
    // Mock implementation
    return {
      views: Math.floor(Math.random() * 10000 + 1000),
      uniqueViews: Math.floor(Math.random() * 8000 + 800),
      averageWatchTime: Math.random() * 300 + 60,
      completionRate: Math.random() * 50 + 30
    };
  }

  private async getEngagementMetrics(contentId: string, startDate: Date, endDate: Date): Promise<any> {
    // Mock implementation
    return {
      likeRate: Math.random() * 10 + 2,
      commentRate: Math.random() * 5 + 1,
      shareRate: Math.random() * 3 + 0.5,
      saveRate: Math.random() * 8 + 1,
      downloadRate: Math.random() * 2 + 0.2
    };
  }

  private async getQualityMetrics(contentId: string, startDate: Date, endDate: Date): Promise<any> {
    // Mock implementation
    return {
      videoQualityScore: Math.random() * 2 + 3, // 3-5
      audioQualityScore: Math.random() * 2 + 3, // 3-5
      loadingTime: Math.random() * 3000 + 500,
      bufferingEvents: Math.floor(Math.random() * 10),
      errorRate: Math.random() * 2
    };
  }

  private async getAudienceMetrics(contentId: string, startDate: Date, endDate: Date): Promise<any> {
    // Mock implementation
    return {
      demographics: { "18-24": 25, "25-34": 35, "35-44": 25, "45-54": 10, "55+": 5 },
      geographicDistribution: { "Nigeria": 30, "South Africa": 20, "Kenya": 15, "Ghana": 10, "Other": 25 },
      deviceBreakdown: { "mobile": 70, "desktop": 25, "tablet": 5 },
      sourceBreakdown: { "feed": 40, "search": 25, "social": 20, "direct": 10, "other": 5 }
    };
  }

  private async getTemporalMetrics(contentId: string, startDate: Date, endDate: Date): Promise<any> {
    // Mock implementation
    return {
      viewsByHour: Array.from({ length: 24 }, (_, i) => ({ hour: i, views: Math.floor(Math.random() * 100 + 20) })),
      viewsByDay: Array.from({ length: 7 }, (_, i) => ({ day: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"][i], views: Math.floor(Math.random() * 500 + 100) })),
      peakTimes: Array.from({ length: 5 }, (_, i) => ({ hour: 18 + i, views: Math.floor(Math.random() * 200 + 50) })),
      seasonality: Math.random() * 0.3 + 0.8
    };
  }

  private async getConversionMetrics(contentId: string, startDate: Date, endDate: Date): Promise<any> {
    // Mock implementation
    return {
      subscriptionConversion: Math.random() * 2 + 0.5,
      sponsorClickThrough: Math.random() * 5 + 1,
      contentShareConversion: Math.random() * 3 + 0.5,
      quizCompletionRate: Math.random() * 20 + 60
    };
  }

  private async getCohortDayMetrics(userIds: Types.ObjectId[], startDate: Date, endDate: Date): Promise<any> {
    // Mock implementation
    return {
      averageSessionDuration: Math.random() * 300 + 60,
      averageActionsPerSession: Math.random() * 20 + 5,
      conversionRate: Math.random() * 3 + 1
    };
  }
}

export const advancedAnalyticsService = new AdvancedAnalyticsService();
