import mongoose, { model, Schema } from "mongoose";
import type { NotificationChannel, NotificationType } from "./Notification.js";

export interface WebPushSubscriptionToken {
  endpoint: string;
  expirationTime?: number | null;
  keys: {
    p256dh: string;
    auth: string;
  };
}

export interface IUserNotificationPreferences {
  _id: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  
  // Global settings
  emailEnabled: boolean;
  pushEnabled: boolean;
  inAppEnabled: boolean;
  
  // Quiet hours
  quietHoursEnabled: boolean;
  quietHoursStart: string; // Format: "HH:mm" (24h)
  quietHoursEnd: string; // Format: "HH:mm" (24h)
  timezone: string; // e.g., "Europe/Paris"
  
  // Per-type preferences
  preferences: Record<
    NotificationType,
    {
      enabled: boolean;
      channels: NotificationChannel[];
      digestMode?: "immediate" | "daily" | "weekly";
    }
  >;
  
  // Device tokens for push notifications
  pushTokens: {
    token: string | WebPushSubscriptionToken;
    platform: "ios" | "android" | "web";
    deviceId?: string;
    lastUsedAt: Date;
    createdAt: Date;
  }[];
  
  updatedAt: Date;
  createdAt: Date;
}

const userNotificationPreferencesSchema = new Schema<IUserNotificationPreferences>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
      index: true
    },
    emailEnabled: {
      type: Boolean,
      default: true
    },
    pushEnabled: {
      type: Boolean,
      default: true
    },
    inAppEnabled: {
      type: Boolean,
      default: true
    },
    quietHoursEnabled: {
      type: Boolean,
      default: false
    },
    quietHoursStart: {
      type: String,
      default: "22:00",
      match: /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/
    },
    quietHoursEnd: {
      type: String,
      default: "08:00",
      match: /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/
    },
    timezone: {
      type: String,
      default: "UTC"
    },
    preferences: {
      type: Schema.Types.Mixed,
      default: {
        email_verified: { enabled: true, channels: ["in_app", "email"] },
        welcome: { enabled: true, channels: ["in_app", "email"] },
        content_published: { enabled: true, channels: ["in_app"], digestMode: "daily" },
        comment_reply: { enabled: true, channels: ["in_app", "email"] },
        mention_received: { enabled: true, channels: ["in_app", "push"] },
        like_received: { enabled: true, channels: ["in_app"], digestMode: "weekly" },
        save_received: { enabled: true, channels: ["in_app"], digestMode: "weekly" },
        trending_content: { enabled: true, channels: ["in_app"], digestMode: "daily" },
        weekly_digest: { enabled: true, channels: ["email"], digestMode: "weekly" },
        security_alert: { enabled: true, channels: ["in_app", "email", "push"] },
        password_changed: { enabled: true, channels: ["in_app", "email"] },
        trust_level_upgraded: { enabled: true, channels: ["in_app", "email"] },
        system_announcement: { enabled: true, channels: ["in_app", "email"] }
      }
    },
    pushTokens: {
      type: [{
        token: { type: Schema.Types.Mixed, required: true },
        platform: { type: String, enum: ["ios", "android", "web"], required: true },
        deviceId: { type: String },
        lastUsedAt: { type: Date, default: Date.now },
        createdAt: { type: Date, default: Date.now }
      }],
      default: []
    }
  },
  {
    timestamps: true
  }
);

export const UserNotificationPreferencesModel =
  mongoose.models.UserNotificationPreferences ||
  model<IUserNotificationPreferences>("UserNotificationPreferences", userNotificationPreferencesSchema);

// Default preferences for new users
export const getDefaultNotificationPreferences = (): IUserNotificationPreferences["preferences"] => ({
  email_verified: { enabled: true, channels: ["in_app", "email"] },
  welcome: { enabled: true, channels: ["in_app", "email"] },
  content_published: { enabled: true, channels: ["in_app"], digestMode: "daily" },
  comment_reply: { enabled: true, channels: ["in_app", "email"] },
  mention_received: { enabled: true, channels: ["in_app", "push"] },
  like_received: { enabled: true, channels: ["in_app"], digestMode: "weekly" },
  save_received: { enabled: true, channels: ["in_app"], digestMode: "weekly" },
  trending_content: { enabled: true, channels: ["in_app"], digestMode: "daily" },
  weekly_digest: { enabled: true, channels: ["email"], digestMode: "weekly" },
  security_alert: { enabled: true, channels: ["in_app", "email", "push"] },
  password_changed: { enabled: true, channels: ["in_app", "email"] },
  trust_level_upgraded: { enabled: true, channels: ["in_app", "email"] },
  system_announcement: { enabled: true, channels: ["in_app", "email"] }
});
