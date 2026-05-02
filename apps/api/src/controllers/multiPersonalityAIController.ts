import { Request, Response } from "express";
import { logger } from "../config/logger.js";
import { CommentModel } from "../models/Comment.js";
import { 
  createAICommentForComment, 
  shouldAIRespondToComment
} from "../services/aiCommentService.js";
import { AIMemoryService } from "../services/aiMemoryService.js";
import { AIModerationService } from "../services/aiModerationService.js";
import { classifyContent } from "../services/contentClassificationService.js";
import { 
  getAllPersonalities, 
  getPersonality, 
  routeToPersonality,
  type AIPersonalityId
} from "../services/personalityRouterService.js";

/**
 * Get all available AI personalities
 */
export async function getPersonalities(req: Request, res: Response) {
  try {
    const personalities = getAllPersonalities();
    
    res.json({
      success: true,
      data: personalities.map(p => ({
        id: p.id,
        name: p.name,
        displayName: p.displayName,
        description: p.description,
        avatar: p.avatar,
        expertise: p.expertise,
        triggers: p.triggers
      }))
    });
  } catch (error) {
    logger.error({ err: error }, "Failed to get AI personalities");
    res.status(500).json({
      success: false,
      error: "Failed to get AI personalities"
    });
  }
}

/**
 * Check if AI should respond to a comment
 */
export async function checkAIResponse(req: Request, res: Response) {
  try {
    const { commentId } = req.params;
    const { 
      recentCommentCount = 0,
      discussionActive = false,
      lastAIResponses = []
    } = req.body;

    const shouldRespond = await shouldAIRespondToComment(commentId as string, {
      recentCommentCount,
      discussionActive,
      lastAIResponses
    });

    res.json({
      success: true,
      data: {
        shouldRespond: shouldRespond.shouldRespond,
        reason: shouldRespond.reason
      }
    });
  } catch (error) {
    logger.error({ err: error, commentId: req.params.commentId }, "Failed to check AI response");
    res.status(500).json({
      success: false,
      error: "Failed to check AI response"
    });
  }
}

/**
 * Generate AI response for a comment
 */
export async function generateAIResponse(req: Request, res: Response) {
  try {
    const { commentId } = req.params;
    const { 
      recentCommentCount = 0,
      discussionActive = false,
      lastAIResponses = [],
      forceResponse = false
    } = req.body;

    // Check if AI should respond (unless forced)
    if (!forceResponse) {
      const shouldRespond = await shouldAIRespondToComment(commentId as string, {
        recentCommentCount,
        discussionActive,
        lastAIResponses
      });

      if (!shouldRespond.shouldRespond) {
        return res.json({
          success: true,
          data: {
            responseGenerated: false,
            reason: shouldRespond.reason
          }
        });
      }
    }

    // Get discussion context
    const sourceComment = await CommentModel.findById(commentId);
    if (!sourceComment) {
      return res.status(404).json({
        success: false,
        error: "Comment not found"
      });
    }

    const responseContext = await AIMemoryService.getResponseContext(
      sourceComment.contentId.toString(),
      "maat_sage" // Default personality, will be overridden by routing
    );

    // Generate AI response
    const aiCommentId = await createAICommentForComment(commentId as string, {
      recentCommentCount,
      discussionActive,
      lastAIResponses: lastAIResponses as { personalityId: AIPersonalityId; timestamp: number }[],
      discussionContext: responseContext.discussionContext,
      previousAIResponses: responseContext.previousAIResponses
    });

    if (!aiCommentId) {
      return res.json({
        success: true,
        data: {
          responseGenerated: false,
          reason: "AI response not generated"
        }
      });
    }

    // Store in memory
    const aiComment = await CommentModel.findById(aiCommentId);
    if (aiComment) {
      await AIMemoryService.storeAIResponse(
        aiCommentId,
        aiComment.aiPersona as AIPersonalityId,
        aiComment.body,
        responseContext.recentTopics,
        { positive: 0.5, negative: 0.3, neutral: 0.2 }, // Default sentiment
        commentId as string,
        sourceComment.contentId.toString()
      );
    }

    res.json({
      success: true,
      data: {
        responseGenerated: true,
        commentId: aiCommentId
      }
    });
  } catch (error) {
    logger.error({ err: error, commentId: req.params.commentId }, "Failed to generate AI response");
    res.status(500).json({
      success: false,
      error: "Failed to generate AI response"
    });
  }
}

/**
 * Moderate content for AI intervention
 */
export async function moderateContent(req: Request, res: Response) {
  try {
    const { text } = req.body;
    
    if (!text || typeof text !== 'string') {
      return res.status(400).json({
        success: false,
        error: "Text is required and must be a string"
      });
    }

    const moderation = await AIModerationService.moderateForAI(text);

    res.json({
      success: true,
      data: moderation
    });
  } catch (error) {
    logger.error({ err: error }, "Failed to moderate content");
    res.status(500).json({
      success: false,
      error: "Failed to moderate content"
    });
  }
}

/**
 * Classify content
 */
export async function classifyContentForAI(req: Request, res: Response) {
  try {
    const { text } = req.body;
    
    if (!text) {
      return res.status(400).json({
        success: false,
        error: "Text is required"
      });
    }

    const classification = await classifyContent(text);

    res.json({
      success: true,
      data: classification
    });
  } catch (error) {
    logger.error({ err: error }, "Failed to classify content");
    res.status(500).json({
      success: false,
      error: "Failed to classify content"
    });
  }
}

/**
 * Route content to best personality
 */
export async function routeToPersonalityEndpoint(req: Request, res: Response) {
  try {
    const { text } = req.body;
    const { 
      recentCommentCount = 0,
      discussionActive = false,
      lastAIResponses = []
    } = req.body;
    
    if (!text) {
      return res.status(400).json({
        success: false,
        error: "Text is required"
      });
    }

    const routing = await routeToPersonality(text, {
      recentCommentCount,
      discussionActive,
      lastAIResponses
    });

    res.json({
      success: true,
      data: routing
    });
  } catch (error) {
    logger.error({ err: error }, "Failed to route to personality");
    res.status(500).json({
      success: false,
      error: "Failed to route to personality"
    });
  }
}

/**
 * Get AI memory for a personality
 */
export async function getAIMemory(req: Request, res: Response) {
  try {
    const { personalityId } = req.params;
    const { limit = 10 } = req.query;

    const personality = getPersonality(personalityId as AIPersonalityId);
    if (!personality) {
      return res.status(404).json({
        success: false,
        error: "Personality not found"
      });
    }

    const memory = await AIMemoryService.getPersonalityMemory(
      personalityId as AIPersonalityId,
      Number(limit)
    );

    res.json({
      success: true,
      data: {
        personality: personalityId,
        memory,
        count: memory.length
      }
    });
  } catch (error) {
    logger.error({ err: error, personalityId: req.params.personalityId }, "Failed to get AI memory");
    res.status(500).json({
      success: false,
      error: "Failed to get AI memory"
    });
  }
}

/**
 * Get discussion context
 */
export async function getDiscussionContext(req: Request, res: Response) {
  try {
    const { contentId } = req.params;
    const { limit = 10 } = req.query;

    const context = await AIMemoryService.getDiscussionContext(
      contentId as string,
      Number(limit)
    );

    res.json({
      success: true,
      data: context
    });
  } catch (error) {
    logger.error({ err: error, contentId: req.params.contentId }, "Failed to get discussion context");
    res.status(500).json({
      success: false,
      error: "Failed to get discussion context"
    });
  }
}

/**
 * Trigger AI response for recent comments (batch processing)
 */
export async function triggerAIResponses(req: Request, res: Response) {
  try {
    const { contentId, maxComments = 5 } = req.body;

    // Get recent comments without AI responses
    const recentComments = await CommentModel.find({
      contentId,
      aiGenerated: { $ne: true },
      isDeleted: false,
      hidden: false,
      moderationStatus: "approved"
    })
    .sort({ createdAt: -1 })
    .limit(maxComments)
    .lean()
    .exec();

    const results = [];

    for (const comment of recentComments) {
      try {
        // Check if AI already responded
        const existingAIResponse = await CommentModel.findOne({
          inReplyToCommentId: comment._id,
          aiGenerated: true
        });

        if (existingAIResponse) {
          results.push({
            commentId: comment._id,
            responseGenerated: false,
            reason: "AI already responded"
          });
          continue;
        }

        // Generate response
        const aiCommentId = await createAICommentForComment(
          (comment._id as any).toString(),
          {
            recentCommentCount: recentComments.length,
            discussionActive: true,
            lastAIResponses: []
          }
        );

        results.push({
          commentId: (comment._id as any).toString(),
          responseGenerated: !!aiCommentId,
          aiCommentId,
          reason: aiCommentId ? "Response generated" : "Response not generated"
        });
      } catch (error) {
        logger.warn({ err: error, commentId: comment._id }, "Failed to generate AI response for comment");
        results.push({
          commentId: (comment._id as any).toString(),
          responseGenerated: false,
          reason: "Error generating response"
        });
      }
    }

    res.json({
      success: true,
      data: {
        processed: recentComments.length,
        results
      }
    });
  } catch (error) {
    logger.error({ err: error }, "Failed to trigger AI responses");
    res.status(500).json({
      success: false,
      error: "Failed to trigger AI responses"
    });
  }
}
