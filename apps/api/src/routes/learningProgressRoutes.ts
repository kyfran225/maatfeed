import { Router } from "express";
import {
  coachLearningController,
  listLearningProgressController,
  updateLearningProgressController
} from "../controllers/learningProgressController.js";
import {
  getQuizQuestionController,
  submitQuizAnswerController,
  getRecapQuizController,
  submitRecapQuizAnswerController
} from "../controllers/quizController.js";
import { requireAuth } from "../middleware/auth.js";

export const learningProgressRouter = Router();

learningProgressRouter.get("/progress", requireAuth, listLearningProgressController);
learningProgressRouter.post("/progress", requireAuth, updateLearningProgressController);
learningProgressRouter.post("/coach", requireAuth, coachLearningController);

// Quiz endpoints - discrete comprehension checks
learningProgressRouter.get("/quiz/:contentId", getQuizQuestionController);
learningProgressRouter.post("/quiz/:contentId/answer", requireAuth, submitQuizAnswerController);

// Recap quiz - multi-content review
learningProgressRouter.get("/recap-quiz", requireAuth, getRecapQuizController);
learningProgressRouter.post("/recap-quiz/answer", requireAuth, submitRecapQuizAnswerController);
