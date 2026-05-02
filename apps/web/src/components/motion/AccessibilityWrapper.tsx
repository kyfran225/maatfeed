import { ReactNode, useEffect } from 'react';

interface AccessibilityWrapperProps {
  children: ReactNode;
  className?: string;
}

export const AccessibilityWrapper: React.FC<AccessibilityWrapperProps> = ({ 
  children, 
  className = '' 
}) => {
  useEffect(() => {
    // Add keyboard navigation support
    const handleKeyDown = (event: KeyboardEvent) => {
      // Handle escape key to close modals/drawers
      if (event.key === 'Escape') {
        const activeElement = document.activeElement as HTMLElement;
        if (activeElement && activeElement.getAttribute('role') === 'dialog') {
          activeElement.dispatchEvent(new Event('close'));
        }
      }

      // Handle arrow keys for navigation
      if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
        const focusableElements = document.querySelectorAll(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        
        if (focusableElements.length > 0) {
          const currentIndex = Array.from(focusableElements).indexOf(document.activeElement as Element);
          let nextIndex = currentIndex;
          
          if (event.key === 'ArrowDown') {
            nextIndex = (currentIndex + 1) % focusableElements.length;
          } else if (event.key === 'ArrowUp') {
            nextIndex = currentIndex === 0 ? focusableElements.length - 1 : currentIndex - 1;
          }
          
          (focusableElements[nextIndex] as HTMLElement).focus();
          event.preventDefault();
        }
      }
    };

    // Add ARIA live regions for dynamic content
    const announceToScreenReader = (message: string) => {
      const announcement = document.createElement('div');
      announcement.setAttribute('aria-live', 'polite');
      announcement.setAttribute('aria-atomic', 'true');
      announcement.className = 'sr-only';
      announcement.textContent = message;
      document.body.appendChild(announcement);
      
      setTimeout(() => {
        document.body.removeChild(announcement);
      }, 1000);
    };

    document.addEventListener('keydown', handleKeyDown);
    
    // Make announceToScreenReader available globally
    (window as any).announceToScreenReader = announceToScreenReader;

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      delete (window as any).announceToScreenReader;
    };
  }, []);

  return (
    <div className={className}>
      {children}
    </div>
  );
};

export default AccessibilityWrapper;
