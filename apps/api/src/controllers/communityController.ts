import { Request, Response } from "express";
import { z } from "zod";
import {
  createDebateThread,
  getDebateThread,
  getTopDebates,
  rankDebateThread,
  boostHighDebateComments
} from "../services/communityService.js";
import { reportComment } from "../services/commentService.js";
import {
  getCommunityAnalyticsSummary,
  recordCommunityAnalyticsEvent,
  recordCommunityInteraction,
  type DiscussionAnalyticsEventName
} from "../services/interactionService.js";
import { refreshCommunityDiscussionScore } from "../services/communityScoreService.js";

const createDebateThreadSchema = z.object({
  contentId: z.string().min(1, "Content ID is required"),
  title: z.string().min(1, "Title is required").max(200, "Title too long"),
  description: z.string().min(1, "Description is required").max(1000, "Description too long"),
  tags: z.array(z.string()).optional()
});

const getDebateThreadSchema = z.object({
  contentId: z.string().min(1, "Content ID is required")
});

const getTopDebatesSchema = z.object({
  limit: z.string().transform(Number).refine(n => n > 0 && n <= 100, "Limit must be between 1 and 100").optional().default(20)
});

const communityReportSchema = z.object({
  commentId: z.string().min(1, "Comment ID is required"),
  reason: z.enum(["spam", "harassment", "hate_speech", "misinformation", "inappropriate", "other"]),
  description: z.string().max(500).optional()
});

const adminModerationSchema = z.object({
  commentId: z.string().min(1, "Comment ID is required"),
  status: z.enum(["approved", "hidden", "blocked"]),
  note: z.string().max(500).optional().default("")
});

const communityInteractionSchema = z.object({
  contentId: z.string().min(1, "Content ID is required"),
  type: z.enum(["comment", "like", "report", "reply"]),
  analysis: z.object({
    debateScore: z.number().min(0).max(1).optional(),
    questionScore: z.number().min(0).max(1).optional()
  }).optional()
});

const communityAnalyticsSchema = z.object({
  contentId: z.string().min(1, "Content ID is required"),
  eventName: z.enum([
    "discussion_sort_selected",
    "discussion_reply_opened",
    "discussion_reply_mode_selected",
    "discussion_reply_submitted"
  ]),
  metadata: z.object({
    surface: z.string().optional(),
    sortBy: z.enum(["relevant", "newest", "popular", "debated"]).optional(),
    replyMode: z.enum(["flat", "nested"]).optional(),
    targetType: z.enum(["comment", "flat_reply", "nested_reply"]).optional(),
    targetId: z.string().optional(),
    parentCommentId: z.string().optional()
  }).passthrough().optional()
});

export async function createDebateThreadController(req: Request, res: Response) {
  try {
    const userId = res.locals.auth?.userId;
    
    if (!userId) {
      return res.status(401).json({
        success: false,
        error: "Authentication required"
      });
    }

    const validated = createDebateThreadSchema.parse(req.body);
    
    const debateThread = await createDebateThread(validated);
    
    res.status(201).json({
      success: true,
      data: debateThread,
      meta: {
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error("Error in createDebateThreadController:", error);
    res.status(500).json({
      success: false,
      error: "Failed to create debate thread"
    });
  }
}

export async function getDebateThreadController(req: Request, res: Response) {
  try {
    const { contentId } = getDebateThreadSchema.parse(req.params);
    
    const debateThread = await getDebateThread(contentId);
    
    if (!debateThread) {
      return res.status(404).json({
        success: false,
        error: "Debate thread not found"
      });
    }
    
    res.json({
      success: true,
      data: debateThread,
      meta: {
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error("Error in getDebateThreadController:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch debate thread"
    });
  }
}

export async function getTopDebatesController(req: Request, res: Response) {
  try {
    const { limit } = getTopDebatesSchema.parse(req.query);
    
    const debates = await getTopDebates(limit);
    
    res.json({
      success: true,
      data: debates,
      meta: {
        count: debates.length,
        limit,
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error("Error in getTopDebatesController:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch top debates"
    });
  }
}

export async function rankDebateThreadController(req: Request, res: Response) {
  try {
    const userId = res.locals.auth?.userId;
    
    if (!userId) {
      return res.status(401).json({
        success: false,
        error: "Authentication required"
      });
    }

    const { contentId } = getDebateThreadSchema.parse(req.params);
    
    await rankDebateThread(contentId);
    
    res.json({
      success: true,
      meta: {
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error("Error in rankDebateThreadController:", error);
    res.status(500).json({
      success: false,
      error: "Failed to rank debate thread"
    });
  }
}

export async function boostHighDebateCommentsController(req: Request, res: Response) {
  try {
    const userId = res.locals.auth?.userId;
    
    if (!userId) {
      return res.status(401).json({
        success: false,
        error: "Authentication required"
      });
    }

    const { contentId } = getDebateThreadSchema.parse(req.params);
    
    await boostHighDebateComments(contentId);
    
    res.json({
      success: true,
      meta: {
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error("Error in boostHighDebateCommentsController:", error);
    res.status(500).json({
      success: false,
      error: "Failed to boost high debate comments"
    });
  }
}

export async function communityReportController(req: Request, res: Response) {
  try {
    const userId = res.locals.auth?.userId;

    if (!userId) {
      return res.status(401).json({
        success: false,
        error: "Authentication required"
      });
    }

    const validated = communityReportSchema.parse(req.body);
    const result = await reportComment(validated.commentId, userId, validated.reason, validated.description);

    res.status(201).json({
      success: true,
      data: result,
      meta: {
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error("Error in communityReportController:", error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : "Failed to report comment"
    });
  }
}

export async function adminModerateCommunityCommentController(req: Request, res: Response) {
  try {
    const userId = res.locals.auth?.userId;
    const role = res.locals.auth?.role;

    if (!userId) {
      return res.status(401).json({
        success: false,
        error: "Authentication required"
      });
    }

    if (role !== "admin") {
      return res.status(403).json({
        success: false,
        error: "Admin role required"
      });
    }

    const validated = adminModerationSchema.parse(req.body);
    const { CommentModel } = await import("../models/Comment.js");

    const updatedComment = await CommentModel.findByIdAndUpdate(
      validated.commentId,
      {
        $set: {
          moderationStatus: validated.status,
          moderationReason: validated.note || `Admin moderation: ${validated.status}`,
          hidden: validated.status !== "approved",
          hiddenAt: validated.status !== "approved" ? new Date() : null,
          hiddenBy: validated.status !== "approved" ? userId : null,
          adminOverride: true
        }
      },
      { new: true }
    ).lean() as { _id: { toString(): string }; contentId: { toString(): string } } | null;

    if (!updatedComment) {
      return res.status(404).json({
        success: false,
        error: "Comment not found"
      });
    }

    await refreshCommunityDiscussionScore(updatedComment.contentId.toString());

    res.json({
      success: true,
      data: {
        commentId: updatedComment._id.toString(),
        status: validated.status
      },
      meta: {
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error("Error in adminModerateCommunityCommentController:", error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : "Failed to moderate comment"
    });
  }
}

export async function trackCommunityInteractionController(req: Request, res: Response) {
  try {
    const userId = res.locals.auth?.userId;
    const sessionId = req.headers["x-session-id"] as string | undefined;
    const validated = communityInteractionSchema.parse(req.body);

    await recordCommunityInteraction({
      contentId: validated.contentId,
      type: validated.type,
      userId,
      sessionId,
      analysis: validated.analysis
    });

    res.status(201).json({
      success: true,
      data: {
        tracked: true,
        type: validated.type
      },
      meta: {
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error("Error in trackCommunityInteractionController:", error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : "Failed to track interaction"
    });
  }
}

export async function trackCommunityAnalyticsController(req: Request, res: Response) {
  try {
    const userId = res.locals.auth?.userId;
    const sessionId = req.headers["x-session-id"] as string | undefined;
    const validated = communityAnalyticsSchema.parse(req.body);

    await recordCommunityAnalyticsEvent({
      contentId: validated.contentId,
      eventName: validated.eventName as DiscussionAnalyticsEventName,
      userId,
      sessionId,
      metadata: validated.metadata
    });

    res.status(201).json({
      success: true,
      data: {
        tracked: true,
        eventName: validated.eventName
      },
      meta: {
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error("Error in trackCommunityAnalyticsController:", error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : "Failed to track discussion analytics"
    });
  }
}

export async function getCommunityAnalyticsSummaryController(req: Request, res: Response) {
  try {
    const { contentId } = getDebateThreadSchema.parse(req.params);
    const summary = await getCommunityAnalyticsSummary(contentId);

    res.json({
      success: true,
      data: summary,
      meta: {
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error("Error in getCommunityAnalyticsSummaryController:", error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : "Failed to fetch discussion analytics"
    });
  }
}
