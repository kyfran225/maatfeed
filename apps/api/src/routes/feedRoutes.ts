import { Router } from 'express';
import { z } from 'zod';
import { feedService, FeedOptions } from '../services/feedService.js';
import { authenticateToken, AuthenticatedRequest } from '../middleware/authMiddleware.js';
import { logger } from '../config/logger.js';

const router = Router();

// Validation schemas
const feedQuerySchema = z.object({
  limit: z.coerce.number().int().positive().max(100).default(20),
  offset: z.coerce.number().int().min(0).default(0),
  category: z.enum(['debate', 'music', 'podcast', 'news', 'education', 'entertainment', 'sports', 'technology', 'business', 'health', 'other', 'all']).default('all'),
  language: z.string().default('fr'),
  tags: z.string().optional().transform(val => val ? val.split(',').map(tag => tag.trim()) : []),
  includeDebates: z.coerce.boolean().default(true),
  timeRange: z.enum(['hour', 'day', 'week', 'month', 'all']).default('all'),
  sortBy: z.enum(['score', 'recent', 'trending', 'popular']).default('score')
});

// Get personalized feed
router.get('/personalized', authenticateToken, async (req: AuthenticatedRequest, res) => {
  try {
    const validatedQuery = feedQuerySchema.parse(req.query);
    
    const feedOptions: FeedOptions = {
      userId: req.user?.userId,
      ...validatedQuery
    };

    const feed = await feedService.getPersonalizedFeed(feedOptions.userId, feedOptions.offset?.toString(), feedOptions.limit);

    res.json({
      success: true,
      data: feed,
      meta: {
        count: feed.length,
        limit: validatedQuery.limit,
        offset: validatedQuery.offset,
        hasMore: feed.length === validatedQuery.limit
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

    logger.error({ error: (error as Error).message }, 'Failed to get personalized feed');
    res.status(500).json({
      success: false,
      error: 'Failed to get feed',
      message: 'Internal server error'
    });
  }
});

// Get trending content
router.get('/trending', async (req, res) => {
  try {
    const limit = Math.min(parseInt(req.query.limit as string) || 10, 50);
    
    const trending = await feedService.getGlobalFeed(undefined, limit);

    res.json({
      success: true,
      data: trending,
      meta: {
        count: trending.length,
        limit
      }
    });
  } catch (error) {
    logger.error({ error: (error as Error).message }, 'Failed to get trending content');
    res.status(500).json({
      success: false,
      error: 'Failed to get trending content',
      message: 'Internal server error'
    });
  }
});

// Get categories
router.get('/categories', async (req, res) => {
  try {
    const categories = [
      { value: 'debate', label: 'Débats', color: '#FF6B35' },
      { value: 'music', label: 'Musique', color: '#1DB954' },
      { value: 'podcast', label: 'Podcasts', color: '#FF6B35' },
      { value: 'news', label: 'Actualités', color: '#FF6B35' },
      { value: 'education', label: 'Éducation', color: '#1DB954' },
      { value: 'entertainment', label: 'Divertissement', color: '#FF6B35' },
      { value: 'sports', label: 'Sports', color: '#1DB954' },
      { value: 'technology', label: 'Technologie', color: '#FF6B35' },
      { value: 'business', label: 'Business', color: '#1DB954' },
      { value: 'health', label: 'Santé', color: '#FF6B35' },
      { value: 'other', label: 'Autre', color: '#6B7280' }
    ];

    res.json({
      success: true,
      data: categories
    });
  } catch (error) {
    logger.error({ error: (error as Error).message }, 'Failed to get categories');
    res.status(500).json({
      success: false,
      error: 'Failed to get categories',
      message: 'Internal server error'
    });
  }
});

export default router;
