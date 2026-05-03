import { Router } from "express";
import {
  coachLearningController,
  listLearningProgressController,
  updateLearningProgressController
} from "../controllers/learningProgressController.js";
import { requireAuth } from "../middleware/auth.js";

export const learningProgressRouter = Router();

learningProgressRouter.get("/progress", requireAuth, listLearningProgressController);
learningProgressRouter.post("/progress", requireAuth, updateLearningProgressController);
learningProgressRouter.post("/coach", requireAuth, coachLearningController);
