import { getJson, postJson } from "./httpClient";

// Convert base64 string to Uint8Array for VAPID key
export function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }

  return outputArray;
}

// Get VAPID public key from server
export async function getVapidPublicKey(): Promise<string | null> {
  try {
    const response = await getJson<{ publicKey: string }>("/api/notifications/push/vapid-key");
    return response.publicKey;
  } catch (error) {
    console.error("Failed to get VAPID public key:", error);
    return null;
  }
}

// Subscribe to push notifications
export async function subscribeToPush(subscription: PushSubscription): Promise<{ success: boolean; isUpdate?: boolean }> {
  const subscriptionJson = subscription.toJSON();

  const response = await postJson<{ success: boolean; isUpdate: boolean }>(
    "/api/notifications/push/subscribe",
    {
      subscription: subscriptionJson,
      deviceId: getDeviceId()
    }
  );

  return response;
}

// Unsubscribe from push notifications
export async function unsubscribeFromPush(endpoint: string): Promise<{ success: boolean; removed?: boolean }> {
  const response = await postJson<{ success: boolean; removed: boolean }>(
    "/api/notifications/push/unsubscribe",
    { endpoint }
  );

  return response;
}

// Test push notification (development only)
export async function testPushNotification(): Promise<{ success: boolean; message: string }> {
  const response = await postJson<{ success: boolean; message: string }>(
    "/api/notifications/push/test"
  );

  return response;
}

// Get or create a device ID for this browser
function getDeviceId(): string {
  const storageKey = "maat_device_id";
  let deviceId = localStorage.getItem(storageKey);

  if (!deviceId) {
    deviceId = `web_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    localStorage.setItem(storageKey, deviceId);
  }

  return deviceId;
}

// Check if push notifications are supported
export function isPushSupported(): boolean {
  return "serviceWorker" in navigator && "PushManager" in window;
}

// Request notification permission
export async function requestNotificationPermission(): Promise<NotificationPermission> {
  if (!("Notification" in window)) {
    throw new Error("Notifications not supported in this browser");
  }

  const permission = await Notification.requestPermission();
  return permission;
}

// Get current notification permission
export function getNotificationPermission(): NotificationPermission | null {
  if (!("Notification" in window)) {
    return null;
  }

  return Notification.permission;
}

// Register service worker
export async function registerServiceWorker(): Promise<ServiceWorkerRegistration | null> {
  if (!("serviceWorker" in navigator)) {
    console.warn("Service workers not supported");
    return null;
  }

  try {
    const registration = await navigator.serviceWorker.register("/sw.js", {
      updateViaCache: "imports"
    });
    console.log("Service Worker registered:", registration);
    return registration;
  } catch (error) {
    console.error("Service Worker registration failed:", error);
    return null;
  }
}

// Subscribe to push notifications with the push manager
export async function subscribeWithPushManager(
  registration: ServiceWorkerRegistration,
  vapidPublicKey: string
): Promise<PushSubscription | null> {
  try {
    const existingSubscription = await registration.pushManager.getSubscription();

    if (existingSubscription) {
      console.log("Existing push subscription found");
      return existingSubscription;
    }

    const applicationServerKey = urlBase64ToUint8Array(vapidPublicKey);

    const subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: applicationServerKey as BufferSource
    });

    console.log("New push subscription created");
    return subscription;
  } catch (error) {
    console.error("Failed to subscribe with push manager:", error);
    return null;
  }
}

// Unsubscribe from push notifications
export async function unsubscribeFromPushManager(
  registration: ServiceWorkerRegistration
): Promise<boolean> {
  try {
    const subscription = await registration.pushManager.getSubscription();

    if (!subscription) {
      return false;
    }

    const endpoint = subscription.endpoint;
    const unsubscribed = await subscription.unsubscribe();

    if (unsubscribed) {
      // Also notify server to remove subscription
      await unsubscribeFromPush(endpoint);
    }

    return unsubscribed;
  } catch (error) {
    console.error("Failed to unsubscribe from push manager:", error);
    return false;
  }
}
