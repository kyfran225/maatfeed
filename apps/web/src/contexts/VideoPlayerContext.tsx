import { createContext, useCallback, useContext, useEffect, useState, ReactNode } from "react";

const MEDIA_SOUND_STORAGE_KEY = "maatfeed-media-sound-enabled";
const LEGACY_TIKTOK_SOUND_STORAGE_KEY = "maat:tiktok:sound-enabled";
const LEGACY_YOUTUBE_SOUND_STORAGE_KEY = "maat_yt_audio_unlocked";

interface VideoPlayerContextType {
  isAnyVideoPlaying: boolean;
  setIsAnyVideoPlaying: (playing: boolean) => void;
  mediaSoundEnabled: boolean;
  activateMediaSound: () => void;
  deactivateMediaSound: () => void;
}

const VideoPlayerContext = createContext<VideoPlayerContextType | undefined>(undefined);

function readMediaSoundPreference() {
  try {
    if (typeof window === "undefined") return false;

    return (
      window.localStorage.getItem(MEDIA_SOUND_STORAGE_KEY) === "1" ||
      window.localStorage.getItem(LEGACY_TIKTOK_SOUND_STORAGE_KEY) === "1" ||
      window.sessionStorage.getItem(LEGACY_YOUTUBE_SOUND_STORAGE_KEY) === "true"
    );
  } catch {
    return false;
  }
}

function writeMediaSoundPreference(enabled: boolean) {
  try {
    if (typeof window === "undefined") return;

    window.localStorage.setItem(MEDIA_SOUND_STORAGE_KEY, enabled ? "1" : "0");
    window.localStorage.setItem(LEGACY_TIKTOK_SOUND_STORAGE_KEY, enabled ? "1" : "0");
    window.sessionStorage.setItem(LEGACY_YOUTUBE_SOUND_STORAGE_KEY, enabled ? "true" : "false");
  } catch {
    // Ignore storage errors in restricted browsing contexts.
  }
}

export function VideoPlayerProvider({ children }: { children: ReactNode }) {
  const [isAnyVideoPlaying, setIsAnyVideoPlaying] = useState(false);
  const [mediaSoundEnabled, setMediaSoundEnabled] = useState(readMediaSoundPreference);

  useEffect(() => {
    writeMediaSoundPreference(mediaSoundEnabled);
  }, [mediaSoundEnabled]);

  const activateMediaSound = useCallback(() => {
    setMediaSoundEnabled(true);
  }, []);

  const deactivateMediaSound = useCallback(() => {
    setMediaSoundEnabled(false);
  }, []);

  return (
    <VideoPlayerContext.Provider
      value={{
        isAnyVideoPlaying,
        setIsAnyVideoPlaying,
        mediaSoundEnabled,
        activateMediaSound,
        deactivateMediaSound
      }}
    >
      {children}
    </VideoPlayerContext.Provider>
  );
}

export function useVideoPlayer() {
  const context = useContext(VideoPlayerContext);
  if (context === undefined) {
    throw new Error("useVideoPlayer must be used within a VideoPlayerProvider");
  }
  return context;
}
