import { CreatorModel, type ICreator, type CreatorStatus, type CreatorTier } from "../models/Creator";
import { CreatorFollowModel, type ICreatorFollow } from "../models/CreatorFollow";
import { CreatorAnalyticsModel, type ICreatorAnalytics } from "../models/CreatorAnalytics";
import { ProfileModel } from "../models/Profile";
import { ContentModel } from "../models/Content";
import { InteractionModel } from "../models/Interaction";
import mongoose from "mongoose";

export interface CreatorStats {
  totalFollowers: number;
  totalContent: number;
  totalViews: number;
  totalEngagement: number;
  avgWatchTime: number;
  followerGrowth: number;
}

export interface CreatorDashboard {
  creator: ICreator;
  stats: CreatorStats;
  recentAnalytics: ICreatorAnalytics[];
  topContent: Array<{
    contentId: mongoose.Types.ObjectId;
    title: string;
    views: number;
    engagement: number;
    completionRate: number;
  }>;
  recentFollowers: Array<{
    followerId: mongoose.Types.ObjectId;
    followedAt: Date;
  }>;
}

class CreatorService {
  /**
   * Create a new creator profile for a user
   */
  async createCreator(userId: string, creatorData: Partial<ICreator>): Promise<ICreator> {
    try {
      // Check if user already has a creator profile
      const existingCreator = await CreatorModel.findOne({ userId });
      if (existingCreator) {
        throw new Error("User already has a creator profile");
      }

      // Get user profile for display name
      const userProfile = await ProfileModel.findOne({ userId });
      if (!userProfile) {
        throw new Error("User profile not found");
      }

      const creator = new CreatorModel({
        userId,
        displayName: creatorData.displayName || userProfile.displayName,
        bio: creatorData.bio || "",
        ...creatorData
      });

      return await creator.save();
    } catch (error) {
      console.error("Error creating creator:", error);
      throw error;
    }
  }

  /**
   * Get creator by user ID
   */
  async getCreatorByUserId(userId: string): Promise<ICreator | null> {
    try {
      return await CreatorModel.findOne({ userId }).populate("userId", "email");
    } catch (error) {
      console.error("Error fetching creator:", error);
      throw error;
    }
  }

  /**
   * Get creator by ID
   */
  async getCreatorById(creatorId: string): Promise<ICreator | null> {
    try {
      return await CreatorModel.findById(creatorId).populate("userId", "email");
    } catch (error) {
      console.error("Error fetching creator:", error);
      throw error;
    }
  }

  /**
   * Update creator profile
   */
  async updateCreator(creatorId: string, updateData: Partial<ICreator>): Promise<ICreator> {
    try {
      const updatedCreator = await CreatorModel.findByIdAndUpdate(
        creatorId,
        { ...updateData, updatedAt: new Date() },
        { new: true, runValidators: true }
      );
      
      if (!updatedCreator) {
        throw new Error("Creator not found");
      }
      
      return updatedCreator;
    } catch (error) {
      console.error("Error updating creator:", error);
      throw error;
    }
  }

  /**
   * Follow a creator
   */
  async followCreator(creatorId: string, followerId: string): Promise<ICreatorFollow> {
    try {
      // Check if already following
      const existingFollow = await CreatorFollowModel.findOne({
        creatorId,
        followerId,
        isActive: true
      });

      if (existingFollow) {
        throw new Error("Already following this creator");
      }

      const follow = new CreatorFollowModel({
        creatorId,
        followerId,
        followedAt: new Date()
      });

      await follow.save();

      // Update creator follower count
      await CreatorModel.findByIdAndUpdate(
        creatorId,
        { $inc: { "stats.totalFollowers": 1 } }
      );

      return follow;
    } catch (error) {
      console.error("Error following creator:", error);
      throw error;
    }
  }

  /**
   * Unfollow a creator
   */
  async unfollowCreator(creatorId: string, followerId: string): Promise<void> {
    try {
      const follow = await CreatorFollowModel.findOne({
        creatorId,
        followerId,
        isActive: true
      });

      if (!follow) {
        throw new Error("Not following this creator");
      }

      follow.isActive = false;
      await follow.save();

      // Update creator follower count
      await CreatorModel.findByIdAndUpdate(
        creatorId,
        { $inc: { "stats.totalFollowers": -1 } }
      );
    } catch (error) {
      console.error("Error unfollowing creator:", error);
      throw error;
    }
  }

  /**
   * Get creator followers
   */
  async getCreatorFollowers(
    creatorId: string,
    page: number = 1,
    limit: number = 20
  ): Promise<ICreatorFollow[]> {
    try {
      return await CreatorFollowModel.find({ creatorId, isActive: true })
        .populate("followerId", "email")
        .sort({ followedAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit);
    } catch (error) {
      console.error("Error fetching creator followers:", error);
      throw error;
    }
  }

  /**
   * Get user's followed creators
   */
  async getUserFollowedCreators(
    followerId: string,
    page: number = 1,
    limit: number = 20
  ): Promise<ICreatorFollow[]> {
    try {
      return await CreatorFollowModel.find({ followerId, isActive: true })
        .populate("creatorId")
        .sort({ followedAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit);
    } catch (error) {
      console.error("Error fetching followed creators:", error);
      throw error;
    }
  }

  /**
   * Calculate creator stats
   */
  async calculateCreatorStats(creatorId: string): Promise<CreatorStats> {
    try {
      const creator = await CreatorModel.findById(creatorId);
      if (!creator) {
        throw new Error("Creator not found");
      }

      // Get content stats
      const contentStats = await ContentModel.aggregate([
        { $match: { creatorId: new mongoose.Types.ObjectId(creatorId) } },
        {
          $group: {
            _id: null,
            totalContent: { $sum: 1 },
            totalViews: { $sum: "$views" },
            avgWatchTime: { $avg: "$avgWatchTime" }
          }
        }
      ]);

      // Get engagement stats
      const engagementStats = await InteractionModel.aggregate([
        {
          $match: {
            targetType: "content",
            targetId: { $in: await ContentModel.find({ creatorId }).distinct("_id") }
          }
        },
        {
          $group: {
            _id: null,
            totalEngagement: { $sum: 1 }
          }
        }
      ]);

      // Calculate follower growth (simplified - would need historical data)
      const followerGrowth = 0; // Would calculate based on previous period

      const stats: CreatorStats = {
        totalFollowers: creator.stats.totalFollowers,
        totalContent: contentStats[0]?.totalContent || 0,
        totalViews: contentStats[0]?.totalViews || 0,
        totalEngagement: engagementStats[0]?.totalEngagement || 0,
        avgWatchTime: contentStats[0]?.avgWatchTime || 0,
        followerGrowth
      };

      // Update creator stats
      await CreatorModel.findByIdAndUpdate(creatorId, { $set: { stats } });

      return stats;
    } catch (error) {
      console.error("Error calculating creator stats:", error);
      throw error;
    }
  }

  /**
   * Get creator dashboard data
   */
  async getCreatorDashboard(creatorId: string): Promise<CreatorDashboard> {
    try {
      const creator = await CreatorModel.findById(creatorId).populate("userId", "email");
      if (!creator) {
        throw new Error("Creator not found");
      }

      const stats = await this.calculateCreatorStats(creatorId);

      // Get recent analytics (last 30 days)
      const recentAnalytics = await CreatorAnalyticsModel.find({
        creatorId,
        period: "daily",
        date: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) }
      }).sort({ date: -1 });

      // Get top content
      const topContent = await ContentModel.find({ creatorId })
        .sort({ views: -1 })
        .limit(5)
        .select("_id title views engagement completionRate");

      // Get recent followers
      const recentFollowers = await CreatorFollowModel.find({
        creatorId,
        isActive: true
      })
        .populate("followerId", "email")
        .sort({ followedAt: -1 })
        .limit(10);

      return {
        creator,
        stats,
        recentAnalytics,
        topContent,
        recentFollowers
      };
    } catch (error) {
      console.error("Error fetching creator dashboard:", error);
      throw error;
    }
  }

  /**
   * Verify creator
   */
  async verifyCreator(
    creatorId: string,
    verificationMethod: string,
    verifiedBy: string
  ): Promise<ICreator> {
    try {
      const verifiedCreator = await CreatorModel.findByIdAndUpdate(
        creatorId,
        {
          status: "verified",
          verificationBadge: {
            isVerified: true,
            verifiedAt: new Date(),
            verificationMethod
          }
        },
        { new: true }
      );
      
      if (!verifiedCreator) {
        throw new Error("Creator not found");
      }
      
      return verifiedCreator;
    } catch (error) {
      console.error("Error verifying creator:", error);
      throw error;
    }
  }

  /**
   * Search creators
   */
  async searchCreators(
    query: string,
    filters: {
      status?: CreatorStatus;
      tier?: CreatorTier;
      category?: string;
    } = {},
    page: number = 1,
    limit: number = 20
  ): Promise<ICreator[]> {
    try {
      const searchQuery: any = {
        $or: [
          { displayName: { $regex: query, $options: "i" } },
          { bio: { $regex: query, $options: "i" } }
        ]
      };

      if (filters.status) {
        searchQuery.status = filters.status;
      }
      if (filters.tier) {
        searchQuery.tier = filters.tier;
      }

      return await CreatorModel.find(searchQuery)
        .populate("userId", "email")
        .sort({ "stats.totalFollowers": -1 })
        .skip((page - 1) * limit)
        .limit(limit);
    } catch (error) {
      console.error("Error searching creators:", error);
      throw error;
    }
  }

  /**
   * Get trending creators
   */
  async getTrendingCreators(limit: number = 10): Promise<ICreator[]> {
    try {
      return await CreatorModel.find({
        status: "active",
        "stats.totalFollowers": { $gt: 100 }
      })
        .populate("userId", "email")
        .sort({ "stats.followerGrowth": -1, "stats.totalFollowers": -1 })
        .limit(limit);
    } catch (error) {
      console.error("Error fetching trending creators:", error);
      throw error;
    }
  }
}

export const creatorService = new CreatorService();
