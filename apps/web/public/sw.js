/**
 * MAATFEED Service Worker v2.0
 * Unified PWA Service Worker with advanced caching strategies
 */

const CACHE_VERSION = 'v2.0.0';
const STATIC_CACHE = `maatfeed-static-${CACHE_VERSION}`;
const IMAGE_CACHE = `maatfeed-images-${CACHE_VERSION}`;
const API_CACHE = `maatfeed-api-${CACHE_VERSION}`;

// Assets to cache immediately on install
const PRECACHE_ASSETS = [
  '/',
  '/index.html',
  '/offline.html',
  '/favicon.ico',
  '/favicon_io/favicon-16x16.png',
  '/favicon_io/favicon-32x32.png',
  '/favicon_io/android-chrome-192x192.png',
  '/og-image.webp',
  '/site.webmanifest'
];

// ============================================================
// INSTALL - Precache critical assets
// ============================================================
self.addEventListener('install', (event) => {
  console.log('[SW] Installing...');
  
  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then((cache) => {
        console.log('[SW] Precaching assets...');
        return cache.addAll(PRECACHE_ASSETS);
      })
      .then(() => {
        console.log('[SW] Precache complete');
        return self.skipWaiting();
      })
      .catch((err) => {
        console.error('[SW] Precache failed:', err);
        // Continue installation even if some assets fail
        return self.skipWaiting();
      })
  );
});

// ============================================================
// ACTIVATE - Clean up old caches
// ============================================================
self.addEventListener('activate', (event) => {
  console.log('[SW] Activating...');
  
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => {
            return name.startsWith('maatfeed-') && 
                   !name.includes(CACHE_VERSION);
          })
          .map((name) => {
            console.log('[SW] Deleting old cache:', name);
            return caches.delete(name);
          })
      );
    }).then(() => {
      console.log('[SW] Activation complete');
      return self.clients.claim();
    })
  );
});

// ============================================================
// FETCH - Advanced caching strategies
// ============================================================
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);
  
  // Skip non-GET requests
  if (request.method !== 'GET') return;
  
  // Skip browser extensions and chrome-extension URLs
  if (url.protocol === 'chrome-extension:' || url.protocol === 'moz-extension:') return;
  
  // Skip API requests - use Network First
  if (url.pathname.startsWith('/api/') || url.pathname.startsWith('/ws/')) {
    event.respondWith(networkFirst(request));
    return;
  }
  
  // Static assets (JS, CSS) - Cache First with background update
  if (request.destination === 'script' || request.destination === 'style') {
    event.respondWith(cacheFirstWithBackgroundUpdate(request, STATIC_CACHE));
    return;
  }
  
  // Images - Cache First
  if (request.destination === 'image' || 
      url.pathname.match(/\.(png|jpg|jpeg|gif|webp|svg|ico)$/)) {
    event.respondWith(cacheFirst(request, IMAGE_CACHE));
    return;
  }
  
  // Fonts - Cache First
  if (request.destination === 'font') {
    event.respondWith(cacheFirst(request, STATIC_CACHE));
    return;
  }
  
  // HTML Navigation - Network First with offline fallback
  if (request.mode === 'navigate') {
    event.respondWith(networkFirstWithOfflineFallback(request));
    return;
  }
  
  // Default: Network First
  event.respondWith(networkFirst(request));
});

// ============================================================
// CACHING STRATEGIES
// ============================================================

// Network First - For API calls and dynamic content
async function networkFirst(request) {
  try {
    const networkResponse = await fetch(request);
    
    // Cache successful API responses
    if (networkResponse.ok && request.url.includes('/api/')) {
      const cache = await caches.open(API_CACHE);
      cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
  } catch (error) {
    console.log('[SW] Network failed, trying cache:', request.url);
    
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }
    
    throw error;
  }
}

// Cache First - For static assets
async function cacheFirst(request, cacheName) {
  const cachedResponse = await caches.match(request);
  
  if (cachedResponse) {
    // Update cache in background
    fetch(request).then((response) => {
      if (response.ok) {
        caches.open(cacheName).then((cache) => {
          cache.put(request, response);
        });
      }
    }).catch(() => {});
    
    return cachedResponse;
  }
  
  try {
    const networkResponse = await fetch(request);
    
    if (networkResponse.ok) {
      const cache = await caches.open(cacheName);
      cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
  } catch (error) {
    console.error('[SW] Fetch failed for:', request.url);
    throw error;
  }
}

// Cache First with Background Update
async function cacheFirstWithBackgroundUpdate(request, cacheName) {
  const cachedResponse = await caches.match(request);
  
  const fetchPromise = fetch(request).then((networkResponse) => {
    if (networkResponse.ok) {
      const cache = caches.open(cacheName).then((cache) => {
        cache.put(request, networkResponse.clone());
      });
    }
    return networkResponse;
  }).catch(() => cachedResponse);
  
  return cachedResponse || fetchPromise;
}

// Network First with Offline Fallback
async function networkFirstWithOfflineFallback(request) {
  try {
    const networkResponse = await fetch(request);
    return networkResponse;
  } catch (error) {
    console.log('[SW] Network failed for navigation, trying cache...');
    
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }
    
    // Return offline page
    const offlineResponse = await caches.match('/offline.html');
    if (offlineResponse) {
      return offlineResponse;
    }
    
    // Last resort - show simple offline message
    return new Response(
      '<!DOCTYPE html><html><head><title>MAATFEED - Hors ligne</title></head><body style="background:#0B0704;color:#F5F5F5;text-align:center;padding:50px;font-family:sans-serif;"><h1>⚡ Vous êtes hors ligne</h1><p>Vérifiez votre connexion et réessayez.</p></body></html>',
      {
        status: 503,
        statusText: 'Service Unavailable',
        headers: { 'Content-Type': 'text/html' }
      }
    );
  }
}

// ============================================================
// PUSH NOTIFICATIONS
// ============================================================
self.addEventListener('push', (event) => {
  if (!event.data) return;

  try {
    const payload = event.data.json();
    const notification = payload.notification || payload;

    const options = {
      body: notification.body || 'Nouvelle notification de MAATFEED',
      icon: notification.icon || '/favicon_io/android-chrome-192x192.png',
      badge: notification.badge || '/favicon_io/favicon-32x32.png',
      tag: notification.tag || 'default',
      data: notification.data || {},
      actions: notification.actions || [
        { action: 'open', title: 'Voir' },
        { action: 'close', title: 'Fermer' }
      ],
      requireInteraction: notification.requireInteraction ?? false,
      renotify: notification.renotify ?? false,
      silent: notification.silent ?? false,
      timestamp: notification.timestamp || Date.now(),
      vibrate: [100, 50, 100]
    };

    event.waitUntil(
      self.registration.showNotification(
        notification.title || 'MAATFEED',
        options
      )
    );
  } catch (error) {
    console.error('[SW] Push error:', error);
    
    event.waitUntil(
      self.registration.showNotification('MAATFEED', {
        body: 'Nouvelle notification',
        icon: '/favicon_io/android-chrome-192x192.png'
      })
    );
  }
});

// Notification click handler
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  const notificationData = event.notification.data || {};
  const action = event.action;
  
  if (action === 'close') {
    return;
  }

  const url = notificationData.url || `/notifications/${notificationData.notificationId || ''}`;

  event.waitUntil(openUrl(url));
});

// Helper to open URL
async function openUrl(url) {
  const clients = await self.clients.matchAll({ 
    type: 'window', 
    includeUncontrolled: true 
  });

  const existingClient = clients.find((client) => 
    client.url.includes(self.location.origin)
  );

  if (existingClient) {
    await existingClient.focus();
    await existingClient.navigate(url);
    return;
  }

  await self.clients.openWindow(url);
}

// ============================================================
// MESSAGE HANDLING - Communication with main thread
// ============================================================
self.addEventListener('message', (event) => {
  const data = event.data;
  if (!data) return;

  switch (data.type) {
    case 'SKIP_WAITING':
      console.log('[SW] Skipping waiting...');
      self.skipWaiting();
      break;
      
    case 'GET_VERSION':
      if (event.ports[0]) {
        event.ports[0].postMessage({ 
          version: CACHE_VERSION,
          caches: [STATIC_CACHE, IMAGE_CACHE, API_CACHE]
        });
      }
      break;
      
    case 'CLEAR_CACHES':
      event.waitUntil(
        caches.keys().then((cacheNames) => {
          return Promise.all(
            cacheNames.map((name) => caches.delete(name))
          );
        }).then(() => {
          if (event.ports[0]) {
            event.ports[0].postMessage({ success: true });
          }
        })
      );
      break;
      
    default:
      break;
  }
});

// ============================================================
// BACKGROUND SYNC
// ============================================================
self.addEventListener('sync', (event) => {
  console.log('[SW] Background sync:', event.tag);
  
  if (event.tag === 'sync-interactions') {
    event.waitUntil(syncInteractions());
  }
  
  if (event.tag === 'sync-posts') {
    event.waitUntil(syncPosts());
  }
});

async function syncInteractions() {
  console.log('[SW] Syncing interactions...');
  // Implementation would sync queued interactions from IndexedDB
}

async function syncPosts() {
  console.log('[SW] Syncing posts...');
  // Implementation would sync queued posts from IndexedDB
}

// ============================================================
// PERIODIC SYNC (if supported)
// ============================================================
self.addEventListener('periodicsync', (event) => {
  if (event.tag === 'check-new-content') {
    event.waitUntil(checkNewContent());
  }
});

async function checkNewContent() {
  console.log('[SW] Checking for new content...');
  // Could notify app about new content availability
}

console.log('[SW] Service Worker loaded - version:', CACHE_VERSION);
