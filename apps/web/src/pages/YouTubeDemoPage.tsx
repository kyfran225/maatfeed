import { useMemo, useState } from "react";
import { SEO } from "../components/SEO";
import {
  buildYouTubeEmbedUrl,
  extractYouTubeVideoId,
  YouTubeEmbed,
  type YouTubeEmbedOptions
} from "../components/media/YouTubeEmbed";

const DEFAULT_VIDEO_URL = "https://www.youtube.com/watch?v=M7lc1UVf-VE";

export function YouTubeDemoPage() {
  const [videoUrl, setVideoUrl] = useState(DEFAULT_VIDEO_URL);
  const [options, setOptions] = useState<Required<YouTubeEmbedOptions>>({
    controls: true,
    autoplay: false,
    muted: false,
    loop: false,
    captions: false,
    keyboardControls: true,
    fullscreen: true,
    playsInline: true,
    relatedSameChannel: true,
    enableJsApi: true
  });

  const videoId = useMemo(() => extractYouTubeVideoId(videoUrl), [videoUrl]);
  const embedUrl = useMemo(
    () => (videoId ? buildYouTubeEmbedUrl(videoId, options) : ""),
    [options, videoId]
  );

  const handleOptionChange = (optionName: keyof YouTubeEmbedOptions, value: boolean) => {
    setOptions(prev => ({ ...prev, [optionName]: value }));
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <SEO
        title="YouTube Embed Demo - Maatfeed"
        description="Démonstration de l'intégration YouTube selon les recommandations officielles de l'IFrame Player API"
      />

      <div className="max-w-4xl mx-auto px-4">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            YouTube Embed Demo
          </h1>
          <p className="text-gray-600">
            Intégration YouTube selon les recommandations officielles de l'IFrame Player API
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Options du lecteur YouTube
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={options.controls}
                onChange={(event) => handleOptionChange("controls", event.target.checked)}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm text-gray-700">Contrôles du lecteur</span>
            </label>

            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={options.autoplay}
                onChange={(event) => handleOptionChange("autoplay", event.target.checked)}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm text-gray-700">Lecture automatique</span>
            </label>

            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={options.muted}
                onChange={(event) => handleOptionChange("muted", event.target.checked)}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm text-gray-700">Démarrer en muet</span>
            </label>

            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={options.loop}
                onChange={(event) => handleOptionChange("loop", event.target.checked)}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm text-gray-700">Lecture en boucle</span>
            </label>

            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={options.captions}
                onChange={(event) => handleOptionChange("captions", event.target.checked)}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm text-gray-700">Sous-titres par défaut</span>
            </label>

            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={options.keyboardControls}
                onChange={(event) => handleOptionChange("keyboardControls", event.target.checked)}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm text-gray-700">Contrôles clavier</span>
            </label>

            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={options.fullscreen}
                onChange={(event) => handleOptionChange("fullscreen", event.target.checked)}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm text-gray-700">Plein écran</span>
            </label>

            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={options.playsInline}
                onChange={(event) => handleOptionChange("playsInline", event.target.checked)}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm text-gray-700">Lecture inline mobile</span>
            </label>

            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={options.relatedSameChannel}
                onChange={(event) => handleOptionChange("relatedSameChannel", event.target.checked)}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm text-gray-700">Suggestions même chaîne</span>
            </label>

            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={options.enableJsApi}
                onChange={(event) => handleOptionChange("enableJsApi", event.target.checked)}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm text-gray-700">API JavaScript activée</span>
            </label>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            URL de la vidéo YouTube
          </label>
          <input
            type="url"
            value={videoUrl}
            onChange={(event) => setVideoUrl(event.target.value)}
            placeholder="https://www.youtube.com/watch?v=VIDEO_ID"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          {!videoId && (
            <p className="mt-2 text-sm text-red-600">
              URL YouTube invalide. Formats acceptés : youtube.com/watch, youtu.be, /embed, /shorts et /live.
            </p>
          )}
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Vidéo YouTube intégrée
          </h2>

          <div className="mb-6 overflow-hidden rounded-lg bg-black">
            {videoId ? (
              <YouTubeEmbed
                key={embedUrl}
                videoUrl={videoUrl}
                title="YouTube video"
                options={options}
              />
            ) : (
              <div className="flex aspect-video min-h-[200px] items-center justify-center px-4 text-center text-sm text-white/70">
                Ajoutez une URL YouTube valide pour afficher la vidéo.
              </div>
            )}
          </div>

          {embedUrl && (
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                URL embed générée
              </label>
              <input
                readOnly
                value={embedUrl}
                className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-sm text-gray-700 focus:outline-none"
              />
            </div>
          )}

          <div className="mt-6 p-4 bg-blue-50 rounded-lg">
            <h3 className="font-medium text-blue-900 mb-2">
              Caractéristiques de l'intégration :
            </h3>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>- Embed officiel : https://www.youtube.com/embed/VIDEO_ID</li>
              <li>- Dimensions : format 16:9 responsive, minimum 200px par 200px</li>
              <li>- API JavaScript : enablejsapi=1 avec origin défini</li>
              <li>- Boucle officielle : loop=1 avec playlist=VIDEO_ID</li>
              <li>- Aucun paramètre déprécié comme showinfo ou modestbranding</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

export default YouTubeDemoPage;
