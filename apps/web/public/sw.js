/**
 * MAAT FEED Service Worker
 * Handles push notifications and background sync
 */

const CACHE_NAME = "maatfeed-v1";
const STATIC_ASSETS = [
  "/",
  "/index.html",
  "/favicon.ico",
  "/og-image.webp"
];

// Install event - cache static assets
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS);
    }).then(() => {
      return self.skipWaiting();
    })
  );
});

// Activate event - clean up old caches
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_NAME)
          .map((name) => caches.delete(name))
      );
    }).then(() => {
      return self.clients.claim();
    })
  );
});

// Fetch event - network first, fallback to cache
self.addEventListener("fetch", (event) => {
  // Skip non-GET requests
  if (event.request.method !== "GET") return;
  
  // Skip API requests
  if (event.request.url.includes("/api/")) return;

  event.respondWith(
    fetch(event.request)
      .then((response) => {
        // Clone the response before caching
        const responseClone = response.clone();
        caches.open(CACHE_NAME).then((cache) => {
          cache.put(event.request, responseClone);
        });
        return response;
      })
      .catch(() => {
        return caches.match(event.request);
      })
  );
});

// Push event - show notification
self.addEventListener("push", (event) => {
  if (!event.data) return;

  try {
    const data = event.data.json();
    const notification = data.notification || {};

    const options = {
      body: notification.body || "Nouvelle notification de MAAT FEED",
      icon: notification.icon || "/favicon/android-chrome-192x192.png",
      badge: notification.badge || "/favicon/android-chrome-192x192.png",
      tag: notification.tag || "default",
      requireInteraction: notification.requireInteraction ?? false,
      renotify: notification.renotify ?? false,
      silent: notification.silent ?? false,
      timestamp: notification.timestamp || Date.now(),
      data: notification.data || {},
      actions: notification.actions || []
    };

    event.waitUntil(
      self.registration.showNotification(
        notification.title || "MAAT FEED",
        options
      )
    );
  } catch (error) {
    console.error("[Service Worker] Error handling push:", error);
    
    // Fallback notification
    event.waitUntil(
      self.registration.showNotification("MAAT FEED", {
        body: "Nouvelle notification",
        icon: "/favicon/android-chrome-192x192.png"
      })
    );
  }
});

// Notification click event - handle user interaction
self.addEventListener("notificationclick", (event) => {
  event.notification.close();

  const notificationData = event.notification.data || {};
  const url = notificationData.url || "/";

  event.waitUntil(
    self.clients.matchAll({ type: "window", includeUncontrolled: true })
      .then((clientList) => {
        // If a window client is already open, focus it and navigate
        for (const client of clientList) {
          if (client.url && "focus" in client) {
            client.focus();
            client.postMessage({
              type: "NOTIFICATION_CLICK",
              url: url,
              notificationId: notificationData.notificationId
            });
            return;
          }
        }
        
        // Otherwise, open a new window
        if (self.clients.openWindow) {
          return self.clients.openWindow(url);
        }
      })
  );
});

// Message event - handle messages from the main thread
self.addEventListener("message", (event) => {
  const data = event.data;
  
  if (!data) return;

  switch (data.type) {
    case "SKIP_WAITING":
      self.skipWaiting();
      break;
      
    case "GET_VERSION":
      event.ports[0].postMessage({ version: CACHE_NAME });
      break;
      
    default:
      break;
  }
});

// Sync event - handle background sync (for offline form submissions)
self.addEventListener("sync", (event) => {
  if (event.tag === "sync-interactions") {
    event.waitUntil(syncInteractions());
  }
});

async function syncInteractions() {
  // Placeholder for background sync logic
  // This would sync any queued interactions when coming back online
  console.log("[Service Worker] Syncing interactions...");
}
