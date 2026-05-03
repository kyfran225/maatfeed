import { Request, Response } from "express";
import {
  calculateAnalyticsOverview,
  getUserLearningProgress,
  getTopRetentionUsers
} from "../services/learningAnalyticsService.js";
import { logger } from "../config/logger.js";

/**
 * GET /api/learning/analytics/overview
 * Récupère les métriques d'apprentissage globales
 */
export async function getAnalyticsOverviewController(req: Request, res: Response) {
  try {
    const overview = await calculateAnalyticsOverview();
    res.json(overview);
  } catch (error) {
    logger.error({ err: error }, "Failed to calculate analytics overview");
    res.status(500).json({ error: "Failed to calculate analytics" });
  }
}

/**
 * GET /api/learning/analytics/user/:userId
 * Récupère la progression d'apprentissage d'un utilisateur spécifique
 * (accessible à l'user lui-même ou aux admins)
 */
export async function getUserAnalyticsController(req: Request, res: Response) {
  try {
    const userId = Array.isArray(req.params.userId) ? req.params.userId[0] : (req.params.userId as string);
    const progress = await getUserLearningProgress(userId);
    res.json(progress);
  } catch (error) {
    if ((error as Error).message === "User not found") {
      return res.status(404).json({ error: "User not found" });
    }
    if ((error as Error).message === "Invalid userId") {
      return res.status(400).json({ error: "Invalid userId" });
    }
    logger.error({ err: error }, "Failed to get user analytics");
    res.status(500).json({ error: "Failed to get user analytics" });
  }
}

/**
 * GET /api/learning/analytics/retention/top
 * Récupère les utilisateurs avec les meilleurs taux de rétention
 * (admin seulement)
 */
export async function getTopRetentionController(req: Request, res: Response) {
  try {
    const limitRaw = req.query.limit;
    const limitParam = Array.isArray(limitRaw) ? limitRaw[0] : (limitRaw as string | undefined);
    const limitStr = typeof limitParam === "string" ? limitParam : "10";
    const limit = Math.min(parseInt(limitStr) || 10, 100);
    const users = await getTopRetentionUsers(limit);
    res.json(users);
  } catch (error) {
    logger.error({ err: error }, "Failed to get top retention users");
    res.status(500).json({ error: "Failed to get top retention users" });
  }
}
