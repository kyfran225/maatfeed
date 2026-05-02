import type { Request, Response } from "express";
import * as notificationService from "../services/notificationService.js";

// Get user notifications
export async function getNotificationsController(request: Request, response: Response) {
  const userId = response.locals.auth?.userId;

  if (!userId) {
    response.status(401).json({ error: "Authentification requise." });
    return;
  }

  const unreadOnly = request.query.unread === "true";
  const limit = parseInt(request.query.limit as string) || 50;
  const offset = parseInt(request.query.offset as string) || 0;

  const result = await notificationService.getUserNotifications(userId, {
    unreadOnly,
    limit,
    offset
  });

  response.json(result);
}

// Get unread notification count
export async function getUnreadCountController(request: Request, response: Response) {
  const userId = response.locals.auth?.userId;

  if (!userId) {
    response.status(401).json({ error: "Authentification requise." });
    return;
  }

  const count = await notificationService.getUnreadCount(userId);
  response.json({ count });
}

// Mark notification as read
export async function markAsReadController(request: Request, response: Response) {
  const userId = response.locals.auth?.userId;

  if (!userId) {
    response.status(401).json({ error: "Authentification requise." });
    return;
  }

  const notificationId = request.params.notificationId;

  if (!notificationId || typeof notificationId !== "string") {
    response.status(400).json({ error: "ID de notification invalide." });
    return;
  }

  try {
    const notification = await notificationService.markNotificationAsRead(userId, notificationId);
    response.json({ success: true, notification });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Notification non trouvée.";
    response.status(404).json({ error: message });
  }
}

// Mark all notifications as read
export async function markAllAsReadController(request: Request, response: Response) {
  const userId = response.locals.auth?.userId;

  if (!userId) {
    response.status(401).json({ error: "Authentification requise." });
    return;
  }

  const result = await notificationService.markAllNotificationsAsRead(userId);
  response.json(result);
}

// Get notification preferences
export async function getPreferencesController(request: Request, response: Response) {
  const userId = response.locals.auth?.userId;

  if (!userId) {
    response.status(401).json({ error: "Authentification requise." });
    return;
  }

  const prefs = await notificationService.initializeNotificationPreferences(userId);
  response.json({ preferences: prefs });
}

// Update notification preferences
export async function updatePreferencesController(request: Request, response: Response) {
  const userId = response.locals.auth?.userId;

  if (!userId) {
    response.status(401).json({ error: "Authentification requise." });
    return;
  }

  const updates = request.body;

  const prefs = await notificationService.updateNotificationPreferences(userId, updates);
  response.json({ success: true, preferences: prefs });
}

// Get VAPID public key for web push subscription
export function getVapidPublicKeyController(_request: Request, response: Response) {
  const publicKey = notificationService.getVapidPublicKey();

  if (!publicKey) {
    response.status(503).json({
      error: "Web push not configured",
      message: "VAPID keys are not configured on the server"
    });
    return;
  }

  response.json({ publicKey });
}

// Subscribe to web push notifications
export async function subscribeToPushController(request: Request, response: Response) {
  const userId = response.locals.auth?.userId;

  if (!userId) {
    response.status(401).json({ error: "Authentification requise." });
    return;
  }

  const { subscription, deviceId } = request.body;

  if (!subscription || !subscription.endpoint || !subscription.keys) {
    response.status(400).json({
      error: "Invalid subscription",
      message: "Subscription must include endpoint and keys (p256dh, auth)"
    });
    return;
  }

  try {
    const result = await notificationService.subscribeToPush(userId, subscription, deviceId);
    response.json({
      success: true,
      message: result.isUpdate ? "Subscription updated" : "Subscribed successfully",
      isUpdate: result.isUpdate
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to subscribe";
    response.status(500).json({ error: message });
  }
}

// Unsubscribe from web push notifications
export async function unsubscribeFromPushController(request: Request, response: Response) {
  const userId = response.locals.auth?.userId;

  if (!userId) {
    response.status(401).json({ error: "Authentification requise." });
    return;
  }

  const { endpoint } = request.body;

  if (!endpoint) {
    response.status(400).json({ error: "Endpoint is required" });
    return;
  }

  try {
    const result = await notificationService.unsubscribeFromPush(userId, endpoint);
    response.json({
      success: true,
      message: result.removed ? "Unsubscribed successfully" : "Subscription not found",
      removed: result.removed
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to unsubscribe";
    response.status(500).json({ error: message });
  }
}

// Test push notification (for development)
export async function testPushController(request: Request, response: Response) {
  const userId = response.locals.auth?.userId;

  if (!userId) {
    response.status(401).json({ error: "Authentification requise." });
    return;
  }

  // Only allow in development
  if (process.env.NODE_ENV === "production") {
    response.status(403).json({ error: "Test endpoint not available in production" });
    return;
  }

  try {
    // Create a test notification
    await notificationService.createNotification({
      userId,
      type: "system_announcement",
      title: "🧪 Test Push Notification",
      message: "This is a test of the MAAT FEED push notification system!",
      priority: "normal",
      channels: ["push"]
    });

    response.json({
      success: true,
      message: "Test push notification queued. You should receive it shortly if subscribed."
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to send test notification";
    response.status(500).json({ error: message });
  }
}
