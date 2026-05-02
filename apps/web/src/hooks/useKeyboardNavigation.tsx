import { useEffect, useCallback } from "react";

interface KeyboardNavigationOptions {
  onPlayPause?: () => void;
  enabled?: boolean;
}

export function useKeyboardNavigation({
  onPlayPause,
  enabled = true
}: KeyboardNavigationOptions) {
  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    if (!enabled) return;

    // Ignore if user is typing in an input, textarea, or contenteditable
    const target = event.target as HTMLElement;
    if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable) {
      return;
    }

    switch (event.key) {
      case ' ':
        event.preventDefault();
        onPlayPause?.();
        break;
    }
  }, [enabled, onPlayPause]);

  useEffect(() => {
    if (enabled) {
      window.addEventListener('keydown', handleKeyDown);
      return () => window.removeEventListener('keydown', handleKeyDown);
    }
  }, [enabled, handleKeyDown]);
}
