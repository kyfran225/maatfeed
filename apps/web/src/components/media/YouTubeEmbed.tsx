import { useEffect, useRef, useState } from "react";

export interface YouTubeEmbedOptions {
  controls?: boolean;
  autoplay?: boolean;
  muted?: boolean;
  loop?: boolean;
  captions?: boolean;
  keyboardControls?: boolean;
  fullscreen?: boolean;
  playsInline?: boolean;
  relatedSameChannel?: boolean;
  enableJsApi?: boolean;
}

export const YOUTUBE_DEFAULT_OPTIONS: Required<YouTubeEmbedOptions> = {
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
};

interface YouTubeEmbedProps {
  videoUrl: string;
  title?: string;
  className?: string;
  iframeClassName?: string;
  layout?: "responsive" | "fill";
  autoplayWhenVisible?: boolean;
  visibilityThreshold?: number;
  options?: YouTubeEmbedOptions;
}

export function extractYouTubeVideoId(url: string): string | null {
  try {
    const parsedUrl = new URL(url);
    const hostname = parsedUrl.hostname.replace(/^www\./, "");

    if (hostname === "youtube.com" || hostname === "m.youtube.com") {
      const watchId = parsedUrl.searchParams.get("v");
      if (watchId) return watchId;

      const pathMatch = parsedUrl.pathname.match(/^\/(?:embed|shorts|live)\/([^/?#]+)/);
      return pathMatch?.[1] ?? null;
    }

    if (hostname === "youtu.be") {
      return parsedUrl.pathname.split("/").filter(Boolean)[0] ?? null;
    }
  } catch {
    return null;
  }

  return null;
}

export function isYouTubeShortUrl(url?: string | null): boolean {
  if (!url) return false;

  try {
    const parsedUrl = new URL(url);
    const hostname = parsedUrl.hostname.replace(/^www\./, "");

    if (hostname !== "youtube.com" && hostname !== "m.youtube.com") {
      return false;
    }

    return parsedUrl.pathname.startsWith("/shorts/");
  } catch {
    return false;
  }
}

export function buildYouTubeEmbedUrl(videoId: string, options: YouTubeEmbedOptions = {}) {
  const mergedOptions = { ...YOUTUBE_DEFAULT_OPTIONS, ...options };
  const params = new URLSearchParams({
    autoplay: mergedOptions.autoplay ? "1" : "0",
    controls: mergedOptions.controls ? "1" : "0",
    mute: mergedOptions.muted ? "1" : "0",
    disablekb: mergedOptions.keyboardControls ? "0" : "1",
    fs: mergedOptions.fullscreen ? "1" : "0",
    playsinline: mergedOptions.playsInline ? "1" : "0",
    rel: mergedOptions.relatedSameChannel ? "0" : "1",
    cc_load_policy: mergedOptions.captions ? "1" : "0",
    cc_lang_pref: "fr",
    hl: "fr",
    iv_load_policy: "3"
  });

  if (mergedOptions.loop) {
    params.set("loop", "1");
    params.set("playlist", videoId);
  }

  if (mergedOptions.enableJsApi && typeof window !== "undefined") {
    params.set("enablejsapi", "1");
    params.set("origin", window.location.origin);
  }

  return `https://www.youtube.com/embed/${videoId}?${params.toString()}`;
}

export function YouTubeEmbed({
  videoUrl,
  title = "YouTube video",
  className = "",
  iframeClassName = "",
  layout = "responsive",
  autoplayWhenVisible = false,
  visibilityThreshold = 0.6,
  options = {}
}: YouTubeEmbedProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [isVisible, setIsVisible] = useState(false);
  const videoId = extractYouTubeVideoId(videoUrl);

  useEffect(() => {
    if (!autoplayWhenVisible || !iframeRef.current) return;

    const observer = new IntersectionObserver(([entry]) => {
      setIsVisible(Boolean(entry?.isIntersecting));
    }, { threshold: visibilityThreshold });

    observer.observe(iframeRef.current);
    return () => observer.disconnect();
  }, [autoplayWhenVisible, visibilityThreshold]);

  if (!videoId) {
    return (
      <div className={`flex min-h-[200px] items-center justify-center bg-black px-4 text-center text-sm text-white/70 ${className}`}>
        URL YouTube invalide.
      </div>
    );
  }

  const shouldAutoplay = options.autoplay || (autoplayWhenVisible && isVisible);
  const embedOptions = {
    ...options,
    autoplay: shouldAutoplay,
    muted: options.muted ?? Boolean(shouldAutoplay)
  };
  const embedUrl = buildYouTubeEmbedUrl(videoId, embedOptions);
  const mergedOptions = { ...YOUTUBE_DEFAULT_OPTIONS, ...embedOptions };

  const layoutClassName = layout === "fill" ? "h-full w-full border-0" : "aspect-video w-full min-h-[200px] border-0";

  return (
    <iframe
      ref={iframeRef}
      src={embedUrl}
      title={title}
      className={`${layoutClassName} ${className} ${iframeClassName}`}
      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
      allowFullScreen={mergedOptions.fullscreen}
    />
  );
}

export default YouTubeEmbed;
