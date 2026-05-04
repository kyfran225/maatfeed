import { useServiceWorker } from '../../hooks/useServiceWorker';

/**
 * Component to display Service Worker update notification
 * Shows a banner when a new version of the app is available
 */
export function ServiceWorkerUpdate() {
  const { isUpdateAvailable, update, dismissUpdate } = useServiceWorker();

  if (!isUpdateAvailable) {
    return null;
  }

  return (
    <div 
      role="alert"
      aria-live="polite"
      style={{
        position: 'fixed',
        bottom: '20px',
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 9999,
        background: 'linear-gradient(135deg, #D4AF37 0%, #B8941F 100%)',
        color: '#0B0704',
        padding: '16px 24px',
        borderRadius: '12px',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4)',
        display: 'flex',
        alignItems: 'center',
        gap: '16px',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        fontSize: '14px',
        maxWidth: '90vw',
        width: 'auto',
        minWidth: '300px'
      }}
    >
      <span style={{ fontSize: '20px' }}>🔄</span>
      
      <div style={{ flex: 1 }}>
        <div style={{ fontWeight: 600, marginBottom: '4px' }}>
          Nouvelle version disponible
        </div>
        <div style={{ fontSize: '13px', opacity: 0.9 }}>
          Mettez à jour pour bénéficier des dernières améliorations
        </div>
      </div>
      
      <div style={{ display: 'flex', gap: '8px' }}>
        <button
          onClick={dismissUpdate}
          style={{
            background: 'transparent',
            border: '1px solid rgba(11, 7, 4, 0.3)',
            color: '#0B0704',
            padding: '8px 16px',
            borderRadius: '8px',
            cursor: 'pointer',
            fontSize: '13px',
            fontWeight: 500,
            transition: 'all 0.2s ease'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'rgba(11, 7, 4, 0.1)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'transparent';
          }}
        >
          Plus tard
        </button>
        
        <button
          onClick={update}
          style={{
            background: '#0B0704',
            border: 'none',
            color: '#D4AF37',
            padding: '8px 16px',
            borderRadius: '8px',
            cursor: 'pointer',
            fontSize: '13px',
            fontWeight: 600,
            transition: 'all 0.2s ease'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-1px)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
          }}
        >
          Mettre à jour
        </button>
      </div>
    </div>
  );
}
