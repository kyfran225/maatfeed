import { useState, useEffect } from 'react';
import { usePWAInstall } from '../../hooks/useServiceWorker';

/**
 * PWA Install Prompt Component
 * Shows a custom installation banner for the PWA
 */
export function InstallPrompt() {
  const { canInstall, promptInstall } = usePWAInstall();
  const [isVisible, setIsVisible] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);

  useEffect(() => {
    // Check if user previously dismissed the prompt
    const dismissed = localStorage.getItem('pwa-install-dismissed');
    const dismissedTime = dismissed ? parseInt(dismissed, 10) : 0;
    const oneDayMs = 24 * 60 * 60 * 1000;
    
    // Show again after 1 day
    if (dismissed && Date.now() - dismissedTime < oneDayMs) {
      setIsDismissed(true);
    }
  }, []);

  useEffect(() => {
    // Delay showing the prompt to not annoy users immediately
    if (canInstall && !isDismissed) {
      const timer = setTimeout(() => {
        setIsVisible(true);
      }, 5000);
      
      return () => clearTimeout(timer);
    }
  }, [canInstall, isDismissed]);

  const handleDismiss = () => {
    setIsVisible(false);
    setIsDismissed(true);
    localStorage.setItem('pwa-install-dismissed', Date.now().toString());
  };

  const handleInstall = async () => {
    await promptInstall();
    setIsVisible(false);
    // Mark as permanently dismissed after install attempt
    localStorage.setItem('pwa-install-dismissed', Date.now().toString());
  };

  if (!isVisible) {
    return null;
  }

  return (
    <div
      role="dialog"
      aria-labelledby="install-title"
      style={{
        position: 'fixed',
        top: '20px',
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 9999,
        background: '#1A1A1A',
        border: '1px solid #2A2A2A',
        padding: '20px',
        borderRadius: '16px',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.5)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '16px',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        maxWidth: '420px',
        width: '90vw',
        animation: 'slideDown 0.3s ease-out'
      }}
    >
      <style>{`
        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translateX(-50%) translateY(-20px);
          }
          to {
            opacity: 1;
            transform: translateX(-50%) translateY(0);
          }
        }
      `}</style>
      
      {/* Header with Logo and Title */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', width: '100%' }}>
        {/* App Icon */}
        <div
          style={{
            width: '56px',
            height: '56px',
            background: '#0B0704',
            borderRadius: '14px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
            overflow: 'hidden',
            boxShadow: 'inset 0 0 0 1px rgba(212, 175, 55, 0.3), 0 2px 4px rgba(0,0,0,0.2)'
          }}
        >
          <img 
            src="/logo-kemet-site.webp" 
            alt="MAATFEED"
            style={{
              width: '40px',
              height: '40px',
              objectFit: 'contain'
            }}
          />
        </div>
        
        {/* Title */}
        <div 
          id="install-title"
          style={{ 
            fontWeight: 600, 
            fontSize: '18px',
            color: '#F5F5F5'
          }}
        >
          Installer MAATFEED
        </div>
      </div>
      
      {/* Description */}
      <div style={{ 
        fontSize: '14px', 
        color: '#A3A3A3', 
        lineHeight: 1.4, 
        textAlign: 'center',
        width: '100%'
      }}>
        Ajoutez l'application à votre écran d'accueil pour un accès rapide hors ligne
      </div>
      
      {/* Actions */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', width: '100%' }}>
        <button
          onClick={handleInstall}
          style={{
            background: 'linear-gradient(135deg, #D4AF37 0%, #B8941F 100%)',
            border: 'none',
            color: '#0B0704',
            padding: '12px 24px',
            borderRadius: '10px',
            cursor: 'pointer',
            fontSize: '14px',
            fontWeight: 600,
            width: '100%',
            transition: 'all 0.2s ease'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-1px)';
            e.currentTarget.style.boxShadow = '0 4px 12px rgba(212, 175, 55, 0.3)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = 'none';
          }}
        >
          Installer
        </button>
        
        <button
          onClick={handleDismiss}
          style={{
            background: 'transparent',
            border: 'none',
            color: '#737373',
            padding: '8px',
            cursor: 'pointer',
            fontSize: '13px',
            width: '100%',
            transition: 'color 0.2s ease'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.color = '#A3A3A3';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.color = '#737373';
          }}
        >
          Plus tard
        </button>
      </div>
    </div>
  );
}

/**
 * PWA Badge for installed apps
 * Shows an indicator when the app is running in standalone mode
 */
export function PWABadge() {
  const [isStandalone, setIsStandalone] = useState(false);

  useEffect(() => {
    // Check if app is running in standalone mode (installed PWA)
    const isStandaloneMode = 
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as any).standalone === true;
    
    setIsStandalone(isStandaloneMode);
  }, []);

  if (!isStandalone) {
    return null;
  }

  return (
    <div
      style={{
        position: 'fixed',
        bottom: '16px',
        right: '16px',
        background: 'rgba(11, 7, 4, 0.8)',
        backdropFilter: 'blur(8px)',
        border: '1px solid rgba(212, 175, 55, 0.3)',
        padding: '8px 12px',
        borderRadius: '8px',
        display: 'flex',
        alignItems: 'center',
        gap: '6px',
        fontSize: '12px',
        color: '#D4AF37',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        zIndex: 100
      }}
    >
      <span>📱</span>
      <span>Mode hors ligne actif</span>
    </div>
  );
}
