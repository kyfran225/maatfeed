import { useState } from "react";
import { SEO } from "../components/SEO";
import { TikTokEmbed } from "../components/feed/TikTokEmbed";

export function TikTokDemoPage() {
  const [videoUrl, setVideoUrl] = useState(
    "https://www.tiktok.com/@scout2015/video/6718335390845095173"
  );

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
              <li>• Contrôles interactifs</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

export default TikTokDemoPage;
