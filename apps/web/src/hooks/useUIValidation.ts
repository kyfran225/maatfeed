import { useState, useEffect, useCallback } from 'react';

export interface UIIssue {
  type: 'dead-zone' | 'unreachable-element' | 'missing-touch-target' | 'no-aria-label' | 'poor-contrast';
  element: string;
  description: string;
  severity: 'low' | 'medium' | 'high';
  position?: { x: number; y: number };
}

export const useUIValidation = () => {
  const [issues, setIssues] = useState<UIIssue[]>([]);
  const [isValidating, setIsValidating] = useState(false);

  const validateDeadZones = useCallback(() => {
    const foundIssues: UIIssue[] = [];
    
    // Only check visible interactive elements
    const interactiveElements = document.querySelectorAll(
      'button:not([disabled]):not([style*="display: none"]):not([style*="opacity: 0"]), ' +
      'a:not([style*="display: none"]):not([style*="opacity: 0"]), ' +
      'input:not([type="hidden"]):not([style*="display: none"]):not([style*="opacity: 0"]), ' +
      'select:not([style*="display: none"]):not([style*="opacity: 0"]), ' +
      'textarea:not([style*="display: none"]):not([style*="opacity: 0"]), ' +
      '[role="button"]:not([style*="display: none"]):not([style*="opacity: 0"]), ' +
      '[tabindex]:not([tabindex="-1"]):not([style*="display: none"]):not([style*="opacity: 0"])'
    );

    interactiveElements.forEach((element, index) => {
      const rect = element.getBoundingClientRect();
      
      // Skip elements that are too small to be interactive (likely decorative)
      if (rect.width < 10 || rect.height < 10) {
        return;
      }
      
      // Skip hidden or invisible elements
      const styles = window.getComputedStyle(element);
      if (styles.display === 'none' || styles.visibility === 'hidden' || styles.opacity === '0') {
        return;
      }
      
      const elementId = element.id || `${element.tagName.toLowerCase()}-${index}`;
      
      // Check if element is completely off-screen
      if (rect.right < 0 || rect.left > window.innerWidth || 
          rect.bottom < 0 || rect.top > window.innerHeight) {
        foundIssues.push({
          type: 'dead-zone',
          element: elementId,
          description: 'Interactive element is completely off-screen',
          severity: 'high',
          position: { x: rect.left, y: rect.top }
        });
      }

      // Check if element is too small for touch interaction (only for touch devices)
      if (window.matchMedia('(pointer: coarse)').matches && (rect.width < 44 || rect.height < 44)) {
        foundIssues.push({
          type: 'missing-touch-target',
          element: elementId,
          description: `Touch target too small: ${Math.round(rect.width)}x${Math.round(rect.height)}px (minimum 44x44px)`,
          severity: 'medium',
          position: { x: rect.left, y: rect.top }
        });
      }

      // Check for missing ARIA labels on icon buttons without text
      if (element.tagName === 'BUTTON' && !element.textContent?.trim() && !element.getAttribute('aria-label') && !element.getAttribute('aria-labelledby')) {
        // Only flag if it doesn't contain SVG icons (which usually have their own labels)
        if (!element.querySelector('svg[aria-label], svg[title]')) {
          foundIssues.push({
            type: 'no-aria-label',
            element: elementId,
            description: 'Button without text content or aria-label',
            severity: 'medium'
          });
        }
      }

      // Check for poor contrast (only for visible elements with text)
      if (element.textContent?.trim()) {
        const color = styles.color;
        const backgroundColor = styles.backgroundColor;
        
        if (color === backgroundColor || (backgroundColor === 'rgba(0, 0, 0, 0)' && color === 'rgb(255, 255, 255)')) {
          foundIssues.push({
            type: 'poor-contrast',
            element: elementId,
            description: 'Poor color contrast detected',
            severity: 'medium'
          });
        }
      }
    });

    return foundIssues;
  }, []);

  const validateKeyboardNavigation = useCallback(() => {
    const foundIssues: UIIssue[] = [];
    const focusableElements = document.querySelectorAll(
      'button, a, input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );

    if (focusableElements.length === 0) {
      foundIssues.push({
        type: 'unreachable-element',
        element: 'document',
        description: 'No focusable elements found',
        severity: 'high'
      });
    }

    // Check for proper tab order
    focusableElements.forEach((element, index) => {
      const tabIndex = element.getAttribute('tabindex');
      if (tabIndex && parseInt(tabIndex) > 0) {
        foundIssues.push({
          type: 'unreachable-element',
          element: element.id || `element-${index}`,
          description: `Positive tabindex (${tabIndex}) may disrupt natural tab order`,
          severity: 'low'
        });
      }
    });

    return foundIssues;
  }, []);

  const validateResponsiveness = useCallback(() => {
    const foundIssues: UIIssue[] = [];
    const viewportWidth = window.innerWidth;
    
    // Check for horizontal scroll on mobile
    if (viewportWidth < 768) {
      const documentWidth = document.documentElement.scrollWidth;
      if (documentWidth > viewportWidth) {
        foundIssues.push({
          type: 'dead-zone',
          element: 'document',
          description: `Horizontal scroll detected on mobile (${documentWidth}px > ${viewportWidth}px)`,
          severity: 'high'
        });
      }
    }

    return foundIssues;
  }, []);

  const runValidation = useCallback(() => {
    setIsValidating(true);
    setIssues([]);

    setTimeout(() => {
      const allIssues = [
        ...validateDeadZones(),
        ...validateKeyboardNavigation(),
        ...validateResponsiveness()
      ];

      // Remove duplicates
      const uniqueIssues = allIssues.filter((issue, index, self) =>
        index === self.findIndex((i) => i.element === issue.element && i.type === issue.type)
      );

      setIssues(uniqueIssues);
      setIsValidating(false);
    }, 100);
  }, [validateDeadZones, validateKeyboardNavigation, validateResponsiveness]);

  // Auto-validate on window resize
  useEffect(() => {
    const handleResize = () => {
      if (process.env.NODE_ENV === 'development') {
        runValidation();
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [runValidation]);

  // Initial validation
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      runValidation();
    }
  }, [runValidation]);

  const getHighSeverityIssues = () => issues.filter(issue => issue.severity === 'high');
  const getMediumSeverityIssues = () => issues.filter(issue => issue.severity === 'medium');
  const getLowSeverityIssues = () => issues.filter(issue => issue.severity === 'low');

  return {
    issues,
    isValidating,
    runValidation,
    getHighSeverityIssues,
    getMediumSeverityIssues,
    getLowSeverityIssues,
    totalIssues: issues.length,
    hasCriticalIssues: getHighSeverityIssues().length > 0
  };
};
