import { Router } from "express";
import {
  getNotificationsController,
  getUnreadCountController,
  getPreferencesController,
  markAllAsReadController,
  markAsReadController,
  updatePreferencesController,
  getVapidPublicKeyController,
  subscribeToPushController,
  unsubscribeFromPushController,
  testPushController
} from "../controllers/notificationController.js";
import { requireAuth } from "../middleware/auth.js";

export const notificationRouter = Router();

// Get notifications
notificationRouter.get("/", requireAuth, getNotificationsController);
notificationRouter.get("/unread-count", requireAuth, getUnreadCountController);

// Mark as read
notificationRouter.post("/mark-all-read", requireAuth, markAllAsReadController);
notificationRouter.post("/:notificationId/read", requireAuth, markAsReadController);

// Preferences
notificationRouter.get("/preferences", requireAuth, getPreferencesController);
notificationRouter.patch("/preferences", requireAuth, updatePreferencesController);

// Web Push notifications
notificationRouter.get("/push/vapid-key", getVapidPublicKeyController);
notificationRouter.post("/push/subscribe", requireAuth, subscribeToPushController);
notificationRouter.post("/push/unsubscribe", requireAuth, unsubscribeFromPushController);
notificationRouter.post("/push/test", requireAuth, testPushController);
