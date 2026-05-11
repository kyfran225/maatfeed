import React, { useState } from 'react';
import { MediaUpload } from './MediaUpload';
import { useAuthStore } from '../../stores/authStore';

interface UploadedMedia {
  id: string;
  name: string;
  url: string;
  size: number;
  type: string;
}

export default function UploadPage() {
  const [uploadedMedia, setUploadedMedia] = useState<UploadedMedia[]>([]);
  const { user } = useAuthStore();

  const handleUploadComplete = (results: UploadedMedia[]) => {
    setUploadedMedia(prev => [...prev, ...results]);
  };

  const handleCopyUrl = (url: string) => {
    navigator.clipboard.writeText(url);
    // You could add a toast notification here
  };

  const handleRemoveMedia = (id: string) => {
    setUploadedMedia(prev => prev.filter(media => media.id !== id));
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Authentication Required</h1>
          <p className="text-gray-400">Please log in to upload media files.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">
            Upload Media
          </h1>
          <p className="text-gray-400">
            Share your audio, video, and image content with the MAATFEED community.
          </p>
        </div>

        {/* Upload Component */}
        <div className="mb-12">
          <MediaUpload 
            onUploadComplete={handleUploadComplete}
            maxFiles={10}
            className="bg-gray-900 rounded-lg p-6"
          />
        </div>

        {/* Uploaded Media */}
        {uploadedMedia.length > 0 && (
          <div>
            <h2 className="text-xl font-semibold text-white mb-4">
              Recently Uploaded
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {uploadedMedia.map((media) => (
                <div
                  key={media.id}
                  className="bg-gray-900 rounded-lg overflow-hidden border border-gray-800"
                >
                  {/* Preview */}
                  <div className="aspect-video bg-gray-800 flex items-center justify-center">
                    {media.type.startsWith('image/') ? (
                      <img
                        src={media.url}
                        alt={media.name}
                        className="w-full h-full object-cover"
                      />
                    ) : media.type.startsWith('video/') ? (
                      <video
                        src={media.url}
                        className="w-full h-full object-cover"
                        controls={false}
                      />
                    ) : (
                      <div className="text-center">
                        <div className="w-16 h-16 bg-orange-500 rounded-full flex items-center justify-center mx-auto mb-2">
                          <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M18 3a1 1 0 00-1.196-.98l-10 2A1 1 0 006 5v9.114A4.369 4.369 0 005 14c-1.657 0-3 .895-3 2s1.343 2 3 2 3-.895 3-2V7.82l8-1.6v5.894A4.37 4.37 0 0015 12c-1.657 0-3 .895-3 2s1.343 2 3 2 3-.895 3-2V3z" />
                          </svg>
                        </div>
                        <p className="text-sm text-gray-400">Audio File</p>
                      </div>
                    )}
                  </div>

                  {/* Info */}
                  <div className="p-4">
                    <h3 className="text-sm font-medium text-white truncate mb-1">
                      {media.name}
                    </h3>
                    <p className="text-xs text-gray-400 mb-3">
                      {(media.size / 1024 / 1024).toFixed(2)} MB
                    </p>

                    {/* Actions */}
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleCopyUrl(media.url)}
                        className="flex-1 px-3 py-1.5 bg-gray-800 text-white text-xs rounded hover:bg-gray-700 transition-colors"
                      >
                        Copy URL
                      </button>
                      <button
                        onClick={() => window.open(media.url, '_blank')}
                        className="flex-1 px-3 py-1.5 bg-orange-500 text-white text-xs rounded hover:bg-orange-600 transition-colors"
                      >
                        View
                      </button>
                      <button
                        onClick={() => handleRemoveMedia(media.id)}
                        className="px-3 py-1.5 bg-red-500 text-white text-xs rounded hover:bg-red-600 transition-colors"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tips */}
        <div className="mt-12 bg-gray-900 rounded-lg p-6 border border-gray-800">
          <h3 className="text-lg font-semibold text-white mb-4">
            Upload Tips
          </h3>
          <ul className="space-y-2 text-sm text-gray-400">
            <li className="flex items-start">
              <span className="text-orange-500 mr-2">•</span>
              Maximum file size: 100MB per file
            </li>
            <li className="flex items-start">
              <span className="text-orange-500 mr-2">•</span>
              Supported formats: Images (JPG, PNG, GIF, WebP), Videos (MP4, MOV, AVI), Audio (MP3, WAV, M4A)
            </li>
            <li className="flex items-start">
              <span className="text-orange-500 mr-2">•</span>
              You can upload up to 10 files at once
            </li>
            <li className="flex items-start">
              <span className="text-orange-500 mr-2">•</span>
              All files are automatically optimized for web and mobile viewing
            </li>
            <li className="flex items-start">
              <span className="text-orange-500 mr-2">•</span>
              Videos and audio files will be processed for optimal streaming quality
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
