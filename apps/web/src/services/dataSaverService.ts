import { useState, useEffect, useCallback } from 'react';
import { performanceService } from './performanceService';

export interface DataSaverConfig {
  enabled: boolean;
  autoMode: boolean; // Automatically enable based on network
  imageQuality: 'low' | 'medium' | 'high';
  videoQuality: 'low' | 'medium' | 'high';
  preloadContent: boolean;
  backgroundSync: boolean;
  reducedAnimations: boolean;
  compressData: boolean;
}

export interface DataUsage {
  total: number; // in bytes
  images: number;
  videos: number;
  audio: number;
  other: number;
  period: 'daily' | 'weekly' | 'monthly';
}

class DataSaverService {
  private static instance: DataSaverService;
  private config: DataSaverConfig = {
    enabled: false,
    autoMode: true,
    imageQuality: 'medium',
    videoQuality: 'medium',
    preloadContent: true,
    backgroundSync: true,
    reducedAnimations: false,
    compressData: true
  };

  private dataUsage: DataUsage = {
    total: 0,
    images: 0,
    videos: 0,
    audio: 0,
    other: 0,
    period: 'daily'
  };

  private listeners: Set<(config: DataSaverConfig) => void> = new Set();

  private constructor() {
    this.loadConfig();
    this.loadDataUsage();
    this.setupNetworkMonitoring();
    this.setupDataUsageTracking();
  }

  static getInstance(): DataSaverService {
    if (!DataSaverService.instance) {
      DataSaverService.instance = new DataSaverService();
    }
    return DataSaverService.instance;
  }

  private loadConfig(): void {
    try {
      const stored = localStorage.getItem('maatfeed-data-saver-config');
      if (stored) {
        this.config = { ...this.config, ...JSON.parse(stored) };
      }
    } catch (error) {
      console.warn('Failed to load data saver config:', error);
    }
  }

  private saveConfig(): void {
    try {
      localStorage.setItem('maatfeed-data-saver-config', JSON.stringify(this.config));
      this.notifyListeners();
    } catch (error) {
      console.warn('Failed to save data saver config:', error);
    }
  }

  private loadDataUsage(): void {
    try {
      const stored = localStorage.getItem('maatfeed-data-usage');
      if (stored) {
        this.dataUsage = { ...this.dataUsage, ...JSON.parse(stored) };
      }
    } catch (error) {
      console.warn('Failed to load data usage:', error);
    }
  }

  private saveDataUsage(): void {
    try {
      localStorage.setItem('maatfeed-data-usage', JSON.stringify(this.dataUsage));
    } catch (error) {
      console.warn('Failed to save data usage:', error);
    }
  }

  private setupNetworkMonitoring(): void {
    if ('connection' in navigator) {
      const connection = (navigator as any).connection;
      
      const updateConfig = () => {
        if (this.config.autoMode) {
          const effectiveType = connection.effectiveType;
          const saveData = connection.saveData;
          
          // Auto-enable data saver on slow networks or when requested
          const shouldEnable = saveData || ['slow-2g', '2g'].includes(effectiveType);
          
          if (shouldEnable !== this.config.enabled) {
            this.config.enabled = shouldEnable;
            
            // Adjust quality settings based on network
            if (shouldEnable) {
              this.config.imageQuality = effectiveType === 'slow-2g' ? 'low' : 'medium';
              this.config.videoQuality = 'low';
              this.config.preloadContent = false;
              this.config.reducedAnimations = true;
            } else {
              this.config.imageQuality = 'medium';
              this.config.videoQuality = 'medium';
              this.config.preloadContent = true;
              this.config.reducedAnimations = false;
            }
            
            this.saveConfig();
          }
        }
      };

      connection.addEventListener('change', updateConfig);
      updateConfig(); // Initial check
    }
  }

  private setupDataUsageTracking(): void {
    // Track data usage for different content types
    if ('PerformanceObserver' in window) {
      try {
        const observer = new PerformanceObserver((list) => {
          list.getEntries().forEach((entry) => {
            if (entry.name.includes('.jpg') || entry.name.includes('.png') || entry.name.includes('.webp')) {
              this.trackDataUsage('images', (entry as any).transferSize || 0);
            } else if (entry.name.includes('.mp4') || entry.name.includes('.webm')) {
              this.trackDataUsage('videos', (entry as any).transferSize || 0);
            } else if (entry.name.includes('.mp3') || entry.name.includes('.wav')) {
              this.trackDataUsage('audio', (entry as any).transferSize || 0);
            } else {
              this.trackDataUsage('other', (entry as any).transferSize || 0);
            }
          });
        });
        observer.observe({ entryTypes: ['resource'] });
      } catch (error) {
        console.warn('Data usage tracking not supported:', error);
      }
    }
  }

  private trackDataUsage(type: keyof Omit<DataUsage, 'total' | 'period'>, bytes: number): void {
    this.dataUsage[type] += bytes;
    this.dataUsage.total += bytes;
    this.saveDataUsage();
  }

  private notifyListeners(): void {
    this.listeners.forEach(listener => listener(this.config));
  }

  // Public methods
  getConfig(): DataSaverConfig {
    return { ...this.config };
  }

  updateConfig(updates: Partial<DataSaverConfig>): void {
    this.config = { ...this.config, ...updates };
    this.saveConfig();
  }

  getDataUsage(): DataUsage {
    return { ...this.dataUsage };
  }

  resetDataUsage(): void {
    this.dataUsage = {
      total: 0,
      images: 0,
      videos: 0,
      audio: 0,
      other: 0,
      period: this.dataUsage.period
    };
    this.saveDataUsage();
  }

  subscribe(listener: (config: DataSaverConfig) => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  // Utility methods
  shouldCompressImages(): boolean {
    return this.config.enabled && this.config.compressData;
  }

  shouldReduceQuality(): boolean {
    return this.config.enabled;
  }

  getImageQuality(): number {
    switch (this.config.imageQuality) {
      case 'low': return 50;
      case 'medium': return 70;
      case 'high': return 90;
      default: return 75;
    }
  }

  getVideoQuality(): string {
    switch (this.config.videoQuality) {
      case 'low': return '480p';
      case 'medium': return '720p';
      case 'high': return '1080p';
      default: return '720p';
    }
  }

  shouldPreloadContent(): boolean {
    return !this.config.enabled || this.config.preloadContent;
  }

  shouldReduceAnimations(): boolean {
    return this.config.enabled && this.config.reducedAnimations;
  }

  formatDataUsage(bytes: number): string {
    const units = ['B', 'KB', 'MB', 'GB'];
    let size = bytes;
    let unitIndex = 0;
    
    while (size >= 1024 && unitIndex < units.length - 1) {
      size /= 1024;
      unitIndex++;
    }
    
    return `${size.toFixed(1)} ${units[unitIndex]}`;
  }
}

// React hook for data saver
export function useDataSaver() {
  const [config, setConfig] = useState<DataSaverConfig>(() => 
    DataSaverService.getInstance().getConfig()
  );
  const [dataUsage, setDataUsage] = useState<DataUsage>(() => 
    DataSaverService.getInstance().getDataUsage()
  );

  useEffect(() => {
    const dataSaverService = DataSaverService.getInstance();
    
    const unsubscribe = dataSaverService.subscribe((newConfig) => {
      setConfig(newConfig);
    });

    // Update data usage periodically
    const interval = setInterval(() => {
      setDataUsage(dataSaverService.getDataUsage());
    }, 5000);

    return () => {
      unsubscribe();
      clearInterval(interval);
    };
  }, []);

  const updateConfig = useCallback((updates: Partial<DataSaverConfig>) => {
    DataSaverService.getInstance().updateConfig(updates);
  }, []);

  const resetDataUsage = useCallback(() => {
    DataSaverService.getInstance().resetDataUsage();
    setDataUsage(DataSaverService.getInstance().getDataUsage());
  }, []);

  return {
    config,
    dataUsage,
    updateConfig,
    resetDataUsage,
    formatDataUsage: DataSaverService.getInstance().formatDataUsage.bind(DataSaverService.getInstance())
  };
}

// React hook for optimized image loading
export function useOptimizedImage(src: string, options?: {
  width?: number;
  height?: number;
  quality?: 'low' | 'medium' | 'high';
}) {
  const [optimizedSrc, setOptimizedSrc] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const { config } = useDataSaver();

  useEffect(() => {
    if (!src) return;

    const dataSaverService = DataSaverService.getInstance();
    
    // Determine quality based on data saver settings
    let quality = options?.quality || config.imageQuality;
    if (config.enabled && !options?.quality) {
      quality = config.imageQuality;
    }

    // Get optimized URL from performance service
    const optimized = performanceService.getOptimizedImageUrl(src, options?.width, options?.height);
    
    // Apply data saver quality adjustments
    const qualityParam = dataSaverService.getImageQuality();
    const separator = optimized.includes('?') ? '&' : '?';
    const finalUrl = `${optimized}${separator}q=${qualityParam}`;

    setOptimizedSrc(finalUrl);
    setIsLoading(false);
  }, [src, options, config]);

  return {
    src: optimizedSrc,
    isLoading
  };
}

export default DataSaverService;
