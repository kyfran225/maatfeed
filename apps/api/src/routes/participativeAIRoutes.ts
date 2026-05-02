import { Router } from "express";
import {
  triggerAIInterventionController,
  launchAutoDebateController,
  processAutomaticInterventionsController,
  checkInterventionNeedController
} from "../controllers/participativeAIController.js";

const router = Router();

// Interventions IA
router.post("/intervene", triggerAIInterventionController);
router.post("/launch-debate", launchAutoDebateController);
router.post("/process-automatic", processAutomaticInterventionsController);
router.get("/check/:postId", checkInterventionNeedController);

export { router as participativeAIRoutes };
