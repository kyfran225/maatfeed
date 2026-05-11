/**
 * Performance Optimization Service for MAATFEED
 * Target: < 4s load time on mobile 3G
 */

export interface PerformanceMetrics {
  loadTime: number;
  firstContentfulPaint: number;
  largestContentfulPaint: number;
  cumulativeLayoutShift: number;
  firstInputDelay: number;
  memoryUsage: number;
  networkType: string;
  deviceType: string;
}

export interface OptimizationConfig {
  // Image optimization
  imageQuality: number;
  lazyLoading: boolean;
  placeholderQuality: number;
  
  // Network optimization
  compressionEnabled: boolean;
  cachingEnabled: boolean;
  prefetchEnabled: boolean;
  
  // Loading optimization
  criticalCSS: boolean;
  resourceHints: boolean;
  bundleSplitting: boolean;
  
  // Mobile specific
  dataSaverMode: boolean;
  reducedMotion: boolean;
  touchOptimized: boolean;
}

class PerformanceService {
  private metrics: PerformanceMetrics = {
    loadTime: 0,
    firstContentfulPaint: 0,
    largestContentfulPaint: 0,
    cumulativeLayoutShift: 0,
    firstInputDelay: 0,
    memoryUsage: 0,
    networkType: 'unknown',
    deviceType: 'unknown'
  };

  private config: OptimizationConfig = {
    imageQuality: 75,
    lazyLoading: true,
    placeholderQuality: 20,
    compressionEnabled: true,
    cachingEnabled: true,
    prefetchEnabled: true,
    criticalCSS: true,
    resourceHints: true,
    bundleSplitting: true,
    dataSaverMode: false,
    reducedMotion: false,
    touchOptimized: true
  };

  constructor() {
    this.initializePerformanceMonitoring();
    this.detectNetworkConditions();
    this.optimizeForDevice();
  }

  /**
   * Initialize performance monitoring
   */
  private initializePerformanceMonitoring(): void {
    if (typeof window !== 'undefined' && 'performance' in window) {
      // Monitor page load
      window.addEventListener('load', () => {
        this.measurePageLoad();
      });

      // Monitor Core Web Vitals
      this.observeWebVitals();

      // Monitor memory usage
      this.monitorMemoryUsage();
    }
  }

  /**
   * Detect network conditions and adjust configuration
   */
  private detectNetworkConditions(): void {
    if ('connection' in navigator) {
      const connection = (navigator as any).connection;
      this.metrics.networkType = connection.effectiveType || 'unknown';

      // Adjust configuration based on network
      switch (connection.effectiveType) {
        case 'slow-2g':
        case '2g':
          this.config.imageQuality = 50;
          this.config.dataSaverMode = true;
          this.config.prefetchEnabled = false;
          break;
        case '3g':
          this.config.imageQuality = 65;
          this.config.dataSaverMode = false;
          break;
        case '4g':
          this.config.imageQuality = 80;
          break;
      }
    }
  }

  /**
   * Optimize for device capabilities
   */
  private optimizeForDevice(): void {
    if (typeof window !== 'undefined') {
      // Detect device type
      const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
      this.metrics.deviceType = isMobile ? 'mobile' : 'desktop';

      // Adjust for mobile
      if (isMobile) {
        this.config.reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        this.config.touchOptimized = true;
      }

      // Detect memory constraints
      if ('deviceMemory' in navigator) {
        const memory = (navigator as any).deviceMemory;
        if (memory < 4) {
          this.config.bundleSplitting = true;
        }
      }
    }
  }

  /**
   * Measure page load performance
   */
  private measurePageLoad(): void {
    if ('performance' in window && 'getEntriesByType' in performance) {
      const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
      this.metrics.loadTime = navigation.loadEventEnd - navigation.loadEventStart;
      
      // Log performance metrics
      console.log('Page Load Time:', this.metrics.loadTime + 'ms');
      
      // Check if we meet our target
      if (this.metrics.loadTime > 4000) {
        console.warn('Page load time exceeds 4s target:', this.metrics.loadTime + 'ms');
        this.suggestOptimizations();
      }
    }
  }

  /**
   * Observe Core Web Vitals
   */
  private observeWebVitals(): void {
    // First Contentful Paint
    if ('PerformanceObserver' in window) {
      try {
        const observer = new PerformanceObserver((list) => {
          list.getEntries().forEach((entry) => {
            if (entry.name === 'first-contentful-paint') {
              this.metrics.firstContentfulPaint = entry.startTime;
            }
          });
        });
        observer.observe({ type: 'paint', buffered: true });
      } catch (e) {
        console.warn('Performance Observer not supported for paint');
      }

      // Largest Contentful Paint
      try {
        const observer = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          const lastEntry = entries[entries.length - 1];
          this.metrics.largestContentfulPaint = lastEntry.startTime;
        });
        observer.observe({ type: 'largest-contentful-paint', buffered: true });
      } catch (e) {
        console.warn('Performance Observer not supported for LCP');
      }

      // Cumulative Layout Shift
      try {
        let clsValue = 0;
        const observer = new PerformanceObserver((list) => {
          list.getEntries().forEach((entry) => {
            if (!(entry as any).hadRecentInput) {
              clsValue += (entry as any).value;
            }
          });
          this.metrics.cumulativeLayoutShift = clsValue;
        });
        observer.observe({ type: 'layout-shift', buffered: true });
      } catch (e) {
        console.warn('Performance Observer not supported for CLS');
      }
    }
  }

  /**
   * Monitor memory usage
   */
  private monitorMemoryUsage(): void {
    if ('memory' in performance) {
      const memory = (performance as any).memory;
      this.metrics.memoryUsage = memory.usedJSHeapSize;
      
      // Log memory usage periodically
      setInterval(() => {
        this.metrics.memoryUsage = memory.usedJSHeapSize;
        if (memory.usedJSHeapSize > memory.jsHeapSizeLimit * 0.8) {
          console.warn('High memory usage detected:', memory.usedJSHeapSize);
        }
      }, 30000); // Check every 30 seconds
    }
  }

  /**
   * Suggest optimizations based on metrics
   */
  private suggestOptimizations(): void {
    const suggestions: string[] = [];

    if (this.metrics.loadTime > 4000) {
      suggestions.push('Enable more aggressive lazy loading');
      suggestions.push('Reduce image quality further');
      suggestions.push('Implement code splitting');
    }

    if (this.metrics.firstContentfulPaint > 2000) {
      suggestions.push('Optimize critical CSS');
      suggestions.push('Reduce render-blocking resources');
    }

    if (this.metrics.largestContentfulPaint > 2500) {
      suggestions.push('Optimize images and videos');
      suggestions.push('Remove unused CSS/JS');
    }

    if (this.metrics.cumulativeLayoutShift > 0.1) {
      suggestions.push('Add explicit dimensions to images/videos');
      suggestions.push('Avoid inserting content above existing content');
    }

    if (suggestions.length > 0) {
      console.log('Performance Optimization Suggestions:', suggestions);
    }
  }

  /**
   * Get optimized image URL
   */
  getOptimizedImageUrl(originalUrl: string, width?: number, height?: number): string {
    if (!originalUrl) return '';

    // If it's already an optimized URL, return as is
    if (originalUrl.includes('?')) {
      return originalUrl;
    }

    // Add optimization parameters
    const params = new URLSearchParams();
    
    // Quality based on network and config
    params.set('q', this.config.imageQuality.toString());
    
    // Auto format selection
    params.set('auto', 'format');
    
    // Dimensions if provided
    if (width) params.set('w', width.toString());
    if (height) params.set('h', height.toString());
    
    // Add placeholder for lazy loading
    if (this.config.lazyLoading) {
      params.set('blur', this.config.placeholderQuality.toString());
    }

    return `${originalUrl}?${params.toString()}`;
  }

  /**
   * Get optimized video URL
   */
  getOptimizedVideoUrl(originalUrl: string, quality: 'low' | 'medium' | 'high' = 'medium'): string {
    if (!originalUrl) return '';

    const qualitySettings = {
      low: { bitrate: '500k', resolution: '480p' },
      medium: { bitrate: '1000k', resolution: '720p' },
      high: { bitrate: '2000k', resolution: '1080p' }
    };

    const settings = qualitySettings[quality];
    
    // Adjust quality based on network
    let finalQuality = quality;
    if (this.metrics.networkType === '2g' || this.metrics.networkType === 'slow-2g') {
      finalQuality = 'low';
    } else if (this.metrics.networkType === '3g') {
      finalQuality = 'medium';
    }

    const finalSettings = qualitySettings[finalQuality];
    
    // Add optimization parameters
    const params = new URLSearchParams();
    params.set('bitrate', finalSettings.bitrate);
    params.set('resolution', finalSettings.resolution);
    params.set('auto', 'format');

    return `${originalUrl}?${params.toString()}`;
  }

  /**
   * Preload critical resources
   */
  preloadCriticalResources(resources: string[]): void {
    if (!this.config.prefetchEnabled) return;

    resources.forEach(resource => {
      const link = document.createElement('link');
      link.rel = 'preload';
      link.href = resource;
      
      // Determine resource type
      if (resource.match(/\.(jpg|jpeg|png|gif|webp)$/i)) {
        link.as = 'image';
      } else if (resource.match(/\.(mp4|webm)$/i)) {
        link.as = 'video';
      } else if (resource.match(/\.(mp3|wav)$/i)) {
        link.as = 'audio';
      } else if (resource.match(/\.css$/i)) {
        link.as = 'style';
      } else if (resource.match(/\.js$/i)) {
        link.as = 'script';
      }
      
      document.head.appendChild(link);
    });
  }

  /**
   * Implement lazy loading for images
   */
  setupLazyLoading(): void {
    if (!this.config.lazyLoading || !('IntersectionObserver' in window)) {
      return;
    }

    const imageObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const img = entry.target as HTMLImageElement;
          
          // Load the actual image
          if (img.dataset.src) {
            img.src = img.dataset.src;
            img.classList.remove('lazy');
            imageObserver.unobserve(img);
          }
        }
      });
    }, {
      rootMargin: '50px 0px', // Start loading 50px before entering viewport
      threshold: 0.01
    });

    // Observe all lazy images
    document.querySelectorAll('img[data-src]').forEach(img => {
      imageObserver.observe(img);
    });
  }

  /**
   * Get current performance metrics
   */
  getMetrics(): PerformanceMetrics {
    return { ...this.metrics };
  }

  /**
   * Get current configuration
   */
  getConfig(): OptimizationConfig {
    return { ...this.config };
  }

  /**
   * Update configuration
   */
  updateConfig(newConfig: Partial<OptimizationConfig>): void {
    this.config = { ...this.config, ...newConfig };
  }

  /**
   * Check if performance targets are met
   */
  checkPerformanceTargets(): boolean {
    return (
      this.metrics.loadTime < 4000 &&
      this.metrics.firstContentfulPaint < 2000 &&
      this.metrics.largestContentfulPaint < 2500 &&
      this.metrics.cumulativeLayoutShift < 0.1
    );
  }

  /**
   * Generate performance report
   */
  generateReport(): string {
    const targets = this.checkPerformanceTargets();
    
    return `
Performance Report - ${new Date().toISOString()}
============================================
Network: ${this.metrics.networkType}
Device: ${this.metrics.deviceType}
Targets Met: ${targets ? '✅ YES' : '❌ NO'}

Metrics:
- Load Time: ${this.metrics.loadTime}ms (Target: < 4000ms)
- First Contentful Paint: ${this.metrics.firstContentfulPaint}ms (Target: < 2000ms)
- Largest Contentful Paint: ${this.metrics.largestContentfulPaint}ms (Target: < 2500ms)
- Cumulative Layout Shift: ${this.metrics.cumulativeLayoutShift} (Target: < 0.1)
- Memory Usage: ${(this.metrics.memoryUsage / 1024 / 1024).toFixed(2)}MB

Configuration:
- Image Quality: ${this.config.imageQuality}%
- Lazy Loading: ${this.config.lazyLoading ? 'Enabled' : 'Disabled'}
- Data Saver Mode: ${this.config.dataSaverMode ? 'Enabled' : 'Disabled'}
- Compression: ${this.config.compressionEnabled ? 'Enabled' : 'Disabled'}
- Caching: ${this.config.cachingEnabled ? 'Enabled' : 'Disabled'}
    `.trim();
  }
}

export const performanceService = new PerformanceService();

// Export utility functions
export const getOptimizedImageUrl = (url: string, width?: number, height?: number) => 
  performanceService.getOptimizedImageUrl(url, width, height);

export const getOptimizedVideoUrl = (url: string, quality?: 'low' | 'medium' | 'high') => 
  performanceService.getOptimizedVideoUrl(url, quality);

export const preloadCriticalResources = (resources: string[]) => 
  performanceService.preloadCriticalResources(resources);

export const setupLazyLoading = () => 
  performanceService.setupLazyLoading();
