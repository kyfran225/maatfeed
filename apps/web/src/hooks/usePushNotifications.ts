import { useState, useEffect, useCallback } from "react";
import { useAuth } from "./useAuth";
import {
  getVapidPublicKey,
  subscribeToPush,
  unsubscribeFromPush,
  getPushStatus,
  requestNotificationPermission,
  registerServiceWorker,
  subscribeToPushNotifications,
  unsubscribeFromPushNotifications,
  type PushSubscriptionData
} from "../services/pushService";

interface UsePushNotificationsResult {
  isSupported: boolean;
  permission: NotificationPermission | null;
  isSubscribed: boolean;
  isLoading: boolean;
  error: Error | null;
  subscribe: () => Promise<boolean>;
  unsubscribe: () => Promise<boolean>;
  requestPermission: () => Promise<NotificationPermission>;
}

export function usePushNotifications(): UsePushNotificationsResult {
  const { profile, isAuthenticated } = useAuth();
  const [isSupported, setIsSupported] = useState(false);
  const [permission, setPermission] = useState<NotificationPermission | null>(null);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  // Check support on mount
  useEffect(() => {
    const checkSupport = () => {
      const supported = 
        "serviceWorker" in navigator && 
        "PushManager" in window && 
        "Notification" in window;
      setIsSupported(supported);
      if (supported) {
        setPermission(Notification.permission);
      }
      setIsLoading(false);
    };

    checkSupport();
  }, []);

  // Check subscription status when user changes
  useEffect(() => {
    if (!isSupported || !isAuthenticated) {
      setIsSubscribed(false);
      return;
    }

    let cancelled = false;

    async function checkStatus() {
      try {
        const status = await getPushStatus();
        if (!cancelled) {
          setIsSubscribed(status.hasSubscription);
        }
      } catch (err) {
        console.error("[Push] Failed to check status:", err);
      }
    }

    checkStatus();

    return () => {
      cancelled = true;
    };
  }, [isSupported, isAuthenticated]);

  // Subscribe to push notifications
  const subscribe = useCallback(async (): Promise<boolean> => {
    if (!isSupported) {
      setError(new Error("Push notifications not supported"));
      return false;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Step 1: Register service worker
      const registration = await registerServiceWorker();
      if (!registration) {
        throw new Error("Failed to register service worker");
      }

      // Step 2: Get VAPID public key from server
      const { publicKey, configured } = await getVapidPublicKey();
      if (!configured) {
        throw new Error("Push notifications not configured on server");
      }

      // Step 3: Subscribe to push
      const subscription = await subscribeToPushNotifications(publicKey);
      if (!subscription) {
        throw new Error("Failed to subscribe to push notifications");
      }

      // Step 4: Send subscription to server
      const userAgent = navigator.userAgent;
      const platform = getPlatform();
      
      await subscribeToPush(subscription, userAgent, platform);

      setIsSubscribed(true);
      setPermission("granted");
      return true;
    } catch (err) {
      const error = err instanceof Error ? err : new Error("Failed to subscribe");
      setError(error);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [isSupported]);

  // Unsubscribe from push notifications
  const unsubscribe = useCallback(async (): Promise<boolean> => {
    if (!isSupported) {
      return false;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Get current subscription to find endpoint
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.getSubscription();
      
      if (subscription) {
        // Unsubscribe from browser
        await unsubscribeFromPushNotifications();
        
        // Unsubscribe from server
        await unsubscribeFromPush(subscription.endpoint);
      }

      setIsSubscribed(false);
      return true;
    } catch (err) {
      const error = err instanceof Error ? err : new Error("Failed to unsubscribe");
      setError(error);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [isSupported]);

  // Request permission
  const requestPermission = useCallback(async (): Promise<NotificationPermission> => {
    try {
      const result = await requestNotificationPermission();
      setPermission(result);
      return result;
    } catch (err) {
      const error = err instanceof Error ? err : new Error("Permission request failed");
      setError(error);
      throw error;
    }
  }, []);

  return {
    isSupported,
    permission,
    isSubscribed,
    isLoading,
    error,
    subscribe,
    unsubscribe,
    requestPermission
  };
}

function getPlatform(): "web" | "android" | "ios" | "desktop" {
  const userAgent = navigator.userAgent.toLowerCase();
  
  if (/android/.test(userAgent)) return "android";
  if (/iphone|ipad|ipod/.test(userAgent)) return "ios";
  if (/win32|win64|mac|linux/.test(userAgent)) return "desktop";
  
  return "web";
}
