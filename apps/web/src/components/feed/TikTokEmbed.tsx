import React, { useEffect, useRef, useState } from "react";

interface TikTokEmbedProps {
  videoUrl: string;
  className?: string;
}

interface PlayerMessage {
  'x-tiktok-player': boolean;
  value: any;
  type: string;
}

export function TikTokEmbed({ videoUrl, className = "" }: TikTokEmbedProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [playerReady, setPlayerReady] = useState(false);

  // Extract video ID from TikTok URL
  const getVideoId = (url: string): string | null => {
    const match = url.match(/tiktok\.com\/@[^\/]+\/video\/(\d+)/);
    return match ? match[1] : null;
  };

  const videoId = getVideoId(videoUrl);

  useEffect(() => {
    if (!videoId) {
      setError('URL TikTok invalide');
      setLoading(false);
      return;
    }

    console.log('TikTokEmbed: Video ID extracted:', videoId);

    // iOS Safari touch events fix: Add dummy touch listeners to parent window
    // This is required for touch events to work within iframes on iOS
    const enableTouchEvents = () => {
      // Add dummy touch listener to window - required for iOS iframe touch events
      window.addEventListener('touchstart', () => {}, { passive: false });
      window.addEventListener('touchmove', () => {}, { passive: false });
      window.addEventListener('touchend', () => {}, { passive: false });
    };

    enableTouchEvents();

    // Handle messages from the TikTok player
    const handleMessage = (event: MessageEvent) => {
      const message = event.data as PlayerMessage;
      
      console.log('TikTokEmbed: Message received:', message);
      
      if (message && message['x-tiktok-player']) {
        switch (message.type) {
          case 'onPlayerReady':
            console.log('TikTokEmbed: Player is ready');
            setPlayerReady(true);
            setLoading(false);
            break;
          case 'onPlayerError':
            console.log('TikTokEmbed: Player error occurred');
            setError('Erreur de chargement de la vidéo TikTok');
            setLoading(false);
            break;
          default:
            console.log('TikTokEmbed: Unknown message type:', message.type);
        }
      }
    };

    window.addEventListener('message', handleMessage);

    // Fallback: if no message received after 5 seconds, try to load anyway
    const timeout = setTimeout(() => {
      if (loading) {
        console.log('TikTokEmbed: Timeout, showing player anyway');
        setLoading(false);
      }
    }, 5000);

    return () => {
      window.removeEventListener('message', handleMessage);
      clearTimeout(timeout);
    };
  }, [videoId]);

  // Send message to TikTok player
  const sendPlayerMessage = (type: string, value?: any) => {
    if (iframeRef.current && playerReady) {
      const message: PlayerMessage = {
        'x-tiktok-player': true,
        value,
        type
      };
      iframeRef.current.contentWindow?.postMessage(message, '*');
    }
  };

  // Handle sound toggle independently
  const handleSoundToggle = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    // Get click position relative to iframe
    const rect = iframeRef.current?.getBoundingClientRect();
    if (!rect) return;
    
    const clickX = e.clientX - rect.left;
    const clickY = e.clientY - rect.top;
    const relativeX = clickX / rect.width;
    const relativeY = clickY / rect.height;
    
    // Sound button is typically in bottom-right area
    if (relativeX > 0.75 && relativeY > 0.75) {
      // Toggle mute/unmute
      sendPlayerMessage('mute');
      setTimeout(() => sendPlayerMessage('unMute'), 100);
    }
  };

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

  if (!videoId) {
    return (
      <div className={`flex items-center justify-center p-8 bg-red-50 rounded-lg ${className}`}>
        <div className="text-red-600">URL TikTok invalide</div>
      </div>
    );
  }

  return (
    <>
      {/* iOS Safari iframe touch events fix CSS */}
      <style>{`
        .tiktok-embed-container iframe {
          -webkit-touch-callout: default;
          -webkit-user-select: text;
          user-select: text;
          pointer-events: auto;
          touch-action: manipulation;
        }
        
        /* iOS Safari specific fixes */
        @supports (-webkit-touch-callout: none) {
          .tiktok-embed-container iframe {
            -webkit-touch-callout: default;
            -webkit-user-select: auto;
            user-select: auto;
          }
        }
      `}</style>
      
      <div className={`tiktok-embed-container flex justify-center w-full ${className}`}>
        <iframe
          ref={iframeRef}
          src={`https://www.tiktok.com/player/v1/${videoId}?controls=1&volume_control=1&fullscreen_button=1&progress_bar=1&play_button=1&timestamp=1&music_info=1&description=1&rel=1&autoplay=0&loop=0&muted=0`}
          style={{
            width: '100%',
            height: '800px',
            maxWidth: '605px',
            minWidth: '325px',
            border: 'none',
            borderRadius: '8px',
            margin: '0 auto',
            pointerEvents: 'auto',
            touchAction: 'manipulation',
            WebkitTouchCallout: 'default',
            WebkitUserSelect: 'auto'
          }}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; touch"
          allowFullScreen
          onClick={handleSoundToggle}
        />
      </div>
    </>
  );
}
