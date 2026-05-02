import { useEffect, useRef } from "react";

interface TikTokEmbedProps {
  videoId: string;
  isActive: boolean;
  isPaused: boolean;
  onPlayPause: () => void;
}

export function TikTokEmbed({ videoId, isActive, isPaused, onPlayPause }: TikTokEmbedProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (containerRef.current && !containerRef.current.hasChildNodes()) {
      // Load TikTok embed script
      const script = document.createElement('script');
      script.src = 'https://www.tiktok.com/embed.js';
      script.async = true;
      script.onload = () => {
        // Create the embed blockquote
        const blockquote = document.createElement('blockquote');
        blockquote.className = 'tiktok-embed';
        blockquote.setAttribute('cite', `https://www.tiktok.com/@/video/${videoId}`);
        blockquote.setAttribute('data-video-id', videoId);
        blockquote.setAttribute('style', 'width: 100%; height: 100%; max-width: 100%;');
        
        const section = document.createElement('section');
        section.innerHTML = `<a target="_blank" href="https://www.tiktok.com/@/video/${videoId}?lang=fr">TikTok Video</a>`;
        
        blockquote.appendChild(section);
        containerRef.current?.appendChild(blockquote);
        
        // Re-initialize TikTok embed
        if (window.tiktokEmbed) {
          window.tiktokEmbed.reload();
        }
      };
      
      document.head.appendChild(script);
    }
  }, [videoId]);

  useEffect(() => {
    // Handle play/pause by finding the video element
    if (containerRef.current) {
      const video = containerRef.current.querySelector('video');
      if (video) {
        if (isActive && !isPaused) {
          video.play().catch(console.error);
        } else {
          video.pause();
        }
      }
    }
  }, [isActive, isPaused]);

  return (
    <div 
      ref={containerRef} 
      className="absolute inset-0 w-full h-full"
      style={{ pointerEvents: 'none' }}
      onClick={onPlayPause}
    />
  );
}

// Add type declaration for TikTok embed
declare global {
  interface Window {
    tiktokEmbed?: {
      reload: () => void;
    };
  }
}
