import React, { useState } from 'react';
import { Wifi, WifiOff, Database, Zap, Shield, Smartphone } from 'lucide-react';
import { useDataSaver } from '../../services/dataSaverService';
import { useOffline } from '../../services/offlineService';

export const DataSaverSettings: React.FC = () => {
  const { config, dataUsage, updateConfig, resetDataUsage, formatDataUsage } = useDataSaver();
  const { isOnline, config: offlineConfig, updateConfig: updateOfflineConfig } = useOffline();
  const [showAdvanced, setShowAdvanced] = useState(false);

  const handleDataSaverToggle = (enabled: boolean) => {
    updateConfig({ enabled });
  };

  const handleAutoModeToggle = (autoMode: boolean) => {
    updateConfig({ autoMode });
  };

  const handleImageQualityChange = (quality: 'low' | 'medium' | 'high') => {
    updateConfig({ imageQuality: quality });
  };

  const handleVideoQualityChange = (quality: 'low' | 'medium' | 'high') => {
    updateConfig({ videoQuality: quality });
  };

  const handlePreloadToggle = (preload: boolean) => {
    updateConfig({ preloadContent: preload });
  };

  const handleAnimationsToggle = (reduced: boolean) => {
    updateConfig({ reducedAnimations: reduced });
  };

  const handleOfflineToggle = (enabled: boolean) => {
    updateOfflineConfig({ enabled });
  };

  const getQualityLabel = (quality: string) => {
    switch (quality) {
      case 'low': return 'Basse (économique)';
      case 'medium': return 'Moyenne';
      case 'high': return 'Haute (qualité)';
      default: return quality;
    }
  };

  const getNetworkStatus = () => {
    if (!isOnline) {
      return { status: 'Hors ligne', color: 'text-red-500', icon: WifiOff };
    }
    
    // Get network type if available
    const connection = (navigator as any).connection;
    const effectiveType = connection?.effectiveType || 'unknown';
    
    switch (effectiveType) {
      case 'slow-2g':
      case '2g':
        return { status: '2G', color: 'text-orange-500', icon: Wifi };
      case '3g':
        return { status: '3G', color: 'text-yellow-500', icon: Wifi };
      case '4g':
        return { status: '4G', color: 'text-green-500', icon: Wifi };
      default:
        return { status: 'Connexion', color: 'text-blue-500', icon: Wifi };
    }
  };

  const networkStatus = getNetworkStatus();
  const NetworkIcon = networkStatus.icon;

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <Database className="w-6 h-6 text-orange-500" />
        <h1 className="text-2xl font-bold">Optimisation Mobile</h1>
      </div>

      {/* Network Status */}
      <div className="bg-white rounded-lg border p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <NetworkIcon className={`w-5 h-5 ${networkStatus.color}`} />
            <div>
              <h3 className="font-medium">Statut Réseau</h3>
              <p className="text-sm text-gray-600">{networkStatus.status}</p>
            </div>
          </div>
          
          <div className="text-right">
            <p className="text-sm text-gray-500">Utilisation de données</p>
            <p className="font-medium">{formatDataUsage(dataUsage.total)}</p>
          </div>
        </div>
      </div>

      {/* Data Saver Settings */}
      <div className="bg-white rounded-lg border p-6">
        <div className="flex items-center gap-2 mb-4">
          <Shield className="w-5 h-5 text-orange-500" />
          <h2 className="text-lg font-semibold">Mode Économie de Données</h2>
        </div>

        <div className="space-y-4">
          {/* Main Toggle */}
          <div className="flex items-center justify-between">
            <div>
              <label className="font-medium">Activer l'économie de données</label>
              <p className="text-sm text-gray-600">
                Réduit la consommation de données en optimisant les médias
              </p>
            </div>
            <button
              onClick={() => handleDataSaverToggle(!config.enabled)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                config.enabled ? 'bg-orange-500' : 'bg-gray-300'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  config.enabled ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>

          {/* Auto Mode */}
          <div className="flex items-center justify-between">
            <div>
              <label className="font-medium">Mode automatique</label>
              <p className="text-sm text-gray-600">
                Active automatiquement selon la qualité du réseau
              </p>
            </div>
            <button
              onClick={() => handleAutoModeToggle(!config.autoMode)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                config.autoMode ? 'bg-orange-500' : 'bg-gray-300'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  config.autoMode ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>
        </div>
      </div>

      {/* Quality Settings */}
      <div className="bg-white rounded-lg border p-6">
        <div className="flex items-center gap-2 mb-4">
          <Smartphone className="w-5 h-5 text-orange-500" />
          <h2 className="text-lg font-semibold">Qualité des Médias</h2>
        </div>

        <div className="space-y-4">
          {/* Image Quality */}
          <div>
            <label className="font-medium block mb-2">Qualité des images</label>
            <div className="grid grid-cols-3 gap-2">
              {(['low', 'medium', 'high'] as const).map((quality) => (
                <button
                  key={quality}
                  onClick={() => handleImageQualityChange(quality)}
                  className={`px-3 py-2 rounded-lg border text-sm font-medium transition-colors ${
                    config.imageQuality === quality
                      ? 'bg-orange-500 text-white border-orange-500'
                      : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  {getQualityLabel(quality)}
                </button>
              ))}
            </div>
          </div>

          {/* Video Quality */}
          <div>
            <label className="font-medium block mb-2">Qualité des vidéos</label>
            <div className="grid grid-cols-3 gap-2">
              {(['low', 'medium', 'high'] as const).map((quality) => (
                <button
                  key={quality}
                  onClick={() => handleVideoQualityChange(quality)}
                  className={`px-3 py-2 rounded-lg border text-sm font-medium transition-colors ${
                    config.videoQuality === quality
                      ? 'bg-orange-500 text-white border-orange-500'
                      : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  {getQualityLabel(quality)}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Performance Settings */}
      <div className="bg-white rounded-lg border p-6">
        <div className="flex items-center gap-2 mb-4">
          <Zap className="w-5 h-5 text-orange-500" />
          <h2 className="text-lg font-semibold">Performance</h2>
        </div>

        <div className="space-y-4">
          {/* Preload Content */}
          <div className="flex items-center justify-between">
            <div>
              <label className="font-medium">Préchargement du contenu</label>
              <p className="text-sm text-gray-600">
                Charge le contenu à l'avance pour une navigation plus rapide
              </p>
            </div>
            <button
              onClick={() => handlePreloadToggle(!config.preloadContent)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                config.preloadContent ? 'bg-orange-500' : 'bg-gray-300'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  config.preloadContent ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>

          {/* Reduced Animations */}
          <div className="flex items-center justify-between">
            <div>
              <label className="font-medium">Réduire les animations</label>
              <p className="text-sm text-gray-600">
                Désactive les animations pour économiser la batterie
              </p>
            </div>
            <button
              onClick={() => handleAnimationsToggle(!config.reducedAnimations)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                config.reducedAnimations ? 'bg-orange-500' : 'bg-gray-300'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  config.reducedAnimations ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>
        </div>
      </div>

      {/* Offline Settings */}
      <div className="bg-white rounded-lg border p-6">
        <div className="flex items-center gap-2 mb-4">
          <WifiOff className="w-5 h-5 text-orange-500" />
          <h2 className="text-lg font-semibold">Mode Hors Ligne</h2>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <label className="font-medium">Activer le mode hors ligne</label>
              <p className="text-sm text-gray-600">
                Permet d'accéder au contenu sans connexion internet
              </p>
            </div>
            <button
              onClick={() => handleOfflineToggle(!offlineConfig.enabled)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                offlineConfig.enabled ? 'bg-orange-500' : 'bg-gray-300'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  offlineConfig.enabled ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>
        </div>
      </div>

      {/* Data Usage Breakdown */}
      <div className="bg-white rounded-lg border p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Utilisation de Données</h2>
          <button
            onClick={resetDataUsage}
            className="text-sm text-orange-500 hover:text-orange-600"
          >
            Réinitialiser
          </button>
        </div>

        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">Images</span>
            <span className="font-medium">{formatDataUsage(dataUsage.images)}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">Vidéos</span>
            <span className="font-medium">{formatDataUsage(dataUsage.videos)}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">Audio</span>
            <span className="font-medium">{formatDataUsage(dataUsage.audio)}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">Autres</span>
            <span className="font-medium">{formatDataUsage(dataUsage.other)}</span>
          </div>
          <div className="border-t pt-3 flex justify-between items-center">
            <span className="font-medium">Total</span>
            <span className="font-bold text-orange-500">{formatDataUsage(dataUsage.total)}</span>
          </div>
        </div>
      </div>

      {/* Advanced Settings */}
      <div className="bg-white rounded-lg border p-6">
        <button
          onClick={() => setShowAdvanced(!showAdvanced)}
          className="flex items-center justify-between w-full text-left"
        >
          <h2 className="text-lg font-semibold">Paramètres Avancés</h2>
          <span className="text-gray-400">
            {showAdvanced ? '▼' : '▶'}
          </span>
        </button>

        {showAdvanced && (
          <div className="mt-4 space-y-4 text-sm text-gray-600">
            <p>
              <strong>Cache:</strong> Les données sont stockées localement pour un accès rapide.
            </p>
            <p>
              <strong>Compression:</strong> Les fichiers sont compressés pour réduire la taille.
            </p>
            <p>
              <strong>Sync automatique:</strong> Les changements sont synchronisés lorsque la connexion est rétablie.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
