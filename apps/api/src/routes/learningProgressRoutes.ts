import { Router } from "express";
import {
  coachLearningController,
  listLearningProgressController,
  recordCorrectionFeedbackController,
  updateLearningProgressController
} from "../controllers/learningProgressController.js";
import {
  getQuizQuestionController,
  submitQuizAnswerController,
  getRecapQuizController,
  submitRecapQuizAnswerController
} from "../controllers/quizController.js";
import {
  getAnalyticsOverviewController,
  getUserAnalyticsController,
  getTopRetentionController
} from "../controllers/learningAnalyticsController.js";
import { requireAuth } from "../middleware/auth.js";

export const learningProgressRouter = Router();

learningProgressRouter.get("/progress", requireAuth, listLearningProgressController);
learningProgressRouter.post("/progress", requireAuth, updateLearningProgressController);
learningProgressRouter.post("/coach", requireAuth, coachLearningController);
learningProgressRouter.post("/coach/feedback", requireAuth, recordCorrectionFeedbackController);

// Quiz endpoints - discrete comprehension checks
learningProgressRouter.get("/quiz/:contentId", getQuizQuestionController);
learningProgressRouter.post("/quiz/:contentId/answer", requireAuth, submitQuizAnswerController);

// Recap quiz - multi-content review
learningProgressRouter.get("/recap-quiz", requireAuth, getRecapQuizController);
learningProgressRouter.post("/recap-quiz/answer", requireAuth, submitRecapQuizAnswerController);

// Analytics endpoints - learning metrics
learningProgressRouter.get("/analytics/overview", getAnalyticsOverviewController);
learningProgressRouter.get("/analytics/user/:userId", getUserAnalyticsController);
learningProgressRouter.get("/analytics/retention/top", getTopRetentionController);
