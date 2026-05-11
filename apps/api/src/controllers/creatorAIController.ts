import { Request, Response } from "express";
import { creatorAIService } from "../services/creatorAIService";
import { creatorAIAssistantService } from "../services/creatorAIAssistantService";
import { Types } from "mongoose";

export class CreatorAIController {
  /**
   * Generate AI summary for content
   */
  async generateContentSummary(req: Request, res: Response) {
    try {
      const userId = res.locals.auth?.userId;
      if (!userId) {
        return res.status(401).json({ error: "User not authenticated" });
      }

      const contentId = Array.isArray(req.params.contentId) ? req.params.contentId[0] : req.params.contentId;
      
      if (!Types.ObjectId.isValid(contentId)) {
        return res.status(400).json({ error: "Invalid content ID" });
      }

      const summary = await creatorAIService.generateContentSummary(contentId);

      res.json({
        success: true,
        data: summary
      });
    } catch (error: any) {
      console.error("Error generating content summary:", error);
      res.status(500).json({ 
        error: error.message || "Failed to generate content summary" 
      });
    }
  }

  /**
   * Generate content suggestions for creator
   */
  async generateContentSuggestions(req: Request, res: Response) {
    try {
      const userId = res.locals.auth?.userId;
      if (!userId) {
        return res.status(401).json({ error: "User not authenticated" });
      }

      // Get creator ID from user or request params
      const creatorId = req.body.creatorId || req.params.creatorId;
      
      if (!creatorId || !Types.ObjectId.isValid(creatorId)) {
        return res.status(400).json({ error: "Invalid creator ID" });
      }

      const suggestions = await creatorAIService.generateContentSuggestions(creatorId);

      res.json({
        success: true,
        data: suggestions
      });
    } catch (error: any) {
      console.error("Error generating content suggestions:", error);
      res.status(500).json({ 
        error: error.message || "Failed to generate content suggestions" 
      });
    }
  }

  /**
   * Generate optimal posting schedule
   */
  async generateOptimalSchedule(req: Request, res: Response) {
    try {
      const userId = res.locals.auth?.userId;
      if (!userId) {
        return res.status(401).json({ error: "User not authenticated" });
      }

      const creatorId = Array.isArray(req.params.creatorId) ? req.params.creatorId[0] : req.params.creatorId;
      
      if (!Types.ObjectId.isValid(creatorId)) {
        return res.status(400).json({ error: "Invalid creator ID" });
      }

      const schedule = await creatorAIService.generateOptimalSchedule(creatorId);

      res.json({
        success: true,
        data: schedule
      });
    } catch (error: any) {
      console.error("Error generating optimal schedule:", error);
      res.status(500).json({ 
        error: error.message || "Failed to generate optimal schedule" 
      });
    }
  }

  /**
   * Generate title suggestions
   */
  async generateTitleSuggestions(req: Request, res: Response) {
    try {
      const userId = res.locals.auth?.userId;
      if (!userId) {
        return res.status(401).json({ error: "User not authenticated" });
      }

      const creatorId = Array.isArray(req.params.creatorId) ? req.params.creatorId[0] : req.params.creatorId;
      const { contentDescription, contentType } = req.body;
      
      if (!Types.ObjectId.isValid(creatorId)) {
        return res.status(400).json({ error: "Invalid creator ID" });
      }

      if (!contentDescription || !contentType) {
        return res.status(400).json({ 
          error: "Content description and type are required" 
        });
      }

      const titles = await creatorAIService.generateTitleSuggestions(
        creatorId,
        contentDescription,
        contentType
      );

      res.json({
        success: true,
        data: titles
      });
    } catch (error: any) {
      console.error("Error generating title suggestions:", error);
      res.status(500).json({ 
        error: error.message || "Failed to generate title suggestions" 
      });
    }
  }

  /**
   * Generate AI suggestions for creator
   */
  async generateAISuggestions(req: Request, res: Response) {
    try {
      const userId = res.locals.auth?.userId;
      if (!userId) {
        return res.status(401).json({ error: "User not authenticated" });
      }

      const creatorId = Array.isArray(req.params.creatorId) ? req.params.creatorId[0] : req.params.creatorId;
      const { contentType } = req.query;
      
      if (!Types.ObjectId.isValid(creatorId)) {
        return res.status(400).json({ error: "Invalid creator ID" });
      }

      const suggestions = await creatorAIAssistantService.generateSuggestions(
        creatorId, 
        contentType as string
      );

      res.json({
        success: true,
        data: suggestions
      });
    } catch (error: any) {
      console.error("Error generating AI suggestions:", error);
      res.status(500).json({ 
        error: error.message || "Failed to generate AI suggestions" 
      });
    }
  }

  /**
   * Optimize content with AI
   */
  async optimizeContent(req: Request, res: Response) {
    try {
      const userId = res.locals.auth?.userId;
      if (!userId) {
        return res.status(401).json({ error: "User not authenticated" });
      }

      const contentId = Array.isArray(req.params.contentId) ? req.params.contentId[0] : req.params.contentId;
      
      if (!Types.ObjectId.isValid(contentId)) {
        return res.status(400).json({ error: "Invalid content ID" });
      }

      const optimization = await creatorAIAssistantService.optimizeContent(contentId);

      res.json({
        success: true,
        data: optimization
      });
    } catch (error: any) {
      console.error("Error optimizing content:", error);
      res.status(500).json({ 
        error: error.message || "Failed to optimize content" 
      });
    }
  }

  /**
   * Apply AI suggestion to content
   */
  async applyAISuggestion(req: Request, res: Response) {
    try {
      const userId = res.locals.auth?.userId;
      if (!userId) {
        return res.status(401).json({ error: "User not authenticated" });
      }

      const creatorId = Array.isArray(req.params.creatorId) ? req.params.creatorId[0] : req.params.creatorId;
      const { suggestion, contentId } = req.body;
      
      if (!Types.ObjectId.isValid(creatorId)) {
        return res.status(400).json({ error: "Invalid creator ID" });
      }

      if (!suggestion) {
        return res.status(400).json({ error: "Suggestion is required" });
      }

      await creatorAIAssistantService.applySuggestion(creatorId, suggestion, contentId);

      res.json({
        success: true,
        message: "Suggestion applied successfully"
      });
    } catch (error: any) {
      console.error("Error applying AI suggestion:", error);
      res.status(500).json({ 
        error: error.message || "Failed to apply AI suggestion" 
      });
    }
  }

  /**
   * Generate audience insights
   */
  async generateAudienceInsights(req: Request, res: Response) {
    try {
      const userId = res.locals.auth?.userId;
      if (!userId) {
        return res.status(401).json({ error: "User not authenticated" });
      }

      const creatorId = Array.isArray(req.params.creatorId) ? req.params.creatorId[0] : req.params.creatorId;
      
      if (!Types.ObjectId.isValid(creatorId)) {
        return res.status(400).json({ error: "Invalid creator ID" });
      }

      const insights = await creatorAIAssistantService.generateAudienceInsights(creatorId);

      res.json({
        success: true,
        data: insights
      });
    } catch (error: any) {
      console.error("Error generating audience insights:", error);
      res.status(500).json({ 
        error: error.message || "Failed to generate audience insights" 
      });
    }
  }

  /**
   * Batch generate AI insights for creator dashboard
   */
  async generateDashboardInsights(req: Request, res: Response) {
    try {
      const userId = res.locals.auth?.userId;
      if (!userId) {
        return res.status(401).json({ error: "User not authenticated" });
      }

      const creatorId = Array.isArray(req.params.creatorId) ? req.params.creatorId[0] : req.params.creatorId;
      
      if (!Types.ObjectId.isValid(creatorId)) {
        return res.status(400).json({ error: "Invalid creator ID" });
      }

      // Generate all insights in parallel
      const [suggestions, insights, schedule] = await Promise.all([
        creatorAIService.generateContentSuggestions(creatorId),
        creatorAIService.generateAudienceInsights(creatorId),
        creatorAIService.generateOptimalSchedule(creatorId)
      ]);

      res.json({
        success: true,
        data: {
          suggestions,
          insights,
          schedule
        }
      });
    } catch (error: any) {
      console.error("Error generating dashboard insights:", error);
      res.status(500).json({ 
        error: error.message || "Failed to generate dashboard insights" 
      });
    }
  }
}

export const creatorAIController = new CreatorAIController();
