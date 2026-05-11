import { ContentModel, IContent } from "../models/Content.js";
import { InteractionModel } from "../models/Interaction.js";
import { UserModel } from "../models/User.js";
import { CreatorModel } from "../models/Creator.js";
import { logger } from "../config/logger.js";
import { Types } from "mongoose";

// Content performance types
export interface ContentPerformanceMetrics {
  contentId: string;
  title: string;
  contentType: "video" | "audio" | "article";
  creatorId: string;
  creatorName: string;
  
  // Basic metrics
  basicMetrics: {
    totalViews: number;
    uniqueViews: number;
    averageWatchTime: number;
    completionRate: number;
    totalWatchTime: number;
    averageCompletionRate: number;
  };
  
  // Engagement metrics
  engagementMetrics: {
    likeRate: number;
    commentRate: number;
    shareRate: number;
    saveRate: number;
    downloadRate: number;
    totalLikes: number;
    totalComments: number;
    totalShares: number;
    totalSaves: number;
    totalDownloads: number;
  };
  
  // Quality metrics
  qualityMetrics: {
    videoQualityScore: number;
    audioQualityScore: number;
    loadingTime: number;
    bufferingEvents: number;
    errorRate: number;
    averageBitrate: number;
    resolution: string;
  };
  
  // Audience metrics
  audienceMetrics: {
    demographics: {
      ageGroups: Record<string, number>;
      gender: Record<string, number>;
      locations: Record<string, number>;
      languages: Record<string, number>;
    };
    deviceBreakdown: Record<string, number>;
    sourceBreakdown: Record<string, number>;
    newVsReturning: {
      newUsers: number;
      returningUsers: number;
      newPercentage: number;
    };
  };
  
  // Temporal metrics
  temporalMetrics: {
    viewsByHour: Array<{ hour: number; views: number }>;
    viewsByDay: Array<{ day: string; views: number }>;
    viewsByWeek: Array<{ week: string; views: number }>;
    peakTimes: Array<{ hour: number; views: number }>;
    seasonality: number;
    growthRate: number;
  };
  
  // Conversion metrics
  conversionMetrics: {
    subscriptionConversion: number;
    sponsorClickThrough: number;
    contentShareConversion: number;
    quizCompletionRate: number;
    creatorFollowConversion: number;
    revenuePerView: number;
  };
  
  // Comparative metrics
  comparativeMetrics: {
    vsCreatorAverage: {
      views: number;
      engagement: number;
      completion: number;
    };
    vsContentTypeAverage: {
      views: number;
      engagement: number;
      completion: number;
    };
    vsPlatformAverage: {
      views: number;
      engagement: number;
      completion: number;
    };
    ranking: {
      creatorRank: number;
      contentTypeRank: number;
      platformRank: number;
    };
  };
}

export interface ContentPerformanceFilter {
  contentType?: "video" | "audio" | "article";
  creatorId?: string;
  dateRange?: {
    start: Date;
    end: Date;
  };
  minViews?: number;
  minEngagement?: number;
  sortBy?: "views" | "engagement" | "completion" | "revenue";
  sortOrder?: "asc" | "desc";
  limit?: number;
  offset?: number;
}

class ContentPerformanceService {
  /**
   * Get detailed performance metrics for a specific content
   */
  async getContentPerformance(contentId: string, filter?: ContentPerformanceFilter): Promise<ContentPerformanceMetrics> {
    try {
      const content = await ContentModel.findById(contentId).populate('creatorId');
      if (!content) {
        throw new Error("Content not found");
      }

      const creator = content.creatorId as any;
      const startDate = filter?.dateRange?.start || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
      const endDate = filter?.dateRange?.end || new Date();

      // Calculate all metrics in parallel for better performance
      const [
        basicMetrics,
        engagementMetrics,
        qualityMetrics,
        audienceMetrics,
        temporalMetrics,
        conversionMetrics,
        comparativeMetrics
      ] = await Promise.all([
        this.calculateBasicMetrics(contentId, startDate, endDate),
        this.calculateEngagementMetrics(contentId, startDate, endDate),
        this.calculateQualityMetrics(contentId, startDate, endDate),
        this.calculateAudienceMetrics(contentId, startDate, endDate),
        this.calculateTemporalMetrics(contentId, startDate, endDate),
        this.calculateConversionMetrics(contentId, startDate, endDate),
        this.calculateComparativeMetrics(contentId, creator._id, content.type, startDate, endDate)
      ]);

      return {
        contentId,
        title: content.title,
        contentType: content.type,
        creatorId: creator._id.toString(),
        creatorName: creator.name || creator.username,
        basicMetrics,
        engagementMetrics,
        qualityMetrics,
        audienceMetrics,
        temporalMetrics,
        conversionMetrics,
        comparativeMetrics
      };
    } catch (error) {
      logger.error({
        msg: "Failed to get content performance",
        error: error instanceof Error ? error.message : String(error),
        contentId
      });
      throw error;
    }
  }

  /**
   * Get performance metrics for multiple contents
   */
  async getMultipleContentPerformance(contentIds: string[], filter?: ContentPerformanceFilter): Promise<ContentPerformanceMetrics[]> {
    try {
      const promises = contentIds.map(contentId => 
        this.getContentPerformance(contentId, filter)
      );
      
      return await Promise.all(promises);
    } catch (error) {
      logger.error({
        msg: "Failed to get multiple content performance",
        error: error instanceof Error ? error.message : String(error),
        contentIds
      });
      throw error;
    }
  }

  /**
   * Get top performing contents
   */
  async getTopPerformingContent(filter: ContentPerformanceFilter): Promise<ContentPerformanceMetrics[]> {
    try {
      // Build query
      const query: any = {};
      
      if (filter?.contentType) {
        query.type = filter.contentType;
      }
      
      if (filter?.creatorId) {
        query.creatorId = new Types.ObjectId(filter.creatorId);
      }
      
      if (filter?.dateRange) {
        query.createdAt = {
          $gte: filter.dateRange.start,
          $lte: filter.dateRange.end
        };
      }
      
      if (filter?.minViews) {
        query.views = { $gte: filter.minViews };
      }

      // Get content with basic sorting
      const sortField = filter?.sortBy || "views";
      const sortOrder = filter?.sortOrder === "asc" ? 1 : -1;
      const limit = filter?.limit || 50;
      const offset = filter?.offset || 0;

      const contents = await ContentModel
        .find(query)
        .populate('creatorId')
        .sort({ [sortField]: sortOrder })
        .skip(offset)
        .limit(limit);

      // Get detailed performance for each content
      const contentIds = contents.map(c => c._id.toString());
      return await this.getMultipleContentPerformance(contentIds, filter);
    } catch (error) {
      logger.error({
        msg: "Failed to get top performing content",
        error: error instanceof Error ? error.message : String(error),
        filter
      });
      throw error;
    }
  }

  /**
   * Calculate basic metrics
   */
  private async calculateBasicMetrics(contentId: string, startDate: Date, endDate: Date) {
    // Get view interactions
    const viewInteractions = await InteractionModel.find({
      contentId: new Types.ObjectId(contentId),
      actionType: "view",
      createdAt: { $gte: startDate, $lte: endDate }
    });

    const totalViews = viewInteractions.length;
    const uniqueViews = new Set(viewInteractions.map(i => i.userId.toString())).size;
    
    // Calculate watch times
    const totalWatchTime = viewInteractions.reduce((sum, interaction) => 
      sum + (interaction.watchDurationMs || 0), 0
    );
    
    const averageWatchTime = totalViews > 0 ? totalWatchTime / totalViews / 1000 : 0; // Convert to seconds
    
    // Calculate completion rates
    const completionRates = viewInteractions
      .filter(i => i.completionRatio !== undefined)
      .map(i => i.completionRatio!);
    
    const averageCompletionRate = completionRates.length > 0 
      ? completionRates.reduce((sum, rate) => sum + rate, 0) / completionRates.length 
      : 0;

    return {
      totalViews,
      uniqueViews,
      averageWatchTime,
      completionRate: averageCompletionRate,
      totalWatchTime,
      averageCompletionRate
    };
  }

  /**
   * Calculate engagement metrics
   */
  private async calculateEngagementMetrics(contentId: string, startDate: Date, endDate: Date) {
    // Get all engagement interactions
    const engagementInteractions = await InteractionModel.find({
      contentId: new Types.ObjectId(contentId),
      actionType: { $in: ["like", "comment", "share", "save", "download"] },
      createdAt: { $gte: startDate, $lte: endDate }
    });

    // Count by type
    const totalLikes = engagementInteractions.filter(i => i.actionType === "like").length;
    const totalComments = engagementInteractions.filter(i => i.actionType === "comment").length;
    const totalShares = engagementInteractions.filter(i => i.actionType === "share").length;
    const totalSaves = engagementInteractions.filter(i => i.actionType === "save").length;
    const totalDownloads = engagementInteractions.filter(i => i.actionType === "download").length;

    // Get total views for rate calculations
    const totalViews = await InteractionModel.countDocuments({
      contentId: new Types.ObjectId(contentId),
      actionType: "view",
      createdAt: { $gte: startDate, $lte: endDate }
    });

    return {
      likeRate: totalViews > 0 ? (totalLikes / totalViews) * 100 : 0,
      commentRate: totalViews > 0 ? (totalComments / totalViews) * 100 : 0,
      shareRate: totalViews > 0 ? (totalShares / totalViews) * 100 : 0,
      saveRate: totalViews > 0 ? (totalSaves / totalViews) * 100 : 0,
      downloadRate: totalViews > 0 ? (totalDownloads / totalViews) * 100 : 0,
      totalLikes,
      totalComments,
      totalShares,
      totalSaves,
      totalDownloads
    };
  }

  /**
   * Calculate quality metrics
   */
  private async calculateQualityMetrics(contentId: string, startDate: Date, endDate: Date) {
    // Mock implementation - in production, this would come from:
    // - Video/audio quality analysis
    // - CDN performance metrics
    // - User feedback on quality
    // - Technical performance logs
    
    return {
      videoQualityScore: Math.random() * 2 + 3, // 3-5 scale
      audioQualityScore: Math.random() * 2 + 3, // 3-5 scale
      loadingTime: Math.random() * 3000 + 500, // 0.5-3.5 seconds
      bufferingEvents: Math.floor(Math.random() * 10),
      errorRate: Math.random() * 2, // 0-2%
      averageBitrate: Math.random() * 2000 + 1000, // 1-3 Mbps
      resolution: "1080p" // Would come from actual content metadata
    };
  }

  /**
   * Calculate audience metrics
   */
  private async calculateAudienceMetrics(contentId: string, startDate: Date, endDate: Date) {
    // Get user interactions for audience analysis
    const interactions = await InteractionModel.find({
      contentId: new Types.ObjectId(contentId),
      createdAt: { $gte: startDate, $lte: endDate }
    }).populate('userId');

    // Get user demographics (mock data - would come from user profiles)
    const demographics = {
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
      },
      languages: {
        "English": 60,
        "French": 25,
        "Arabic": 10,
        "Other": 5
      }
    };

    // Device breakdown (mock - would come from user agent analysis)
    const deviceBreakdown = {
      "mobile": 70,
      "desktop": 25,
      "tablet": 5
    };

    // Source breakdown (mock - would come from referral tracking)
    const sourceBreakdown = {
      "feed": 40,
      "search": 25,
      "social": 20,
      "direct": 10,
      "other": 5
    };

    // New vs returning users
    const uniqueUsers = new Set(interactions.map(i => i.userId.toString())).size;
    const newUsers = Math.floor(uniqueUsers * 0.3); // Mock calculation
    const returningUsers = uniqueUsers - newUsers;

    return {
      demographics,
      deviceBreakdown,
      sourceBreakdown,
      newVsReturning: {
        newUsers,
        returningUsers,
        newPercentage: uniqueUsers > 0 ? (newUsers / uniqueUsers) * 100 : 0
      }
    };
  }

  /**
   * Calculate temporal metrics
   */
  private async calculateTemporalMetrics(contentId: string, startDate: Date, endDate: Date) {
    // Get interactions grouped by hour
    const hourlyViews = await InteractionModel.aggregate([
      {
        $match: {
          contentId: new Types.ObjectId(contentId),
          actionType: "view",
          createdAt: { $gte: startDate, $lte: endDate }
        }
      },
      {
        $group: {
          _id: { $hour: "$createdAt" },
          views: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    const viewsByHour = Array.from({ length: 24 }, (_, i) => {
      const hourData = hourlyViews.find(h => h._id === i);
      return { hour: i, views: hourData?.views || 0 };
    });

    // Get interactions grouped by day of week
    const dailyViews = await InteractionModel.aggregate([
      {
        $match: {
          contentId: new Types.ObjectId(contentId),
          actionType: "view",
          createdAt: { $gte: startDate, $lte: endDate }
        }
      },
      {
        $group: {
          _id: { $dayOfWeek: "$createdAt" },
          views: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    const viewsByDay = Array.from({ length: 7 }, (_, i) => {
      const dayData = dailyViews.find(d => d._id === i + 1); // MongoDB dayOfWeek is 1-7
      return { day: dayNames[i], views: dayData?.views || 0 };
    });

    // Calculate peak times
    const peakTimes = viewsByHour
      .sort((a, b) => b.views - a.views)
      .slice(0, 5);

    // Calculate growth rate (comparing first half to second half of period)
    const midPoint = new Date(startDate.getTime() + (endDate.getTime() - startDate.getTime()) / 2);
    const firstHalfViews = await InteractionModel.countDocuments({
      contentId: new Types.ObjectId(contentId),
      actionType: "view",
      createdAt: { $gte: startDate, $lt: midPoint }
    });
    const secondHalfViews = await InteractionModel.countDocuments({
      contentId: new Types.ObjectId(contentId),
      actionType: "view",
      createdAt: { $gte: midPoint, $lte: endDate }
    });
    
    const growthRate = firstHalfViews > 0 ? ((secondHalfViews - firstHalfViews) / firstHalfViews) * 100 : 0;

    return {
      viewsByHour,
      viewsByDay,
      viewsByWeek: [], // Could be implemented similarly
      peakTimes,
      seasonality: Math.random() * 0.3 + 0.8, // Mock calculation
      growthRate
    };
  }

  /**
   * Calculate conversion metrics
   */
  private async calculateConversionMetrics(contentId: string, startDate: Date, endDate: Date) {
    // Mock implementation - in production, this would track:
    // - Subscription conversions after viewing
    // - Sponsor click-throughs
    // - Content sharing leading to new views
    // - Quiz completion rates
    // - Creator follow conversions
    
    return {
      subscriptionConversion: Math.random() * 2 + 0.5, // 0.5-2.5%
      sponsorClickThrough: Math.random() * 5 + 1, // 1-6%
      contentShareConversion: Math.random() * 3 + 0.5, // 0.5-3.5%
      quizCompletionRate: Math.random() * 20 + 60, // 60-80%
      creatorFollowConversion: Math.random() * 3 + 1, // 1-4%
      revenuePerView: Math.random() * 0.01 + 0.001 // $0.001-$0.011 per view
    };
  }

  /**
   * Calculate comparative metrics
   */
  private async calculateComparativeMetrics(contentId: string, creatorId: string, contentType: string, startDate: Date, endDate: Date) {
    // Get content's basic metrics
    const contentMetrics = await this.calculateBasicMetrics(contentId, startDate, endDate);
    
    // Get creator's average metrics
    const creatorContents = await ContentModel.find({
      creatorId: new Types.ObjectId(creatorId),
      type: contentType
    });
    
    const creatorContentIds = creatorContents.map(c => c._id.toString());
    const creatorMetrics = await this.getAverageMetrics(creatorContentIds, startDate, endDate);
    
    // Get content type average metrics
    const typeContents = await ContentModel.find({ type: contentType });
    const typeContentIds = typeContents.map(c => c._id.toString());
    const typeMetrics = await this.getAverageMetrics(typeContentIds, startDate, endDate);
    
    // Get platform average metrics
    const allContents = await ContentModel.find({});
    const allContentIds = allContents.map(c => c._id.toString());
    const platformMetrics = await this.getAverageMetrics(allContentIds, startDate, endDate);

    // Calculate rankings (simplified)
    const allContentMetrics = await this.getMultipleContentPerformance(allContentIds.slice(0, 100), {
      dateRange: { start: startDate, end: endDate },
      sortBy: "views",
      sortOrder: "desc"
    });

    const creatorRanking = allContentMetrics
      .filter(c => c.creatorId === creatorId)
      .findIndex(c => c.contentId === contentId) + 1;
    
    const typeRanking = allContentMetrics
      .filter(c => c.contentType === contentType)
      .findIndex(c => c.contentId === contentId) + 1;
    
    const platformRanking = allContentMetrics
      .findIndex(c => c.contentId === contentId) + 1;

    return {
      vsCreatorAverage: {
        views: creatorMetrics.averageViews > 0 ? (contentMetrics.totalViews / creatorMetrics.averageViews - 1) * 100 : 0,
        engagement: creatorMetrics.averageEngagement > 0 ? (contentMetrics.averageWatchTime / creatorMetrics.averageEngagement - 1) * 100 : 0,
        completion: creatorMetrics.averageCompletion > 0 ? (contentMetrics.completionRate / creatorMetrics.averageCompletion - 1) * 100 : 0
      },
      vsContentTypeAverage: {
        views: typeMetrics.averageViews > 0 ? (contentMetrics.totalViews / typeMetrics.averageViews - 1) * 100 : 0,
        engagement: typeMetrics.averageEngagement > 0 ? (contentMetrics.averageWatchTime / typeMetrics.averageEngagement - 1) * 100 : 0,
        completion: typeMetrics.averageCompletion > 0 ? (contentMetrics.completionRate / typeMetrics.averageCompletion - 1) * 100 : 0
      },
      vsPlatformAverage: {
        views: platformMetrics.averageViews > 0 ? (contentMetrics.totalViews / platformMetrics.averageViews - 1) * 100 : 0,
        engagement: platformMetrics.averageEngagement > 0 ? (contentMetrics.averageWatchTime / platformMetrics.averageEngagement - 1) * 100 : 0,
        completion: platformMetrics.averageCompletion > 0 ? (contentMetrics.completionRate / platformMetrics.averageCompletion - 1) * 100 : 0
      },
      ranking: {
        creatorRank: creatorRanking,
        contentTypeRank: typeRanking,
        platformRank: platformRanking
      }
    };
  }

  /**
   * Helper method to get average metrics for multiple contents
   */
  private async getAverageMetrics(contentIds: string[], startDate: Date, endDate: Date) {
    if (contentIds.length === 0) {
      return { averageViews: 0, averageEngagement: 0, averageCompletion: 0 };
    }

    const metricsPromises = contentIds.map(id => 
      this.calculateBasicMetrics(id, startDate, endDate)
    );

    const allMetrics = await Promise.all(metricsPromises);
    
    const totalViews = allMetrics.reduce((sum, m) => sum + m.totalViews, 0);
    const totalWatchTime = allMetrics.reduce((sum, m) => sum + m.averageWatchTime, 0);
    const totalCompletion = allMetrics.reduce((sum, m) => sum + m.completionRate, 0);

    return {
      averageViews: totalViews / contentIds.length,
      averageEngagement: totalWatchTime / contentIds.length,
      averageCompletion: totalCompletion / contentIds.length
    };
  }
}

export const contentPerformanceService = new ContentPerformanceService();
