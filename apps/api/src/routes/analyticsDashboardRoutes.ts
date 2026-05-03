import { Router } from "express";
import { requireAuth } from "../middleware/auth.js";
import { requireAdmin } from "../middleware/adminAuth.js";
import {
  getDashboardData,
  calculateRetentionMetrics,
  calculateLearningAnalytics,
  calculateEngagementMetrics,
  getContentPerformance
} from "../services/analyticsDashboardService.js";
import { logger } from "../config/logger.js";

const router = Router();

/**
 * GET /api/analytics/dashboard
 * Get full dashboard data (admin only)
 */
router.get("/dashboard", requireAuth, requireAdmin, async (req, res) => {
  try {
    const days = parseInt(req.query.days as string) || 30;
    const data = await getDashboardData(days);
    res.json(data);
  } catch (error) {
    logger.error({
      msg: "Failed to get dashboard data",
      error: error instanceof Error ? error.message : String(error)
    });
    res.status(500).json({ error: "Failed to fetch dashboard data" });
  }
});

/**
 * GET /api/analytics/retention
 * Get retention metrics only
 */
router.get("/retention", requireAuth, requireAdmin, async (req, res) => {
  try {
    const days = parseInt(req.query.days as string) || 30;
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const metrics = await calculateRetentionMetrics(startDate, endDate);
    res.json(metrics);
  } catch (error) {
    logger.error({
      msg: "Failed to get retention metrics",
      error: error instanceof Error ? error.message : String(error)
    });
    res.status(500).json({ error: "Failed to fetch retention metrics" });
  }
});

/**
 * GET /api/analytics/learning
 * Get learning analytics only
 */
router.get("/learning", requireAuth, requireAdmin, async (req, res) => {
  try {
    const days = parseInt(req.query.days as string) || 30;
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const analytics = await calculateLearningAnalytics(startDate, endDate);
    res.json(analytics);
  } catch (error) {
    logger.error({
      msg: "Failed to get learning analytics",
      error: error instanceof Error ? error.message : String(error)
    });
    res.status(500).json({ error: "Failed to fetch learning analytics" });
  }
});

/**
 * GET /api/analytics/engagement
 * Get engagement metrics only
 */
router.get("/engagement", requireAuth, requireAdmin, async (req, res) => {
  try {
    const days = parseInt(req.query.days as string) || 30;
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const metrics = await calculateEngagementMetrics(startDate, endDate);
    res.json(metrics);
  } catch (error) {
    logger.error({
      msg: "Failed to get engagement metrics",
      error: error instanceof Error ? error.message : String(error)
    });
    res.status(500).json({ error: "Failed to fetch engagement metrics" });
  }
});

/**
 * GET /api/analytics/content
 * Get content performance data
 */
router.get("/content", requireAuth, requireAdmin, async (req, res) => {
  try {
    const days = parseInt(req.query.days as string) || 30;
    const limit = parseInt(req.query.limit as string) || 10;

    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const performance = await getContentPerformance(startDate, endDate, limit);
    res.json(performance);
  } catch (error) {
    logger.error({
      msg: "Failed to get content performance",
      error: error instanceof Error ? error.message : String(error)
    });
    res.status(500).json({ error: "Failed to fetch content performance" });
  }
});

/**
 * POST /api/analytics/events
 * Receive analytics events from frontend
 * This can be used as a proxy/retry mechanism for GA4 events
 */
router.post("/events", async (req, res) => {
  try {
    const { eventName, params } = req.body;

    // Log event for debugging/backup
    logger.info({
      msg: "Analytics event received",
      eventName,
      params,
      userId: res.locals.auth?.userId || "anonymous"
    });

    // Here you could also:
    // 1. Store in your own analytics DB
    // 2. Forward to GA4 server-side
    // 3. Send to other analytics tools

    res.json({ success: true });
  } catch (error) {
    logger.error({
      msg: "Failed to process analytics event",
      error: error instanceof Error ? error.message : String(error)
    });
    res.status(500).json({ error: "Failed to process event" });
  }
});

export { router as analyticsDashboardRouter };
