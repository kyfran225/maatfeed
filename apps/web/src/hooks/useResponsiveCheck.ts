import { useState, useEffect } from 'react';

export interface Breakpoint {
  name: string;
  minWidth: number;
  maxWidth?: number;
}

export const breakpoints: Breakpoint[] = [
  { name: 'mobile', minWidth: 0, maxWidth: 767 },
  { name: 'tablet', minWidth: 768, maxWidth: 1023 },
  { name: 'desktop', minWidth: 1024, maxWidth: 1439 },
  { name: 'wide', minWidth: 1440 }
];

export interface ResponsiveCheckResult {
  currentBreakpoint: string;
  windowWidth: number;
  windowHeight: number;
  orientation: 'portrait' | 'landscape';
  isTouchDevice: boolean;
  issues: string[];
}

export const useResponsiveCheck = () => {
  const [checkResult, setCheckResult] = useState<ResponsiveCheckResult>({
    currentBreakpoint: 'mobile',
    windowWidth: 0,
    windowHeight: 0,
    orientation: 'portrait',
    isTouchDevice: false,
    issues: []
  });

  const getCurrentBreakpoint = (width: number): string => {
    for (const breakpoint of breakpoints) {
      if (width >= breakpoint.minWidth && (!breakpoint.maxWidth || width <= breakpoint.maxWidth)) {
        return breakpoint.name;
      }
    }
    return 'mobile';
  };

  const detectTouchDevice = (): boolean => {
    return (
      'ontouchstart' in window ||
      navigator.maxTouchPoints > 0 ||
      // @ts-ignore - for older browsers
      navigator.msMaxTouchPoints > 0
    );
  };

  const checkResponsiveIssues = (width: number, height: number): string[] => {
    const issues: string[] = [];
    const aspectRatio = width / height;
    const breakpoint = getCurrentBreakpoint(width);

    // Check for common responsive issues
    if (breakpoint === 'mobile' && width < 320) {
      issues.push('Screen width below minimum mobile threshold (320px)');
    }

    if (breakpoint === 'tablet' && width < 768) {
      issues.push('Tablet breakpoint triggered below minimum width (768px)');
    }

    if (breakpoint === 'desktop' && width < 1024) {
      issues.push('Desktop breakpoint triggered below minimum width (1024px)');
    }

    // Check aspect ratio issues
    if (aspectRatio > 2.5) {
      issues.push('Unusually wide screen - check horizontal layout');
    }

    if (aspectRatio < 0.4) {
      issues.push('Unusually tall screen - check vertical layout');
    }

    // Check for touch device compatibility
    if (!detectTouchDevice() && breakpoint === 'mobile') {
      issues.push('Non-touch device detected at mobile breakpoint');
    }

    return issues;
  };

  useEffect(() => {
    const updateCheck = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      const orientation = width > height ? 'landscape' : 'portrait';

      setCheckResult({
        currentBreakpoint: getCurrentBreakpoint(width),
        windowWidth: width,
        windowHeight: height,
        orientation,
        isTouchDevice: detectTouchDevice(),
        issues: checkResponsiveIssues(width, height)
      });
    };

    // Initial check
    updateCheck();

    // Update on resize and orientation change
    window.addEventListener('resize', updateCheck);
    window.addEventListener('orientationchange', updateCheck);

    return () => {
      window.removeEventListener('resize', updateCheck);
      window.removeEventListener('orientationchange', updateCheck);
    };
  }, []);

  const isBreakpoint = (breakpointName: string): boolean => {
    return checkResult.currentBreakpoint === breakpointName;
  };

  const isMinWidth = (width: number): boolean => {
    return checkResult.windowWidth >= width;
  };

  const isMaxWidth = (width: number): boolean => {
    return checkResult.windowWidth <= width;
  };

  return {
    ...checkResult,
    isBreakpoint,
    isMinWidth,
    isMaxWidth,
    breakpoints
  };
};
