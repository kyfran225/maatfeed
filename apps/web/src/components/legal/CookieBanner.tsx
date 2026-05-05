import React, { useState, useEffect } from 'react';
import { X, Settings, Shield, Cookie } from 'lucide-react';

interface CookiePreferences {
  essential: boolean;
  analytics: boolean;
  marketing: boolean;
  functional: boolean;
}

export default function CookieBanner() {
<<<<<<< HEAD
=======
  // Désactiver complètement le CookieBanner dans les tests Playwright
  if (typeof window !== 'undefined' && navigator.userAgent.includes('Playwright')) {
    return null;
  }
  
>>>>>>> staging
  const [isVisible, setIsVisible] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [preferences, setPreferences] = useState<CookiePreferences>({
    essential: true,
    analytics: false,
    marketing: false,
    functional: false
  });

  useEffect(() => {
    const consent = localStorage.getItem('cookie-consent');
    if (!consent) {
      setIsVisible(true);
    }
  }, []);

  const savePreferences = (acceptAll = false) => {
    const finalPreferences = acceptAll 
      ? { essential: true, analytics: true, marketing: true, functional: true }
      : preferences;

    localStorage.setItem('cookie-consent', JSON.stringify(finalPreferences));
    localStorage.setItem('cookie-consent-date', new Date().toISOString());
    
    // Appliquer les préférences
    applyCookiePreferences(finalPreferences);
    
    setIsVisible(false);
    setShowSettings(false);
  };

  const applyCookiePreferences = (prefs: CookiePreferences) => {
    // Cookies essentiels (toujours activés)
    if (prefs.essential) {
      document.cookie = `session_consent=true; path=/; max-age=${60 * 60 * 24 * 30}`;
    }

    // Google Analytics ou autre tracking
    if (prefs.analytics) {
      // Activer Google Analytics
      (window as any).gtag = (window as any).gtag || function() { ((window as any).gtag.q = (window as any).gtag.q || []).push(arguments); };
      (window as any).gtag('consent', 'update', { 'analytics_storage': 'granted' });
    } else {
      (window as any).gtag = (window as any).gtag || function() { ((window as any).gtag.q = (window as any).gtag.q || []).push(arguments); };
      (window as any).gtag('consent', 'update', { 'analytics_storage': 'denied' });
    }

    // Marketing cookies
    if (prefs.marketing) {
      document.cookie = `marketing_consent=true; path=/; max-age=${60 * 60 * 24 * 365}`;
    }

    // Cookies fonctionnels
    if (prefs.functional) {
      document.cookie = `functional_consent=true; path=/; max-age=${60 * 60 * 24 * 180}`;
    }

    // Log du consentement pour audit
    console.log('Cookie consent saved:', {
      preferences: prefs,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent
    });
  };

  const handlePreferenceChange = (category: keyof CookiePreferences, value: boolean) => {
    if (category === 'essential') return; // Les cookies essentiels ne peuvent être désactivés
    setPreferences(prev => ({ ...prev, [category]: value }));
  };

  if (!isVisible) return null;

  return (
    <>
      {/* Overlay pour les paramètres */}
      {showSettings && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[80vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                  <Cookie className="w-6 h-6" />
                  Préférences de cookies
                </h2>
                <button
                  onClick={() => setShowSettings(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="space-y-6">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-blue-900 mb-2">Cookies essentiels</h3>
                  <p className="text-sm text-blue-700 mb-3">
                    Nécessaires au fonctionnement du site (authentification, sécurité, panier)
                  </p>
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="essential"
                      checked={preferences.essential}
                      disabled
                      className="w-4 h-4 text-blue-600 rounded"
                    />
                    <label htmlFor="essential" className="text-sm text-gray-700">
                      Toujours activés
                    </label>
                  </div>
                </div>

                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-gray-900 mb-2">Cookies d'analyse</h3>
                  <p className="text-sm text-gray-700 mb-3">
                    Nous aident à comprendre comment vous utilisez le site pour améliorer nos services
                  </p>
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="analytics"
                      checked={preferences.analytics}
                      onChange={(e) => handlePreferenceChange('analytics', e.target.checked)}
                      className="w-4 h-4 text-blue-600 rounded"
                    />
                    <label htmlFor="analytics" className="text-sm text-gray-700">
                      Autoriser les cookies d'analyse
                    </label>
                  </div>
                </div>

                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-gray-900 mb-2">Cookies marketing</h3>
                  <p className="text-sm text-gray-700 mb-3">
                    Utilisés pour vous proposer des publicités pertinentes
                  </p>
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="marketing"
                      checked={preferences.marketing}
                      onChange={(e) => handlePreferenceChange('marketing', e.target.checked)}
                      className="w-4 h-4 text-blue-600 rounded"
                    />
                    <label htmlFor="marketing" className="text-sm text-gray-700">
                      Autoriser les cookies marketing
                    </label>
                  </div>
                </div>

                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-gray-900 mb-2">Cookies fonctionnels</h3>
                  <p className="text-sm text-gray-700 mb-3">
                    Améliorent votre expérience (préférences, personnalisation)
                  </p>
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="functional"
                      checked={preferences.functional}
                      onChange={(e) => handlePreferenceChange('functional', e.target.checked)}
                      className="w-4 h-4 text-blue-600 rounded"
                    />
                    <label htmlFor="functional" className="text-sm text-gray-700">
                      Autoriser les cookies fonctionnels
                    </label>
                  </div>
                </div>
              </div>

              <div className="flex gap-3 mt-8">
                <button
                  onClick={() => savePreferences(false)}
                  className="flex-1 bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Enregistrer mes choix
                </button>
                <button
                  onClick={() => savePreferences(true)}
                  className="flex-1 bg-gray-600 text-white py-3 px-4 rounded-lg hover:bg-gray-700 transition-colors"
                >
                  Tout accepter
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Bannière principale */}
<<<<<<< HEAD
      <div className="fixed bottom-32 left-0 right-0 bg-white border-t border-gray-200 shadow-lg z-40 lg:bottom-0">
=======
      <div data-testid="cookie-banner" className="fixed bottom-32 left-0 right-0 bg-white border-t border-gray-200 shadow-lg z-40 lg:bottom-0">
>>>>>>> staging
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <div className="flex items-start gap-3 flex-1">
              <Cookie className="w-6 h-6 text-blue-600 mt-1 flex-shrink-0" />
              <div className="flex-1">
                <p className="text-gray-800 font-medium mb-1">
                  MAAT FEED utilise des cookies pour améliorer votre expérience
                </p>
                <p className="text-sm text-gray-600">
                  Certains cookies sont essentiels au fonctionnement du site, d'autres nous aident 
                  à personnaliser votre contenu et à analyser notre trafic.
                </p>
              </div>
            </div>
            
            <div className="flex gap-2 flex-shrink-0">
              <button
                onClick={() => setShowSettings(true)}
                className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm"
              >
                <Settings className="w-4 h-4" />
                Personnaliser
              </button>
              <button
                onClick={() => savePreferences(true)}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
              >
                Tout accepter
              </button>
              <button
                onClick={() => savePreferences(false)}
                className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm"
              >
                Refuser
              </button>
            </div>
          </div>
          
          <div className="mt-3 flex items-center gap-4 text-xs text-gray-500">
            <a href="/privacy-policy" className="hover:text-blue-600 underline">
              Politique de confidentialité
            </a>
            <span>•</span>
            <a href="/legal-notice" className="hover:text-blue-600 underline">
              Mentions légales
            </a>
            <span>•</span>
            <button
              onClick={() => setShowSettings(true)}
              className="hover:text-blue-600 underline"
            >
              Gérer les cookies
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
