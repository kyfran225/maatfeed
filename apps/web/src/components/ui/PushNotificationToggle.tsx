import { useWebPush, getPermissionStatusText } from "../../hooks/useWebPush";
import { Button } from "./Button";

interface PushNotificationToggleProps {
  className?: string;
}

export function PushNotificationToggle({ className = "" }: PushNotificationToggleProps) {
  const {
    isSupported,
    permission,
    isSubscribed,
    isLoading,
    error,
    subscribe,
    unsubscribe
  } = useWebPush();

  // Not supported by browser
  if (!isSupported) {
    return (
      <div className={`p-4 bg-gray-100 rounded-lg ${className}`}>
        <p className="text-sm text-gray-600">
          Les notifications push ne sont pas supportées par ce navigateur.
        </p>
      </div>
    );
  }

  // Permission denied - show instructions to enable
  if (permission === "denied") {
    return (
      <div className={`p-4 bg-red-50 border border-red-200 rounded-lg ${className}`}>
        <div className="flex items-start gap-3">
          <span className="text-xl">🔒</span>
          <div>
            <h4 className="font-medium text-red-800">Notifications bloquées</h4>
            <p className="text-sm text-red-600 mt-1">
              Vous avez bloqué les notifications. Pour les activer :
            </p>
            <ol className="text-sm text-red-600 mt-2 ml-4 list-decimal">
              <li>Cliquez sur l&apos;icône 🔒 à gauche de l&apos;URL</li>
              <li>Autorisez les notifications pour ce site</li>
              <li>Rechargez la page</li>
            </ol>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`p-4 bg-white border border-gray-200 rounded-lg ${className}`}>
      <div className="flex items-start gap-3">
        <span className="text-2xl">
          {isSubscribed ? "🔔" : "🔕"}
        </span>
        <div className="flex-1">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium text-gray-900">
                {isSubscribed ? "Notifications activées" : "Notifications désactivées"}
              </h4>
              <p className="text-sm text-gray-500 mt-0.5">
                Statut : {getPermissionStatusText(permission)}
              </p>
            </div>

            <Button
              onClick={isSubscribed ? unsubscribe : subscribe}
              disabled={isLoading}
              variant={isSubscribed ? "secondary" : "primary"}
            >
              {isLoading ? (
                <span className="flex items-center gap-2">
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                      fill="none"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                  Chargement...
                </span>
              ) : isSubscribed ? (
                "Désactiver"
              ) : (
                "Activer"
              )}
            </Button>
          </div>

          {isSubscribed && (
            <p className="text-sm text-green-600 mt-2">
              ✓ Vous recevrez des notifications push sur cet appareil
            </p>
          )}

          {!isSubscribed && permission === "granted" && (
            <p className="text-sm text-amber-600 mt-2">
              ⚠ Permission accordée mais pas encore abonné
            </p>
          )}

          {error && (
            <p className="text-sm text-red-600 mt-2">
              ✗ {error}
            </p>
          )}

          <div className="mt-3 pt-3 border-t border-gray-100">
            <p className="text-xs text-gray-400">
              Les notifications incluent : nouveaux commentaires, réponses, tendances,
              et alertes de sécurité.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

// Simple inline toggle button variant
export function PushNotificationButton({ className = "" }: { className?: string }) {
  const { isSupported, isSubscribed, isLoading, subscribe, unsubscribe } = useWebPush();

  if (!isSupported) return null;

  return (
    <button
      onClick={isSubscribed ? unsubscribe : subscribe}
      disabled={isLoading}
      className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors
        ${isSubscribed
          ? "bg-green-100 text-green-700 hover:bg-green-200"
          : "bg-gray-100 text-gray-700 hover:bg-gray-200"
        }
        disabled:opacity-50 disabled:cursor-not-allowed
        ${className}
      `}
      title={isSubscribed ? "Désactiver les notifications" : "Activer les notifications"}
    >
      <span>{isSubscribed ? "🔔" : "🔕"}</span>
      <span>{isSubscribed ? "Notifications on" : "Notifications off"}</span>
    </button>
  );
}
