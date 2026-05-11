import { Request, Response } from "express";
import { creatorService } from "../services/creatorService";
import { Types } from "mongoose";


export class CreatorController {
  /**
   * Create creator profile
   */
  async createCreator(req: Request, res: Response) {
    try {
      const userId = res.locals.auth?.userId;
      if (!userId) {
        return res.status(401).json({ error: "User not authenticated" });
      }

      const { displayName, bio, socialLinks, settings } = req.body;

      // Validate required fields
      if (!displayName || !bio) {
        return res.status(400).json({ error: "Display name and bio are required" });
      }

      const creator = await creatorService.createCreator(userId, {
        displayName,
        bio,
        socialLinks,
        settings
      });

      res.status(201).json({
        success: true,
        data: creator
      });
    } catch (error: any) {
      console.error("Error creating creator:", error);
      res.status(500).json({ 
        error: error.message || "Failed to create creator profile" 
      });
    }
  }

  /**
   * Get current user's creator profile
   */
  async getMyCreatorProfile(req: Request, res: Response) {
    try {
      const userId = res.locals.auth?.userId;
      if (!userId) {
        return res.status(401).json({ error: "User not authenticated" });
      }

      const creator = await creatorService.getCreatorByUserId(userId);
      if (!creator) {
        return res.status(404).json({ error: "Creator profile not found" });
      }

      res.json({
        success: true,
        data: creator
      });
    } catch (error: any) {
      console.error("Error fetching creator profile:", error);
      res.status(500).json({ 
        error: error.message || "Failed to fetch creator profile" 
      });
    }
  }

  /**
   * Get creator by ID
   */
  async getCreatorById(req: Request, res: Response) {
    try {
      const creatorId = Array.isArray(req.params.creatorId) ? req.params.creatorId[0] : req.params.creatorId;
      
      if (!Types.ObjectId.isValid(creatorId)) {
        return res.status(400).json({ error: "Invalid creator ID" });
      }

      const creator = await creatorService.getCreatorById(creatorId);
      if (!creator) {
        return res.status(404).json({ error: "Creator not found" });
      }

      res.json({
        success: true,
        data: creator
      });
    } catch (error: any) {
      console.error("Error fetching creator:", error);
      res.status(500).json({ 
        error: error.message || "Failed to fetch creator" 
      });
    }
  }

  /**
   * Update creator profile
   */
  async updateCreator(req: Request, res: Response) {
    try {
      const userId = res.locals.auth?.userId;
      if (!userId) {
        return res.status(401).json({ error: "User not authenticated" });
      }

      const creator = await creatorService.getCreatorByUserId(userId);
      if (!creator) {
        return res.status(404).json({ error: "Creator profile not found" });
      }

      const updateData = req.body;
      const updatedCreator = await creatorService.updateCreator(creator._id.toString(), updateData);

      res.json({
        success: true,
        data: updatedCreator
      });
    } catch (error: any) {
      console.error("Error updating creator:", error);
      res.status(500).json({ 
        error: error.message || "Failed to update creator profile" 
      });
    }
  }

  /**
   * Follow a creator
   */
  async followCreator(req: Request, res: Response) {
    try {
      const userId = res.locals.auth?.userId;
      if (!userId) {
        return res.status(401).json({ error: "User not authenticated" });
      }

      const creatorId = Array.isArray(req.params.creatorId) ? req.params.creatorId[0] : req.params.creatorId;
      
      if (!Types.ObjectId.isValid(creatorId)) {
        return res.status(400).json({ error: "Invalid creator ID" });
      }

      const follow = await creatorService.followCreator(creatorId, userId);

      res.status(201).json({
        success: true,
        data: follow
      });
    } catch (error: any) {
      console.error("Error following creator:", error);
      res.status(500).json({ 
        error: error.message || "Failed to follow creator" 
      });
    }
  }

  /**
   * Unfollow a creator
   */
  async unfollowCreator(req: Request, res: Response) {
    try {
      const userId = res.locals.auth?.userId;
      if (!userId) {
        return res.status(401).json({ error: "User not authenticated" });
      }

      const creatorId = Array.isArray(req.params.creatorId) ? req.params.creatorId[0] : req.params.creatorId;
      
      if (!Types.ObjectId.isValid(creatorId)) {
        return res.status(400).json({ error: "Invalid creator ID" });
      }

      await creatorService.unfollowCreator(creatorId, userId);

      res.json({
        success: true,
        message: "Successfully unfollowed creator"
      });
    } catch (error: any) {
      console.error("Error unfollowing creator:", error);
      res.status(500).json({ 
        error: error.message || "Failed to unfollow creator" 
      });
    }
  }

  /**
   * Get creator followers
   */
  async getCreatorFollowers(req: Request, res: Response) {
    try {
      const creatorId = Array.isArray(req.params.creatorId) ? req.params.creatorId[0] : req.params.creatorId;
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;
      
      if (!Types.ObjectId.isValid(creatorId)) {
        return res.status(400).json({ error: "Invalid creator ID" });
      }

      const followers = await creatorService.getCreatorFollowers(creatorId, page, limit);

      res.json({
        success: true,
        data: followers,
        pagination: {
          page,
          limit,
          hasNext: followers.length === limit
        }
      });
    } catch (error: any) {
      console.error("Error fetching creator followers:", error);
      res.status(500).json({ 
        error: error.message || "Failed to fetch creator followers" 
      });
    }
  }

  /**
   * Get user's followed creators
   */
  async getMyFollowedCreators(req: Request, res: Response) {
    try {
      const userId = res.locals.auth?.userId;
      if (!userId) {
        return res.status(401).json({ error: "User not authenticated" });
      }

      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;

      const followedCreators = await creatorService.getUserFollowedCreators(userId, page, limit);

      res.json({
        success: true,
        data: followedCreators,
        pagination: {
          page,
          limit,
          hasNext: followedCreators.length === limit
        }
      });
    } catch (error: any) {
      console.error("Error fetching followed creators:", error);
      res.status(500).json({ 
        error: error.message || "Failed to fetch followed creators" 
      });
    }
  }

  /**
   * Get creator dashboard
   */
  async getCreatorDashboard(req: Request, res: Response) {
    try {
      const userId = res.locals.auth?.userId;
      if (!userId) {
        return res.status(401).json({ error: "User not authenticated" });
      }

      const creator = await creatorService.getCreatorByUserId(userId);
      if (!creator) {
        return res.status(404).json({ error: "Creator profile not found" });
      }

      const dashboard = await creatorService.getCreatorDashboard(creator._id.toString());

      res.json({
        success: true,
        data: dashboard
      });
    } catch (error: any) {
      console.error("Error fetching creator dashboard:", error);
      res.status(500).json({ 
        error: error.message || "Failed to fetch creator dashboard" 
      });
    }
  }

  /**
   * Search creators
   */
  async searchCreators(req: Request, res: Response) {
    try {
      const { q: query } = req.query;
      const { status, tier, category } = req.query;
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;

      if (!query || typeof query !== "string") {
        return res.status(400).json({ error: "Search query is required" });
      }

      const filters: any = {};
      if (status) filters.status = status as any;
      if (tier) filters.tier = tier as any;
      if (category) filters.category = category as string;

      const creators = await creatorService.searchCreators(query, filters, page, limit);

      res.json({
        success: true,
        data: creators,
        pagination: {
          page,
          limit,
          hasNext: creators.length === limit
        }
      });
    } catch (error: any) {
      console.error("Error searching creators:", error);
      res.status(500).json({ 
        error: error.message || "Failed to search creators" 
      });
    }
  }

  /**
   * Get trending creators
   */
  async getTrendingCreators(req: Request, res: Response) {
    try {
      const limit = parseInt(req.query.limit as string) || 10;
      
      const creators = await creatorService.getTrendingCreators(limit);

      res.json({
        success: true,
        data: creators
      });
    } catch (error: any) {
      console.error("Error fetching trending creators:", error);
      res.status(500).json({ 
        error: error.message || "Failed to fetch trending creators" 
      });
    }
  }

  /**
   * Update creator stats (internal use)
   */
  async updateCreatorStats(req: Request, res: Response) {
    try {
      const creatorId = Array.isArray(req.params.creatorId) ? req.params.creatorId[0] : req.params.creatorId;
      
      if (!Types.ObjectId.isValid(creatorId)) {
        return res.status(400).json({ error: "Invalid creator ID" });
      }

      const stats = await creatorService.calculateCreatorStats(creatorId);

      res.json({
        success: true,
        data: stats
      });
    } catch (error: any) {
      console.error("Error updating creator stats:", error);
      res.status(500).json({ 
        error: error.message || "Failed to update creator stats" 
      });
    }
  }
}

export const creatorController = new CreatorController();
