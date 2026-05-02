/**
 * Keyword management controller
 * Full CRUD for dynamic keywords
 */
import type { Request, Response } from "express";
import {
  getAllDynamicKeywords,
  getEnabledKeywords,
  getKeywordById,
  createKeyword,
  updateKeyword,
  deleteKeyword,
  resetToDefaultKeywords,
  bulkImportKeywords,
  bulkToggleKeywords,
  getKeywordStats,
  type CreateKeywordInput,
  type UpdateKeywordInput
} from "../services/keywordManagementService.js";
import { ingestByKeyword } from "../services/contentIngestionService.js";
import { logger } from "../config/logger.js";

// GET /api/admin/keywords - List all keywords
export async function listKeywordsController(request: Request, response: Response) {
  try {
    const enabledOnly = request.query.enabled === "true";
    const keywords = enabledOnly ? await getEnabledKeywords() : await getAllDynamicKeywords();
    const stats = await getKeywordStats();

    response.status(200).json({
      success: true,
      data: {
        keywords,
        stats,
        count: keywords.length
      }
    });
  } catch (error) {
    logger.error({ error }, "Failed to list keywords");
    response.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : "Failed to list keywords"
    });
  }
}

// GET /api/admin/keywords/stats - Get keyword statistics
export async function getKeywordStatsController(request: Request, response: Response) {
  try {
    const stats = await getKeywordStats();

    response.status(200).json({
      success: true,
      data: stats
    });
  } catch (error) {
    logger.error({ error }, "Failed to get keyword stats");
    response.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : "Failed to get stats"
    });
  }
}

// POST /api/admin/keywords - Create new keyword
export async function createKeywordController(request: Request, response: Response) {
  try {
    const input: CreateKeywordInput = {
      keyword: String(request.body?.keyword ?? "").trim(),
      interests: Array.isArray(request.body?.interests) ? request.body.interests : [],
      language: request.body?.language === "fr" ? "fr" : "en"
    };

    if (!input.keyword) {
      response.status(400).json({
        success: false,
        error: "keyword is required"
      });
      return;
    }

    if (input.interests.length === 0) {
      response.status(400).json({
        success: false,
        error: "at least one interest is required"
      });
      return;
    }

    const keyword = await createKeyword(input);

    response.status(201).json({
      success: true,
      data: keyword,
      message: `Keyword "${keyword.keyword}" created`
    });
  } catch (error) {
    logger.error({ error }, "Failed to create keyword");
    response.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : "Failed to create keyword"
    });
  }
}

// GET /api/admin/keywords/:id - Get single keyword
export async function getKeywordController(request: Request, response: Response) {
  try {
    const id = String(request.params.id);
    const keyword = await getKeywordById(id);

    if (!keyword) {
      response.status(404).json({
        success: false,
        error: "Keyword not found"
      });
      return;
    }

    response.status(200).json({
      success: true,
      data: keyword
    });
  } catch (error) {
    logger.error({ error, id: request.params.id }, "Failed to get keyword");
    response.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : "Failed to get keyword"
    });
  }
}

// PUT /api/admin/keywords/:id - Update keyword
export async function updateKeywordController(request: Request, response: Response) {
  try {
    const id = String(request.params.id);
    const input: UpdateKeywordInput = {};

    if (request.body?.keyword !== undefined) {
      input.keyword = String(request.body.keyword).trim();
    }
    if (request.body?.interests !== undefined) {
      input.interests = Array.isArray(request.body.interests) ? request.body.interests : [];
    }
    if (request.body?.language !== undefined) {
      input.language = request.body.language === "fr" ? "fr" : "en";
    }
    if (request.body?.enabled !== undefined) {
      input.enabled = Boolean(request.body.enabled);
    }

    const keyword = await updateKeyword(id, input);

    if (!keyword) {
      response.status(404).json({
        success: false,
        error: "Keyword not found"
      });
      return;
    }

    response.status(200).json({
      success: true,
      data: keyword,
      message: `Keyword "${keyword.keyword}" updated`
    });
  } catch (error) {
    logger.error({ error, id: request.params.id }, "Failed to update keyword");
    response.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : "Failed to update keyword"
    });
  }
}

// DELETE /api/admin/keywords/:id - Delete keyword
export async function deleteKeywordController(request: Request, response: Response) {
  try {
    const id = String(request.params.id);
    const deleted = await deleteKeyword(id);

    if (!deleted) {
      response.status(404).json({
        success: false,
        error: "Keyword not found"
      });
      return;
    }

    response.status(200).json({
      success: true,
      message: "Keyword deleted"
    });
  } catch (error) {
    logger.error({ error, id: request.params.id }, "Failed to delete keyword");
    response.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : "Failed to delete keyword"
    });
  }
}

// POST /api/admin/keywords/reset - Reset to defaults
export async function resetKeywordsController(request: Request, response: Response) {
  try {
    const keywords = await resetToDefaultKeywords();

    response.status(200).json({
      success: true,
      data: {
        count: keywords.length,
        keywords
      },
      message: `Reset to ${keywords.length} default keywords`
    });
  } catch (error) {
    logger.error({ error }, "Failed to reset keywords");
    response.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : "Failed to reset keywords"
    });
  }
}

// POST /api/admin/keywords/bulk-import - Import multiple keywords
export async function bulkImportKeywordsController(request: Request, response: Response) {
  try {
    const keywords = Array.isArray(request.body?.keywords) ? request.body.keywords : [];

    if (keywords.length === 0) {
      response.status(400).json({
        success: false,
        error: "keywords array is required"
      });
      return;
    }

    // Validate input
    for (const k of keywords) {
      if (!k.keyword || !Array.isArray(k.interests) || k.interests.length === 0) {
        response.status(400).json({
          success: false,
          error: "each keyword must have keyword and interests array"
        });
        return;
      }
    }

    const imported = await bulkImportKeywords(keywords);

    response.status(201).json({
      success: true,
      data: { imported },
      message: `${imported} keywords imported`
    });
  } catch (error) {
    logger.error({ error }, "Failed to bulk import keywords");
    response.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : "Failed to bulk import"
    });
  }
}

// POST /api/admin/keywords/bulk-toggle - Enable/disable multiple
export async function bulkToggleKeywordsController(request: Request, response: Response) {
  try {
    const ids = Array.isArray(request.body?.ids) ? request.body.ids : [];
    const enabled = request.body?.enabled === true;

    if (ids.length === 0) {
      response.status(400).json({
        success: false,
        error: "ids array is required"
      });
      return;
    }

    const changed = await bulkToggleKeywords(ids, enabled);

    response.status(200).json({
      success: true,
      data: { changed, enabled },
      message: `${changed} keywords ${enabled ? "enabled" : "disabled"}`
    });
  } catch (error) {
    logger.error({ error }, "Failed to bulk toggle keywords");
    response.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : "Failed to toggle keywords"
    });
  }
}

// POST /api/admin/keywords/:id/ingest - Ingest for specific keyword
export async function ingestKeywordController(request: Request, response: Response) {
  try {
    const id = String(request.params.id);
    const keyword = await getKeywordById(id);

    if (!keyword) {
      response.status(404).json({
        success: false,
        error: "Keyword not found"
      });
      return;
    }

    if (!keyword.enabled) {
      response.status(400).json({
        success: false,
        error: "Cannot ingest for disabled keyword"
      });
      return;
    }

    const limitPerProvider = typeof request.body?.limitPerProvider === "number"
      ? request.body.limitPerProvider
      : 10;

    // Return immediately, process async
    response.status(202).json({
      success: true,
      message: `Ingestion started for "${keyword.keyword}"`,
      keyword: keyword.keyword,
      limitPerProvider
    });

    // Process async
    setImmediate(async () => {
      try {
        const result = await ingestByKeyword({
          keyword: keyword.keyword,
          limitPerProvider
        });
        logger.info(
          { keyword: keyword.keyword, result },
          "Keyword ingestion completed"
        );
      } catch (err) {
        logger.error({ err, keyword: keyword.keyword }, "Keyword ingestion failed");
      }
    });
  } catch (error) {
    logger.error({ error, id: request.params.id }, "Failed to start keyword ingestion");
    response.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : "Failed to start ingestion"
    });
  }
}
