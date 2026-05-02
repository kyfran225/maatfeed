import { NotificationModel, type NotificationType, NotificationTemplates } from "../models/Notification.js";
import { UserNotificationPreferencesModel, getDefaultNotificationPreferences } from "../models/UserNotificationPreferences.js";
import { UserModel, type TrustLevel } from "../models/User.js";
import { ProfileModel } from "../models/Profile.js";
import * as emailService from "./emailService.js";
import * as webPushService from "./webPushService.js";
import { logger } from "../config/logger.js";

// Trust level configuration with benefits
const TrustLevelConfig: Record<TrustLevel, { displayName: string; benefits: string[]; requirements: string }> = {
  visitor: {
    displayName: "Visiteur",
    benefits: ["Accès au contenu en lecture", "Like et sauvegarde de contenu"],
    requirements: "Compte créé"
  },
  verified: {
    displayName: "Membre vérifié",
    benefits: ["Commentaires illimités", "Participation aux débats", "Création de playlists"],
    requirements: "Email vérifié"
  },
  contributor: {
    displayName: "Contributeur",
    benefits: ["Suggestions de contenu", "Votes sur les propositions", "Badge contributeur"],
    requirements: "10+ commentaires et engagement positif"
  },
  trusted: {
    displayName: "Membre de confiance",
    benefits: ["Accès beta aux nouvelles fonctionnalités", "Modération communautaire", "Support prioritaire"],
    requirements: "Engagement soutenu et contributions de qualité"
  }
};

// Create a new notification
interface CreateNotificationInput {
  userId: string;
  type: NotificationType;
  title?: string;
  message?: string;
  data?: Record<string, unknown>;
  priority?: "low" | "normal" | "high" | "urgent";
  channels?: ("in_app" | "email" | "push")[];
}

export async function createNotification(input: CreateNotificationInput) {
  // Get user preferences
  const preferences = await UserNotificationPreferencesModel.findOne({ userId: input.userId });
  const typePrefs = preferences?.preferences?.[input.type];

  // Check if notification type is enabled for this user
  if (typePrefs && !typePrefs.enabled) {
    return { skipped: true, reason: "notification_type_disabled" };
  }

  // Use template defaults or override
  const template = NotificationTemplates[input.type];
  const rawChannels = input.channels || typePrefs?.channels || template.defaultChannels;
  const channels = rawChannels.filter((channel: "in_app" | "email" | "push") => {
    if (channel === "email") return preferences?.emailEnabled !== false;
    if (channel === "push") return preferences?.pushEnabled !== false;
    if (channel === "in_app") return preferences?.inAppEnabled !== false;
    return true;
  });

  if (channels.length === 0) {
    return { skipped: true, reason: "all_channels_disabled" };
  }

  // Create the notification
  const notification = await NotificationModel.create({
    userId: input.userId,
    type: input.type,
    title: input.title || template.title,
    message: input.message || template.message,
    channels,
    priority: input.priority || template.priority,
    data: input.data || {},
    status: "pending"
  });

  // Queue for delivery (in-app is immediate)
  if (channels.includes("in_app")) {
    await markAsSent(notification._id.toString());
  }

  // Email and push are queued for async processing
  if (channels.includes("email") || channels.includes("push")) {
    // This would typically be queued via BullMQ
    await processNotificationDelivery(notification._id.toString());
  }

  return { success: true, notificationId: notification._id.toString() };
}

// Mark notification as sent
async function markAsSent(notificationId: string) {
  await NotificationModel.findByIdAndUpdate(notificationId, {
    status: "sent",
    sentAt: new Date()
  });
}

// Mark notification as delivered
async function markAsDelivered(notificationId: string) {
  await NotificationModel.findByIdAndUpdate(notificationId, {
    status: "delivered",
    deliveredAt: new Date()
  });
}

// Mark notification as read
export async function markNotificationAsRead(userId: string, notificationId: string) {
  const notification = await NotificationModel.findOneAndUpdate(
    { _id: notificationId, userId },
    { status: "read", readAt: new Date() },
    { new: true }
  );

  if (!notification) {
    throw new Error("Notification not found");
  }

  return notification;
}

// Mark all notifications as read
export async function markAllNotificationsAsRead(userId: string) {
  await NotificationModel.updateMany(
    { userId, status: { $in: ["pending", "sent", "delivered"] } },
    { status: "read", readAt: new Date() }
  );

  return { success: true };
}

// Process notification delivery
async function processNotificationDelivery(notificationId: string) {
  const notification = await NotificationModel.findById(notificationId);
  if (!notification) return;

  // Check quiet hours
  const shouldSendEmail = await checkQuietHours(notification.userId.toString(), notification.priority);

  if (notification.channels.includes("email") && shouldSendEmail) {
    await sendEmailNotification(notification);
  }

  if (notification.channels.includes("push")) {
    await sendPushNotification(notification);
  }

  await markAsDelivered(notificationId);
}

// Check if we should send email based on quiet hours
async function checkQuietHours(userId: string, priority: string): Promise<boolean> {
  // Urgent notifications bypass quiet hours
  if (priority === "urgent") return true;

  const prefs = await UserNotificationPreferencesModel.findOne({ userId });
  if (!prefs?.quietHoursEnabled) return true;

  const now = new Date();
  const userTimezone = prefs.timezone || "UTC";

  // Convert to user's timezone
  const userTime = new Date(now.toLocaleString("en-US", { timeZone: userTimezone }));
  const currentHour = userTime.getHours();
  const currentMinute = userTime.getMinutes();
  const currentTime = currentHour * 60 + currentMinute;

  const [startHour, startMinute] = prefs.quietHoursStart.split(":").map(Number);
  const [endHour, endMinute] = prefs.quietHoursEnd.split(":").map(Number);
  const startTime = startHour * 60 + startMinute;
  const endTime = endHour * 60 + endMinute;

  // Check if current time is within quiet hours
  if (startTime < endTime) {
    return currentTime < startTime || currentTime >= endTime;
  } else {
    // Quiet hours span midnight
    return currentTime < startTime && currentTime >= endTime;
  }
}

// Send email notification
async function sendEmailNotification(notification: any) {
  try {
    // Get user email and display name
    const user = await UserModel.findById(notification.userId);
    const profile = await ProfileModel.findOne({ userId: notification.userId });

    if (!user || !user.isEmailVerified) return;

    const displayName = profile?.displayName || user.email.split("@")[0];

    switch (notification.type) {
      case "email_verified":
        // Already handled by sendVerificationEmail
        break;
      case "welcome":
        await emailService.sendWelcomeEmail(user.email, displayName);
        break;
      case "password_changed":
        await emailService.sendPasswordChangedEmail(user.email, displayName);
        break;
      case "trust_level_upgraded":
        const newLevel = notification.data?.newLevel || "verified";
        const benefits = TrustLevelConfig[newLevel as TrustLevel]?.benefits || [];
        await emailService.sendTrustLevelUpgradedEmail(user.email, displayName, newLevel, benefits);
        break;
      case "security_alert":
        await emailService.sendSecurityAlertEmail(
          user.email,
          displayName,
          notification.data?.alertType || "Alerte de sécurité",
          notification.message,
          notification.data?.ipAddress
        );
        break;
      default:
        // For other types, we could send generic emails or skip
        break;
    }
  } catch (error) {
    logger.error({ msg: "Failed to send email notification", notificationId: notification._id, error });
  }
}

// Send push notification using web-push
async function sendPushNotification(notification: any) {
  try {
    const prefs = await UserNotificationPreferencesModel.findOne({ userId: notification.userId });
    if (!prefs?.pushEnabled || !prefs?.pushTokens?.length) return;

    // Filter only web subscriptions
    const webSubscriptions = prefs.pushTokens
      .filter((token: any) => token.platform === "web" && webPushService.isValidSubscription(token.token))
      .map((token: any) => token.token);

    if (webSubscriptions.length === 0) return;

    // Build push payload
    const payload: webPushService.PushNotificationPayload = {
      title: notification.title,
      body: notification.message,
      icon: "/icon-192x192.png",
      badge: "/icon-72x72.png",
      tag: notification.type,
      data: {
        url: notification.data?.url || `/notifications/${notification._id}`,
        notificationId: notification._id.toString(),
        type: notification.type,
        ...notification.data
      },
      requireInteraction: notification.priority === "urgent" || notification.priority === "high",
      timestamp: Date.now()
    };

    // Send to all web subscriptions
    const results = await webPushService.sendPushToMany(webSubscriptions, payload);

    logger.info({
      msg: "Push notifications sent",
      notificationId: notification._id,
      userId: notification.userId,
      total: webSubscriptions.length,
      success: results.success,
      failed: results.failed,
      expired: results.expired
    });

    // Clean up expired subscriptions
    if (results.expired > 0) {
      const validTokens = prefs.pushTokens.filter((token: any) => {
        if (token.platform !== "web") return true;
        const expired = !webSubscriptions.find(
          (sub: webPushService.PushSubscription) => sub.endpoint === token.token.endpoint
        );
        return !expired;
      });

      await UserNotificationPreferencesModel.findByIdAndUpdate(prefs._id, {
        pushTokens: validTokens
      });
    }
  } catch (error) {
    logger.error({ msg: "Failed to send push notification", notificationId: notification._id, error });
  }
}

// Get user notifications
export async function getUserNotifications(userId: string, options: { unreadOnly?: boolean; limit?: number; offset?: number } = {}) {
  const query: any = { userId };

  if (options.unreadOnly) {
    query.status = { $in: ["pending", "sent", "delivered"] };
  }

  const notifications = await NotificationModel.find(query)
    .sort({ createdAt: -1 })
    .limit(options.limit || 50)
    .skip(options.offset || 0)
    .lean();

  const unreadCount = await NotificationModel.countDocuments({
    userId,
    status: { $in: ["pending", "sent", "delivered"] }
  });

  return { notifications, unreadCount };
}

// Initialize notification preferences for new user
export async function initializeNotificationPreferences(userId: string) {
  const existing = await UserNotificationPreferencesModel.findOne({ userId });
  if (existing) return existing;

  return UserNotificationPreferencesModel.create({
    userId,
    preferences: getDefaultNotificationPreferences()
  });
}

// Update notification preferences
export async function updateNotificationPreferences(
  userId: string,
  updates: Partial<{
    emailEnabled: boolean;
    pushEnabled: boolean;
    inAppEnabled: boolean;
    quietHoursEnabled: boolean;
    quietHoursStart: string;
    quietHoursEnd: string;
    timezone: string;
  }>
) {
  const prefs = await UserNotificationPreferencesModel.findOneAndUpdate(
    { userId },
    { $set: updates },
    { new: true, upsert: true }
  );

  return prefs;
}

// Upgrade user trust level
export async function upgradeTrustLevel(userId: string, newLevel: TrustLevel, reason: string) {
  const user = await UserModel.findByIdAndUpdate(
    userId,
    { trustLevel: newLevel },
    { new: true }
  );

  if (!user) {
    throw new Error("User not found");
  }

  // Create notification for trust level upgrade
  await createNotification({
    userId: userId.toString(),
    type: "trust_level_upgraded",
    data: { newLevel, reason, benefits: TrustLevelConfig[newLevel].benefits }
  });

  logger.info({ msg: "User trust level upgraded", userId, newLevel, reason });

  return { success: true, trustLevel: newLevel };
}

// Check and auto-upgrade trust level based on user activity
export async function checkAndUpgradeTrustLevel(userId: string) {
  const user = await UserModel.findById(userId);
  if (!user || !user.isEmailVerified) return;

  // Count comments to determine if user can be upgraded to contributor
  const CommentModel = (await import("../models/Comment.js")).CommentModel;
  const commentCount = await CommentModel.countDocuments({ userId });

  // Upgrade logic
  if (user.trustLevel === "visitor" && user.isEmailVerified) {
    await upgradeTrustLevel(userId.toString(), "verified", "Email vérifié");
  } else if (user.trustLevel === "verified" && commentCount >= 10) {
    await upgradeTrustLevel(userId.toString(), "contributor", "10+ contributions qualitatives");
  }
}

// Get unread notification count
export async function getUnreadCount(userId: string) {
  return NotificationModel.countDocuments({
    userId,
    status: { $in: ["pending", "sent", "delivered"] }
  });
}

// Subscribe to web push notifications
export async function subscribeToPush(userId: string, subscription: webPushService.PushSubscription, deviceId?: string) {
  const prefs = await UserNotificationPreferencesModel.findOne({ userId });

  if (!prefs) {
    throw new Error("Notification preferences not found");
  }

  // Check if subscription already exists
  const existingIndex = prefs.pushTokens.findIndex(
    (token: any) => token.token.endpoint === subscription.endpoint
  );

  const pushToken = {
    token: subscription,
    platform: "web" as const,
    deviceId,
    lastUsedAt: new Date(),
    createdAt: existingIndex >= 0 ? prefs.pushTokens[existingIndex].createdAt : new Date()
  };

  if (existingIndex >= 0) {
    // Update existing subscription
    prefs.pushTokens[existingIndex] = pushToken;
  } else {
    // Add new subscription
    prefs.pushTokens.push(pushToken);
  }

  // Enable push notifications if not already enabled
  if (!prefs.pushEnabled) {
    prefs.pushEnabled = true;
  }

  await prefs.save();

  logger.info({
    msg: "User subscribed to web push",
    userId,
    endpoint: subscription.endpoint.substring(0, 50) + "...",
    isUpdate: existingIndex >= 0
  });

  return { success: true, isUpdate: existingIndex >= 0 };
}

// Unsubscribe from web push notifications
export async function unsubscribeFromPush(userId: string, endpoint: string) {
  const prefs = await UserNotificationPreferencesModel.findOne({ userId });

  if (!prefs) {
    throw new Error("Notification preferences not found");
  }

  const initialCount = prefs.pushTokens.length;
  prefs.pushTokens = prefs.pushTokens.filter(
    (token: any) => token.token.endpoint !== endpoint
  );

  await prefs.save();

  const removed = initialCount > prefs.pushTokens.length;

  if (removed) {
    logger.info({
      msg: "User unsubscribed from web push",
      userId,
      endpoint: endpoint.substring(0, 50) + "..."
    });
  }

  return { success: true, removed };
}

// Get VAPID public key for client
export function getVapidPublicKey(): string {
  return webPushService.getVapidPublicKey();
}

// Check if web push is configured
export function isWebPushConfigured(): boolean {
  return webPushService.isWebPushConfigured();
}
