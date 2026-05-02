import { Router } from "express";
import {
  getTopDebatesController,
  getDebateThreadController,
  createDebateThreadController
} from "../controllers/simpleDebatesController.js";
import {
  getDebateAIPersonalitiesController,
  getDebateStatsController,
  getDebateAISummaryController
} from "../controllers/debateDetailsController.js";
import {
  rankDebateThreadController,
  boostHighDebateCommentsController,
  communityReportController,
  adminModerateCommunityCommentController,
  trackCommunityInteractionController,
  trackCommunityAnalyticsController,
  getCommunityAnalyticsSummaryController
} from "../controllers/communityController.js";
import { requireAuth, optionalAuth, optionalAuthWithVerification, requireVerifiedEmail } from "../middleware/auth.js";

const router = Router();

// GET /api/community/debates - Get top debate threads
router.get("/debates", optionalAuth, getTopDebatesController);

// POST /api/community/debates - Create new debate thread (authenticated users)
router.post("/debates", requireAuth, createDebateThreadController);

// GET /api/community/debates/:contentId - Get debate thread for specific content
router.get("/debates/:contentId", optionalAuth, getDebateThreadController);

// GET /api/community/debates/:contentId/ai-personalities - Get AI personalities in debate
router.get("/debates/:contentId/ai-personalities", optionalAuth, getDebateAIPersonalitiesController);

// GET /api/community/debates/:contentId/stats - Get debate statistics
router.get("/debates/:contentId/stats", optionalAuth, getDebateStatsController);

// GET /api/community/debates/:contentId/ai-summary - Get AI summary of debate
router.get("/debates/:contentId/ai-summary", optionalAuth, getDebateAISummaryController);

// GET /api/community/debates/:contentId/interaction-analytics - Discussion analytics summary
router.get("/debates/:contentId/interaction-analytics", optionalAuth, getCommunityAnalyticsSummaryController);

// POST /api/community/debates/:contentId/rank - Rank debate thread (admin/moderator only)
router.post("/debates/:contentId/rank", requireAuth, rankDebateThreadController);

// POST /api/community/debates/:contentId/boost - Boost high debate comments (admin/moderator only)
router.post("/debates/:contentId/boost", requireAuth, boostHighDebateCommentsController);

// POST /api/community/report - Community moderation signal
router.post("/report", requireVerifiedEmail, communityReportController);

// POST /api/community/moderate/admin - Admin override moderation
router.post("/moderate/admin", requireAuth, adminModerateCommunityCommentController);

// POST /api/community/interaction - Track community interactions and profile learning
router.post("/interaction", optionalAuthWithVerification, trackCommunityInteractionController);

// POST /api/community/analytics - Track discussion UX analytics without affecting engagement scores
router.post("/analytics", optionalAuthWithVerification, trackCommunityAnalyticsController);

export default router;
