import { Request, Response } from "express";
import { z } from "zod";
import {
  postComment,
  postReply,
  getCommentsThread,
  getCommentsPaginated,
  editComment,
  editReply,
  deleteComment,
  deleteReply,
  likeComment,
  unlikeComment,
  likeReply,
  unlikeReply,
  reportComment,
  reportReply,
  getCommentStats,
  getNestedReplies
} from "../services/commentService.js";
import type { CommentSortBy, SortOrder } from "../repositories/commentRepository.js";
import { CommentModerationError } from "../services/moderationService.js";

// Validation schemas
const createCommentSchema = z.object({
  body: z.string().min(2, "Comment must be at least 2 characters").max(2000, "Comment too long (max 2000 characters)")
});

const createReplySchema = z.object({
  body: z.string().min(1, "Reply must be at least 1 character").max(1000, "Reply too long (max 1000 characters)"),
  parentReplyId: z.string().optional(),
  replyToCommentId: z.string().optional(),
  replyToReplyId: z.string().optional(),
  replyMode: z.enum(["nested", "flat"]).optional()
});

const updateCommentSchema = z.object({
  body: z.string().min(2, "Comment must be at least 2 characters").max(2000, "Comment too long")
});

const updateReplySchema = z.object({
  body: z.string().min(1, "Reply must be at least 1 character").max(1000, "Reply too long")
});

const listCommentsSchema = z.object({
  contentId: z.string().min(1, "Content ID is required")
});

const paginationSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().min(1).max(50).default(20),
  sortBy: z.enum(["date", "likes", "replies", "debate"]).default("date"),
  sortOrder: z.enum(["asc", "desc"]).default("desc"),
  ai_only: z.coerce.boolean().optional().default(false)
});

const reportSchema = z.object({
  reason: z.enum(["spam", "harassment", "hate_speech", "misinformation", "inappropriate", "other"]),
  description: z.string().max(500).optional()
});

// ==================== COMMENT CONTROLLERS ====================

export async function createCommentController(req: Request, res: Response) {
  try {
    const userId = res.locals.auth?.userId;

    if (!userId) {
      return res.status(401).json({
        success: false,
        error: "Authentication required"
      });
    }

    const { contentId } = req.params;
    const contentIdStr = Array.isArray(contentId) ? contentId[0] : contentId;
    const { body } = createCommentSchema.parse(req.body);

    const comment = await postComment({ contentId: contentIdStr, userId, body });

    res.status(201).json({
      success: true,
      data: comment,
      meta: {
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        error: "Validation failed",
        details: error.issues
      });
    }
    if (error instanceof CommentModerationError) {
      return res.status(error.statusCode).json({
        success: false,
        error: error.moderation.reason,
        moderation: error.moderation
      });
    }
    console.error("Error in createCommentController:", error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : "Failed to create comment"
    });
  }
}

export async function updateCommentController(req: Request, res: Response) {
  try {
    const userId = res.locals.auth?.userId;

    if (!userId) {
      return res.status(401).json({
        success: false,
        error: "Authentication required"
      });
    }

    const { commentId } = req.params;
    const { body } = updateCommentSchema.parse(req.body);

    const comment = await editComment(commentId as string, userId, body);

    if (!comment) {
      return res.status(404).json({
        success: false,
        error: "Comment not found"
      });
    }

    res.json({
      success: true,
      data: comment,
      meta: {
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        error: "Validation failed",
        details: error.issues
      });
    }
    console.error("Error in updateCommentController:", error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : "Failed to update comment"
    });
  }
}

export async function deleteCommentController(req: Request, res: Response) {
  try {
    const userId = res.locals.auth?.userId;

    if (!userId) {
      return res.status(401).json({
        success: false,
        error: "Authentication required"
      });
    }

    const { commentId } = req.params;
    const { reason } = req.body || {};

    const success = await deleteComment(commentId as string, userId, reason);

    if (!success) {
      return res.status(404).json({
        success: false,
        error: "Comment not found or not authorized"
      });
    }

    res.json({
      success: true,
      message: "Comment deleted successfully",
      meta: {
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error("Error in deleteCommentController:", error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : "Failed to delete comment"
    });
  }
}

// ==================== REPLY CONTROLLERS ====================

export async function createReplyController(req: Request, res: Response) {
  try {
    const userId = res.locals.auth?.userId;

    if (!userId) {
      return res.status(401).json({
        success: false,
        error: "Authentication required"
      });
    }

    const { commentId } = req.params;
    const { body, parentReplyId, replyToCommentId, replyToReplyId, replyMode } = createReplySchema.parse(req.body);

    const reply = await postReply({
      commentId: Array.isArray(commentId) ? commentId[0] : commentId,
      userId,
      body,
      parentReplyId,
      replyToCommentId,
      replyToReplyId,
      replyMode
    });

    res.status(201).json({
      success: true,
      data: reply,
      meta: {
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        error: "Validation failed",
        details: error.issues
      });
    }
    if (error instanceof CommentModerationError) {
      return res.status(error.statusCode).json({
        success: false,
        error: error.moderation.reason,
        moderation: error.moderation
      });
    }
    console.error("Error in createReplyController:", error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : "Failed to create reply"
    });
  }
}

export async function updateReplyController(req: Request, res: Response) {
  try {
    const userId = res.locals.auth?.userId;

    if (!userId) {
      return res.status(401).json({
        success: false,
        error: "Authentication required"
      });
    }

    const { replyId } = req.params;
    const { body } = updateReplySchema.parse(req.body);

    const reply = await editReply(replyId as string, userId, body);

    if (!reply) {
      return res.status(404).json({
        success: false,
        error: "Reply not found"
      });
    }

    res.json({
      success: true,
      data: reply,
      meta: {
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        error: "Validation failed",
        details: error.issues
      });
    }
    console.error("Error in updateReplyController:", error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : "Failed to update reply"
    });
  }
}

export async function deleteReplyController(req: Request, res: Response) {
  try {
    const userId = res.locals.auth?.userId;

    if (!userId) {
      return res.status(401).json({
        success: false,
        error: "Authentication required"
      });
    }

    const { replyId } = req.params;
    const { reason } = req.body || {};

    const success = await deleteReply(replyId as string, userId, reason);

    if (!success) {
      return res.status(404).json({
        success: false,
        error: "Reply not found or not authorized"
      });
    }

    res.json({
      success: true,
      message: "Reply deleted successfully",
      meta: {
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error("Error in deleteReplyController:", error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : "Failed to delete reply"
    });
  }
}

// ==================== LISTING CONTROLLERS ====================

export async function listCommentsController(req: Request, res: Response) {
  try {
    const { contentId } = listCommentsSchema.parse(req.params);
    const { page, limit, sortBy, sortOrder, ai_only } = paginationSchema.parse(req.query);
    const userId = res.locals.auth?.userId;

    // Get paginated comments
    const result = await getCommentsPaginated(contentId, {
      page,
      limit,
      sortBy: sortBy as CommentSortBy,
      sortOrder: sortOrder as SortOrder,
      currentUserId: userId,
      aiOnly: ai_only
    });

    // Get stats
    const stats = await getCommentStats(contentId);

    res.json({
      success: true,
      data: result.data,
      meta: {
        ...result.pagination,
        stats,
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        error: "Validation failed",
        details: error.issues
      });
    }
    console.error("Error in listCommentsController:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch comments"
    });
  }
}

export async function listNestedRepliesController(req: Request, res: Response) {
  try {
    const { replyId } = req.params;
    const userId = res.locals.auth?.userId;

    const replies = await getNestedReplies(replyId as string, userId);

    res.json({
      success: true,
      data: replies,
      meta: {
        count: replies.length,
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error("Error in listNestedRepliesController:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch nested replies"
    });
  }
}

// ==================== LIKE CONTROLLERS ====================

export async function likeCommentController(req: Request, res: Response) {
  try {
    const userId = res.locals.auth?.userId;

    if (!userId) {
      return res.status(401).json({
        success: false,
        error: "Authentication required"
      });
    }

    const { commentId } = req.params;
    const success = await likeComment(commentId as string, userId);

    if (!success) {
      return res.status(400).json({
        success: false,
        error: "Already liked or comment not found"
      });
    }

    res.json({
      success: true,
      message: "Comment liked successfully",
      meta: {
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error("Error in likeCommentController:", error);
    res.status(500).json({
      success: false,
      error: "Failed to like comment"
    });
  }
}

export async function unlikeCommentController(req: Request, res: Response) {
  try {
    const userId = res.locals.auth?.userId;

    if (!userId) {
      return res.status(401).json({
        success: false,
        error: "Authentication required"
      });
    }

    const { commentId } = req.params;
    const success = await unlikeComment(commentId as string, userId);

    if (!success) {
      return res.status(400).json({
        success: false,
        error: "Not liked or comment not found"
      });
    }

    res.json({
      success: true,
      message: "Comment unliked successfully",
      meta: {
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error("Error in unlikeCommentController:", error);
    res.status(500).json({
      success: false,
      error: "Failed to unlike comment"
    });
  }
}

export async function likeReplyController(req: Request, res: Response) {
  try {
    const userId = res.locals.auth?.userId;

    if (!userId) {
      return res.status(401).json({
        success: false,
        error: "Authentication required"
      });
    }

    const { replyId } = req.params;
    const success = await likeReply(replyId as string, userId);

    if (!success) {
      return res.status(400).json({
        success: false,
        error: "Already liked or reply not found"
      });
    }

    res.json({
      success: true,
      message: "Reply liked successfully",
      meta: {
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error("Error in likeReplyController:", error);
    res.status(500).json({
      success: false,
      error: "Failed to like reply"
    });
  }
}

export async function unlikeReplyController(req: Request, res: Response) {
  try {
    const userId = res.locals.auth?.userId;

    if (!userId) {
      return res.status(401).json({
        success: false,
        error: "Authentication required"
      });
    }

    const { replyId } = req.params;
    const success = await unlikeReply(replyId as string, userId);

    if (!success) {
      return res.status(400).json({
        success: false,
        error: "Not liked or reply not found"
      });
    }

    res.json({
      success: true,
      message: "Reply unliked successfully",
      meta: {
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error("Error in unlikeReplyController:", error);
    res.status(500).json({
      success: false,
      error: "Failed to unlike reply"
    });
  }
}

// ==================== REPORT CONTROLLERS ====================

export async function reportCommentController(req: Request, res: Response) {
  try {
    const userId = res.locals.auth?.userId;

    if (!userId) {
      return res.status(401).json({
        success: false,
        error: "Authentication required"
      });
    }

    const { commentId } = req.params;
    const { reason, description } = reportSchema.parse(req.body);

    const result = await reportComment(commentId as string, userId, reason, description);

    res.status(201).json({
      success: true,
      message: "Report submitted successfully",
      data: result,
      meta: {
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        error: "Validation failed",
        details: error.issues
      });
    }
    // Handle duplicate reports with proper HTTP status
    if (error instanceof Error && error.message === "You have already reported this comment") {
      return res.status(409).json({
        success: false,
        error: error.message
      });
    }
    console.error("Error in reportCommentController:", error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : "Failed to submit report"
    });
  }
}

export async function reportReplyController(req: Request, res: Response) {
  try {
    const userId = res.locals.auth?.userId;

    if (!userId) {
      return res.status(401).json({
        success: false,
        error: "Authentication required"
      });
    }

    const { replyId } = req.params;
    const { reason, description } = reportSchema.parse(req.body);

    const success = await reportReply(replyId as string, userId, reason, description);

    res.status(201).json({
      success: true,
      message: "Report submitted successfully",
      meta: {
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        error: "Validation failed",
        details: error.issues
      });
    }
    // Handle duplicate reports with proper HTTP status
    if (error instanceof Error && error.message === "You have already reported this reply") {
      return res.status(409).json({
        success: false,
        error: error.message
      });
    }
    console.error("Error in reportReplyController:", error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : "Failed to submit report"
    });
  }
}

// ==================== STATS CONTROLLER ====================

export async function getCommentStatsController(req: Request, res: Response) {
  try {
    const contentId = req.params.contentId as string;
    const stats = await getCommentStats(contentId);

    res.json({
      success: true,
      data: stats,
      meta: {
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error("Error in getCommentStatsController:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch comment stats"
    });
  }
}
