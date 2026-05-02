import { useEffect, useCallback, useRef } from 'react';

export interface AccessibilityOptions {
  announceChanges?: boolean;
  trapFocus?: boolean;
  escapeKey?: () => void;
  arrowKeys?: {
    up?: () => void;
    down?: () => void;
    left?: () => void;
    right?: () => void;
  };
}

export const useAccessibility = (options: AccessibilityOptions = {}) => {
  const {
    announceChanges = false,
    trapFocus = false,
    escapeKey,
    arrowKeys
  } = options;

  const containerRef = useRef<HTMLElement>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);

  // Screen reader announcements
  const announce = useCallback((message: string, priority: 'polite' | 'assertive' = 'polite') => {
    const announcement = document.createElement('div');
    announcement.setAttribute('aria-live', priority);
    announcement.setAttribute('aria-atomic', 'true');
    announcement.className = 'sr-only';
    announcement.textContent = message;

    document.body.appendChild(announcement);

    // Remove after announcement
    setTimeout(() => {
      document.body.removeChild(announcement);
    }, 1000);
  }, []);

  // Focus management
  const trapFocusInContainer = useCallback(() => {
    if (!containerRef.current || !trapFocus) return;

    const container = containerRef.current;
    const focusableElements = container.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    ) as NodeListOf<HTMLElement>;

    if (focusableElements.length === 0) return;

    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];

    const handleTabKey = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return;

      if (e.shiftKey) {
        if (document.activeElement === firstElement) {
          e.preventDefault();
          lastElement.focus();
        }
      } else {
        if (document.activeElement === lastElement) {
          e.preventDefault();
          firstElement.focus();
        }
      }
    };

    container.addEventListener('keydown', handleTabKey);

    return () => {
      container.removeEventListener('keydown', handleTabKey);
    };
  }, [trapFocus]);

  // Save and restore focus
  const saveFocus = useCallback(() => {
    previousFocusRef.current = document.activeElement as HTMLElement;
  }, []);

  const restoreFocus = useCallback(() => {
    if (previousFocusRef.current && typeof previousFocusRef.current.focus === 'function') {
      previousFocusRef.current.focus();
    }
  }, []);

  // Keyboard navigation
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    switch (e.key) {
      case 'Escape':
        if (escapeKey) {
          e.preventDefault();
          escapeKey();
        }
        break;
      
      case 'ArrowUp':
        if (arrowKeys?.up) {
          e.preventDefault();
          arrowKeys.up();
        }
        break;
      
      case 'ArrowDown':
        if (arrowKeys?.down) {
          e.preventDefault();
          arrowKeys.down();
        }
        break;
      
      case 'ArrowLeft':
        if (arrowKeys?.left) {
          e.preventDefault();
          arrowKeys.left();
        }
        break;
      
      case 'ArrowRight':
        if (arrowKeys?.right) {
          e.preventDefault();
          arrowKeys.right();
        }
        break;
    }
  }, [escapeKey, arrowKeys]);

  // ARIA attributes helper
  const getAriaProps = useCallback((label: string, describedBy?: string) => ({
    'aria-label': label,
    'aria-describedby': describedBy,
    role: 'button' as const,
    tabIndex: 0
  }), []);

  // Setup keyboard listeners
  useEffect(() => {
    if (escapeKey || arrowKeys) {
      document.addEventListener('keydown', handleKeyDown);
      return () => {
        document.removeEventListener('keydown', handleKeyDown);
      };
    }
  }, [handleKeyDown, escapeKey, arrowKeys]);

  // Setup focus trap
  useEffect(() => {
    const cleanup = trapFocusInContainer();
    return cleanup;
  }, [trapFocusInContainer]);

  return {
    containerRef,
    announce,
    saveFocus,
    restoreFocus,
    getAriaProps,
    canAnnounce: announceChanges && typeof announce === 'function'
  };
};
