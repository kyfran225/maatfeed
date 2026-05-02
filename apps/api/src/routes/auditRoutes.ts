import { Router } from "express";
import {
  getAuditLogsController,
  getAuditLogByIdController,
  getEntityHistoryController,
  getRollbackOptionsController,
  createRollbackController,
  getAuditStatsController
} from "../controllers/auditController.js";

export const auditRouter = Router();

// Get all audit logs with filtering and pagination
auditRouter.get("/", getAuditLogsController);

// Get audit statistics
auditRouter.get("/stats", getAuditStatsController);

// Get entity history
auditRouter.get("/entity/:entityType/:entityId/history", getEntityHistoryController);

// Get rollback options for an entity
auditRouter.get("/entity/:entityType/:entityId/rollback-options", getRollbackOptionsController);

// Create a rollback
auditRouter.post("/entity/:entityType/:entityId/rollback", createRollbackController);

// Get specific audit log by ID
auditRouter.get("/:id", getAuditLogByIdController);
