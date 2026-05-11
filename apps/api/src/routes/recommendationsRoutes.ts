import { Router } from 'express';
import {
  getRecommendationsController,
  getContentBasedRecommendationsController,
  getCollaborativeRecommendationsController,
  getTrendingRecommendationsController,
  getPersonalizedRecommendationsController,
  getTrendingTopicsController,
  getDiscoveryInsightsController,
  getRelatedContentController,
  getRecommendationPreferencesController,
  updateRecommendationPreferencesController
} from '../controllers/recommendationsController.js';
import { authenticateToken } from '../middleware/authMiddleware.js';

const router = Router();

/**
 * @route GET /api/recommendations
 * @desc Get personalized recommendations for user
 * @access Public (with optional auth for personalization)
 */
router.get('/', getRecommendationsController);

/**
 * @route GET /api/recommendations/content-based
 * @desc Get content-based recommendations
 * @access Public (with optional auth for personalization)
 */
router.get('/content-based', getContentBasedRecommendationsController);

/**
 * @route GET /api/recommendations/collaborative
 * @desc Get collaborative filtering recommendations
 * @access Private (requires authentication)
 */
router.get('/collaborative', authenticateToken, getCollaborativeRecommendationsController);

/**
 * @route GET /api/recommendations/trending
 * @desc Get trending recommendations
 * @access Public (with optional auth for personalization)
 */
router.get('/trending', getTrendingRecommendationsController);

/**
 * @route GET /api/recommendations/personalized
 * @desc Get ML-powered personalized recommendations
 * @access Public (with optional auth for personalization)
 */
router.get('/personalized', getPersonalizedRecommendationsController);

/**
 * @route GET /api/recommendations/trending-topics
 * @desc Get trending topics
 * @access Public
 */
router.get('/trending-topics', getTrendingTopicsController);

/**
 * @route GET /api/recommendations/discovery
 * @desc Get discovery insights
 * @access Public (with optional auth for personalization)
 */
router.get('/discovery', getDiscoveryInsightsController);

/**
 * @route GET /api/recommendations/related/:contentId
 * @desc Get related content for a specific content item
 * @access Public (with optional auth for personalization)
 */
router.get('/related/:contentId', getRelatedContentController);

/**
 * @route GET /api/recommendations/preferences
 * @desc Get user recommendation preferences
 * @access Private
 */
router.get('/preferences', authenticateToken, getRecommendationPreferencesController);

/**
 * @route PUT /api/recommendations/preferences
 * @desc Update user recommendation preferences
 * @access Private
 */
router.put('/preferences', authenticateToken, updateRecommendationPreferencesController);

export default router;
