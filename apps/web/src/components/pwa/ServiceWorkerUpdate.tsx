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
        top: '20px',
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 9999,
        background: 'linear-gradient(135deg, #D4AF37 0%, #B8941F 100%)',
        border: '1px solid rgba(212, 175, 55, 0.5)',
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

      {/* Header with Icon and Title */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', width: '100%' }}>
        {/* Update Icon */}
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
          <span style={{ fontSize: '28px' }}>🔄</span>
        </div>

        {/* Title */}
        <div
          style={{
            fontWeight: 600,
            fontSize: '18px',
            color: '#0B0704'
          }}
        >
          Nouvelle version disponible
        </div>
      </div>

      {/* Description */}
      <div
        style={{
          fontSize: '14px',
          color: '#0B0704',
          opacity: 0.9,
          lineHeight: 1.4,
          textAlign: 'center',
          width: '100%'
        }}
      >
        Mettez à jour pour bénéficier des dernières améliorations
      </div>

      {/* Actions */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', width: '100%' }}>
        <button
          onClick={update}
          style={{
            background: '#0B0704',
            border: 'none',
            color: '#D4AF37',
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
            e.currentTarget.style.boxShadow = '0 4px 12px rgba(11, 7, 4, 0.3)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = 'none';
          }}
        >
          Mettre à jour
        </button>

        <button
          onClick={dismissUpdate}
          style={{
            background: 'transparent',
            border: 'none',
            color: '#0B0704',
            opacity: 0.7,
            padding: '8px',
            cursor: 'pointer',
            fontSize: '13px',
            width: '100%',
            transition: 'opacity 0.2s ease'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.opacity = '1';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.opacity = '0.7';
          }}
        >
          Plus tard
        </button>
      </div>
    </div>
  );
}
