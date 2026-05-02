import { Request, Response } from "express";
import { getGlobalFeed, getUserFeed, getSessionFeed, updateSessionFeed } from "../services/feedService.js";
import { z } from "zod";

const feedQuerySchema = z.object({
  cursor: z.string().optional(),
  limit: z.string().optional().transform(val => val ? parseInt(val, 10) : 20)
});

const sessionFeedSchema = z.object({
  sessionId: z.string().min(1, "Session ID is required")
});

export async function getGlobalFeedController(req: Request, res: Response) {
  try {
    const { cursor, limit } = feedQuerySchema.parse(req.query);
    
    const feed = await getGlobalFeed(cursor, limit);
    
    res.json({
      success: true,
      data: feed,
      meta: {
        type: "global",
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error("Error in getGlobalFeedController:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch global feed"
    });
  }
}

export async function getPersonalizedFeedController(req: Request, res: Response) {
  try {
    // This comes from auth middleware
    const userId = res.locals.auth?.userId;
    
    if (!userId) {
      return res.status(401).json({
        success: false,
        error: "Authentication required for personalized feed"
      });
    }

    const { cursor, limit } = feedQuerySchema.parse(req.query);
    
    const feed = await getUserFeed(userId, cursor, limit);
    
    res.json({
      success: true,
      data: feed,
      meta: {
        type: "personalized",
        userId,
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error("Error in getPersonalizedFeedController:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch personalized feed"
    });
  }
}

export async function getSessionFeedController(req: Request, res: Response) {
  try {
    const { sessionId } = sessionFeedSchema.parse(req.query);
    
    const feed = await getSessionFeed(sessionId);
    
    if (!feed) {
      return res.status(404).json({
        success: false,
        error: "Session feed not found"
      });
    }
    
    res.json({
      success: true,
      data: feed,
      meta: {
        type: "session",
        sessionId,
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error("Error in getSessionFeedController:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch session feed"
    });
  }
}

export async function updateSessionFeedController(req: Request, res: Response) {
  try {
    const sessionData = req.body;
    
    if (!sessionData.sessionId) {
      return res.status(400).json({
        success: false,
        error: "sessionId is required"
      });
    }
    
    await updateSessionFeed(sessionData.sessionId, sessionData.watchedContent || [], sessionData.cursor || null);
    
    res.json({
      success: true,
      data: sessionData,
      meta: {
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error("Error in updateSessionFeedController:", error);
    res.status(500).json({
      success: false,
      error: "Failed to update session feed"
    });
  }
}
