import { Router } from "express";
import {
  listKeywordsController,
  getKeywordStatsController,
  createKeywordController,
  getKeywordController,
  updateKeywordController,
  deleteKeywordController,
  resetKeywordsController,
  bulkImportKeywordsController,
  bulkToggleKeywordsController,
  ingestKeywordController
} from "../controllers/keywordAdminController.js";

export const keywordAdminRouter = Router();

// List all keywords with stats
keywordAdminRouter.get("/", listKeywordsController);

// Get statistics
keywordAdminRouter.get("/stats", getKeywordStatsController);

// Create new keyword
keywordAdminRouter.post("/", createKeywordController);

// Reset to defaults
keywordAdminRouter.post("/reset", resetKeywordsController);

// Bulk operations
keywordAdminRouter.post("/bulk-import", bulkImportKeywordsController);
keywordAdminRouter.post("/bulk-toggle", bulkToggleKeywordsController);

// Individual keyword operations
keywordAdminRouter.get("/:id", getKeywordController);
keywordAdminRouter.put("/:id", updateKeywordController);
keywordAdminRouter.delete("/:id", deleteKeywordController);

// Ingest for specific keyword
keywordAdminRouter.post("/:id/ingest", ingestKeywordController);
