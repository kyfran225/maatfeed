import { motion } from "framer-motion";
import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { useLayout } from "../../contexts/LayoutContext";
import { useAudioPlayer } from "../../hooks/useAudio";
import { AudioShareSheet } from "./AudioShareSheet";

function formatTime(seconds: number) {
  const safeSeconds = Number.isFinite(seconds) ? Math.max(0, seconds) : 0;
  const minutes = Math.floor(safeSeconds / 60);
  const remainder = Math.floor(safeSeconds % 60);
  return `${minutes}:${remainder.toString().padStart(2, "0")}`;
}

export function MiniAudioPlayer() {
  const { hideBottomNav } = useLayout();
  const location = useLocation();
  const [showShareSheet, setShowShareSheet] = useState(false);
  const {
    currentTrack,
    isPlaying,
    isLoading,
    currentTime,
    duration,
    error,
    isCurrentTrackLiked,
    hasNext,
    hasPrevious,
    togglePlayback,
    playNext,
    playPrevious,
    seekTo,
    likeCurrentTrack,
  } = useAudioPlayer();

  if (!currentTrack) {
    return null;
  }

  const isAudioPage = location.pathname === "/audio";
  const progressMax = duration > 0 ? duration : currentTrack.duration || 0;
  const progressValue = Math.min(currentTime, progressMax || currentTime);
  const progressPercent = progressMax > 0 ? Math.min(100, (progressValue / progressMax) * 100) : 0;

  if (!isAudioPage) {
    return (
      <>
        <motion.section
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          className={`fixed left-3 right-3 z-[190] ${
            hideBottomNav ? "bottom-3" : "bottom-[5.35rem]"
          } lg:left-6 lg:right-6 lg:bottom-6`}
        >
          <div className="mx-auto max-w-2xl overflow-hidden rounded-[1.2rem] border border-gold/20 bg-ink/94 shadow-2xl shadow-black/60 backdrop-blur-xl">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(212,175,55,0.16),_transparent_42%),linear-gradient(135deg,_rgba(255,255,255,0.05),_transparent_60%)]" />
            <div className="relative px-3 py-2.5">
              <div className="mb-2 h-1 overflow-hidden rounded-full bg-white/8">
                <div
                  className="h-full rounded-full bg-gold transition-[width] duration-200"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>

              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center overflow-hidden rounded-xl bg-gold/15">
                  {currentTrack.coverImageUrl ? (
                    <img
                      src={currentTrack.coverImageUrl}
                      alt={currentTrack.title}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <span className="text-base text-gold">♪</span>
                  )}
                </div>

                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-white">
                    {currentTrack.shortTitle || currentTrack.title}
                  </p>
                  <div className="mt-1 flex flex-wrap items-center gap-2 text-[11px] text-sand/68">
                    <span className="truncate">{currentTrack.artist}</span>
                    <span className="rounded-full bg-white/8 px-2 py-0.5 uppercase tracking-[0.12em] text-sand/60">
                      {currentTrack.genre}
                    </span>
                    <span className="rounded-full bg-gold/12 px-2 py-0.5 text-gold">
                      {formatTime(currentTime)}
                    </span>
                  </div>
                  {error && <p className="mt-1 text-[11px] text-amber-300">Piste indisponible.</p>}
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => void togglePlayback()}
                    className="rounded-full bg-gold p-3 text-ink transition-colors hover:bg-gold/90"
                    aria-label={isPlaying ? "Pause" : "Lecture"}
                  >
                    {isLoading ? (
                      <span className="block h-4 w-4 animate-spin rounded-full border-2 border-ink border-t-transparent" />
                    ) : isPlaying ? (
                      <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zM7 8a1 1 0 012 0v4a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v4a1 1 0 102 0V8a1 1 0 00-1-1z" />
                      </svg>
                    ) : (
                      <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" />
                      </svg>
                    )}
                  </button>

                  <Link
                    to="/audio"
                    className="inline-flex items-center rounded-full border border-white/12 px-3 py-2 text-[11px] font-medium uppercase tracking-[0.14em] text-sand/80 transition-colors hover:border-white/24 hover:text-white"
                  >
                    Audio
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </motion.section>

        <AudioShareSheet isOpen={showShareSheet} onClose={() => setShowShareSheet(false)} />
      </>
    );
  }

  return (
    <>
      <motion.section
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        className={`fixed left-3 right-3 z-[190] ${
          hideBottomNav ? "bottom-3" : "bottom-[5.5rem]"
        } lg:left-6 lg:right-6 lg:bottom-6`}
      >
        <div className="mx-auto max-w-3xl overflow-hidden rounded-[1.4rem] border border-gold/20 bg-ink/95 shadow-2xl shadow-black/60 backdrop-blur-xl">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(212,175,55,0.18),_transparent_42%),linear-gradient(135deg,_rgba(255,255,255,0.06),_transparent_60%)]" />
          <div className="relative p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center overflow-hidden rounded-xl bg-gold/15">
                {currentTrack.coverImageUrl ? (
                  <img
                    src={currentTrack.coverImageUrl}
                    alt={currentTrack.title}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <span className="text-lg text-gold">♪</span>
                )}
              </div>

              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-white">{currentTrack.title}</p>
                <div className="mt-1 flex items-center gap-2 text-xs text-sand/70">
                  <span className="truncate">{currentTrack.artist}</span>
                  <span className="rounded-full bg-white/8 px-2 py-0.5 uppercase tracking-[0.12em] text-sand/60">
                    {currentTrack.genre}
                  </span>
                  <span className="rounded-full bg-gold/12 px-2 py-0.5 text-gold">
                    extrait {formatTime(currentTime)}
                  </span>
                </div>
                {error && <p className="mt-1 text-xs text-amber-300">{error}</p>}
              </div>

              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => void likeCurrentTrack()}
                  className={`rounded-full p-2 transition-colors ${
                    isCurrentTrackLiked ? "text-rose-400" : "text-sand/70 hover:text-white"
                  }`}
                  aria-label="Aimer cette piste"
                >
                  <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                    <path d="m3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" />
                  </svg>
                </button>
                <button
                  type="button"
                  onClick={() => void playPrevious()}
                  disabled={!hasPrevious}
                  className="rounded-full p-2 text-sand/70 transition-colors hover:text-white disabled:cursor-not-allowed disabled:opacity-40"
                  aria-label="Piste precedente"
                >
                  <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M8.445 14.832A1 1 0 0010 14v-8a1 1 0 00-1.555-.832L3 9.168V6a1 1 0 00-2 0v8a1 1 0 002 0v-3.168l5.445 4z" />
                  </svg>
                </button>
                <button
                  type="button"
                  onClick={() => void togglePlayback()}
                  className="rounded-full bg-gold px-3 py-3 text-ink transition-colors hover:bg-gold/90"
                  aria-label={isPlaying ? "Pause" : "Lecture"}
                >
                  {isLoading ? (
                    <span className="block h-5 w-5 animate-spin rounded-full border-2 border-ink border-t-transparent" />
                  ) : isPlaying ? (
                    <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zM7 8a1 1 0 012 0v4a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v4a1 1 0 102 0V8a1 1 0 00-1-1z" />
                    </svg>
                  ) : (
                    <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" />
                    </svg>
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => void playNext()}
                  disabled={!hasNext}
                  className="rounded-full p-2 text-sand/70 transition-colors hover:text-white disabled:cursor-not-allowed disabled:opacity-40"
                  aria-label="Piste suivante"
                >
                  <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M4.555 5.168A1 1 0 003 6v8a1 1 0 001.555.832L10 10.832V14a1 1 0 002 0V6a1 1 0 00-2 0v3.168L4.555 5.168z" />
                  </svg>
                </button>
                <button
                  type="button"
                  onClick={() => setShowShareSheet(true)}
                  className="rounded-full p-2 text-sand/70 transition-colors hover:text-white"
                  aria-label="Partager cette piste"
                >
                  <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M15 8a3 3 0 10-2.83-4H12a3 3 0 00.17 1L7.91 7.13a3 3 0 100 5.74l4.26 2.13A3 3 0 1013 13a2.99 2.99 0 00-.17-.99l-4.26-2.13a3.02 3.02 0 000-.76l4.26-2.13c.05.11.11.21.17.31A3 3 0 0015 8z" />
                  </svg>
                </button>
              </div>
            </div>

            <div className="mt-3">
              <input
                type="range"
                min={0}
                max={progressMax || 0}
                value={progressValue}
                onChange={(event) => seekTo(Number(event.target.value))}
                className="h-1.5 w-full cursor-pointer appearance-none rounded-full bg-white/10 accent-[#d4af37]"
                aria-label="Progression audio"
              />
              <div className="mt-1 flex items-center justify-between text-[11px] text-sand/55">
                <span>{formatTime(currentTime)}</span>
                <span>{formatTime(progressMax)}</span>
              </div>
            </div>
          </div>
        </div>
      </motion.section>

      <AudioShareSheet isOpen={showShareSheet} onClose={() => setShowShareSheet(false)} />
    </>
  );
}
