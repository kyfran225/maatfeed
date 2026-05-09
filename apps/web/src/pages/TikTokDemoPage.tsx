import { useState } from "react";
import { SEO } from "../components/SEO";
import { TikTokEmbed } from "../components/feed/TikTokEmbed";

interface TikTokOptions {
  controls: boolean;
  volume_control: boolean;
  fullscreen_button: boolean;
  progress_bar: boolean;
  play_button: boolean;
  timestamp: boolean;
  autoplay: boolean;
}

export function TikTokDemoPage() {
  const [videoUrl, setVideoUrl] = useState(
    "https://www.tiktok.com/@scout2015/video/6718335390845095173"
  );

  const [options, setOptions] = useState<TikTokOptions>({
    controls: true,
    volume_control: true,
    fullscreen_button: true,
    progress_bar: true,
    play_button: true,
    timestamp: true,
    autoplay: true
  });

  const handleOptionChange = (optionName: keyof TikTokOptions, value: boolean) => {
    setOptions(prev => ({ ...prev, [optionName]: value }));
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <SEO 
        title="TikTok Embed Demo - Maatfeed"
        description="Démonstration de l'intégration TikTok selon les recommandations officielles"
      />
      
      <div className="max-w-4xl mx-auto px-4">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            TikTok Embed Demo
          </h1>
          <p className="text-gray-600">
            Intégration TikTok selon les recommandations officielles oEmbed API
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Options du lecteur TikTok
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={options.controls}
                onChange={(e) => handleOptionChange('controls', e.target.checked)}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm text-gray-700">Contrôles généraux</span>
            </label>

            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={options.volume_control}
                onChange={(e) => handleOptionChange('volume_control', e.target.checked)}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm text-gray-700">Contrôle du volume</span>
            </label>

            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={options.fullscreen_button}
                onChange={(e) => handleOptionChange('fullscreen_button', e.target.checked)}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm text-gray-700">Bouton plein écran</span>
            </label>

            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={options.progress_bar}
                onChange={(e) => handleOptionChange('progress_bar', e.target.checked)}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm text-gray-700">Barre de progression</span>
            </label>

            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={options.play_button}
                onChange={(e) => handleOptionChange('play_button', e.target.checked)}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm text-gray-700">Bouton lecture/pause</span>
            </label>

            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={options.timestamp}
                onChange={(e) => handleOptionChange('timestamp', e.target.checked)}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm text-gray-700">Afficher le temps</span>
            </label>

            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={options.autoplay}
                onChange={(e) => handleOptionChange('autoplay', e.target.checked)}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm text-gray-700">Lecture automatique</span>
            </label>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            URL de la vidéo TikTok
          </label>
          <input
            type="url"
            value={videoUrl}
            onChange={(e) => setVideoUrl(e.target.value)}
            placeholder="https://www.tiktok.com/@username/video/123456789"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Vidéo TikTok intégrée
          </h2>
          
          <TikTokEmbed 
            videoUrl={videoUrl}
            options={options}
            className="mb-6"
          />

          <div className="mt-6 p-4 bg-blue-50 rounded-lg">
            <h3 className="font-medium text-blue-900 mb-2">
              Caractéristiques de l'intégration :
            </h3>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• Dimensions : max-width: 605px, min-width: 325px</li>
              <li>• Hauteur : gérée automatiquement par TikTok</li>
              <li>• Responsive et centré</li>
              <li>• Attribution complète du créateur</li>
              <li>• Contrôles interactifs essentiels</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

export default TikTokDemoPage;
