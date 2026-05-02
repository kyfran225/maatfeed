import { Router } from "express";
import {
  getFailuresController,
  getFailureByIdController,
  resolveFailureController,
  getFailureStatsController,
  getRootCauseAnalysisController,
  getHealingReportsController
} from "../controllers/failureController.js";

export const failureRouter = Router();

// Get all failures with filtering and pagination
failureRouter.get("/", getFailuresController);

// Get failure statistics
failureRouter.get("/stats", getFailureStatsController);

// Get root cause analysis
failureRouter.get("/root-cause-analysis", getRootCauseAnalysisController);

// Get healing reports
failureRouter.get("/healing-reports", getHealingReportsController);

// Get specific failure by ID
failureRouter.get("/:id", getFailureByIdController);

// Resolve a failure
failureRouter.post("/:id/resolve", resolveFailureController);
