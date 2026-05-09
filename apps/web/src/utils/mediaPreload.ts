type MediaPreloadCandidate = {
  mediaUrl?: string | null;
  videoUrl?: string | null;
  audioUrl?: string | null;
  thumbnailUrl?: string | null;
  sourceProvider?: string | null;
};

const PRELOADED_IMAGES = new Set<string>();
const PRELOADED_VIDEOS = new Map<string, HTMLVideoElement>();
const PRECONNECTED_ORIGINS = new Set<string>();
const MAX_VIDEO_PRELOADS = 6;

function runWhenIdle(task: () => void) {
  if (typeof window === "undefined") return;

  const idleWindow = window as Window & {
    requestIdleCallback?: (callback: () => void, options?: { timeout: number }) => number;
  };

  if (idleWindow.requestIdleCallback) {
    idleWindow.requestIdleCallback(task, { timeout: 1200 });
    return;
  }

  globalThis.setTimeout(task, 80);
}

function getOrigin(url: string) {
  try {
    return new URL(url).origin;
  } catch {
    return null;
  }
}

function addResourceHint(rel: "preconnect" | "dns-prefetch", href: string, crossOrigin = false) {
  if (typeof document === "undefined") return;
  const selector = `link[rel="${rel}"][href="${href}"]`;
  if (document.head.querySelector(selector)) return;

  const link = document.createElement("link");
  link.rel = rel;
  link.href = href;
  if (crossOrigin) {
    link.crossOrigin = "anonymous";
  }
  document.head.appendChild(link);
}

export function preconnectMediaOrigins(urls: Array<string | null | undefined>) {
  if (typeof document === "undefined") return;

  urls.forEach((url) => {
    if (!url) return;
    const origin = getOrigin(url);
    if (!origin || PRECONNECTED_ORIGINS.has(origin)) return;

    PRECONNECTED_ORIGINS.add(origin);
    addResourceHint("preconnect", origin, true);
    addResourceHint("dns-prefetch", origin);
  });
}

export function preloadImage(url?: string | null) {
  if (!url || typeof Image === "undefined" || PRELOADED_IMAGES.has(url)) return;

  PRELOADED_IMAGES.add(url);
  runWhenIdle(() => {
    const image = new Image();
    image.decoding = "async";
    image.src = url;
  });
}

function getYouTubeVideoId(url?: string | null) {
  if (!url) return null;

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

function isDirectVideo(url?: string | null) {
  return Boolean(url?.match(/\.(mp4|webm|ogg|m3u8)(\?.*)?$/i));
}

function trimVideoPreloadCache() {
  while (PRELOADED_VIDEOS.size > MAX_VIDEO_PRELOADS) {
    const oldestUrl = PRELOADED_VIDEOS.keys().next().value as string | undefined;
    if (!oldestUrl) return;

    const video = PRELOADED_VIDEOS.get(oldestUrl);
    if (video) {
      video.removeAttribute("src");
      video.load();
    }
    PRELOADED_VIDEOS.delete(oldestUrl);
  }
}

export function preloadDirectVideo(url?: string | null, preload: "metadata" | "auto" = "metadata") {
  if (!url || typeof document === "undefined" || PRELOADED_VIDEOS.has(url)) return;
  if (!isDirectVideo(url)) return;

  runWhenIdle(() => {
    const video = document.createElement("video");
    video.preload = preload;
    video.muted = true;
    video.playsInline = true;
    video.src = url;
    video.load();

    PRELOADED_VIDEOS.set(url, video);
    trimVideoPreloadCache();
  });
}

export function preloadYouTubeThumbnail(videoUrl?: string | null) {
  const videoId = getYouTubeVideoId(videoUrl);
  if (!videoId) return;

  preloadImage(`https://i.ytimg.com/vi/${videoId}/maxresdefault.jpg`);
  preloadImage(`https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`);
}

export function preloadMediaCandidate(candidate: MediaPreloadCandidate, priority: "nearby" | "immediate" = "nearby") {
  const mediaUrl = candidate.mediaUrl ?? candidate.videoUrl ?? candidate.audioUrl;
  preconnectMediaOrigins([
    mediaUrl,
    candidate.thumbnailUrl,
    "https://www.youtube.com",
    "https://i.ytimg.com",
    "https://www.tiktok.com"
  ]);

  preloadImage(candidate.thumbnailUrl);
  preloadYouTubeThumbnail(mediaUrl);
  preloadDirectVideo(mediaUrl, priority === "immediate" ? "auto" : "metadata");
}

export function preloadMediaBatch(candidates: MediaPreloadCandidate[], priority: "nearby" | "immediate" = "nearby") {
  candidates.slice(0, 6).forEach((candidate) => preloadMediaCandidate(candidate, priority));
}
