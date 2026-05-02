import { Router } from "express";
import {
  createCommunityPostController,
  getCommunityPostsController,
  getCommunityPostController,
  updateCommunityPostController,
  deleteCommunityPostController,
  upvotePostController,
  // getTrendingTopicsController, // Désactivé temporairement
  getContradictionsController,
  generateSummaryController,
  getPersonalizedSuggestionsController,
  getIntegrationStatsController
} from "../controllers/communityPostController.js";
import { requireAuth } from "../middleware/auth.js";

const router = Router();

// Posts communautaires - routes principales
router.post("/", requireAuth, createCommunityPostController);
router.get("/", getCommunityPostsController);

// Routes spécifiques avec noms uniques pour éviter les conflits
// router.get("/trending/:timeframe?", getTrendingTopicsController); // Désactivé temporairement
router.get("/contradictions/:topic", getContradictionsController);
router.get("/suggestions/personalized", requireAuth, getPersonalizedSuggestionsController);
router.get("/stats/integration", getIntegrationStatsController);

// Routes pour les posts spécifiques (avec postId)
router.get("/:postId", getCommunityPostController);
router.put("/:postId", requireAuth, updateCommunityPostController);
router.delete("/:postId", requireAuth, deleteCommunityPostController);
router.post("/:postId/upvote", requireAuth, upvotePostController);
router.post("/:postId/summary", requireAuth, generateSummaryController);

export { router as communityPostRoutes };
