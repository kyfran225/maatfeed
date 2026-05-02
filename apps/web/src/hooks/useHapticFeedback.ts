import { useEffect, useCallback } from 'react';

export interface HapticPattern {
  type: 'light' | 'medium' | 'heavy' | 'success' | 'warning' | 'error';
}

export const useHapticFeedback = () => {
  const triggerHaptic = useCallback((hapticPattern: HapticPattern) => {
    if (!window.navigator || !('vibrate' in window.navigator)) {
      return; // Device doesn't support vibration
    }

    const vibrationPatterns: Record<HapticPattern['type'], number[]> = {
      light: [10],
      medium: [20],
      heavy: [40],
      success: [10, 50, 10],
      warning: [20, 30, 20],
      error: [30, 20, 30, 20]
    };

    const vibrationPattern = vibrationPatterns[hapticPattern.type];
    if (vibrationPattern) {
      window.navigator.vibrate(vibrationPattern);
    }
  }, []);

  const triggerLight = useCallback(() => triggerHaptic({ type: 'light' }), [triggerHaptic]);
  const triggerMedium = useCallback(() => triggerHaptic({ type: 'medium' }), [triggerHaptic]);
  const triggerHeavy = useCallback(() => triggerHaptic({ type: 'heavy' }), [triggerHaptic]);
  const triggerSuccess = useCallback(() => triggerHaptic({ type: 'success' }), [triggerHaptic]);
  const triggerWarning = useCallback(() => triggerHaptic({ type: 'warning' }), [triggerHaptic]);
  const triggerError = useCallback(() => triggerHaptic({ type: 'error' }), [triggerHaptic]);

  return {
    triggerHaptic,
    triggerLight,
    triggerMedium,
    triggerHeavy,
    triggerSuccess,
    triggerWarning,
    triggerError,
    isSupported: 'vibrate' in window.navigator
  };
};
