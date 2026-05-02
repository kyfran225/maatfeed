import { Router } from "express";
import {
  getPersonalities,
  checkAIResponse,
  generateAIResponse,
  moderateContent,
  classifyContentForAI,
  routeToPersonalityEndpoint,
  getAIMemory,
  getDiscussionContext,
  triggerAIResponses
} from "../controllers/multiPersonalityAIController.js";
import { requireVerifiedEmail } from "../middleware/auth.js";

const router = Router();

/**
 * GET /api/ai/personalities
 * Get all available AI personalities
 */
router.get("/personalities", getPersonalities);

/**
 * POST /api/ai/moderate
 * Moderate content for AI intervention
 */
router.post("/moderate", moderateContent);

/**
 * POST /api/ai/classify
 * Classify content for AI routing
 */
router.post("/classify", classifyContentForAI);

/**
 * POST /api/ai/route
 * Route content to best personality
 */
router.post("/route", routeToPersonalityEndpoint);

/**
 * POST /api/ai/comments/:commentId/check
 * Check if AI should respond to a comment
 */
router.post("/comments/:commentId/check", checkAIResponse);

/**
 * POST /api/ai/comments/:commentId/respond
 * Generate AI response for a comment
 */
router.post("/comments/:commentId/respond", requireVerifiedEmail, generateAIResponse);

/**
 * GET /api/ai/memory/:personalityId
 * Get AI memory for a personality
 */
router.get("/memory/:personalityId", getAIMemory);

/**
 * GET /api/ai/context/:contentId
 * Get discussion context for content
 */
router.get("/context/:contentId", getDiscussionContext);

/**
 * POST /api/ai/trigger
 * Trigger AI responses for recent comments (batch processing)
 */
router.post("/trigger", triggerAIResponses);

export default router;
