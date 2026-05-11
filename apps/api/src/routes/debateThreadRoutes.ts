import { Router } from "express";
import {
  getDebateThreadController,
  addReplyController,
  addAIReplyController,
  toggleCommentPinController,
  getThreadStatsController,
  searchThreadController,
  getThreadTimelineController
} from "../controllers/debateThreadController.js";
import { requireAuth } from "../middleware/auth.js";
import { rateLimit } from "express-rate-limit";

const router = Router();

// Rate limiting for different endpoints
const readRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: {
    success: false,
    error: "Too many requests, please try again later"
  }
});

const writeRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20, // limit each IP to 20 write requests per windowMs
  message: {
    success: false,
    error: "Too many requests, please try again later"
  }
});

// Get debate thread with hierarchical structure
// GET /api/debates/:contentId/thread
router.get("/:contentId/thread", 
  requireAuth, 
  readRateLimit, 
  getDebateThreadController
);

// Get thread statistics and analytics
// GET /api/debates/:contentId/stats
router.get("/:contentId/stats", 
  requireAuth, 
  readRateLimit, 
  getThreadStatsController
);

// Search within a debate thread
// GET /api/debates/:contentId/search
router.get("/:contentId/search", 
  requireAuth, 
  readRateLimit, 
  searchThreadController
);

// Get thread timeline (chronological view)
// GET /api/debates/:contentId/timeline
router.get("/:contentId/timeline", 
  requireAuth, 
  readRateLimit, 
  getThreadTimelineController
);

// Add a reply to a comment in the thread
// POST /api/debates/:contentId/comments/:commentId/reply
router.post("/:contentId/comments/:commentId/reply", 
  requireAuth, 
  writeRateLimit, 
  addReplyController
);

// Add an AI-generated reply to a comment
// POST /api/debates/:contentId/comments/:commentId/ai-reply
router.post("/:contentId/comments/:commentId/ai-reply", 
  requireAuth, 
  writeRateLimit, 
  addAIReplyController
);

// Pin/unpin a comment (moderator only)
// PATCH /api/debates/comments/:commentId/pin
router.patch("/comments/:commentId/pin", 
  requireAuth, 
  writeRateLimit, 
  toggleCommentPinController
);

export default router;
