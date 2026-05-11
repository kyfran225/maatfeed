import React from 'react';

// Offline service for basic offline functionality

export interface OfflineConfig {
  enabled: boolean;
  cacheSize: number; // in MB
  maxAge: number; // in hours
  autoSync: boolean;
}

interface CacheEntry {
  url: string;
  data: any;
  timestamp: number;
  expiresAt: number;
  contentType: string;
}

class OfflineService {
  private static instance: OfflineService;
  private config: OfflineConfig;
  private cache: Map<string, CacheEntry> = new Map();
  private db: IDBDatabase | null = null;
  private syncQueue: Array<{ url: string; method: string; data?: any }> = [];
  private isOnline = navigator.onLine;

  private constructor() {
    this.config = this.getDefaultConfig();
    this.initializeService();
    this.setupEventListeners();
  }

  static getInstance(): OfflineService {
    if (!OfflineService.instance) {
      OfflineService.instance = new OfflineService();
    }
    return OfflineService.instance;
  }

  private getDefaultConfig(): OfflineConfig {
    return {
      enabled: true,
      cacheSize: 50, // 50MB
      maxAge: 24, // 24 hours
      autoSync: true
    };
  }

  private async initializeService() {
    // Load saved preferences
    this.loadPreferences();
    
    // Initialize IndexedDB
    if ('indexedDB' in window) {
      await this.initializeIndexedDB();
    }
    
    // Load cached data
    await this.loadCacheFromIndexedDB();
    
    // Clean expired entries
    this.cleanExpiredEntries();
    
    // Setup service worker if available
    this.setupServiceWorker();
  }

  private setupEventListeners() {
    // Monitor online/offline status
    window.addEventListener('online', () => {
      this.isOnline = true;
      this.handleOnlineStatus();
    });

    window.addEventListener('offline', () => {
      this.isOnline = false;
      this.handleOfflineStatus();
    });

    // Monitor page visibility to sync when returning to page
    document.addEventListener('visibilitychange', () => {
      if (!document.hidden && this.isOnline && this.config.autoSync) {
        this.syncOfflineChanges();
      }
    });
  }

  private async initializeIndexedDB() {
    return new Promise<void>((resolve, reject) => {
      const request = indexedDB.open('MaatfeedOffline', 1);
      
      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        this.db = request.result;
        resolve();
      };
      
      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        
        if (!db.objectStoreNames.contains('cache')) {
          const cacheStore = db.createObjectStore('cache', { keyPath: 'url' });
          cacheStore.createIndex('timestamp', 'timestamp', { unique: false });
          cacheStore.createIndex('expiresAt', 'expiresAt', { unique: false });
        }
        
        if (!db.objectStoreNames.contains('syncQueue')) {
          db.createObjectStore('syncQueue', { keyPath: 'id', autoIncrement: true });
        }
      };
    });
  }

  private async loadCacheFromIndexedDB() {
    if (!this.db) return;

    try {
      const transaction = this.db.transaction(['cache'], 'readonly');
      const store = transaction.objectStore('cache');
      const request = store.getAll();
      
      request.onsuccess = () => {
        const entries = request.result;
        entries.forEach((entry: CacheEntry) => {
          this.cache.set(entry.url, entry);
        });
      };
    } catch (error) {
      console.warn('Failed to load cache from IndexedDB:', error);
    }
  }

  private async saveCacheToIndexedDB(entry: CacheEntry) {
    if (!this.db) return;

    try {
      const transaction = this.db.transaction(['cache'], 'readwrite');
      const store = transaction.objectStore('cache');
      await store.put(entry);
    } catch (error) {
      console.warn('Failed to save cache to IndexedDB:', error);
    }
  }

  private setupServiceWorker() {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js')
        .then((registration) => {
          console.log('Service Worker registered:', registration);
        })
        .catch((error) => {
          console.warn('Service Worker registration failed:', error);
        });
    }
  }

  private handleOnlineStatus() {
    console.log('App is online');
    this.syncOfflineChanges();
    
    // Notify components that we're online
    window.dispatchEvent(new CustomEvent('online-status', { 
      detail: { isOnline: true } 
    }));
  }

  private handleOfflineStatus() {
    console.log('App is offline');
    
    // Notify components that we're offline
    window.dispatchEvent(new CustomEvent('online-status', { 
      detail: { isOnline: false } 
    }));
  }

  // Public API methods
  async cacheData(url: string, data: any, contentType = 'application/json') {
    if (!this.config.enabled) return;

    const entry: CacheEntry = {
      url,
      data,
      timestamp: Date.now(),
      expiresAt: Date.now() + (this.config.maxAge * 60 * 60 * 1000),
      contentType
    };

    // Save to memory cache
    this.cache.set(url, entry);
    
    // Save to IndexedDB
    await this.saveCacheToIndexedDB(entry);
    
    // Check cache size and clean if necessary
    this.checkCacheSize();
  }

  async getCachedData(url: string): Promise<any | null> {
    if (!this.config.enabled) return null;

    // Check memory cache first
    const entry = this.cache.get(url);
    
    if (entry && entry.expiresAt > Date.now()) {
      return entry.data;
    }
    
    // Check IndexedDB if not in memory cache
    if (this.db) {
      try {
        const transaction = this.db.transaction(['cache'], 'readonly');
        const store = transaction.objectStore('cache');
        const request = store.get(url);
        
        return new Promise((resolve) => {
          request.onsuccess = () => {
            const dbEntry = request.result;
            if (dbEntry && dbEntry.expiresAt > Date.now()) {
              // Add to memory cache
              this.cache.set(url, dbEntry);
              resolve(dbEntry.data);
            } else {
              resolve(null);
            }
          };
          request.onerror = () => resolve(null);
        });
      } catch (error) {
        console.warn('Failed to get cached data:', error);
        return null;
      }
    }
    
    return null;
  }

  async fetchWithCache(url: string, options: RequestInit = {}): Promise<Response> {
    // Try to get from cache first
    const cachedData = await this.getCachedData(url);
    
    if (cachedData) {
      return new Response(JSON.stringify(cachedData), {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'X-Offline-Cache': 'true'
        }
      });
    }

    // If not cached and online, fetch from network
    if (this.isOnline) {
      try {
        const response = await fetch(url, options);
        
        // Cache successful responses
        if (response.ok) {
          const data = await response.clone().json();
          await this.cacheData(url, data, response.headers.get('Content-Type') || 'application/json');
        }
        
        return response;
      } catch (error) {
        console.warn('Network request failed:', error);
        throw error;
      }
    }
    
    // If offline and not cached, return offline response
    return new Response(JSON.stringify({ 
      error: 'No network connection and data not cached',
      offline: true 
    }), {
      status: 503,
      headers: {
        'Content-Type': 'application/json',
        'X-Offline': 'true'
      }
    });
  }

  private async syncOfflineChanges() {
    if (!this.config.autoSync || this.syncQueue.length === 0) return;

    console.log(`Syncing ${this.syncQueue.length} offline changes...`);
    
    for (const item of this.syncQueue) {
      try {
        const response = await fetch(item.url, {
          method: item.method,
          headers: {
            'Content-Type': 'application/json'
          },
          body: item.data ? JSON.stringify(item.data) : undefined
        });

        if (response.ok) {
          // Remove from queue on successful sync
          const index = this.syncQueue.findIndex(q => q === item);
          if (index > -1) {
            this.syncQueue.splice(index, 1);
          }
        }
      } catch (error) {
        console.warn('Failed to sync offline change:', error);
      }
    }

    // Save updated queue
    await this.saveSyncQueue();
  }

  private cleanExpiredEntries() {
    const now = Date.now();
    const expiredKeys: string[] = [];
    
    this.cache.forEach((entry, url) => {
      if (entry.expiresAt <= now) {
        expiredKeys.push(url);
      }
    });
    
    // Remove expired entries
    expiredKeys.forEach(url => {
      this.cache.delete(url);
    });
    
    // Also clean IndexedDB
    if (this.db && expiredKeys.length > 0) {
      const transaction = this.db.transaction(['cache'], 'readwrite');
      const store = transaction.objectStore('cache');
      
      expiredKeys.forEach(url => {
        store.delete(url);
      });
    }
  }

  private checkCacheSize() {
    // Simple size estimation - in production, you'd track actual size
    const estimatedSize = this.cache.size * 1024; // Rough estimate
    const maxSizeBytes = this.config.cacheSize * 1024 * 1024;
    
    if (estimatedSize > maxSizeBytes) {
      // Remove oldest entries
      const entries = Array.from(this.cache.entries())
        .sort((a, b) => a[1].timestamp - b[1].timestamp);
      
      const toRemove = Math.ceil((estimatedSize - maxSizeBytes) / 1024);
      
      for (let i = 0; i < toRemove && i < entries.length; i++) {
        const [url] = entries[i];
        this.cache.delete(url);
        
        // Also remove from IndexedDB
        if (this.db) {
          const transaction = this.db.transaction(['cache'], 'readwrite');
          transaction.objectStore('cache').delete(url);
        }
      }
    }
  }

  private loadPreferences() {
    try {
      const saved = localStorage.getItem('maat_offline_config');
      if (saved) {
        const parsedConfig = JSON.parse(saved);
        this.config = { ...this.config, ...parsedConfig };
      }
    } catch (error) {
      console.warn('Failed to load offline preferences:', error);
    }
  }

  private savePreferences() {
    try {
      localStorage.setItem('maat_offline_config', JSON.stringify(this.config));
    } catch (error) {
      console.warn('Failed to save offline preferences:', error);
    }
  }

  private async saveSyncQueue() {
    if (!this.db) return;

    try {
      const transaction = this.db.transaction(['syncQueue'], 'readwrite');
      const store = transaction.objectStore('syncQueue');
      
      // Clear existing queue
      await store.clear();
      
      // Add all items
      for (const item of this.syncQueue) {
        await store.add(item);
      }
    } catch (error) {
      console.warn('Failed to save sync queue:', error);
    }
  }

  // Public API
  getConfig(): OfflineConfig {
    return { ...this.config };
  }

  updateConfig(updates: Partial<OfflineConfig>) {
    this.config = { ...this.config, ...updates };
    this.savePreferences();
  }

  isCurrentlyOnline(): boolean {
    return this.isOnline;
  }

  clearCache() {
    this.cache.clear();
    
    if (this.db) {
      const transaction = this.db.transaction(['cache'], 'readwrite');
      transaction.objectStore('cache').clear();
    }
  }

  getCacheStats() {
    return {
      size: this.cache.size,
      maxSize: this.config.cacheSize,
      isOnline: this.isOnline,
      queueLength: this.syncQueue.length
    };
  }
}

export const offlineService = OfflineService.getInstance();

// React hook
export function useOffline() {
  const [isOnline, setIsOnline] = React.useState(offlineService.isCurrentlyOnline());
  const [stats, setStats] = React.useState(offlineService.getCacheStats());

  React.useEffect(() => {
    const handleOnlineStatus = (event: CustomEvent) => {
      setIsOnline(event.detail.isOnline);
      setStats(offlineService.getCacheStats());
    };

    window.addEventListener('online-status', handleOnlineStatus as EventListener);
    
    return () => {
      window.removeEventListener('online-status', handleOnlineStatus as EventListener);
    };
  }, []);

  return {
    isOnline,
    stats,
    config: offlineService.getConfig(),
    updateConfig: offlineService.updateConfig.bind(offlineService),
    clearCache: offlineService.clearCache.bind(offlineService),
    fetchWithCache: offlineService.fetchWithCache.bind(offlineService),
    cacheData: offlineService.cacheData.bind(offlineService),
    getCachedData: offlineService.getCachedData.bind(offlineService)
  };
}
