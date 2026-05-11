import { Request, Response } from "express";
import { debateThreadService, type DebateThreadOptions } from "../services/debateThreadService.js";
import { CommentModel } from "../models/Comment.js";
import { logger } from "../config/logger.js";
import mongoose from "mongoose";

/**
 * Get debate thread with hierarchical structure
 */
export async function getDebateThreadController(req: Request, res: Response) {
  try {
    const contentId = Array.isArray(req.params.contentId) ? req.params.contentId[0] : req.params.contentId;
    const userId = res.locals.auth?.userId;

    if (!contentId) {
      return res.status(400).json({
        success: false,
        error: "Content ID is required"
      });
    }

    const options: DebateThreadOptions = {
      sort: (req.query.sort as any) || "newest",
      maxDepth: parseInt(req.query.maxDepth as string) || 10,
      includeDeleted: req.query.includeDeleted === "true",
      includeBlocked: req.query.includeBlocked === "true",
      userId,
      page: parseInt(req.query.page as string) || 1,
      limit: Math.min(parseInt(req.query.limit as string) || 50, 100)
    };

    const threadResponse = await debateThreadService.buildDebateThread(contentId, options);

    res.json({
      success: true,
      data: threadResponse,
      meta: {
        contentId,
        sort: options.sort,
        maxDepth: options.maxDepth,
        timestamp: new Date().toISOString()
      }
    });

  } catch (error) {
    logger.error({ err: error, contentId: req.params.contentId }, "Failed to get debate thread");
    res.status(500).json({
      success: false,
      error: "Failed to fetch debate thread"
    });
  }
}

/**
 * Add a reply to a comment in the debate thread
 */
export async function addReplyController(req: Request, res: Response) {
  try {
    const contentId = Array.isArray(req.params.contentId) ? req.params.contentId[0] : req.params.contentId;
    const commentId = Array.isArray(req.params.commentId) ? req.params.commentId[0] : req.params.commentId;
    const userId = res.locals.auth?.userId;

    if (!contentId || !commentId) {
      return res.status(400).json({
        success: false,
        error: "Content ID and comment ID are required"
      });
    }

    const { body, mentions } = req.body;

    if (!body || typeof body !== "string" || body.trim().length === 0) {
      return res.status(400).json({
        success: false,
        error: "Reply body is required and cannot be empty"
      });
    }

    if (body.length > 2000) {
      return res.status(400).json({
        success: false,
        error: "Reply body cannot exceed 2000 characters"
      });
    }

    const reply = await debateThreadService.addReply(contentId, commentId, {
      body: body.trim(),
      userId,
      mentions: Array.isArray(mentions) ? mentions : []
    });

    // Return the reply with populated user data
    const populatedReply = await CommentModel.findById(reply._id)
      .populate("userId", "name avatar")
      .lean();

    res.status(201).json({
      success: true,
      data: populatedReply,
      meta: {
        contentId,
        parentCommentId: commentId,
        timestamp: new Date().toISOString()
      }
    });

  } catch (error) {
    logger.error({ 
      err: error, 
      contentId: req.params.contentId, 
      commentId: req.params.commentId 
    }, "Failed to add reply");
    
    if (error instanceof Error && error.message === "Parent comment not found") {
      return res.status(404).json({
        success: false,
        error: "Parent comment not found"
      });
    }

    res.status(500).json({
      success: false,
      error: "Failed to add reply"
    });
  }
}

/**
 * Add an AI-generated reply to a comment
 */
export async function addAIReplyController(req: Request, res: Response) {
  try {
    const contentId = Array.isArray(req.params.contentId) ? req.params.contentId[0] : req.params.contentId;
    const commentId = Array.isArray(req.params.commentId) ? req.params.commentId[0] : req.params.commentId;

    if (!contentId || !commentId) {
      return res.status(400).json({
        success: false,
        error: "Content ID and comment ID are required"
      });
    }

    const { 
      body, 
      aiPersona, 
      aiPersonaName, 
      aiPersonaAvatar,
      mentions 
    } = req.body;

    if (!body || typeof body !== "string" || body.trim().length === 0) {
      return res.status(400).json({
        success: false,
        error: "Reply body is required and cannot be empty"
      });
    }

    const reply = await debateThreadService.addReply(contentId, commentId, {
      body: body.trim(),
      aiGenerated: true,
      aiPersona: aiPersona || null,
      aiPersonaName: aiPersonaName || null,
      aiPersonaAvatar: aiPersonaAvatar || null,
      mentions: Array.isArray(mentions) ? mentions : []
    });

    // Return the AI reply
    const populatedReply = await CommentModel.findById(reply._id).lean();

    res.status(201).json({
      success: true,
      data: populatedReply,
      meta: {
        contentId,
        parentCommentId: commentId,
        aiGenerated: true,
        timestamp: new Date().toISOString()
      }
    });

  } catch (error) {
    logger.error({ 
      err: error, 
      contentId: req.params.contentId, 
      commentId: req.params.commentId 
    }, "Failed to add AI reply");
    
    if (error instanceof Error && error.message === "Parent comment not found") {
      return res.status(404).json({
        success: false,
        error: "Parent comment not found"
      });
    }

    res.status(500).json({
      success: false,
      error: "Failed to add AI reply"
    });
  }
}

/**
 * Pin/unpin a comment in the debate thread (moderator only)
 */
export async function toggleCommentPinController(req: Request, res: Response) {
  try {
    const commentId = Array.isArray(req.params.commentId) ? req.params.commentId[0] : req.params.commentId;
    const moderatorId = res.locals.auth?.userId;
    const { pinned } = req.body;

    if (!commentId) {
      return res.status(400).json({
        success: false,
        error: "Comment ID is required"
      });
    }

    if (!moderatorId) {
      return res.status(401).json({
        success: false,
        error: "Authentication required"
      });
    }

    if (typeof pinned !== "boolean") {
      return res.status(400).json({
        success: false,
        error: "Pinned status must be a boolean"
      });
    }

    // Check if user is a moderator (you might want to implement proper role checking)
    // For now, we'll assume authenticated users can pin comments
    await debateThreadService.toggleCommentPin(commentId, pinned, moderatorId);

    res.json({
      success: true,
      data: {
        commentId,
        pinned,
        moderatedBy: moderatorId
      },
      meta: {
        timestamp: new Date().toISOString()
      }
    });

  } catch (error) {
    logger.error({ 
      err: error, 
      commentId: req.params.commentId 
    }, "Failed to toggle comment pin");
    res.status(500).json({
      success: false,
      error: "Failed to toggle comment pin"
    });
  }
}

/**
 * Get thread statistics and analytics
 */
export async function getThreadStatsController(req: Request, res: Response) {
  try {
    const contentId = Array.isArray(req.params.contentId) ? req.params.contentId[0] : req.params.contentId;

    if (!contentId) {
      return res.status(400).json({
        success: false,
        error: "Content ID is required"
      });
    }

    // Get thread with stats only (no comments)
    const threadResponse = await debateThreadService.buildDebateThread(contentId, {
      page: 1,
      limit: 0 // Get stats only
    });

    res.json({
      success: true,
      data: threadResponse.stats,
      meta: {
        contentId,
        timestamp: new Date().toISOString()
      }
    });

  } catch (error) {
    logger.error({ err: error, contentId: req.params.contentId }, "Failed to get thread stats");
    res.status(500).json({
      success: false,
      error: "Failed to fetch thread statistics"
    });
  }
}

/**
 * Search within a debate thread
 */
export async function searchThreadController(req: Request, res: Response) {
  try {
    const contentId = Array.isArray(req.params.contentId) ? req.params.contentId[0] : req.params.contentId;
    const { q: query, page = 1, limit = 20 } = req.query;

    if (!contentId) {
      return res.status(400).json({
        success: false,
        error: "Content ID is required"
      });
    }

    if (!query || typeof query !== "string" || query.trim().length === 0) {
      return res.status(400).json({
        success: false,
        error: "Search query is required"
      });
    }

    const searchQuery = query.trim();
    const pageNum = parseInt(page as string) || 1;
    const limitNum = Math.min(parseInt(limit as string) || 20, 50);
    const skip = (pageNum - 1) * limitNum;

    // Search comments within the thread
    const [comments, totalCount] = await Promise.all([
      CommentModel.find({
        contentId: new mongoose.Types.ObjectId(contentId),
        isDeleted: false,
        hidden: false,
        moderationStatus: { $ne: "blocked" },
        $text: { $search: searchQuery }
      })
      .populate("userId", "name avatar")
      .sort({ score: { $meta: "textScore" }, createdAt: -1 })
      .skip(skip)
      .limit(limitNum)
      .lean(),
      
      CommentModel.countDocuments({
        contentId: new mongoose.Types.ObjectId(contentId),
        isDeleted: false,
        hidden: false,
        moderationStatus: { $ne: "blocked" },
        $text: { $search: searchQuery }
      })
    ]);

    const totalPages = Math.ceil(totalCount / limitNum);

    res.json({
      success: true,
      data: {
        comments,
        query: searchQuery,
        totalCount,
        pageInfo: {
          currentPage: pageNum,
          totalPages,
          hasNext: pageNum < totalPages,
          hasPrev: pageNum > 1
        }
      },
      meta: {
        contentId,
        timestamp: new Date().toISOString()
      }
    });

  } catch (error) {
    logger.error({ 
      err: error, 
      contentId: req.params.contentId,
      query: req.query.q 
    }, "Failed to search thread");
    res.status(500).json({
      success: false,
      error: "Failed to search thread"
    });
  }
}

/**
 * Get thread timeline (chronological view of all activity)
 */
export async function getThreadTimelineController(req: Request, res: Response) {
  try {
    const contentId = Array.isArray(req.params.contentId) ? req.params.contentId[0] : req.params.contentId;
    const { page = 1, limit = 50 } = req.query;

    if (!contentId) {
      return res.status(400).json({
        success: false,
        error: "Content ID is required"
      });
    }

    const pageNum = parseInt(page as string) || 1;
    const limitNum = Math.min(parseInt(limit as string) || 50, 100);
    const skip = (pageNum - 1) * limitNum;

    // Get all comments in chronological order
    const [comments, totalCount] = await Promise.all([
      CommentModel.find({
        contentId: new mongoose.Types.ObjectId(contentId),
        isDeleted: false,
        hidden: false,
        moderationStatus: { $ne: "blocked" }
      })
      .populate("userId", "name avatar")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum)
      .lean(),
      
      CommentModel.countDocuments({
        contentId: new mongoose.Types.ObjectId(contentId),
        isDeleted: false,
        hidden: false,
        moderationStatus: { $ne: "blocked" }
      })
    ]);

    // Group comments by time periods (hours, days)
    const timeline = groupCommentsByTime(comments);

    const totalPages = Math.ceil(totalCount / limitNum);

    res.json({
      success: true,
      data: {
        timeline,
        totalCount,
        pageInfo: {
          currentPage: pageNum,
          totalPages,
          hasNext: pageNum < totalPages,
          hasPrev: pageNum > 1
        }
      },
      meta: {
        contentId,
        timestamp: new Date().toISOString()
      }
    });

  } catch (error) {
    logger.error({ err: error, contentId: req.params.contentId }, "Failed to get thread timeline");
    res.status(500).json({
      success: false,
      error: "Failed to fetch thread timeline"
    });
  }
}

/**
 * Helper function to group comments by time periods
 */
function groupCommentsByTime(comments: any[]) {
  const now = new Date();
  const timeGroups: { [key: string]: any[] } = {};

  comments.forEach(comment => {
    const commentTime = new Date(comment.createdAt);
    const timeDiff = now.getTime() - commentTime.getTime();
    const hoursAgo = Math.floor(timeDiff / (1000 * 60 * 60));
    
    let timeGroup: string;
    if (hoursAgo < 1) {
      timeGroup = "Maintenant";
    } else if (hoursAgo < 24) {
      timeGroup = `Il y a ${hoursAgo}h`;
    } else if (hoursAgo < 48) {
      timeGroup = "Hier";
    } else if (hoursAgo < 168) { // 1 week
      const daysAgo = Math.floor(hoursAgo / 24);
      timeGroup = `Il y a ${daysAgo} jours`;
    } else {
      timeGroup = commentTime.toLocaleDateString('fr-FR');
    }

    if (!timeGroups[timeGroup]) {
      timeGroups[timeGroup] = [];
    }
    timeGroups[timeGroup].push(comment);
  });

  // Convert to array format
  return Object.entries(timeGroups).map(([timeGroup, groupComments]) => ({
    timeGroup,
    comments: groupComments,
    count: groupComments.length
  }));
}
