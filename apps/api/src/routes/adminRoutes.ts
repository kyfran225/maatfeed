import { Router } from "express";
import { requeueProcessingController, triggerIngestionController, deploymentReadinessController, autoIngestController, autoIngestStatusController, autoIngestTriggerController, massIngestController, contentStatsController, queueStatusController, llmRateLimitStatusController, autoAIDiagnosticsController, autoAICheckController, listRecentDebateCommentsController, triggerAutoAIReplyController, syncAudioSourcesController, refreshFeedCacheController } from "../controllers/adminController.js";
import { requireAuth } from "../middleware/auth.js";

export const adminRouter = Router();

adminRouter.post("/ingest", triggerIngestionController);

adminRouter.post("/requeue-processing", requeueProcessingController);

adminRouter.get("/deployment-readiness", deploymentReadinessController);

adminRouter.post("/auto-ingest/schedule", autoIngestController);

adminRouter.get("/auto-ingest/status", autoIngestStatusController);

adminRouter.post("/auto-ingest/trigger", autoIngestTriggerController);

adminRouter.post("/mass-ingest", massIngestController);

adminRouter.get("/content-stats", contentStatsController);

adminRouter.get("/queue-status", queueStatusController);

adminRouter.get("/llm-rate-limit", llmRateLimitStatusController);

adminRouter.get("/auto-ai-diagnostics", autoAIDiagnosticsController);

adminRouter.post("/auto-ai-diagnostics/check", autoAICheckController);

adminRouter.post("/auto-ai-diagnostics/comments", listRecentDebateCommentsController);

adminRouter.post("/auto-ai-diagnostics/trigger", triggerAutoAIReplyController);

adminRouter.post("/audio/sync", requireAuth, syncAudioSourcesController);

adminRouter.post("/feed/refresh-cache", requireAuth, refreshFeedCacheController);
