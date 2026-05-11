import { Router } from 'express';
import { z } from 'zod';
import { ContentModel, IContent } from '../models/Content.js';
import { DebateModel } from '../models/Debate.js';
import { ReactionModel } from '../models/Reaction.js';
import { feedService } from '../services/feedService.js';
import { authenticateToken, AuthenticatedRequest, requireRole } from '../middleware/authMiddleware.js';
import { logger } from '../config/logger.js';

const router = Router();

// Validation schemas
const createContentSchema = z.object({
  title: z.string().min(1).max(200),
  description: z.string().min(1).max(2000),
  mediaType: z.enum(['audio', 'video', 'text']).default('text'),
  mediaUrl: z.string().url().optional(),
  thumbnailUrl: z.string().url().optional(),
  duration: z.number().positive().optional(),
  tags: z.array(z.string().min(1).max(50)).max(10),
  category: z.enum(['debate', 'music', 'podcast', 'news', 'education', 'entertainment', 'sports', 'technology', 'business', 'health', 'other']),
  language: z.string().min(2).max(5).default('fr'),
  sourceProvider: z.enum(['internal', 'youtube', 'tiktok', 'community']).default('internal'),
  externalId: z.string().optional(),
  sourceUrl: z.string().url().optional(),
  hasDebate: z.boolean().default(false)
});

const updateContentSchema = createContentSchema.partial();

const reactionSchema = z.object({
  type: z.enum(['like', 'love', 'laugh', 'angry', 'sad', 'save', 'share'])
});

// Create content
router.post('/', authenticateToken, async (req: AuthenticatedRequest, res) => {
  try {
    const validatedData = createContentSchema.parse(req.body);
    
    const content = new ContentModel({
      ...validatedData,
      creatorId: req.user?.userId,
      creatorName: req.user?.username || 'Anonymous',
      isPublished: true,
      publishedAt: new Date()
    });

    await content.save();

    // Create debate if requested
    if (validatedData.hasDebate) {
      const debate = new DebateModel({
        contentId: content._id,
        title: `Débat: ${validatedData.title}`,
        description: validatedData.description,
        creatorId: req.user?.userId,
        creatorName: req.user?.username || 'Anonymous',
        status: 'active'
      });

      await debate.save();

      // Update content with debate reference
      content.debateId = debate._id;
      await content.save();
    }

    // Update feed service metrics
    await feedService.updateEngagementMetrics(content._id.toString(), {
      views: 1
    });

    logger.info({ 
      contentId: content._id, 
      userId: req.user?.userId,
      hasDebate: validatedData.hasDebate 
    }, 'Content created successfully');

    res.status(201).json({
      success: true,
      data: {
        id: content._id,
        title: content.title,
        description: content.description,
        mediaType: content.mediaType,
        mediaUrl: content.mediaUrl,
        thumbnailUrl: content.thumbnailUrl,
        duration: content.duration,
        creatorId: content.creatorId,
        creatorName: content.creatorName,
        tags: content.tags,
        category: content.category,
        language: content.language,
        hasDebate: content.hasDebate,
        debateId: content.debateId,
        publishedAt: content.publishedAt,
        createdAt: content.createdAt,
        score: content.score,
        views: content.views,
        likes: content.likes,
        shares: content.shares,
        comments: content.comments
      }
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        error: 'Validation error',
        details: error.issues
      });
    }

    logger.error({ error: (error as Error).message }, 'Failed to create content');
    res.status(500).json({
      success: false,
      error: 'Failed to create content',
      message: 'Internal server error'
    });
  }
});

// Get content by ID
router.get('/:id', async (req, res) => {
  try {
    const content = await ContentModel
      .findOne({ _id: req.params.id, isDeleted: false })
      .populate('debateId', 'status participants')
      .populate('creatorId', 'username avatar')
      .lean();

    if (!content) {
      return res.status(404).json({
        success: false,
        error: 'Content not found'
      });
    }

    // Update view count
    await ContentModel.updateOne(
      { _id: req.params.id },
      { $inc: { views: 1 } }
    );

    // Update feed service metrics
    await feedService.updateEngagementMetrics(req.params.id, {
      views: 1
    });

    res.json({
      success: true,
      data: content
    });
  } catch (error) {
    logger.error({ error: (error as Error).message, contentId: req.params.id }, 'Failed to get content');
    res.status(500).json({
      success: false,
      error: 'Failed to get content',
      message: 'Internal server error'
    });
  }
});

// Update content
router.put('/:id', authenticateToken, async (req: AuthenticatedRequest, res) => {
  try {
    const validatedData = updateContentSchema.parse(req.body);
    
    const content = await ContentModel.findOne({
      _id: req.params.id,
      creatorId: req.user?.userId,
      isDeleted: false
    });

    if (!content) {
      return res.status(404).json({
        success: false,
        error: 'Content not found or access denied'
      });
    }

    Object.assign(content, validatedData);
    content.updatedAt = new Date();
    await content.save();

    logger.info({ contentId: req.params.id, userId: req.user?.userId }, 'Content updated successfully');

    res.json({
      success: true,
      data: content
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        error: 'Validation error',
        details: error.issues
      });
    }

    logger.error({ error: (error as Error).message, contentId: req.params.id }, 'Failed to update content');
    res.status(500).json({
      success: false,
      error: 'Failed to update content',
      message: 'Internal server error'
    });
  }
});

// Delete content (soft delete)
router.delete('/:id', authenticateToken, async (req: AuthenticatedRequest, res) => {
  try {
    const content = await ContentModel.findOne({
      _id: req.params.id,
      creatorId: req.user?.userId,
      isDeleted: false
    });

    if (!content) {
      return res.status(404).json({
        success: false,
        error: 'Content not found or access denied'
      });
    }

    // Soft delete
    content.isDeleted = true;
    content.deletedAt = new Date();
    await content.save();

    logger.info({ contentId: req.params.id, userId: req.user?.userId }, 'Content deleted successfully');

    res.json({
      success: true,
      message: 'Content deleted successfully'
    });
  } catch (error) {
    logger.error({ error: (error as Error).message, contentId: req.params.id }, 'Failed to delete content');
    res.status(500).json({
      success: false,
      error: 'Failed to delete content',
      message: 'Internal server error'
    });
  }
});

// Add/remove reaction
router.post('/:id/react', authenticateToken, async (req: AuthenticatedRequest, res) => {
  try {
    const validatedData = reactionSchema.parse(req.body);
    const { type } = validatedData;

    // Check if reaction already exists
    const existingReaction = await ReactionModel.findOne({
      userId: req.user?.userId,
      contentId: req.params.id,
      type
    });

    if (existingReaction) {
      // Toggle reaction (remove if exists)
      await ReactionModel.updateOne(
        { _id: existingReaction._id },
        { isActive: !existingReaction.isActive }
      );

      const increment = existingReaction.isActive ? -1 : 1;
      await ContentModel.updateOne(
        { _id: req.params.id },
        { $inc: { [type === 'like' ? 'likes' : 'shares']: increment } }
      );

      // Update feed service metrics
      await feedService.updateEngagementMetrics(Array.isArray(req.params.id) ? req.params.id[0] : req.params.id, {
        [type === 'like' ? 'likes' : 'shares']: increment
      });

      return res.json({
        success: true,
        data: {
          reaction: existingReaction.isActive ? 'removed' : 'added',
          type
        }
      });
    }

    // Create new reaction
    const reaction = new ReactionModel({
      userId: req.user?.userId,
      contentId: req.params.id,
      type,
      isActive: true
    });

    await reaction.save();

    // Update content metrics
    const increment = type === 'like' ? 1 : 0;
    await ContentModel.updateOne(
      { _id: req.params.id },
      { $inc: { likes: increment } }
    );

    // Update feed service metrics
    await feedService.updateEngagementMetrics(Array.isArray(req.params.id) ? req.params.id[0] : req.params.id, {
      likes: increment
    });

    logger.info({ 
      contentId: req.params.id, 
      userId: req.user?.userId, 
      reactionType: type 
    }, 'Reaction added successfully');

    res.status(201).json({
      success: true,
      data: {
        reaction: 'added',
        type
      }
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        error: 'Validation error',
        details: error.issues
      });
    }

    logger.error({ error: (error as Error).message, contentId: req.params.id }, 'Failed to handle reaction');
    res.status(500).json({
      success: false,
      error: 'Failed to handle reaction',
      message: 'Internal server error'
    });
  }
});

// Get user's content
router.get('/user/:userId', async (req, res) => {
  try {
    const limit = Math.min(parseInt(req.query.limit as string) || 20, 50);
    const offset = Math.max(parseInt(req.query.offset as string) || 0, 0);

    const content = await ContentModel
      .find({
        creatorId: req.params.userId,
        isDeleted: false,
        isPublished: true
      })
      .populate('debateId', 'status participants')
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip(offset)
      .lean();

    const total = await ContentModel.countDocuments({
      creatorId: req.params.userId,
      isDeleted: false,
      isPublished: true
    });

    res.json({
      success: true,
      data: content,
      meta: {
        count: content.length,
        total,
        limit,
        offset,
        hasMore: offset + content.length < total
      }
    });
  } catch (error) {
    logger.error({ error: (error as Error).message, userId: req.params.userId }, 'Failed to get user content');
    res.status(500).json({
      success: false,
      error: 'Failed to get user content',
      message: 'Internal server error'
    });
  }
});

export default router;
