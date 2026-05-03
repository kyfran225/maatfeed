import { getJson, postJson } from "./httpClient";

export interface PushSubscriptionData {
  endpoint: string;
  keys: {
    p256dh: string;
    auth: string;
  };
}

export interface PushStatus {
  hasSubscription: boolean;
  subscriptions: Array<{
    endpoint: string;
    platform: string;
    lastUsedAt: string;
  }>;
  pushConfigured: boolean;
}

export async function getVapidPublicKey(): Promise<{ publicKey: string; configured: boolean }> {
  return getJson<{ publicKey: string; configured: boolean }>("/api/push/vapid-public-key");
}

export async function subscribeToPush(
  subscription: PushSubscriptionData,
  userAgent?: string,
  platform?: string
): Promise<{ success: boolean; message: string }> {
  return postJson<{ success: boolean; message: string }>("/api/push/subscribe", {
    subscription,
    userAgent,
    platform
  });
}

export async function unsubscribeFromPush(endpoint: string): Promise<{ success: boolean; message: string }> {
  return postJson<{ success: boolean; message: string }>("/api/push/unsubscribe", { endpoint });
}

export async function getPushStatus(): Promise<PushStatus> {
  return getJson<PushStatus>("/api/push/status");
}

// Client-side push subscription helpers
export async function requestNotificationPermission(): Promise<NotificationPermission> {
  if (!("Notification" in window)) {
    throw new Error("Notifications not supported");
  }

  if (Notification.permission === "granted") {
    return "granted";
  }

  if (Notification.permission === "denied") {
    throw new Error("Notification permission denied");
  }

  return await Notification.requestPermission();
}

export async function registerServiceWorker(): Promise<ServiceWorkerRegistration | null> {
  if (!("serviceWorker" in navigator)) {
    console.warn("Service workers not supported");
    return null;
  }

  try {
    const registration = await navigator.serviceWorker.register("/sw.js", {
      updateViaCache: "imports"
    });

    // Wait for the service worker to be ready
    await navigator.serviceWorker.ready;

    console.log("[Push] Service Worker registered:", registration.scope);
    return registration;
  } catch (error) {
    console.error("[Push] Service Worker registration failed:", error);
    return null;
  }
}

export async function subscribeToPushNotifications(
  publicKey: string
): Promise<PushSubscriptionData | null> {
  const registration = await navigator.serviceWorker.ready;

  try {
    // Check for existing subscription
    const existingSubscription = await registration.pushManager.getSubscription();
    if (existingSubscription) {
      // Convert to our format
      return {
        endpoint: existingSubscription.endpoint,
        keys: {
          p256dh: existingSubscription.toJSON().keys?.p256dh || "",
          auth: existingSubscription.toJSON().keys?.auth || ""
        }
      };
    }

    // Subscribe with the server's public key
    const subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(publicKey) as any
    });

    return {
      endpoint: subscription.endpoint,
      keys: {
        p256dh: subscription.toJSON().keys?.p256dh || "",
        auth: subscription.toJSON().keys?.auth || ""
      }
    };
  } catch (error) {
    console.error("[Push] Failed to subscribe to push notifications:", error);
    return null;
  }
}

export async function unsubscribeFromPushNotifications(): Promise<boolean> {
  const registration = await navigator.serviceWorker.ready;

  try {
    const subscription = await registration.pushManager.getSubscription();
    if (subscription) {
      await subscription.unsubscribe();
      return true;
    }
    return false;
  } catch (error) {
    console.error("[Push] Failed to unsubscribe from push notifications:", error);
    return false;
  }
}

// Helper to convert VAPID key to Uint8Array
function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/\-/g, "+").replace(/_/g, "/");

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }

  return outputArray;
}
