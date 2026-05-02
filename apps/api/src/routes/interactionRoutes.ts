import { Router } from "express";
import {
  likeContentController,
  saveContentController,
  shareContentController,
  trackWatchController,
  getEngagementController
} from "../controllers/interactionController.js";
import { optionalAuth, requireVerifiedEmail, optionalAuthWithVerification } from "../middleware/auth.js";

export const interactionRouter = Router();

// GET /api/interactions/engagement/:contentId - Public read
interactionRouter.get("/engagement/:contentId", optionalAuth, getEngagementController);

// Write operations require verified email
// POST /api/interactions/like - Requires verified email
interactionRouter.post("/like", requireVerifiedEmail, likeContentController);

// POST /api/interactions/save - Requires verified email
interactionRouter.post("/save", requireVerifiedEmail, saveContentController);

// POST /api/interactions/share - Requires verified email (internal share with counter)
// Note: External sharing (copy link) is client-side and doesn't require auth
interactionRouter.post("/share", requireVerifiedEmail, shareContentController);

// POST /api/interactions/watch - Open to all for anonymous trending stats
// If authenticated with verified email, also updates personalized history
// This allows algorithm to learn from ALL viewers while respecting privacy
interactionRouter.post("/watch", optionalAuthWithVerification, trackWatchController);
