import { useEffect, useState, useCallback, useRef } from 'react';

interface ServiceWorkerState {
  isUpdateAvailable: boolean;
  isOfflineReady: boolean;
  registration: ServiceWorkerRegistration | null;
  update: () => void;
  dismissUpdate: () => void;
}

/**
 * Hook to manage Service Worker lifecycle
 * Handles update prompts and offline detection
 */
export function useServiceWorker(): ServiceWorkerState {
  const [isUpdateAvailable, setIsUpdateAvailable] = useState(false);
  const [isOfflineReady, setIsOfflineReady] = useState(false);
  const [registration, setRegistration] = useState<ServiceWorkerRegistration | null>(null);
  const newWorkerRef = useRef<ServiceWorker | null>(null);
  const isReloadingRef = useRef(false);

  const reloadForUpdate = useCallback(() => {
    if (isReloadingRef.current) {
      return;
    }

    isReloadingRef.current = true;
    setIsUpdateAvailable(false);
    window.location.reload();
  }, []);

  const update = useCallback(() => {
    if (!('serviceWorker' in navigator)) {
      return;
    }

    const worker = newWorkerRef.current || registration?.waiting || registration?.installing;

    navigator.serviceWorker.addEventListener('controllerchange', reloadForUpdate, { once: true });

    if (!worker) {
      void registration?.update();
      return;
    }

    worker.addEventListener('statechange', () => {
      if (worker.state === 'activated') {
        reloadForUpdate();
      }
    });

    if (worker.state === 'activated') {
      reloadForUpdate();
      return;
    }

    worker.postMessage({ type: 'SKIP_WAITING' });
  }, [registration, reloadForUpdate]);

  const dismissUpdate = useCallback(() => {
    setIsUpdateAvailable(false);
  }, []);

  useEffect(() => {
    // Listen for custom swUpdate event from serviceWorkerRegistration
    const handleUpdate = (event: Event) => {
      const customEvent = event as CustomEvent<ServiceWorkerRegistration>;
      setRegistration(customEvent.detail);
      newWorkerRef.current = customEvent.detail.waiting || customEvent.detail.installing;
      setIsUpdateAvailable(true);
    };

    const handleSuccess = () => {
      setIsOfflineReady(true);
    };

    window.addEventListener('swUpdate', handleUpdate);
    window.addEventListener('swSuccess', handleSuccess);

    // Check for online/offline status
    const handleOnline = () => {
      console.log('[PWA] App is online');
    };

    const handleOffline = () => {
      console.log('[PWA] App is offline');
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Check current SW registration
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.ready.then((reg) => {
        setRegistration(reg);
        
        // Check if there's already a waiting worker
        if (reg.waiting) {
          newWorkerRef.current = reg.waiting;
          setIsUpdateAvailable(true);
        }
      });
    }

    return () => {
      window.removeEventListener('swUpdate', handleUpdate);
      window.removeEventListener('swSuccess', handleSuccess);
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return {
    isUpdateAvailable,
    isOfflineReady,
    registration,
    update,
    dismissUpdate
  };
}

/**
 * Hook to track PWA install prompt
 */
export function usePWAInstall() {
  const [canInstall, setCanInstall] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<Event | null>(null);

  useEffect(() => {
    const handleBeforeInstallPrompt = (e: Event) => {
      // Prevent the mini-infobar from appearing on mobile
      e.preventDefault();
      // Store the event for later use
      setDeferredPrompt(e);
      setCanInstall(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // Check if app is already installed
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setCanInstall(false);
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const promptInstall = useCallback(async () => {
    if (!deferredPrompt) return;

    // Show the install prompt
    const promptEvent = deferredPrompt as any;
    promptEvent.prompt();

    // Wait for the user to respond to the prompt
    const { outcome } = await promptEvent.userChoice;
    
    if (outcome === 'accepted') {
      console.log('[PWA] User accepted install prompt');
    } else {
      console.log('[PWA] User dismissed install prompt');
    }

    // Clear the saved prompt since it can't be used again
    setDeferredPrompt(null);
    setCanInstall(false);
  }, [deferredPrompt]);

  return {
    canInstall,
    promptInstall
  };
}

/**
 * Hook to track connection status
 */
export function useConnectionStatus() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [connectionType, setConnectionType] = useState<string>('unknown');

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Check connection type if available
    const conn = (navigator as any).connection;
    if (conn) {
      setConnectionType(conn.effectiveType || 'unknown');
      
      conn.addEventListener('change', () => {
        setConnectionType(conn.effectiveType || 'unknown');
      });
    }

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return { isOnline, connectionType };
}
