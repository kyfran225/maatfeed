import { Router } from "express";
import { creatorAIController } from "../controllers/creatorAIController";
import { requireAuth } from "../middleware/auth";

const router = Router();

// Apply authentication middleware to all routes
router.use(requireAuth);

// Content AI features
router.post("/content/:contentId/summary", creatorAIController.generateContentSummary.bind(creatorAIController));
router.post("/creator/:creatorId/suggestions", creatorAIController.generateContentSuggestions.bind(creatorAIController));
router.post("/creator/:creatorId/insights", creatorAIController.generateAudienceInsights.bind(creatorAIController));
router.post("/creator/:creatorId/schedule", creatorAIController.generateOptimalSchedule.bind(creatorAIController));
router.post("/creator/:creatorId/titles", creatorAIController.generateTitleSuggestions.bind(creatorAIController));

// Advanced AI Assistant features
router.get("/creator/:creatorId/ai-suggestions", creatorAIController.generateAISuggestions.bind(creatorAIController));
router.post("/content/:contentId/optimize", creatorAIController.optimizeContent.bind(creatorAIController));
router.post("/creator/:creatorId/apply-suggestion", creatorAIController.applyAISuggestion.bind(creatorAIController));

// Dashboard insights (batch generation)
router.get("/creator/:creatorId/dashboard-insights", creatorAIController.generateDashboardInsights.bind(creatorAIController));

export default router;
