import { Router } from "express";
import {
  getGlobalFeedController,
  getPersonalizedFeedController,
  getSessionFeedController,
  updateSessionFeedController
} from "../controllers/feedController.js";
import { optionalAuth } from "../middleware/auth.js";

const router = Router();

// GET /api/feed/global - Global anonymous feed
router.get("/global", getGlobalFeedController);

// GET /api/feed/personalized - Authenticated user personalized feed  
router.get("/personalized", optionalAuth, getPersonalizedFeedController);

// GET /api/feed/session - Session-based feed state
router.get("/session", getSessionFeedController);

// POST /api/feed/session - Update session feed state
router.post("/session", updateSessionFeedController);

export default router;
