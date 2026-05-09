import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type PropsWithChildren
} from "react";
import type { AudioTrack } from "../services/audioService";
import { trackAudioInteraction } from "../services/audioInteractionService";

type AudioInteractionKind = "play" | "pause" | "complete" | "skip" | "like" | "share";

export interface AudioSharePayload {
  url: string;
  title: string;
  text: string;
  excerptText: string;
  timestamp: number;
  timestampLabel: string;
  contextHref: string | null;
}

type AudioPlayerContextValue = {
  currentTrack: AudioTrack | null;
  queue: AudioTrack[];
  currentIndex: number;
  isPlaying: boolean;
  isLoading: boolean;
  currentTime: number;
  duration: number;
  error: string | null;
  isCurrentTrackLiked: boolean;
  hasNext: boolean;
  hasPrevious: boolean;
  playTrack: (track: AudioTrack, trackQueue?: AudioTrack[]) => Promise<void>;
  pause: () => void;
  resume: () => Promise<void>;
  togglePlayback: () => Promise<void>;
  seekTo: (timeInSeconds: number) => void;
  playNext: () => Promise<void>;
  playPrevious: () => Promise<void>;
  likeCurrentTrack: () => Promise<void>;
  getCurrentTrackSharePayload: () => AudioSharePayload | null;
  copyCurrentTrackShareLink: () => Promise<boolean>;
  copyCurrentTrackExcerpt: () => Promise<boolean>;
  shareCurrentTrack: () => Promise<void>;
};

const AudioPlayerContext = createContext<AudioPlayerContextValue | null>(null);

function formatTimestampLabel(totalSeconds: number) {
  const safeSeconds = Math.max(0, Math.floor(totalSeconds));
  const hours = Math.floor(safeSeconds / 3600);
  const minutes = Math.floor((safeSeconds % 3600) / 60);
  const seconds = safeSeconds % 60;

  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
  }

  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
}

export function AudioPlayerProvider({ children }: PropsWithChildren) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const preloadAudioRef = useRef<HTMLAudioElement | null>(null);
  const currentTrackRef = useRef<AudioTrack | null>(null);
  const queueRef = useRef<AudioTrack[]>([]);
  const currentIndexRef = useRef(0);
  const currentTimeRef = useRef(0);
  const durationRef = useRef(0);
  const isPlayingRef = useRef(false);
  const playbackRequestIdRef = useRef(0);
  const playCountsRef = useRef<Record<string, number>>({});
  const sessionListenMsRef = useRef(0);
  const lastPlayStartPositionRef = useRef(0);
  const hasCompletedTrackRef = useRef(false);
  const suppressPauseTrackingRef = useRef(false);
  const countNextPlayRef = useRef(false);
  const [currentTrack, setCurrentTrack] = useState<AudioTrack | null>(null);
  const [queue, setQueue] = useState<AudioTrack[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [likedTrackIds, setLikedTrackIds] = useState<string[]>([]);

  const setCurrentTimeState = useCallback((value: number) => {
    currentTimeRef.current = value;
    setCurrentTime(value);
  }, []);

  const setDurationState = useCallback((value: number) => {
    durationRef.current = value;
    setDuration(value);
  }, []);

  const setIsPlayingState = useCallback((value: boolean) => {
    isPlayingRef.current = value;
    setIsPlaying(value);
  }, []);

  useEffect(() => {
    currentTrackRef.current = currentTrack;
  }, [currentTrack]);

  useEffect(() => {
    queueRef.current = queue;
  }, [queue]);

  useEffect(() => {
    currentIndexRef.current = currentIndex;
  }, [currentIndex]);

  useEffect(() => {
    const nextTrack = queue[currentIndex + 1];
    if (!nextTrack) {
      preloadAudioRef.current = null;
      return;
    }

    const preloadAudio = new Audio();
    preloadAudio.preload = "metadata";
    preloadAudio.src = nextTrack.mediaUrl;
    preloadAudioRef.current = preloadAudio;

    return () => {
      preloadAudio.pause();
      preloadAudio.src = "";
      if (preloadAudioRef.current === preloadAudio) {
        preloadAudioRef.current = null;
      }
    };
  }, [currentIndex, queue]);

  const flushListeningProgress = useCallback((positionSeconds?: number) => {
    const currentPosition = positionSeconds ?? audioRef.current?.currentTime ?? 0;
    const deltaSeconds = Math.max(0, currentPosition - lastPlayStartPositionRef.current);
    const deltaMs = Math.round(deltaSeconds * 1000);

    sessionListenMsRef.current += deltaMs;
    lastPlayStartPositionRef.current = currentPosition;

    return {
      currentPosition,
      totalMs: sessionListenMsRef.current
    };
  }, []);

  const sendInteraction = useCallback((
    track: AudioTrack,
    interactionType: AudioInteractionKind,
    overrides?: {
      listenDurationMs?: number;
      stopPositionSeconds?: number;
      trackDurationSeconds?: number;
      completionRatio?: number;
      repeatCount?: number;
      metadata?: Record<string, unknown> | null;
    }
  ) => {
    const effectiveDuration = overrides?.trackDurationSeconds ?? (durationRef.current || track.duration);
    const stopPosition = overrides?.stopPositionSeconds ?? audioRef.current?.currentTime ?? currentTimeRef.current;

    void trackAudioInteraction({
      trackId: track.id,
      contentId: track.contentId,
      interactionType,
      listenDurationMs: overrides?.listenDurationMs ?? sessionListenMsRef.current,
      stopPositionSeconds: stopPosition,
      trackDurationSeconds: effectiveDuration,
      completionRatio:
        overrides?.completionRatio ??
        (effectiveDuration > 0 ? Math.min(1, stopPosition / effectiveDuration) : 0),
      repeatCount:
        overrides?.repeatCount ?? Math.max(0, (playCountsRef.current[track.id] ?? 1) - 1),
      metadata: overrides?.metadata ?? { source: "global_audio_player" }
    }).catch((interactionError) => {
      console.error(`Audio ${interactionType} tracking failed:`, interactionError);
    });
  }, []);

  const isAbortPlaybackError = useCallback((playbackError: unknown) => (
    playbackError instanceof DOMException && playbackError.name === "AbortError"
  ), []);

  const playQueueIndex = useCallback(async (nextIndex: number, nextQueue?: AudioTrack[]) => {
    const audio = audioRef.current;
    const targetQueue = nextQueue ?? queueRef.current;
    const track = targetQueue[nextIndex];

    if (!audio || !track) {
      return;
    }

    const previousTrack = currentTrackRef.current;
    const previousPosition = audio.currentTime || currentTimeRef.current;
    if (previousTrack && previousTrack.id !== track.id && !hasCompletedTrackRef.current) {
      suppressPauseTrackingRef.current = true;
      const flushed = flushListeningProgress(previousPosition);
      const previousDuration = durationRef.current || previousTrack.duration;
      const completionRatio = previousDuration > 0 ? Math.min(1, previousPosition / previousDuration) : 0;

      sendInteraction(previousTrack, "skip", {
        listenDurationMs: flushed.totalMs,
        stopPositionSeconds: previousPosition,
        trackDurationSeconds: previousDuration,
        completionRatio,
        metadata: {
          source: "global_audio_player",
          reason: "track_change"
        }
      });
    }

    if (nextQueue) {
      queueRef.current = nextQueue;
      setQueue(nextQueue);
    }

    currentIndexRef.current = nextIndex;
    setCurrentIndex(nextIndex);
    currentTrackRef.current = track;
    setCurrentTrack(track);
    setCurrentTimeState(0);
    setDurationState(track.duration || 0);
    setError(null);
    setIsLoading(true);
    sessionListenMsRef.current = 0;
    lastPlayStartPositionRef.current = 0;
    hasCompletedTrackRef.current = false;
    countNextPlayRef.current = true;

    const requestId = playbackRequestIdRef.current + 1;
    playbackRequestIdRef.current = requestId;

    try {
      if (!audio.paused) {
        suppressPauseTrackingRef.current = true;
        audio.pause();
      }

      if (audio.src !== track.mediaUrl) {
        audio.src = track.mediaUrl;
      }

      audio.currentTime = 0;
      audio.load();
      await audio.play();
    } catch (playbackError) {
      if (requestId !== playbackRequestIdRef.current || isAbortPlaybackError(playbackError)) {
        return;
      }

      setIsLoading(false);
      setIsPlayingState(false);
      setError("Cette piste audio est indisponible pour le moment.");
      console.error("Audio playback failed:", playbackError);
    }
  }, [
    flushListeningProgress,
    isAbortPlaybackError,
    sendInteraction,
    setCurrentTimeState,
    setDurationState,
    setIsPlayingState
  ]);

  const playNext = useCallback(async () => {
    const nextIndex = currentIndexRef.current + 1;
    if (nextIndex >= queueRef.current.length) {
      return;
    }

    await playQueueIndex(nextIndex);
  }, [playQueueIndex]);

  const playPrevious = useCallback(async () => {
    const previousIndex = currentIndexRef.current - 1;
    if (previousIndex < 0) {
      return;
    }

    await playQueueIndex(previousIndex);
  }, [playQueueIndex]);

  useEffect(() => {
    const audio = new Audio();
    audio.preload = "metadata";
    audioRef.current = audio;

    const handleLoadStart = () => {
      setIsLoading(true);
      setError(null);
    };

    const handleLoadedMetadata = () => {
      setDurationState(
        Number.isFinite(audio.duration) && audio.duration > 0
          ? audio.duration
          : currentTrackRef.current?.duration || 0
      );
      setIsLoading(false);
    };

    const handleCanPlay = () => {
      setIsLoading(false);
    };

    const handleTimeUpdate = () => {
      setCurrentTimeState(audio.currentTime || 0);
    };

    const handlePlay = () => {
      const track = currentTrackRef.current;
      if (track) {
        const isFreshStart = countNextPlayRef.current || (audio.currentTime || 0) <= 0.25;
        const playCount = isFreshStart
          ? (playCountsRef.current[track.id] ?? 0) + 1
          : (playCountsRef.current[track.id] ?? 1);

        if (isFreshStart) {
          playCountsRef.current[track.id] = playCount;
          countNextPlayRef.current = false;
        }

        lastPlayStartPositionRef.current = audio.currentTime || 0;

        sendInteraction(track, "play", {
          stopPositionSeconds: audio.currentTime || 0,
          trackDurationSeconds: audio.duration || track.duration,
          completionRatio:
            (audio.duration || track.duration) > 0
              ? Math.min(1, (audio.currentTime || 0) / (audio.duration || track.duration))
              : 0,
          repeatCount: Math.max(0, playCount - 1)
        });
      }

      setIsPlayingState(true);
      setIsLoading(false);
    };

    const handlePause = () => {
      if (suppressPauseTrackingRef.current) {
        suppressPauseTrackingRef.current = false;
        setIsPlayingState(false);
        return;
      }

      const track = currentTrackRef.current;
      if (track && !audio.ended && !hasCompletedTrackRef.current) {
        const flushed = flushListeningProgress(audio.currentTime || 0);

        sendInteraction(track, "pause", {
          listenDurationMs: flushed.totalMs,
          stopPositionSeconds: flushed.currentPosition,
          trackDurationSeconds: audio.duration || track.duration,
          completionRatio:
            (audio.duration || track.duration) > 0
              ? Math.min(1, flushed.currentPosition / (audio.duration || track.duration))
              : 0
        });
      }

      setIsPlayingState(false);
    };

    const handleWaiting = () => {
      setIsLoading(true);
    };

    const handleEnded = () => {
      const track = currentTrackRef.current;
      const finalPosition = audio.duration || currentTrackRef.current?.duration || 0;
      const flushed = flushListeningProgress(finalPosition);

      hasCompletedTrackRef.current = true;
      countNextPlayRef.current = true;
      setCurrentTimeState(finalPosition);
      setIsPlayingState(false);

      if (track) {
        sendInteraction(track, "complete", {
          listenDurationMs: flushed.totalMs,
          stopPositionSeconds: finalPosition,
          trackDurationSeconds: audio.duration || track.duration,
          completionRatio: 1
        });
      }

      if (currentIndexRef.current < queueRef.current.length - 1) {
        void playNext();
      }
    };

    const handleError = () => {
      setIsLoading(false);
      setIsPlayingState(false);
      setError("Le chargement de cet audio a échoué.");
    };

    audio.addEventListener("loadstart", handleLoadStart);
    audio.addEventListener("loadedmetadata", handleLoadedMetadata);
    audio.addEventListener("canplay", handleCanPlay);
    audio.addEventListener("timeupdate", handleTimeUpdate);
    audio.addEventListener("play", handlePlay);
    audio.addEventListener("pause", handlePause);
    audio.addEventListener("waiting", handleWaiting);
    audio.addEventListener("ended", handleEnded);
    audio.addEventListener("error", handleError);

    return () => {
      playbackRequestIdRef.current += 1;
      audio.pause();
      audio.removeEventListener("loadstart", handleLoadStart);
      audio.removeEventListener("loadedmetadata", handleLoadedMetadata);
      audio.removeEventListener("canplay", handleCanPlay);
      audio.removeEventListener("timeupdate", handleTimeUpdate);
      audio.removeEventListener("play", handlePlay);
      audio.removeEventListener("pause", handlePause);
      audio.removeEventListener("waiting", handleWaiting);
      audio.removeEventListener("ended", handleEnded);
      audio.removeEventListener("error", handleError);
      audio.src = "";
      audioRef.current = null;
    };
  }, [flushListeningProgress, playNext, sendInteraction, setCurrentTimeState, setDurationState, setIsPlayingState]);

  const pause = useCallback(() => {
    playbackRequestIdRef.current += 1;
    audioRef.current?.pause();
    setIsLoading(false);
  }, []);

  const resume = useCallback(async () => {
    const audio = audioRef.current;
    if (!audio || !currentTrackRef.current) {
      return;
    }

    const requestId = playbackRequestIdRef.current + 1;
    playbackRequestIdRef.current = requestId;

    try {
      setError(null);
      setIsLoading(true);
      await audio.play();
    } catch (playbackError) {
      if (requestId !== playbackRequestIdRef.current || isAbortPlaybackError(playbackError)) {
        setIsLoading(false);
        return;
      }

      setIsPlayingState(false);
      setIsLoading(false);
      setError("La reprise de lecture a échoué.");
      console.error("Audio resume failed:", playbackError);
    }
  }, [isAbortPlaybackError, setIsPlayingState]);

  const playTrack = useCallback(async (track: AudioTrack, trackQueue?: AudioTrack[]) => {
    const existingQueue = trackQueue ?? queueRef.current;
    const nextIndex = existingQueue.findIndex((queuedTrack) => queuedTrack.id === track.id);
    const resolvedQueue = nextIndex >= 0 ? existingQueue : [track];
    const resolvedIndex = nextIndex >= 0 ? nextIndex : 0;

    if (currentTrackRef.current?.id === track.id) {
      if (isPlayingRef.current) {
        pause();
      } else {
        await resume();
      }
      return;
    }

    await playQueueIndex(resolvedIndex, resolvedQueue);
  }, [isPlaying, pause, playQueueIndex, resume]);

  const togglePlayback = useCallback(async () => {
    if (!currentTrackRef.current) {
      return;
    }

    if (isPlaying) {
      pause();
      return;
    }

    await resume();
  }, [isPlaying, pause, resume]);

  const seekTo = useCallback((timeInSeconds: number) => {
    const audio = audioRef.current;
    if (!audio) {
      return;
    }

    const boundedTime = Math.max(0, Math.min(timeInSeconds, duration || audio.duration || timeInSeconds));
    if (!audio.paused) {
      flushListeningProgress(audio.currentTime || 0);
    }
    audio.currentTime = boundedTime;
    setCurrentTimeState(boundedTime);
    lastPlayStartPositionRef.current = boundedTime;
  }, [duration, flushListeningProgress, setCurrentTimeState]);

  const likeCurrentTrack = useCallback(async () => {
    const track = currentTrackRef.current;
    if (!track) {
      return;
    }

    setLikedTrackIds((previous) => (previous.includes(track.id) ? previous : [...previous, track.id]));
    sendInteraction(track, "like");
  }, [sendInteraction]);

  const getCurrentTrackSharePayload = useCallback((): AudioSharePayload | null => {
    const track = currentTrackRef.current;
    if (!track || typeof window === "undefined") {
      return null;
    }

    const timestamp = Math.floor(audioRef.current?.currentTime ?? currentTime);
    const shareUrl = new URL("/audio", window.location.origin);
    shareUrl.searchParams.set("track", track.id);
    if (timestamp > 0) {
      shareUrl.searchParams.set("t", timestamp.toString());
    }

    const contextPath = track.context?.primaryRoute || track.context?.primaryHref || null;
    const contextHref = contextPath
      ? new URL(contextPath, window.location.origin).toString()
      : null;
    const title = track.shortTitle || track.title;
    const timestampLabel = formatTimestampLabel(timestamp);

    return {
      url: shareUrl.toString(),
      title,
      text: `${title} · ${track.artist}`,
      excerptText: `🔥 Extrait puissant : ${title} · ${timestampLabel}`,
      timestamp,
      timestampLabel,
      contextHref
    };
  }, [currentTime]);

  const recordShare = useCallback((track: AudioTrack, payload: AudioSharePayload, channel: string) => {
    sendInteraction(track, "share", {
      stopPositionSeconds: payload.timestamp,
      metadata: {
        source: "global_audio_player",
        channel,
        shareUrl: payload.url,
        excerptText: payload.excerptText,
        contextHref: payload.contextHref
      }
    });
  }, [sendInteraction]);

  const copyCurrentTrackShareLink = useCallback(async () => {
    const track = currentTrackRef.current;
    const payload = getCurrentTrackSharePayload();

    if (!track || !payload || !navigator.clipboard?.writeText) {
      return false;
    }

    try {
      await navigator.clipboard.writeText(payload.url);
      recordShare(track, payload, "copy_link");
      return true;
    } catch (copyError) {
      console.error("Audio share link copy failed:", copyError);
      return false;
    }
  }, [getCurrentTrackSharePayload, recordShare]);

  const copyCurrentTrackExcerpt = useCallback(async () => {
    const track = currentTrackRef.current;
    const payload = getCurrentTrackSharePayload();

    if (!track || !payload || !navigator.clipboard?.writeText) {
      return false;
    }

    try {
      await navigator.clipboard.writeText(`${payload.excerptText}\n${payload.url}`);
      recordShare(track, payload, "copy_excerpt");
      return true;
    } catch (copyError) {
      console.error("Audio excerpt copy failed:", copyError);
      return false;
    }
  }, [getCurrentTrackSharePayload, recordShare]);

  const shareCurrentTrack = useCallback(async () => {
    const track = currentTrackRef.current;
    const payload = getCurrentTrackSharePayload();

    if (!track || !payload) {
      return;
    }

    try {
      if (navigator.share) {
        await navigator.share({
          title: payload.title,
          text: payload.excerptText,
          url: payload.url
        });
        recordShare(track, payload, "native_share");
        return;
      }

      await copyCurrentTrackShareLink();
    } catch (shareError) {
      console.error("Audio share failed:", shareError);
    }
  }, [copyCurrentTrackShareLink, getCurrentTrackSharePayload, recordShare]);

  const value = useMemo<AudioPlayerContextValue>(() => ({
    currentTrack,
    queue,
    currentIndex,
    isPlaying,
    isLoading,
    currentTime,
    duration,
    error,
    isCurrentTrackLiked: currentTrack ? likedTrackIds.includes(currentTrack.id) : false,
    hasNext: currentIndex < queue.length - 1,
    hasPrevious: currentIndex > 0,
    playTrack,
    pause,
    resume,
    togglePlayback,
    seekTo,
    playNext,
    playPrevious,
    likeCurrentTrack,
    getCurrentTrackSharePayload,
    copyCurrentTrackShareLink,
    copyCurrentTrackExcerpt,
    shareCurrentTrack
  }), [
    copyCurrentTrackExcerpt,
    copyCurrentTrackShareLink,
    currentIndex,
    currentTime,
    currentTrack,
    duration,
    error,
    getCurrentTrackSharePayload,
    isLoading,
    isPlaying,
    likeCurrentTrack,
    likedTrackIds,
    pause,
    playNext,
    playPrevious,
    playTrack,
    queue,
    resume,
    seekTo,
    shareCurrentTrack,
    togglePlayback
  ]);

  return <AudioPlayerContext.Provider value={value}>{children}</AudioPlayerContext.Provider>;
}

export function useAudioPlayerContext() {
  const context = useContext(AudioPlayerContext);

  if (!context) {
    throw new Error("useAudioPlayerContext must be used within an AudioPlayerProvider");
  }

  return context;
}
