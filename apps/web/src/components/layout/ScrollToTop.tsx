import { useEffect } from "react";
import { useLocation } from "react-router-dom";

/**
 * Component that resets scroll position on every route change.
 * This prevents scroll bleed between pages (e.g., onboarding scroll affecting feed).
 */
export function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    // Reset all scroll positions
    window.scrollTo(0, 0);
    document.body.scrollTop = 0;
    document.documentElement.scrollTop = 0;

    // Also reset any scrollable containers
    const scrollableContainers = document.querySelectorAll('[class*="overflow-y-auto"], [class*="overflow-auto"]');
    scrollableContainers.forEach((el) => {
      if (el instanceof HTMLElement) {
        el.scrollTop = 0;
      }
    });
  }, [pathname]);

  return null;
}
