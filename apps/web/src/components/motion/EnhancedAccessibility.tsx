import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';

interface EnhancedAccessibilityProps {
  children: React.ReactNode;
  enableHighContrast?: boolean;
  enableLargeText?: boolean;
  enableReducedMotion?: boolean;
  enableScreenReader?: boolean;
}

export const EnhancedAccessibility: React.FC<EnhancedAccessibilityProps> = ({
  children,
  enableHighContrast = false,
  enableLargeText = false,
  enableReducedMotion = false,
  enableScreenReader = true
}) => {
  const [preferences, setPreferences] = useState({
    highContrast: enableHighContrast,
    largeText: enableLargeText,
    reducedMotion: enableReducedMotion,
    screenReader: enableScreenReader
  });

  const [isKeyboardUser, setIsKeyboardUser] = useState(false);
  const [focusVisible, setFocusVisible] = useState(false);
  const lastInteractionTime = useRef(Date.now());

  // Detect keyboard navigation
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Tab, Enter, Space, Arrow keys indicate keyboard navigation
      if (['Tab', 'Enter', ' ', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(event.key)) {
        setIsKeyboardUser(true);
        setFocusVisible(true);
        lastInteractionTime.current = Date.now();
      }
    };

    const handleMouseDown = () => {
      setIsKeyboardUser(false);
      setFocusVisible(false);
    };

    const handleTouchStart = () => {
      setIsKeyboardUser(false);
      setFocusVisible(false);
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('touchstart', handleTouchStart);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('touchstart', handleTouchStart);
    };
  }, []);

  // Check for reduced motion preference
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    if (mediaQuery.matches) {
      setPreferences(prev => ({ ...prev, reducedMotion: true }));
    }

    const handleChange = (e: MediaQueryListEvent) => {
      setPreferences(prev => ({ ...prev, reducedMotion: e.matches }));
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  // Check for high contrast preference
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-contrast: high)');
    if (mediaQuery.matches) {
      setPreferences(prev => ({ ...prev, highContrast: true }));
    }

    const handleChange = (e: MediaQueryListEvent) => {
      setPreferences(prev => ({ ...prev, highContrast: e.matches }));
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  // Generate CSS classes based on preferences
  const getAccessibilityClasses = () => {
    const classes = [];
    
    if (preferences.highContrast) {
      classes.push('accessibility-high-contrast');
    }
    
    if (preferences.largeText) {
      classes.push('accessibility-large-text');
    }
    
    if (preferences.reducedMotion) {
      classes.push('accessibility-reduced-motion');
    }
    
    if (isKeyboardUser) {
      classes.push('accessibility-keyboard-user');
    }
    
    if (focusVisible) {
      classes.push('accessibility-focus-visible');
    }
    
    return classes.join(' ');
  };

  // Motion configuration based on preferences
  const getMotionConfig = () => {
    if (preferences.reducedMotion) {
      return {
        initial: false,
        animate: false,
        transition: { duration: 0 }
      };
    }
    
    return {
      initial: { opacity: 0 },
      animate: { opacity: 1 },
      transition: { duration: 0.3 }
    };
  };

  // Focus management
  const manageFocus = (element: HTMLElement | null) => {
    if (!element || !isKeyboardUser) return;
    
    element.style.outline = focusVisible ? '2px solid #f97316' : 'none';
    element.style.outlineOffset = '2px';
  };

  // Touch target size validation
  const validateTouchTargets = () => {
    const touchTargets = document.querySelectorAll('button, a, input, [role="button"]');
    const invalidTargets: HTMLElement[] = [];
    
    touchTargets.forEach(target => {
      const rect = target.getBoundingClientRect();
      const minSize = 44; // WCAG minimum touch target size
      
      if (rect.width < minSize || rect.height < minSize) {
        invalidTargets.push(target as HTMLElement);
      }
    });
    
    return invalidTargets;
  };

  // Announce to screen readers
  const announceToScreenReader = (message: string) => {
    if (!preferences.screenReader) return;
    
    const announcement = document.createElement('div');
    announcement.setAttribute('role', 'status');
    announcement.setAttribute('aria-live', 'polite');
    announcement.className = 'sr-only';
    announcement.textContent = message;
    
    document.body.appendChild(announcement);
    
    setTimeout(() => {
      document.body.removeChild(announcement);
    }, 1000);
  };

  // Accessibility helper functions
  const accessibilityHelpers = {
    announceToScreenReader,
    validateTouchTargets,
    manageFocus,
    isKeyboardUser,
    focusVisible
  };

  return (
    <motion.div
      className={`accessibility-wrapper ${getAccessibilityClasses()}`}
      {...getMotionConfig()}
    >
      {/* Accessibility CSS Variables */}
      <style>{`
        .accessibility-high-contrast {
          --bg-primary: #000000;
          --bg-secondary: #1a1a1a;
          --text-primary: #ffffff;
          --text-secondary: #e0e0e0;
          --accent: #ff6b35;
          --border: #ffffff;
        }
        
        .accessibility-large-text {
          font-size: 120%;
          line-height: 1.6;
        }
        
        .accessibility-reduced-motion * {
          animation-duration: 0.01ms !important;
          animation-iteration-count: 1 !important;
          transition-duration: 0.01ms !important;
        }
        
        .accessibility-keyboard-user *:focus {
          outline: 2px solid #f97316;
          outline-offset: 2px;
        }
        
        .accessibility-focus-visible *:focus {
          outline: 2px solid #f97316;
          outline-offset: 2px;
        }
        
        .sr-only {
          position: absolute;
          width: 1px;
          height: 1px;
          padding: 0;
          margin: -1px;
          overflow: hidden;
          clip: rect(0, 0, 0, 0);
          white-space: nowrap;
          border: 0;
        }
      `}</style>
      
      {/* Accessibility Toolbar (Development Only) */}
      {process.env.NODE_ENV === 'development' && (
        <motion.div
          className="fixed top-20 left-4 z-50 bg-black/80 backdrop-blur-sm rounded-lg p-3 space-y-2 text-xs"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
        >
          <h3 className="text-white font-semibold mb-2">Accessibility</h3>
          
          <div className="space-y-1">
            <label className="flex items-center gap-2 text-white">
              <input
                type="checkbox"
                checked={preferences.highContrast}
                onChange={(e) => setPreferences(prev => ({ ...prev, highContrast: e.target.checked }))}
                className="rounded"
              />
              High Contrast
            </label>
            
            <label className="flex items-center gap-2 text-white">
              <input
                type="checkbox"
                checked={preferences.largeText}
                onChange={(e) => setPreferences(prev => ({ ...prev, largeText: e.target.checked }))}
                className="rounded"
              />
              Large Text
            </label>
            
            <label className="flex items-center gap-2 text-white">
              <input
                type="checkbox"
                checked={preferences.reducedMotion}
                onChange={(e) => setPreferences(prev => ({ ...prev, reducedMotion: e.target.checked }))}
                className="rounded"
              />
              Reduced Motion
            </label>
          </div>
          
          <div className="pt-2 border-t border-white/20">
            <div className="text-white/60">
              <div>Keyboard User: {isKeyboardUser ? 'Yes' : 'No'}</div>
              <div>Focus Visible: {focusVisible ? 'Yes' : 'No'}</div>
            </div>
          </div>
        </motion.div>
      )}
      
      {/* Pass accessibility helpers to children via context */}
      <div data-accessibility-helpers={JSON.stringify(accessibilityHelpers)}>
        {children}
      </div>
    </motion.div>
  );
};

// Hook for using accessibility features
export const useAccessibility = () => {
  const getAccessibilityHelpers = () => {
    const helpersElement = document.querySelector('[data-accessibility-helpers]');
    if (helpersElement) {
      return JSON.parse(helpersElement.getAttribute('data-accessibility-helpers') || '{}');
    }
    return null;
  };

  return {
    announce: (message: string) => {
      const helpers = getAccessibilityHelpers();
      helpers?.announceToScreenReader(message);
    },
    validateTouchTargets: () => {
      const helpers = getAccessibilityHelpers();
      return helpers?.validateTouchTargets() || [];
    },
    manageFocus: (element: HTMLElement | null) => {
      const helpers = getAccessibilityHelpers();
      helpers?.manageFocus(element);
    },
    isKeyboardUser: () => {
      const helpers = getAccessibilityHelpers();
      return helpers?.isKeyboardUser || false;
    }
  };
};

export default EnhancedAccessibility;
