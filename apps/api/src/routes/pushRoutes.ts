import { Router } from "express";
import { optionalAuth, requireAuth } from "../middleware/auth.js";
import { PushSubscriptionModel } from "../models/PushSubscription.js";
import { 
  getVapidPublicKey, 
  isWebPushConfigured, 
  isValidSubscription,
  type PushSubscription 
} from "../services/webPushService.js";
import { logger } from "../config/logger.js";

const router = Router();

// GET /api/push/vapid-public-key - Get VAPID public key for client
router.get("/vapid-public-key", (_req, res) => {
  if (!isWebPushConfigured()) {
    res.status(503).json({ 
      error: "Push notifications not configured",
      configured: false 
    });
    return;
  }

  res.json({ 
    publicKey: getVapidPublicKey(),
    configured: true 
  });
});

// POST /api/push/subscribe - Register a push subscription
router.post("/subscribe", optionalAuth, async (req, res) => {
  try {
    const { subscription, userAgent, platform } = req.body;

    // Validate subscription format
    if (!isValidSubscription(subscription)) {
      res.status(400).json({ error: "Invalid subscription format" });
      return;
    }

    const pushSub = subscription as PushSubscription;
    const auth = res.locals.auth;
    const userId = auth?.userId || null;

    // Upsert subscription (update if exists, create if not)
    await PushSubscriptionModel.findOneAndUpdate(
      { endpoint: pushSub.endpoint },
      {
        $set: {
          userId,
          endpoint: pushSub.endpoint,
          p256dh: pushSub.keys.p256dh,
          auth: pushSub.keys.auth,
          userAgent: userAgent || req.headers["user-agent"],
          platform: platform || "web",
          isActive: true,
          lastUsedAt: new Date()
        }
      },
      {
        upsert: true,
        new: true
      }
    );

    logger.info({
      msg: "Push subscription registered",
      userId: userId?.toString() || "anonymous",
      endpoint: pushSub.endpoint.substring(0, 50) + "..."
    });

    res.json({ success: true, message: "Subscription registered" });
  } catch (error) {
    logger.error({
      msg: "Failed to register push subscription",
      error: error instanceof Error ? error.message : String(error)
    });
    res.status(500).json({ error: "Failed to register subscription" });
  }
});

// POST /api/push/unsubscribe - Unregister a push subscription
router.post("/unsubscribe", async (req, res) => {
  try {
    const { endpoint } = req.body;

    if (!endpoint || typeof endpoint !== "string") {
      res.status(400).json({ error: "Endpoint required" });
      return;
    }

    await PushSubscriptionModel.findOneAndUpdate(
      { endpoint },
      { $set: { isActive: false } }
    );

    logger.info({
      msg: "Push subscription deactivated",
      endpoint: endpoint.substring(0, 50) + "..."
    });

    res.json({ success: true, message: "Subscription removed" });
  } catch (error) {
    logger.error({
      msg: "Failed to unregister push subscription",
      error: error instanceof Error ? error.message : String(error)
    });
    res.status(500).json({ error: "Failed to unregister subscription" });
  }
});

// GET /api/push/status - Check user's push subscription status
router.get("/status", requireAuth, async (req, res) => {
  try {
    const auth = res.locals.auth;
    const userId = auth?.userId;
    
    const subscriptions = await PushSubscriptionModel.find({
      userId,
      isActive: true
    }).select("endpoint platform lastUsedAt");

    res.json({
      hasSubscription: subscriptions.length > 0,
      subscriptions: subscriptions.map(sub => ({
        endpoint: sub.endpoint.substring(0, 50) + "...",
        platform: sub.platform,
        lastUsedAt: sub.lastUsedAt
      })),
      pushConfigured: isWebPushConfigured()
    });
  } catch (error) {
    logger.error({
      msg: "Failed to get push status",
      error: error instanceof Error ? error.message : String(error)
    });
    res.status(500).json({ error: "Failed to get status" });
  }
});

export { router as pushRouter };
