import { Router } from 'express';
import { TrendController } from '../controllers/trendController.js';

const router = Router();
const trendController = new TrendController();

/**
 * Trend routes
 * Base path: /api/trends
 */

// GET /api/trends/content/:bucket - Get trending content by bucket
router.get('/content/:bucket', trendController.getTrendingContent.bind(trendController));

// GET /api/trends/analytics - Get trend analytics
router.get('/analytics', trendController.getTrendAnalytics.bind(trendController));

// GET /api/trends/content/:contentId - Get trend signals for specific content
router.get('/content/:contentId/trends', trendController.getContentTrends.bind(trendController));

// POST /api/trends/refresh - Refresh trend signals
router.post('/refresh', trendController.refreshTrends.bind(trendController));

// POST /api/trends/analyze/:contentId - Manually trigger trend analysis for content
router.post('/analyze/:contentId', trendController.analyzeContentTrend.bind(trendController));

// POST /api/trends/cleanup - Clean up old inactive trends
router.post('/cleanup', trendController.cleanupOldTrends.bind(trendController));

export { router as trendRoutes };
