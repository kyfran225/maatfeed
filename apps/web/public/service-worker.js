/**
 * MAAT FEED Service Worker
 * Handles web push notifications and caching
 */

const CACHE_NAME = 'maat-feed-v2';
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/favicon.ico',
  '/favicon_io/android-chrome-192x192.png',
  '/favicon_io/favicon-32x32.png'
];

// Install event - cache static assets
self.addEventListener('install', (event) => {
  console.log('[Service Worker] Installing...');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(STATIC_ASSETS))
      .then(() => self.skipWaiting())
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('[Service Worker] Activating...');
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames
          .filter(name => name !== CACHE_NAME)
          .map(name => caches.delete(name))
      );
    }).then(() => self.clients.claim())
  );
});

// Push event - handle incoming push notifications
self.addEventListener('push', (event) => {
  console.log('[Service Worker] Push received:', event);

  if (!event.data) {
    return;
  }

  try {
    const payload = event.data.json();
    const notification = payload.notification || payload;

    const options = {
      body: notification.body || '',
      icon: notification.icon || '/favicon_io/android-chrome-192x192.png',
      badge: notification.badge || '/favicon_io/favicon-32x32.png',
      tag: notification.tag || 'default',
      data: notification.data || {},
      actions: notification.actions || [],
      requireInteraction: notification.requireInteraction || false,
      renotify: notification.renotify || false,
      silent: notification.silent || false,
      timestamp: notification.timestamp || Date.now(),
      vibrate: [100, 50, 100] // Pattern: vibrate, pause, vibrate
    };

    event.waitUntil(
      self.registration.showNotification(notification.title || 'MAAT FEED', options)
    );
  } catch (error) {
    console.error('[Service Worker] Error handling push:', error);

    // Fallback notification if parsing fails
    event.waitUntil(
      self.registration.showNotification('MAAT FEED', {
        body: 'You have a new notification',
        icon: '/favicon_io/android-chrome-192x192.png',
        badge: '/favicon_io/favicon-32x32.png'
      })
    );
  }
});

// Notification click event - handle user interaction
self.addEventListener('notificationclick', (event) => {
  console.log('[Service Worker] Notification click:', event);

  event.notification.close();

  const notificationData = event.notification.data || {};
  const action = event.action;

  // Handle specific actions
  if (action === 'open') {
    event.waitUntil(openUrl(notificationData.url || '/'));
    return;
  }

  if (action === 'close') {
    // Just close the notification (already done above)
    return;
  }

  // Default: open the app to the relevant page
  const url = notificationData.url || `/notifications/${notificationData.notificationId || ''}`;
  event.waitUntil(openUrl(url));
});

// Helper function to open URL and focus client
async function openUrl(url) {
  const clients = await self.clients.matchAll({ type: 'window', includeUncontrolled: true });

  // Check if there's already a window open
  const existingClient = clients.find(client => client.url.includes(self.location.origin));

  if (existingClient) {
    // Focus existing window and navigate
    await existingClient.focus();
    await existingClient.navigate(url);
    return;
  }

  // Open new window
  await self.clients.openWindow(url);
}

// Message event - handle messages from the main app
self.addEventListener('message', (event) => {
  console.log('[Service Worker] Message received:', event.data);

  if (event.data?.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});
