import { CreatorModel, ICreator } from "../models/Creator";
import { CreatorAnalyticsModel, ICreatorAnalytics } from "../models/CreatorAnalytics";
import { ContentModel, IContent } from "../models/Content";
import { CreatorFollowModel } from "../models/CreatorFollow";
import { PaymentTransactionModel } from "../models/PaymentTransaction";
import { Types } from "mongoose";

export interface AnalyticsOverview {
  period: "daily" | "weekly" | "monthly";
  totalViews: number;
  totalEngagement: number;
  totalRevenue: number;
  followerGrowth: number;
  contentPerformance: {
    totalContent: number;
    avgViews: number;
    avgEngagement: number;
    topPerforming: Array<{
      contentId: string;
      title: string;
      views: number;
      engagement: number;
    }>;
  };
  audienceMetrics: {
    totalFollowers: number;
    activeFollowers: number;
    newFollowers: number;
    demographics: {
      ageGroups: Record<string, number>;
      gender: Record<string, number>;
      locations: Record<string, number>;
    };
  };
  revenueBreakdown: {
    fromSponsors: number;
    fromSubscriptions: number;
    fromDonations: number;
    fromContent: number;
  };
}

export interface ContentAnalytics {
  contentId: string;
  title: string;
  type: "video" | "audio";
  views: number;
  uniqueViews: number;
  engagement: {
    likes: number;
    comments: number;
    shares: number;
    downloads: number;
  };
  retention: {
    avgWatchTime: number;
    completionRate: number;
    dropOffPoints: Array<{
      time: number;
      percentage: number;
    }>;
  };
  demographics: {
    ageGroups: Record<string, number>;
    gender: Record<string, number>;
    locations: Record<string, number>;
  };
  traffic: {
    sources: Record<string, number>;
    devices: Record<string, number>;
    times: Array<{
      hour: number;
      views: number;
    }>;
  };
  revenue: {
    direct: number;
    indirect: number;
    total: number;
  };
}

export interface AudienceAnalytics {
  totalFollowers: number;
  activeFollowers: number;
  followerGrowth: {
    daily: Array<{
      date: string;
      followers: number;
      newFollowers: number;
    }>;
    weekly: Array<{
      week: string;
      followers: number;
      newFollowers: number;
    }>;
    monthly: Array<{
      month: string;
      followers: number;
      newFollowers: number;
    }>;
  };
  demographics: {
    ageGroups: Record<string, number>;
    gender: Record<string, number>;
    locations: Record<string, number>;
    languages: Record<string, number>;
  };
  engagement: {
    avgEngagementRate: number;
    topEngagers: Array<{
      userId: string;
      engagementScore: number;
      interactions: number;
    }>;
    engagementByContent: Record<string, number>;
  };
  interests: Record<string, number>;
  behavior: {
    peakActivityHours: Array<{
      hour: number;
      activity: number;
    }>;
    preferredContentTypes: Record<string, number>;
    contentFrequency: number;
  };
}

export interface RevenueAnalytics {
  totalRevenue: number;
  periodRevenue: {
    daily: Array<{
      date: string;
      revenue: number;
      transactions: number;
    }>;
    weekly: Array<{
      week: string;
      revenue: number;
      transactions: number;
    }>;
    monthly: Array<{
      month: string;
      revenue: number;
      transactions: number;
    }>;
  };
  sources: {
    sponsors: {
      total: number;
      activeSponsors: number;
      avgSponsorValue: number;
      sponsors: Array<{
        sponsorId: string;
        amount: number;
        tier: string;
        startDate: string;
      }>;
    };
    subscriptions: {
      total: number;
      activeSubscriptions: number;
      avgSubscriptionValue: number;
      churnRate: number;
      tiers: Record<string, {
        count: number;
        revenue: number;
      }>;
    };
    donations: {
      total: number;
      donations: number;
      avgDonation: number;
      topDonors: Array<{
        userId: string;
        amount: number;
        donations: number;
      }>;
    };
    content: {
      total: number;
      views: number;
      cpm: number;
      topContent: Array<{
        contentId: string;
        revenue: number;
        views: number;
      }>;
    };
  };
  projections: {
    nextMonth: number;
    nextQuarter: number;
    nextYear: number;
    confidence: number;
  };
}

class CreatorAnalyticsService {
  /**
   * Get comprehensive analytics overview for a creator
   */
  async getAnalyticsOverview(creatorId: string, period: "daily" | "weekly" | "monthly" = "weekly"): Promise<AnalyticsOverview> {
    try {
      const creator = await CreatorModel.findById(creatorId);
      if (!creator) {
        throw new Error("Creator not found");
      }

      const now = new Date();
      const periodMap = {
        daily: 1,
        weekly: 7,
        monthly: 30
      };
      const days = periodMap[period];
      const startDate = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);

      // Get analytics data for the period
      const analytics = await CreatorAnalyticsModel.find({
        creatorId,
        date: { $gte: startDate },
        period
      }).sort({ date: -1 });

      // Get content performance
      const content = await ContentModel.find({
        creatorId,
        createdAt: { $gte: startDate }
      }).sort({ views: -1 });

      // Get follower data
      const followerData = await this.getFollowerGrowth(creatorId, period);

      // Get revenue data
      const revenueData = await this.getRevenueData(creatorId, startDate);

      const totalViews = analytics.reduce((sum, a) => sum + a.content.totalViews, 0);
      const totalEngagement = analytics.reduce((sum, a) => sum + a.engagement.likes + a.engagement.comments, 0);

      return {
        period,
        totalViews,
        totalEngagement,
        totalRevenue: revenueData.total,
        followerGrowth: followerData.growthRate,
        contentPerformance: {
          totalContent: content.length,
          avgViews: content.length > 0 ? Math.round(content.reduce((sum, c) => sum + c.views, 0) / content.length) : 0,
          avgEngagement: content.length > 0 ? Math.round(content.reduce((sum, c) => sum + (c.engagement || 0), 0) / content.length) : 0,
          topPerforming: content.slice(0, 5).map(c => ({
            contentId: c._id.toString(),
            title: c.title,
            views: c.views,
            engagement: c.engagement || 0
          }))
        },
        audienceMetrics: {
          totalFollowers: creator.stats.totalFollowers,
          activeFollowers: analytics.reduce((sum, a) => sum + a.audience.activeFollowers, 0),
          newFollowers: analytics.reduce((sum, a) => sum + a.audience.newFollowers, 0),
          demographics: this.aggregateDemographics(analytics)
        },
        revenueBreakdown: revenueData.breakdown
      };
    } catch (error) {
      console.error("Error getting analytics overview:", error);
      throw error;
    }
  }

  /**
   * Get detailed analytics for specific content
   */
  async getContentAnalytics(contentId: string): Promise<ContentAnalytics> {
    try {
      const content = await ContentModel.findById(contentId).populate('creatorId');
      if (!content) {
        throw new Error("Content not found");
      }

      // Get content-specific analytics
      const analytics = await CreatorAnalyticsModel.find({
        creatorId: content.creatorId,
        "topContent.contentId": contentId
      });

      const contentAnalytics = analytics.find(a => 
        a.topContent.some((tc: any) => tc.contentId.toString() === contentId)
      );

      // Mock detailed analytics (in production, this would come from detailed tracking)
      const mockAnalytics: ContentAnalytics = {
        contentId: content._id.toString(),
        title: content.title,
        type: content.type,
        views: content.views,
        uniqueViews: Math.round(content.views * 0.8), // Assume 80% unique
        engagement: {
          likes: Math.round(content.views * 0.05), // 5% like rate
          comments: Math.round(content.views * 0.02), // 2% comment rate
          shares: Math.round(content.views * 0.01), // 1% share rate
          downloads: Math.round(content.views * 0.005) // 0.5% download rate
        },
        retention: {
          avgWatchTime: content.duration ? Math.round(content.duration * 0.6) : 180, // 60% retention
          completionRate: 60,
          dropOffPoints: [
            { time: 10, percentage: 5 },
            { time: 30, percentage: 15 },
            { time: 60, percentage: 25 },
            { time: 120, percentage: 40 }
          ]
        },
        demographics: {
          ageGroups: {
            "18-24": 25,
            "25-34": 35,
            "35-44": 25,
            "45-54": 10,
            "55+": 5
          },
          gender: {
            "male": 55,
            "female": 43,
            "other": 2
          },
          locations: {
            "Nigeria": 30,
            "South Africa": 20,
            "Kenya": 15,
            "Ghana": 10,
            "Other": 25
          }
        },
        traffic: {
          sources: {
            "feed": 40,
            "search": 25,
            "social": 20,
            "direct": 10,
            "other": 5
          },
          devices: {
            "mobile": 70,
            "desktop": 25,
            "tablet": 5
          },
          times: Array.from({ length: 24 }, (_, i) => ({
            hour: i,
            views: Math.round(Math.random() * 100 + 20)
          }))
        },
        revenue: {
          direct: Math.round(content.views * 0.001), // $0.001 per view
          indirect: Math.round(content.views * 0.0005), // $0.0005 per view indirect
          total: Math.round(content.views * 0.0015)
        }
      };

      return mockAnalytics;
    } catch (error) {
      console.error("Error getting content analytics:", error);
      throw error;
    }
  }

  /**
   * Get audience analytics
   */
  async getAudienceAnalytics(creatorId: string): Promise<AudienceAnalytics> {
    try {
      const creator = await CreatorModel.findById(creatorId);
      if (!creator) {
        throw new Error("Creator not found");
      }

      const now = new Date();
      const last30Days = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      const last90Days = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);

      // Get follower data over time
      const dailyFollowers = await this.getFollowerGrowthData(creatorId, "daily", last30Days);
      const weeklyFollowers = await this.getFollowerGrowthData(creatorId, "weekly", last90Days);
      const monthlyFollowers = await this.getFollowerGrowthData(creatorId, "monthly", last90Days);

      // Get analytics for demographics
      const analytics = await CreatorAnalyticsModel.find({
        creatorId,
        date: { $gte: last30Days }
      });

      return {
        totalFollowers: creator.stats.totalFollowers,
        activeFollowers: analytics.reduce((sum, a) => sum + a.audience.activeFollowers, 0),
        followerGrowth: {
          daily: dailyFollowers,
          weekly: weeklyFollowers,
          monthly: monthlyFollowers
        },
        demographics: this.aggregateDemographics(analytics),
        engagement: {
          avgEngagementRate: analytics.length > 0 
            ? Math.round(analytics.reduce((sum, a) => sum + (a.engagement.likes + a.engagement.comments), 0) / analytics.reduce((sum, a) => sum + a.content.totalViews, 0) * 100)
            : 0,
          topEngagers: [], // Would need engagement tracking data
          engagementByContent: {} // Would need content-level engagement data
        },
        interests: analytics.length > 0 
          ? analytics.reduce((acc, a) => ({ ...acc, ...a.audience.demographics.interests }), {})
          : {},
        behavior: {
          peakActivityHours: Array.from({ length: 24 }, (_, i) => ({
            hour: i,
            activity: Math.round(Math.random() * 100 + 10)
          })),
          preferredContentTypes: {
            "video": 60,
            "audio": 40
          },
          contentFrequency: 3 // Average posts per week
        }
      };
    } catch (error) {
      console.error("Error getting audience analytics:", error);
      throw error;
    }
  }

  /**
   * Get revenue analytics
   */
  async getRevenueAnalytics(creatorId: string): Promise<RevenueAnalytics> {
    try {
      const creator = await CreatorModel.findById(creatorId);
      if (!creator) {
        throw new Error("Creator not found");
      }

      const now = new Date();
      const last30Days = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      const last90Days = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);

      // Get transaction data
      const transactions = await PaymentTransactionModel.find({
        creatorId,
        createdAt: { $gte: last90Days }
      }).sort({ createdAt: -1 });

      // Calculate revenue by period
      const dailyRevenue = this.calculateRevenueByPeriod(transactions, "daily", last30Days);
      const weeklyRevenue = this.calculateRevenueByPeriod(transactions, "weekly", last90Days);
      const monthlyRevenue = this.calculateRevenueByPeriod(transactions, "monthly", last90Days);

      // Calculate revenue sources
      const revenueSources = this.calculateRevenueSources(transactions);

      const totalRevenue = transactions.reduce((sum, t) => sum + t.amount, 0);

      return {
        totalRevenue,
        periodRevenue: {
          daily: dailyRevenue,
          weekly: weeklyRevenue,
          monthly: monthlyRevenue
        },
        sources: revenueSources,
        projections: {
          nextMonth: Math.round(totalRevenue * 1.1), // 10% growth projection
          nextQuarter: Math.round(totalRevenue * 1.3), // 30% growth projection
          nextYear: Math.round(totalRevenue * 2), // 100% growth projection
          confidence: 75 // 75% confidence in projections
        }
      };
    } catch (error) {
      console.error("Error getting revenue analytics:", error);
      throw error;
    }
  }

  /**
   * Helper methods
   */
  private async getFollowerGrowth(creatorId: string, period: "daily" | "weekly" | "monthly"): Promise<{ growthRate: number }> {
    try {
      const creator = await CreatorModel.findById(creatorId);
      if (!creator) {
        return { growthRate: 0 };
      }

      // In a real implementation, this would calculate actual growth rate
      // For now, return mock data
      return { growthRate: creator.stats.followerGrowth };
    } catch (error) {
      console.error("Error getting follower growth:", error);
      return { growthRate: 0 };
    }
  }

  private async getFollowerGrowthData(creatorId: string, period: "daily" | "weekly" | "monthly", startDate: Date): Promise<any[]> {
    try {
      // Mock data - in production, this would query actual follower history
      const periods = period === "daily" ? 30 : period === "weekly" ? 12 : 3;
      const data = [];

      for (let i = 0; i < periods; i++) {
        const date = new Date(startDate);
        if (period === "daily") {
          date.setDate(date.getDate() + i);
        } else if (period === "weekly") {
          date.setDate(date.getDate() + (i * 7));
        } else {
          date.setMonth(date.getMonth() + i);
        }

        data.push({
          date: date.toISOString().split('T')[0],
          followers: Math.floor(Math.random() * 1000 + 500),
          newFollowers: Math.floor(Math.random() * 50 + 10)
        });
      }

      return data;
    } catch (error) {
      console.error("Error getting follower growth data:", error);
      return [];
    }
  }

  private async getRevenueData(creatorId: string, startDate: Date): Promise<{ total: number; breakdown: any }> {
    try {
      const transactions = await PaymentTransactionModel.find({
        creatorId,
        createdAt: { $gte: startDate }
      });

      const total = transactions.reduce((sum, t) => sum + t.amount, 0);

      const breakdown = {
        fromSponsors: Math.round(total * 0.4),
        fromSubscriptions: Math.round(total * 0.3),
        fromDonations: Math.round(total * 0.2),
        fromContent: Math.round(total * 0.1)
      };

      return { total, breakdown };
    } catch (error) {
      console.error("Error getting revenue data:", error);
      return { total: 0, breakdown: { fromSponsors: 0, fromSubscriptions: 0, fromDonations: 0, fromContent: 0 } };
    }
  }

  private aggregateDemographics(analytics: ICreatorAnalytics[]): any {
    const aggregated: Record<string, Record<string, number>> = {
      ageGroups: {},
      gender: {},
      locations: {}
    };

    analytics.forEach(a => {
      Object.entries(a.audience.demographics.ageGroups).forEach(([key, value]) => {
        aggregated.ageGroups[key] = (aggregated.ageGroups[key] || 0) + value;
      });
      Object.entries(a.audience.demographics.gender).forEach(([key, value]) => {
        aggregated.gender[key] = (aggregated.gender[key] || 0) + value;
      });
      Object.entries(a.audience.demographics.locations).forEach(([key, value]) => {
        aggregated.locations[key] = (aggregated.locations[key] || 0) + value;
      });
    });

    return aggregated;
  }

  private calculateRevenueByPeriod(transactions: any[], period: string, startDate: Date): any[] {
    // Mock implementation - in production, this would group transactions by period
    const periods = period === "daily" ? 30 : period === "weekly" ? 12 : 3;
    const data = [];

    for (let i = 0; i < periods; i++) {
      const date = new Date(startDate);
      if (period === "daily") {
        date.setDate(date.getDate() + i);
      } else if (period === "weekly") {
        date.setDate(date.getDate() + (i * 7));
      } else {
        date.setMonth(date.getMonth() + i);
      }

      data.push({
        date: date.toISOString().split('T')[0],
        revenue: Math.round(Math.random() * 1000 + 100),
        transactions: Math.floor(Math.random() * 20 + 5)
      });
    }

    return data;
  }

  private calculateRevenueSources(transactions: any[]): any {
    // Mock implementation - in production, this would categorize transactions
    return {
      sponsors: {
        total: Math.round(Math.random() * 5000 + 1000),
        activeSponsors: Math.floor(Math.random() * 50 + 10),
        avgSponsorValue: Math.round(Math.random() * 200 + 50),
        sponsors: []
      },
      subscriptions: {
        total: Math.round(Math.random() * 3000 + 500),
        activeSubscriptions: Math.floor(Math.random() * 100 + 20),
        avgSubscriptionValue: Math.round(Math.random() * 50 + 10),
        churnRate: Math.round(Math.random() * 10 + 5),
        tiers: {
          "basic": { count: 50, revenue: 500 },
          "pro": { count: 30, revenue: 900 },
          "premium": { count: 20, revenue: 1000 }
        }
      },
      donations: {
        total: Math.round(Math.random() * 2000 + 200),
        donations: Math.floor(Math.random() * 100 + 20),
        avgDonation: Math.round(Math.random() * 50 + 10),
        topDonors: []
      },
      content: {
        total: Math.round(Math.random() * 1500 + 300),
        views: Math.floor(Math.random() * 50000 + 10000),
        cpm: Math.round(Math.random() * 5 + 2),
        topContent: []
      }
    };
  }

  /**
   * Generate analytics report
   */
  async generateAnalyticsReport(creatorId: string, period: "daily" | "weekly" | "monthly" = "monthly"): Promise<{
    overview: AnalyticsOverview;
    audience: AudienceAnalytics;
    revenue: RevenueAnalytics;
    insights: string[];
    recommendations: string[];
  }> {
    try {
      const [overview, audience, revenue] = await Promise.all([
        this.getAnalyticsOverview(creatorId, period),
        this.getAudienceAnalytics(creatorId),
        this.getRevenueAnalytics(creatorId)
      ]);

      // Generate insights and recommendations based on data
      const insights = this.generateInsights(overview, audience, revenue);
      const recommendations = this.generateRecommendations(overview, audience, revenue);

      return {
        overview,
        audience,
        revenue,
        insights,
        recommendations
      };
    } catch (error) {
      console.error("Error generating analytics report:", error);
      throw error;
    }
  }

  private generateInsights(overview: AnalyticsOverview, audience: AudienceAnalytics, revenue: RevenueAnalytics): string[] {
    const insights = [];

    if (overview.followerGrowth > 10) {
      insights.push("Strong follower growth indicates content resonates well with audience");
    }

    if (overview.totalEngagement / overview.totalViews > 0.05) {
      insights.push("High engagement rate shows strong audience connection");
    }

    if (revenue.sources.subscriptions.activeSubscriptions > 50) {
      insights.push("Healthy subscription base provides stable revenue foundation");
    }

    if (audience.behavior.preferredContentTypes.video > 70) {
      insights.push("Audience strongly prefers video content");
    }

    return insights;
  }

  private generateRecommendations(overview: AnalyticsOverview, audience: AudienceAnalytics, revenue: RevenueAnalytics): string[] {
    const recommendations = [];

    if (overview.contentPerformance.avgViews < 1000) {
      recommendations.push("Consider optimizing titles and thumbnails to increase views");
    }

    if (overview.totalEngagement / overview.totalViews < 0.03) {
      recommendations.push("Focus on creating more engaging content to boost interaction");
    }

    if (revenue.sources.sponsors.activeSponsors < 10) {
      recommendations.push("Develop sponsor packages to attract more brand partnerships");
    }

    if (audience.behavior.peakActivityHours[19]?.activity > 100) {
      recommendations.push("Schedule content releases around 7 PM for maximum reach");
    }

    return recommendations;
  }
}

export const creatorAnalyticsService = new CreatorAnalyticsService();
