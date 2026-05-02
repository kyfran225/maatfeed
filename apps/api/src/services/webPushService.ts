import webpush from "web-push";
import { env } from "../config/env.js";
import { logger } from "../config/logger.js";

// Initialize web-push with VAPID keys
export function initializeWebPush(): void {
  if (!env.VAPID_PUBLIC_KEY || !env.VAPID_PRIVATE_KEY) {
    logger.warn({
      msg: "VAPID keys not configured. Web push notifications will not work.",
      hint: "Run 'npx web-push generate-vapid-keys' and add keys to .env"
    });
    return;
  }

  webpush.setVapidDetails(
    env.VAPID_SUBJECT,
    env.VAPID_PUBLIC_KEY,
    env.VAPID_PRIVATE_KEY
  );

  logger.info({ msg: "Web push service initialized successfully" });
}

// Check if web push is properly configured
export function isWebPushConfigured(): boolean {
  return !!(env.VAPID_PUBLIC_KEY && env.VAPID_PRIVATE_KEY);
}

// Get VAPID public key for client subscription
export function getVapidPublicKey(): string {
  return env.VAPID_PUBLIC_KEY;
}

export interface PushSubscription {
  endpoint: string;
  expirationTime?: number | null;
  keys: {
    p256dh: string;
    auth: string;
  };
}

export interface PushNotificationPayload {
  title: string;
  body: string;
  icon?: string;
  badge?: string;
  tag?: string;
  data?: {
    url?: string;
    notificationId?: string;
    [key: string]: unknown;
  };
  actions?: Array<{
    action: string;
    title: string;
    icon?: string;
  }>;
  requireInteraction?: boolean;
  renotify?: boolean;
  silent?: boolean;
  timestamp?: number;
}

// Send push notification to a single subscription
export async function sendPush(
  subscription: PushSubscription,
  payload: PushNotificationPayload
): Promise<{ success: boolean; error?: string }> {
  if (!isWebPushConfigured()) {
    return { success: false, error: "Web push not configured" };
  }

  try {
    const pushPayload = JSON.stringify({
      notification: {
        title: payload.title,
        body: payload.body,
        icon: payload.icon || "/icon-192x192.png",
        badge: payload.badge || "/icon-72x72.png",
        tag: payload.tag || "default",
        data: payload.data || {},
        actions: payload.actions || [],
        requireInteraction: payload.requireInteraction ?? false,
        renotify: payload.renotify ?? false,
        silent: payload.silent ?? false,
        timestamp: payload.timestamp || Date.now()
      }
    });

    await webpush.sendNotification(subscription, pushPayload);
    return { success: true };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);

    // Check for expired/invalid subscription
    if (errorMessage.includes("expired") || errorMessage.includes("NotFound") || errorMessage.includes("Gone")) {
      return { success: false, error: "subscription_expired" };
    }

    logger.error({
      msg: "Failed to send push notification",
      error: errorMessage,
      endpoint: subscription.endpoint.substring(0, 50) + "..."
    });

    return { success: false, error: errorMessage };
  }
}

// Send to multiple subscriptions with error handling
export async function sendPushToMany(
  subscriptions: PushSubscription[],
  payload: PushNotificationPayload
): Promise<{
  success: number;
  failed: number;
  expired: number;
  errors: string[];
}> {
  const results = {
    success: 0,
    failed: 0,
    expired: 0,
    errors: [] as string[]
  };

  const sendPromises = subscriptions.map(async (sub) => {
    const result = await sendPush(sub, payload);
    if (result.success) {
      results.success++;
    } else if (result.error === "subscription_expired") {
      results.expired++;
    } else {
      results.failed++;
      if (result.error && !results.errors.includes(result.error)) {
        results.errors.push(result.error);
      }
    }
  });

  await Promise.all(sendPromises);
  return results;
}

// Validate subscription format
export function isValidSubscription(sub: unknown): sub is PushSubscription {
  if (typeof sub !== "object" || sub === null) return false;

  const subscription = sub as Record<string, unknown>;

  if (typeof subscription.endpoint !== "string") return false;
  if (!subscription.keys || typeof subscription.keys !== "object") return false;

  const keys = subscription.keys as Record<string, unknown>;
  if (typeof keys.p256dh !== "string") return false;
  if (typeof keys.auth !== "string") return false;

  return true;
}
