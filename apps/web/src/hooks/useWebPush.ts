import { useState, useEffect, useCallback } from "react";
import {
  isPushSupported,
  requestNotificationPermission,
  getNotificationPermission,
  registerServiceWorker,
  getVapidPublicKey,
  subscribeWithPushManager,
  unsubscribeFromPushManager,
  subscribeToPush as apiSubscribeToPush
} from "../services/pushNotificationService";

interface WebPushState {
  isSupported: boolean;
  permission: NotificationPermission | null;
  isSubscribed: boolean;
  isLoading: boolean;
  error: string | null;
  registration: ServiceWorkerRegistration | null;
}

interface UseWebPushReturn extends WebPushState {
  subscribe: () => Promise<boolean>;
  unsubscribe: () => Promise<boolean>;
  refreshState: () => Promise<void>;
}

export function useWebPush(): UseWebPushReturn {
  const [state, setState] = useState<WebPushState>({
    isSupported: false,
    permission: null,
    isSubscribed: false,
    isLoading: true,
    error: null,
    registration: null
  });

  // Check initial state
  const refreshState = useCallback(async () => {
    try {
      const supported = isPushSupported();
      const permission = getNotificationPermission();

      if (!supported) {
        setState(prev => ({
          ...prev,
          isSupported: false,
          isLoading: false,
          permission
        }));
        return;
      }

      // Check if already subscribed
      let isSubscribed = false;
      let registration = state.registration;

      if (!registration && "serviceWorker" in navigator) {
        registration = await navigator.serviceWorker.ready;
      }

      if (registration) {
        const subscription = await registration.pushManager.getSubscription();
        isSubscribed = !!subscription;
      }

      setState(prev => ({
        ...prev,
        isSupported: true,
        permission,
        isSubscribed,
        isLoading: false,
        error: null,
        registration
      }));
    } catch (err) {
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: err instanceof Error ? err.message : "Failed to check push state"
      }));
    }
  }, [state.registration]);

  // Initialize on mount
  useEffect(() => {
    refreshState();
  }, [refreshState]);

  // Subscribe to push notifications
  const subscribe = useCallback(async (): Promise<boolean> => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      // Step 1: Request permission
      const permission = await requestNotificationPermission();

      if (permission === "denied") {
        setState(prev => ({
          ...prev,
          permission,
          isLoading: false,
          error: "Notification permission denied. Please enable notifications in your browser settings."
        }));
        return false;
      }

      // Step 2: Register service worker
      let registration = state.registration;
      if (!registration) {
        registration = await registerServiceWorker();
        if (!registration) {
          throw new Error("Failed to register service worker");
        }
      }

      // Step 3: Get VAPID key from server
      const vapidKey = await getVapidPublicKey();
      if (!vapidKey) {
        throw new Error("Push notifications not available on this server");
      }

      // Step 4: Subscribe with push manager
      const subscription = await subscribeWithPushManager(registration, vapidKey);
      if (!subscription) {
        throw new Error("Failed to create push subscription");
      }

      // Step 5: Send subscription to server
      const result = await apiSubscribeToPush(subscription);

      if (!result.success) {
        throw new Error("Failed to save subscription on server");
      }

      setState(prev => ({
        ...prev,
        isSubscribed: true,
        permission,
        isLoading: false,
        error: null,
        registration
      }));

      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to subscribe";
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: errorMessage
      }));
      return false;
    }
  }, [state.registration]);

  // Unsubscribe from push notifications
  const unsubscribe = useCallback(async (): Promise<boolean> => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      let registration = state.registration;
      if (!registration) {
        registration = await navigator.serviceWorker.ready;
      }

      const success = await unsubscribeFromPushManager(registration);

      if (success) {
        setState(prev => ({
          ...prev,
          isSubscribed: false,
          isLoading: false,
          error: null
        }));
      } else {
        setState(prev => ({
          ...prev,
          isLoading: false,
          error: "No active subscription found"
        }));
      }

      return success;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to unsubscribe";
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: errorMessage
      }));
      return false;
    }
  }, [state.registration]);

  return {
    ...state,
    subscribe,
    unsubscribe,
    refreshState
  };
}

// Helper hook for checking permission status text
export function getPermissionStatusText(permission: NotificationPermission | null): string {
  switch (permission) {
    case "granted":
      return "Autorisé";
    case "denied":
      return "Refusé";
    case "default":
      return "Non demandé";
    default:
      return "Inconnu";
  }
}

// Helper to check if browser supports push
export function usePushSupported(): boolean {
  const [supported, setSupported] = useState(false);

  useEffect(() => {
    setSupported(isPushSupported());
  }, []);

  return supported;
}
