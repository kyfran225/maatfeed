import { InteractionModel } from "../models/Interaction.js";
import { LearningProgressModel } from "../models/LearningProgress.js";
import { UserModel } from "../models/User.js";
import { ContentModel } from "../models/Content.js";
import { logger } from "../config/logger.js";

// Retention metrics
export interface RetentionMetrics {
  dailyActiveUsers: number;
  weeklyActiveUsers: number;
  monthlyActiveUsers: number;
  userRetentionRate7d: number;
  userRetentionRate30d: number;
  averageSessionDuration: number;
  averageSessionsPerUser: number;
}

// Learning analytics
export interface LearningAnalytics {
  totalQuizzesTaken: number;
  averageQuizScore: number;
  completionRate: number;
  contentMasteredCount: number;
  contentInReviewCount: number;
  averageTimeToMastery: number; // days
  spacedRepetitionAdherence: number; // percentage
}

// Engagement metrics
export interface EngagementMetrics {
  averageWatchTimeSeconds: number;
  completionRate75: number; // % of users who watch 75%+
  likeRate: number;
  saveRate: number;
  shareRate: number;
  commentRate: number;
}

// Content performance
export interface ContentPerformance {
  topPerformingContent: Array<{
    contentId: string;
    title: string;
    views: number;
    avgWatchTime: number;
    engagementScore: number;
  }>;
  bucketDistribution: {
    viral: number;
    educational: number;
    deep: number;
  };
}

// Full dashboard data
export interface DashboardData {
  dateRange: {
    start: Date;
    end: Date;
  };
  retention: RetentionMetrics;
  learning: LearningAnalytics;
  engagement: EngagementMetrics;
  content: ContentPerformance;
  revenue?: {
    totalRevenue: number;
    premiumSubscribers: number;
    conversionRate: number;
  };
}

/**
 * Calculate retention metrics for the dashboard
 */
export async function calculateRetentionMetrics(
  startDate: Date,
  endDate: Date
): Promise<RetentionMetrics> {
  try {
    // Daily Active Users (unique users who had interactions today)
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const dauResult = await InteractionModel.aggregate([
      { $match: { createdAt: { $gte: today } } },
      { $group: { _id: "$userId" } },
      { $count: "count" }
    ]);
    const dailyActiveUsers = dauResult[0]?.count || 0;

    // Weekly Active Users
    const weekAgo = new Date(today);
    weekAgo.setDate(weekAgo.getDate() - 7);
    const wauResult = await InteractionModel.aggregate([
      { $match: { createdAt: { $gte: weekAgo } } },
      { $group: { _id: "$userId" } },
      { $count: "count" }
    ]);
    const weeklyActiveUsers = wauResult[0]?.count || 0;

    // Monthly Active Users
    const monthAgo = new Date(today);
    monthAgo.setDate(monthAgo.getDate() - 30);
    const mauResult = await InteractionModel.aggregate([
      { $match: { createdAt: { $gte: monthAgo } } },
      { $group: { _id: "$userId" } },
      { $count: "count" }
    ]);
    const monthlyActiveUsers = mauResult[0]?.count || 0;

    // Calculate retention rates (users who came back)
    const newUsers7dAgo = await UserModel.countDocuments({
      createdAt: {
        $gte: new Date(today.getTime() - 8 * 24 * 60 * 60 * 1000),
        $lt: new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000)
      }
    });

    const retainedUsers7d = await InteractionModel.countDocuments({
      userId: {
        $in: await UserModel.find({
          createdAt: {
            $gte: new Date(today.getTime() - 8 * 24 * 60 * 60 * 1000),
            $lt: new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000)
          }
        }).distinct("_id")
      },
      createdAt: { $gte: today }
    });

    const userRetentionRate7d = newUsers7dAgo > 0 ? (retainedUsers7d / newUsers7dAgo) * 100 : 0;

    // Average session duration
    const sessionData = await InteractionModel.aggregate([
      { $match: { createdAt: { $gte: monthAgo } } },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
          avgDuration: { $avg: "$watchDurationMs" }
        }
      },
      { $group: { _id: null, avg: { $avg: "$avgDuration" } } }
    ]);
    const averageSessionDuration = (sessionData[0]?.avg || 0) / 1000; // convert to seconds

    return {
      dailyActiveUsers,
      weeklyActiveUsers,
      monthlyActiveUsers,
      userRetentionRate7d: Math.round(userRetentionRate7d * 100) / 100,
      userRetentionRate30d: 0, // Would need cohort analysis
      averageSessionDuration: Math.round(averageSessionDuration),
      averageSessionsPerUser: Math.round((weeklyActiveUsers / Math.max(monthlyActiveUsers, 1)) * 100) / 100
    };
  } catch (error) {
    logger.error({
      msg: "Failed to calculate retention metrics",
      error: error instanceof Error ? error.message : String(error)
    });
    throw error;
  }
}

/**
 * Calculate learning analytics
 */
export async function calculateLearningAnalytics(
  startDate: Date,
  endDate: Date
): Promise<LearningAnalytics> {
  try {
    // Total quizzes taken
    const quizInteractions = await InteractionModel.countDocuments({
      actionType: "quiz_complete",
      createdAt: { $gte: startDate, $lte: endDate }
    });

    // Average quiz score from learning progress
    const quizScores = await LearningProgressModel.aggregate([
      { $match: { quizAttempts: { $gt: 0 } } },
      {
        $project: {
          score: {
            $multiply: [
              { $divide: ["$correctQuizAttempts", "$quizAttempts"] },
              100
            ]
          }
        }
      },
      { $group: { _id: null, avgScore: { $avg: "$score" } } }
    ]);
    const averageQuizScore = Math.round(quizScores[0]?.avgScore || 0);

    // Content mastered
    const contentMastered = await LearningProgressModel.countDocuments({
      status: "learned"
    });

    // Content in review
    const contentInReview = await LearningProgressModel.countDocuments({
      status: "review"
    });

    // Completion rate (users who finished quiz vs started)
    const quizStarts = await InteractionModel.countDocuments({
      actionType: "quiz_start",
      createdAt: { $gte: startDate, $lte: endDate }
    });
    const completionRate = quizStarts > 0 ? (quizInteractions / quizStarts) * 100 : 0;

    // Average time to mastery
    const masteryTime = await LearningProgressModel.aggregate([
      { $match: { status: "learned", learnedAt: { $exists: true } } },
      {
        $project: {
          daysToMastery: {
            $divide: [
              { $subtract: ["$learnedAt", "$createdAt"] },
              1000 * 60 * 60 * 24
            ]
          }
        }
      },
      { $group: { _id: null, avg: { $avg: "$daysToMastery" } } }
    ]);
    const averageTimeToMastery = Math.round(masteryTime[0]?.avg || 0);

    // Spaced repetition adherence (% of reviews done on time)
    const dueReviews = await LearningProgressModel.countDocuments({
      status: "review",
      nextReviewAt: { $lt: new Date() }
    });
    const totalReviewItems = await LearningProgressModel.countDocuments({
      status: "review"
    });
    const spacedRepetitionAdherence = totalReviewItems > 0
      ? ((totalReviewItems - dueReviews) / totalReviewItems) * 100
      : 100;

    return {
      totalQuizzesTaken: quizInteractions,
      averageQuizScore,
      completionRate: Math.round(completionRate * 100) / 100,
      contentMasteredCount: contentMastered,
      contentInReviewCount: contentInReview,
      averageTimeToMastery,
      spacedRepetitionAdherence: Math.round(spacedRepetitionAdherence * 100) / 100
    };
  } catch (error) {
    logger.error({
      msg: "Failed to calculate learning analytics",
      error: error instanceof Error ? error.message : String(error)
    });
    throw error;
  }
}

/**
 * Calculate engagement metrics
 */
export async function calculateEngagementMetrics(
  startDate: Date,
  endDate: Date
): Promise<EngagementMetrics> {
  try {
    const interactions = await InteractionModel.find({
      createdAt: { $gte: startDate, $lte: endDate }
    }).lean();

    if (interactions.length === 0) {
      return {
        averageWatchTimeSeconds: 0,
        completionRate75: 0,
        likeRate: 0,
        saveRate: 0,
        shareRate: 0,
        commentRate: 0
      };
    }

    // Calculate rates
    const views = interactions.filter(i => i.actionType === "view").length;
    const likes = interactions.filter(i => i.actionType === "like").length;
    const saves = interactions.filter(i => i.actionType === "save").length;
    const shares = interactions.filter(i => i.actionType === "share").length;
    const comments = interactions.filter(i => i.actionType === "comment").length;

    // Average watch time
    const avgWatchTime = interactions
      .filter(i => i.watchDurationMs)
      .reduce((sum, i) => sum + (i.watchDurationMs || 0), 0) / interactions.length;

    // Completion rate 75%
    const completions75 = interactions.filter(
      i => i.completionRatio && i.completionRatio >= 0.75
    ).length;

    return {
      averageWatchTimeSeconds: Math.round(avgWatchTime / 1000),
      completionRate75: views > 0 ? Math.round((completions75 / views) * 10000) / 100 : 0,
      likeRate: views > 0 ? Math.round((likes / views) * 10000) / 100 : 0,
      saveRate: views > 0 ? Math.round((saves / views) * 10000) / 100 : 0,
      shareRate: views > 0 ? Math.round((shares / views) * 10000) / 100 : 0,
      commentRate: views > 0 ? Math.round((comments / views) * 10000) / 100 : 0
    };
  } catch (error) {
    logger.error({
      msg: "Failed to calculate engagement metrics",
      error: error instanceof Error ? error.message : String(error)
    });
    throw error;
  }
}

/**
 * Get content performance data
 */
export async function getContentPerformance(
  startDate: Date,
  endDate: Date,
  limit: number = 10
): Promise<ContentPerformance> {
  try {
    // Top performing content
    const topContent = await InteractionModel.aggregate([
      { $match: { createdAt: { $gte: startDate, $lte: endDate } } },
      {
        $group: {
          _id: "$contentId",
          views: { $sum: { $cond: [{ $eq: ["$actionType", "view"] }, 1, 0] } },
          totalWatchTime: { $sum: "$watchDurationMs" },
          engagement: {
            $sum: {
              $cond: [
                { $in: ["$actionType", ["like", "save", "share", "comment"]] },
                1,
                0
              ]
            }
          }
        }
      },
      { $sort: { views: -1 } },
      { $limit: limit },
      {
        $lookup: {
          from: "contents",
          localField: "_id",
          foreignField: "_id",
          as: "content"
        }
      },
      { $unwind: "$content" },
      {
        $project: {
          contentId: "$_id",
          title: "$content.title",
          views: 1,
          avgWatchTime: { $divide: ["$totalWatchTime", "$views"] },
          engagementScore: "$engagement"
        }
      }
    ]);

    // Bucket distribution
    const bucketStats = await ContentModel.aggregate([
      {
        $lookup: {
          from: "contentclassifications",
          localField: "_id",
          foreignField: "contentId",
          as: "classification"
        }
      },
      { $unwind: { path: "$classification", preserveNullAndEmptyArrays: true } },
      {
        $group: {
          _id: { $ifNull: ["$classification.bucket", "unknown"] },
          count: { $sum: 1 }
        }
      }
    ]);

    const bucketDistribution = {
      viral: bucketStats.find(b => b._id === "viral")?.count || 0,
      educational: bucketStats.find(b => b._id === "educational")?.count || 0,
      deep: bucketStats.find(b => b._id === "deep")?.count || 0
    };

    return {
      topPerformingContent: topContent.map(c => ({
        contentId: c.contentId.toString(),
        title: c.title,
        views: c.views,
        avgWatchTime: Math.round(c.avgWatchTime / 1000),
        engagementScore: c.engagementScore
      })),
      bucketDistribution
    };
  } catch (error) {
    logger.error({
      msg: "Failed to get content performance",
      error: error instanceof Error ? error.message : String(error)
    });
    throw error;
  }
}

/**
 * Get full dashboard data
 */
export async function getDashboardData(
  days: number = 30
): Promise<DashboardData> {
  const endDate = new Date();
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  const [retention, learning, engagement, content] = await Promise.all([
    calculateRetentionMetrics(startDate, endDate),
    calculateLearningAnalytics(startDate, endDate),
    calculateEngagementMetrics(startDate, endDate),
    getContentPerformance(startDate, endDate)
  ]);

  return {
    dateRange: { start: startDate, end: endDate },
    retention,
    learning,
    engagement,
    content
  };
}
