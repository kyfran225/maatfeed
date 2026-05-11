import React, { useState, useEffect } from 'react';
import { Wifi, WifiOff, Monitor, Smartphone, Zap, Settings } from 'lucide-react';
import { performanceService, type OptimizationConfig } from '../../services/performanceService';

interface DataSaverToggleProps {
  className?: string;
}

export const DataSaverToggle: React.FC<DataSaverToggleProps> = ({ className = '' }) => {
  const [config, setConfig] = useState<OptimizationConfig>(performanceService.getConfig());
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    // Update config when performance service changes
    const interval = setInterval(() => {
      const currentConfig = performanceService.getConfig();
      if (JSON.stringify(currentConfig) !== JSON.stringify(config)) {
        setConfig(currentConfig);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [config]);

  const handleToggleDataSaver = () => {
    const newConfig = { ...config, dataSaverMode: !config.dataSaverMode };
    
    // When enabling data saver, adjust other settings
    if (!config.dataSaverMode) {
      newConfig.imageQuality = 50;
      newConfig.lazyLoading = true;
      newConfig.prefetchEnabled = false;
      newConfig.compressionEnabled = true;
    } else {
      // Restore defaults when disabling
      newConfig.imageQuality = 75;
      newConfig.prefetchEnabled = true;
    }

    performanceService.updateConfig(newConfig);
    setConfig(newConfig);
  };

  const handleConfigChange = (key: keyof OptimizationConfig, value: any) => {
    const newConfig = { ...config, [key]: value };
    performanceService.updateConfig(newConfig);
    setConfig(newConfig);
  };

  const getNetworkIcon = () => {
    const networkType = performanceService.getMetrics().networkType;
    
    switch (networkType) {
      case 'slow-2g':
      case '2g':
        return <WifiOff className="w-4 h-4 text-red-500" />;
      case '3g':
        return <Wifi className="w-4 h-4 text-yellow-500" />;
      case '4g':
      case 'wifi':
        return <Wifi className="w-4 h-4 text-green-500" />;
      default:
        return <Wifi className="w-4 h-4 text-gray-500" />;
    }
  };

  const getNetworkText = () => {
    const networkType = performanceService.getMetrics().networkType;
    const deviceType = performanceService.getMetrics().deviceType;
    
    return `${networkType.toUpperCase()} • ${deviceType.toUpperCase()}`;
  };

  const getQualityLabel = (quality: number) => {
    if (quality <= 40) return 'Faible';
    if (quality <= 60) return 'Moyenne';
    if (quality <= 80) return 'Bonne';
    return 'Élevée';
  };

  const metrics = performanceService.getMetrics();

  return (
    <div className={`relative ${className}`}>
      {/* Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center gap-2 px-3 py-2 rounded-lg border transition-all ${
          config.dataSaverMode
            ? 'bg-orange-500 border-orange-500 text-white'
            : 'bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:border-gray-400 dark:hover:border-gray-500'
        }`}
      >
        {config.dataSaverMode ? (
          <WifiOff className="w-4 h-4" />
        ) : (
          <Wifi className="w-4 h-4" />
        )}
        
        <span className="text-sm font-medium">
          {config.dataSaverMode ? 'Data Saver ON' : 'Data Saver OFF'}
        </span>
        
        <Settings className="w-4 h-4" />
      </button>

      {/* Dropdown Panel */}
      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-80 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-50">
          {/* Header */}
          <div className="p-4 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-gray-900 dark:text-gray-100">
                Optimisation Mobile
              </h3>
              <button
                onClick={() => setIsOpen(false)}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              >
                ×
              </button>
            </div>
            
            {/* Network Status */}
            <div className="flex items-center gap-2 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
              {getNetworkIcon()}
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                  {getNetworkText()}
                </p>
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  {metrics.loadTime > 0 && `Chargement: ${metrics.loadTime}ms`}
                </p>
              </div>
            </div>
          </div>

          {/* Settings */}
          <div className="p-4 space-y-4">
            {/* Data Saver Mode */}
            <div className="flex items-center justify-between">
              <div>
                <label className="font-medium text-gray-900 dark:text-gray-100">
                  Mode Data Saver
                </label>
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  Réduit la consommation de données
                </p>
              </div>
              <button
                onClick={handleToggleDataSaver}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  config.dataSaverMode ? 'bg-orange-500' : 'bg-gray-300 dark:bg-gray-600'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    config.dataSaverMode ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>

            {/* Image Quality */}
            <div>
              <label className="font-medium text-gray-900 dark:text-gray-100 mb-2 block">
                Qualité des images: {getQualityLabel(config.imageQuality)}
              </label>
              <input
                type="range"
                min="20"
                max="100"
                step="10"
                value={config.imageQuality}
                onChange={(e) => handleConfigChange('imageQuality', parseInt(e.target.value))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700"
                disabled={config.dataSaverMode}
              />
              <div className="flex justify-between text-xs text-gray-600 dark:text-gray-400 mt-1">
                <span>Basse</span>
                <span>Élevée</span>
              </div>
            </div>

            {/* Lazy Loading */}
            <div className="flex items-center justify-between">
              <div>
                <label className="font-medium text-gray-900 dark:text-gray-100">
                  Chargement différé (Lazy Loading)
                </label>
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  Charge les images au fur et à mesure
                </p>
              </div>
              <button
                onClick={() => handleConfigChange('lazyLoading', !config.lazyLoading)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  config.lazyLoading ? 'bg-orange-500' : 'bg-gray-300 dark:bg-gray-600'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    config.lazyLoading ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>

            {/* Prefetch */}
            <div className="flex items-center justify-between">
              <div>
                <label className="font-medium text-gray-900 dark:text-gray-100">
                  Préchargement des ressources
                </label>
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  Charge les ressources à l'avance
                </p>
              </div>
              <button
                onClick={() => handleConfigChange('prefetchEnabled', !config.prefetchEnabled)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  config.prefetchEnabled ? 'bg-orange-500' : 'bg-gray-300 dark:bg-gray-600'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    config.prefetchEnabled ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>

            {/* Reduced Motion */}
            <div className="flex items-center justify-between">
              <div>
                <label className="font-medium text-gray-900 dark:text-gray-100">
                  Animations réduites
                </label>
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  Désactive les animations non essentielles
                </p>
              </div>
              <button
                onClick={() => handleConfigChange('reducedMotion', !config.reducedMotion)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  config.reducedMotion ? 'bg-orange-500' : 'bg-gray-300 dark:bg-gray-600'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    config.reducedMotion ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
          </div>

          {/* Footer */}
          <div className="p-4 border-t border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2">
                <Zap className="w-4 h-4 text-orange-500" />
                <span className="text-gray-600 dark:text-gray-400">
                  {metrics.loadTime < 4000 ? 'Optimisé' : 'À optimiser'}
                </span>
              </div>
              
              <button
                onClick={() => {
                  console.log(performanceService.generateReport());
                }}
                className="text-orange-500 hover:text-orange-600 font-medium"
              >
                Rapport
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
