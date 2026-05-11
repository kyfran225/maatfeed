import { useEffect, useRef, useCallback, useState } from "react";
import { advancedAnalyticsService, UserBehaviorMetrics, UserAction, MouseMovement, ClickEvent, DeviceInfo, PagePerformance } from "../services/advancedAnalyticsService";

interface UseUserBehaviorTrackingOptions {
  enableMouseTracking?: boolean;
  enableScrollTracking?: boolean;
  enableClickTracking?: boolean;
  enablePerformanceTracking?: boolean;
  trackingInterval?: number;
  batchSize?: number;
}

interface UseUserBehaviorTrackingReturn {
  isTracking: boolean;
  startTracking: () => void;
  stopTracking: () => void;
  getSessionData: () => UserBehaviorMetrics | null;
  clearSessionData: () => void;
}

export function useUserBehaviorTracking(options: UseUserBehaviorTrackingOptions = {}): UseUserBehaviorTrackingReturn {
  const {
    enableMouseTracking = true,
    enableScrollTracking = true,
    enableClickTracking = true,
    enablePerformanceTracking = true,
    trackingInterval = 5000, // 5 seconds
    batchSize = 10
  } = options;

  const [isTracking, setIsTracking] = useState(false);
  const [sessionData, setSessionData] = useState<UserBehaviorMetrics | null>(null);
  
  const sessionStartTime = useRef<number>(Date.now());
  const sessionId = useRef<string>(generateSessionId());
  const userId = useRef<string>(getUserId());
  const actions = useRef<UserAction[]>([]);
  const mouseMovements = useRef<MouseMovement[]>([]);
  const clicks = useRef<ClickEvent[]>([]);
  const scrollDepth = useRef<number>(0);
  const maxScrollDepth = useRef<number>(0);
  const trackingIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Generate unique session ID
  function generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  // Get user ID (mock for now)
  function getUserId(): string {
    return localStorage.getItem('userId') || 'anonymous_user';
  }

  // Get device information
  function getDeviceInfo(): DeviceInfo {
    const userAgent = navigator.userAgent;
    const screenResolution = `${screen.width}x${screen.height}`;
    const viewportSize = `${window.innerWidth}x${window.innerHeight}`;
    
    // Simple device detection
    let deviceType: 'mobile' | 'tablet' | 'desktop' = 'desktop';
    if (/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent)) {
      deviceType = /iPad/i.test(userAgent) ? 'tablet' : 'mobile';
    }

    // Simple browser detection
    let browser = 'Unknown';
    if (userAgent.includes('Chrome')) browser = 'Chrome';
    else if (userAgent.includes('Firefox')) browser = 'Firefox';
    else if (userAgent.includes('Safari')) browser = 'Safari';
    else if (userAgent.includes('Edge')) browser = 'Edge';

    // Simple OS detection
    let os = 'Unknown';
    if (userAgent.includes('Windows')) os = 'Windows';
    else if (userAgent.includes('Mac')) os = 'macOS';
    else if (userAgent.includes('Linux')) os = 'Linux';
    else if (userAgent.includes('Android')) os = 'Android';
    else if (userAgent.includes('iOS')) os = 'iOS';

    return {
      userAgent,
      screenResolution,
      viewportSize,
      deviceType,
      browser,
      os,
      connectionSpeed: (navigator as any).connection?.effectiveType
    };
  }

  // Get page performance metrics
  function getPagePerformance(): PagePerformance {
    const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
    
    return {
      loadTime: navigation.loadEventEnd - navigation.fetchStart,
      domContentLoaded: navigation.domContentLoadedEventEnd - navigation.fetchStart,
      firstContentfulPaint: performance.getEntriesByType('paint')[0]?.startTime || 0,
      largestContentfulPaint: performance.getEntriesByType('largest-contentful-paint')[0]?.startTime || 0,
      cumulativeLayoutShift: (performance.getEntriesByType('layout-shift') as PerformanceEntry[]).reduce((sum, entry) => sum + (entry as any).value, 0),
      firstInputDelay: (performance.getEntriesByType('first-input')[0] as any)?.processingStart - (performance.getEntriesByType('first-input')[0] as any)?.startTime || 0
    };
  }

  // Track mouse movements
  const handleMouseMove = useCallback((event: MouseEvent) => {
    if (!enableMouseTracking || !isTracking) return;

    const movement: MouseMovement = {
      x: event.clientX,
      y: event.clientY,
      timestamp: Date.now(),
      velocity: 0 // Could be calculated based on previous movement
    };

    mouseMovements.current.push(movement);

    // Limit mouse movements to prevent memory issues
    if (mouseMovements.current.length > 1000) {
      mouseMovements.current = mouseMovements.current.slice(-500);
    }
  }, [enableMouseTracking, isTracking]);

  // Track clicks
  const handleClick = useCallback((event: MouseEvent) => {
    if (!enableClickTracking || !isTracking) return;

    const target = event.target as HTMLElement;
    const clickEvent: ClickEvent = {
      x: event.clientX,
      y: event.clientY,
      target: target.tagName.toLowerCase() + (target.className ? `.${target.className}` : ''),
      timestamp: Date.now(),
      rightClick: event.button === 2
    };

    clicks.current.push(clickEvent);

    // Also track as user action
    const action: UserAction = {
      type: 'click',
      element: clickEvent.target,
      timestamp: clickEvent.timestamp,
      coordinates: { x: clickEvent.x, y: clickEvent.y },
      metadata: {
        rightClick: clickEvent.rightClick,
        elementType: target.tagName.toLowerCase()
      }
    };

    actions.current.push(action);
  }, [enableClickTracking, isTracking]);

  // Track scroll events
  const handleScroll = useCallback(() => {
    if (!enableScrollTracking || !isTracking) return;

    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    const documentHeight = document.documentElement.scrollHeight - window.innerHeight;
    const currentScrollDepth = documentHeight > 0 ? (scrollTop / documentHeight) * 100 : 0;

    scrollDepth.current = currentScrollDepth;
    maxScrollDepth.current = Math.max(maxScrollDepth.current, currentScrollDepth);

    // Track scroll as user action
    const action: UserAction = {
      type: 'scroll',
      element: 'window',
      timestamp: Date.now(),
      coordinates: { x: 0, y: scrollTop },
      metadata: {
        scrollDepth: currentScrollDepth,
        maxScrollDepth: maxScrollDepth.current
      }
    };

    actions.current.push(action);
  }, [enableScrollTracking, isTracking]);

  // Track keyboard events
  const handleKeyPress = useCallback((event: KeyboardEvent) => {
    if (!isTracking) return;

    const action: UserAction = {
      type: 'keypress',
      element: (event.target as HTMLElement).tagName.toLowerCase(),
      timestamp: Date.now(),
      coordinates: { x: 0, y: 0 },
      metadata: {
        key: event.key,
        keyCode: event.keyCode,
        ctrlKey: event.ctrlKey,
        shiftKey: event.shiftKey
      }
    };

    actions.current.push(action);
  }, [isTracking]);

  // Track focus/blur events
  const handleFocus = useCallback((event: FocusEvent) => {
    if (!isTracking) return;

    const action: UserAction = {
      type: 'focus',
      element: (event.target as HTMLElement).tagName.toLowerCase(),
      timestamp: Date.now(),
      coordinates: { x: 0, y: 0 }
    };

    actions.current.push(action);
  }, [isTracking]);

  const handleBlur = useCallback((event: FocusEvent) => {
    if (!isTracking) return;

    const action: UserAction = {
      type: 'blur',
      element: (event.target as HTMLElement).tagName.toLowerCase(),
      timestamp: Date.now(),
      coordinates: { x: 0, y: 0 }
    };

    actions.current.push(action);
  }, [isTracking]);

  // Start tracking
  const startTracking = useCallback(() => {
    if (isTracking) return;

    setIsTracking(true);
    sessionStartTime.current = Date.now();
    sessionId.current = generateSessionId();
    userId.current = getUserId();

    // Add event listeners
    if (enableMouseTracking) {
      document.addEventListener('mousemove', handleMouseMove);
    }
    
    if (enableClickTracking) {
      document.addEventListener('click', handleClick);
      document.addEventListener('contextmenu', handleClick);
    }
    
    if (enableScrollTracking) {
      window.addEventListener('scroll', handleScroll, { passive: true });
    }

    document.addEventListener('keydown', handleKeyPress);
    document.addEventListener('focus', handleFocus, true);
    document.addEventListener('blur', handleBlur, true);

    // Start periodic data collection
    trackingIntervalRef.current = setInterval(() => {
      collectAndSendData();
    }, trackingInterval);

    console.log('[UserBehaviorTracking] Started tracking');
  }, [
    isTracking,
    enableMouseTracking,
    enableClickTracking,
    enableScrollTracking,
    handleMouseMove,
    handleClick,
    handleScroll,
    handleKeyPress,
    handleFocus,
    handleBlur,
    trackingInterval
  ]);

  // Stop tracking
  const stopTracking = useCallback(() => {
    if (!isTracking) return;

    setIsTracking(false);

    // Remove event listeners
    document.removeEventListener('mousemove', handleMouseMove);
    document.removeEventListener('click', handleClick);
    document.removeEventListener('contextmenu', handleClick);
    window.removeEventListener('scroll', handleScroll);
    document.removeEventListener('keydown', handleKeyPress);
    document.removeEventListener('focus', handleFocus, true);
    document.removeEventListener('blur', handleBlur, true);

    // Clear interval
    if (trackingIntervalRef.current) {
      clearInterval(trackingIntervalRef.current);
      trackingIntervalRef.current = null;
    }

    // Send final data
    collectAndSendData();

    console.log('[UserBehaviorTracking] Stopped tracking');
  }, [
    isTracking,
    handleMouseMove,
    handleClick,
    handleScroll,
    handleKeyPress,
    handleFocus,
    handleBlur
  ]);

  // Collect and send data
  const collectAndSendData = useCallback(() => {
    const currentTime = Date.now();
    const timeOnPage = currentTime - sessionStartTime.current;

    const behaviorData: UserBehaviorMetrics = {
      userId: userId.current,
      sessionId: sessionId.current,
      timestamp: new Date(),
      pageUrl: window.location.href,
      actions: [...actions.current],
      scrollDepth: maxScrollDepth.current,
      timeOnPage,
      mouseMovements: [...mouseMovements.current],
      clicks: [...clicks.current],
      deviceInfo: getDeviceInfo(),
      performance: enablePerformanceTracking ? getPagePerformance() : {} as PagePerformance
    };

    // Update session data
    setSessionData(behaviorData);

    // Send to backend
    advancedAnalyticsService.trackUserBehavior(behaviorData).catch(error => {
      console.error('[UserBehaviorTracking] Failed to send data:', error);
    });

    // Clear arrays to prevent memory issues
    actions.current = [];
    mouseMovements.current = [];
    clicks.current = [];
  }, [enablePerformanceTracking]);

  // Get current session data
  const getSessionData = useCallback((): UserBehaviorMetrics | null => {
    return sessionData;
  }, [sessionData]);

  // Clear session data
  const clearSessionData = useCallback(() => {
    setSessionData(null);
    actions.current = [];
    mouseMovements.current = [];
    clicks.current = [];
    scrollDepth.current = 0;
    maxScrollDepth.current = 0;
  }, []);

  // Auto-start tracking on mount
  useEffect(() => {
    // Only start tracking if user has consent (could be checked from localStorage)
    const hasConsent = localStorage.getItem('analyticsConsent') === 'true';
    if (hasConsent) {
      startTracking();
    }

    // Cleanup on unmount
    return () => {
      stopTracking();
    };
  }, [startTracking, stopTracking]);

  // Handle page visibility change
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        // Page is hidden, pause tracking
        stopTracking();
      } else {
        // Page is visible, resume tracking
        const hasConsent = localStorage.getItem('analyticsConsent') === 'true';
        if (hasConsent) {
          startTracking();
        }
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [startTracking, stopTracking]);

  return {
    isTracking,
    startTracking,
    stopTracking,
    getSessionData,
    clearSessionData
  };
}
