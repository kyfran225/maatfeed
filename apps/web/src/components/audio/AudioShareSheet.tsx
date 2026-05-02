import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";
import { useAudioPlayer } from "../../hooks/useAudio";

interface AudioShareSheetProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AudioShareSheet({ isOpen, onClose }: AudioShareSheetProps) {
  const {
    currentTrack,
    getCurrentTrackSharePayload,
    shareCurrentTrack,
    copyCurrentTrackShareLink,
    copyCurrentTrackExcerpt
  } = useAudioPlayer();
  const [feedback, setFeedback] = useState<string | null>(null);
  const payload = getCurrentTrackSharePayload();
  const canNativeShare = typeof navigator !== "undefined" && "share" in navigator;

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const originalOverflow = document.body.style.overflow;
    const originalTouchAction = document.body.style.touchAction;
    document.body.style.overflow = "hidden";
    document.body.style.touchAction = "none";

    return () => {
      document.body.style.overflow = originalOverflow;
      document.body.style.touchAction = originalTouchAction;
    };
  }, [isOpen]);

  useEffect(() => {
    if (!feedback) {
      return;
    }

    const timeout = window.setTimeout(() => setFeedback(null), 1600);
    return () => window.clearTimeout(timeout);
  }, [feedback]);

  if (!currentTrack || !payload) {
    return null;
  }

  const openContext = () => {
    if (!payload.contextHref) {
      return;
    }

    window.open(payload.contextHref, "_blank", "noopener,noreferrer");
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          data-overlay="true"
          className="fixed inset-0 z-[220] flex items-end bg-black/45"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            className="w-full overflow-hidden rounded-t-[2rem] border-t border-gold/15"
            style={{
              background: "rgba(11, 10, 12, 0.94)",
              backdropFilter: "blur(28px) saturate(180%)",
              WebkitBackdropFilter: "blur(28px) saturate(180%)"
            }}
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 30, stiffness: 320 }}
            onClick={(event) => event.stopPropagation()}
            drag="y"
            dragConstraints={{ top: 0, bottom: 0 }}
            dragElastic={0.16}
            onDragEnd={(_, info) => {
              if (info.offset.y > 150 || info.velocity.y > 900) {
                onClose();
              }
            }}
          >
            <div className="flex justify-center py-3">
              <div className="h-1 w-12 rounded-full bg-white/20" />
            </div>

            <div className="px-6 pb-8">
              <div className="rounded-[1.6rem] border border-white/10 bg-white/5 p-4">
                <p className="text-[11px] uppercase tracking-[0.22em] text-gold/78">Partager un moment precis</p>
                <h3 className="mt-2 text-xl font-semibold text-white">{currentTrack.shortTitle || currentTrack.title}</h3>
                <p className="mt-1 text-sm text-sand/72">{currentTrack.artist}</p>

                <div className="mt-4 flex flex-wrap items-center gap-2 text-xs">
                  <span className="rounded-full bg-gold/14 px-3 py-1.5 text-gold">
                    Extrait a {payload.timestampLabel}
                  </span>
                  <span className="rounded-full bg-white/8 px-3 py-1.5 text-sand/78">
                    {currentTrack.categoryLabel || currentTrack.genre}
                  </span>
                </div>

                <p className="mt-4 rounded-[1.2rem] border border-white/10 bg-black/25 px-4 py-3 text-sm leading-6 text-white/86">
                  {payload.excerptText}
                </p>
              </div>

              {feedback && (
                <div className="mt-4 rounded-2xl border border-emerald-400/20 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-100">
                  {feedback}
                </div>
              )}

              <div className="mt-6 grid gap-3">
                <button
                  type="button"
                  onClick={() => {
                    void shareCurrentTrack().then(() => setFeedback(canNativeShare ? "Extrait partage" : "Lien horodate copie"));
                  }}
                  className="w-full rounded-2xl bg-gold px-4 py-3 font-medium text-ink transition-colors hover:bg-gold/90"
                >
                  {canNativeShare ? "Partager cet extrait" : "Copier le lien horodate"}
                </button>

                <button
                  type="button"
                  onClick={() => {
                    void copyCurrentTrackShareLink().then((copied) => {
                      if (copied) {
                        setFeedback("Lien horodate copie");
                      }
                    });
                  }}
                  className="w-full rounded-2xl bg-white/10 px-4 py-3 font-medium text-white transition-colors hover:bg-white/16"
                >
                  Copier le lien a {payload.timestampLabel}
                </button>

                <button
                  type="button"
                  onClick={() => {
                    void copyCurrentTrackExcerpt().then((copied) => {
                      if (copied) {
                        setFeedback("Texte d'extrait copie");
                      }
                    });
                  }}
                  className="w-full rounded-2xl bg-white/10 px-4 py-3 font-medium text-white transition-colors hover:bg-white/16"
                >
                  Copier le texte + lien
                </button>

                <a
                  href={payload.url}
                  className="w-full rounded-2xl bg-white/6 px-4 py-3 text-center font-medium text-sand/88 transition-colors hover:bg-white/12 hover:text-white"
                >
                  Ouvrir la page audio a {payload.timestampLabel}
                </a>

                {payload.contextHref && (
                  <button
                    type="button"
                    onClick={openContext}
                    className="w-full rounded-2xl bg-white/6 px-4 py-3 font-medium text-sand/88 transition-colors hover:bg-white/12 hover:text-white"
                  >
                    Voir le contexte lie
                  </button>
                )}

                <button
                  type="button"
                  data-close="true"
                  onClick={onClose}
                  className="w-full rounded-2xl px-4 py-3 font-medium text-sand/70 transition-colors hover:text-white"
                >
                  Fermer
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
