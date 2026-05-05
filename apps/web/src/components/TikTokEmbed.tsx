import React, { useEffect, useState } from 'react';

interface TikTokEmbedProps {
  videoUrl: string;
  className?: string;
}

interface TikTokEmbedData {
  version: string;
  type: string;
  title: string;
  author_url: string;
  author_name: string;
  width: string;
  height: string;
  html: string;
  thumbnail_width: number;
  thumbnail_height: number;
  thumbnail_url: string;
  provider_url: string;
  provider_name: string;
}

export function TikTokEmbed({ videoUrl, className = "" }: TikTokEmbedProps) {
  const [embedData, setEmbedData] = useState<TikTokEmbedData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadEmbed() {
      try {
        setLoading(true);
        const response = await fetch(
          `https://www.tiktok.com/oembed?url=${encodeURIComponent(videoUrl)}`
        );
        
        if (!response.ok) {
          throw new Error('Failed to fetch TikTok embed');
        }
        
        const data = await response.json();
        setEmbedData(data);
      } catch (err) {
        setError('Impossible de charger la vidéo TikTok');
      } finally {
        setLoading(false);
      }
    }

    if (videoUrl) {
      loadEmbed();
    }
  }, [videoUrl]);

  if (loading) {
    return (
      <div className={`flex items-center justify-center p-8 bg-gray-100 rounded-lg ${className}`}>
        <div className="text-gray-600">Chargement de la vidéo TikTok...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`flex items-center justify-center p-8 bg-red-50 rounded-lg ${className}`}>
        <div className="text-red-600">{error}</div>
      </div>
    );
  }

  if (!embedData) {
    return null;
  }

  return (
    <div className={`tiktok-embed-container ${className}`}>
      <div 
        dangerouslySetInnerHTML={{ __html: embedData.html }}
        style={{ 
          maxWidth: '605px', 
          minWidth: '325px',
          margin: '0 auto'
        }}
      />
    </div>
  );
}
