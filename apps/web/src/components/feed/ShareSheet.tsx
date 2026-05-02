import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";

interface ShareSheetProps {
  isOpen: boolean;
  onClose: () => void;
  url: string;
  title: string;
}

export function ShareSheet({ isOpen, onClose, url, title }: ShareSheetProps) {
  const [copied, setCopied] = useState(false);

  // Block body scroll when sheet is open
  useEffect(() => {
    if (isOpen) {
      const originalOverflow = document.body.style.overflow;
      const originalTouchAction = document.body.style.touchAction;
      document.body.style.overflow = "hidden";
      document.body.style.touchAction = "none";

      return () => {
        document.body.style.overflow = originalOverflow;
        document.body.style.touchAction = originalTouchAction;
      };
    }
  }, [isOpen]);

  const canNativeShare = typeof navigator !== "undefined" && "share" in navigator;

  async function handleCopy() {
    try {
      const nav: any = typeof navigator !== "undefined" ? (navigator as any) : null;
      if (nav && "clipboard" in nav && nav.clipboard?.writeText) {
        await nav.clipboard.writeText(url);
      } else {
        await Promise.reject(new Error("Clipboard not available"));
      }
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1200);
    } catch {
      setCopied(false);
    }
  }

  async function handleNativeShare() {
    if (!canNativeShare) {
      return;
    }

    try {
      await (navigator as any).share({ title, url });
      onClose();
    } catch {
      // ignore cancellation
    }
  }

  function handleOpenSource() {
    try {
      window.open(url, "_blank", "noopener,noreferrer");
    } catch {
      // ignore
    }
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          data-overlay="true"
          className="fixed inset-0 z-[210] flex items-end"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            className="w-full max-h-[80vh] overflow-hidden rounded-t-3xl border-t border-white/10"
            style={{
              background: "rgba(10, 10, 15, 0.92)",
              backdropFilter: "blur(24px) saturate(180%)",
              WebkitBackdropFilter: "blur(24px) saturate(180%)",
              touchAction: "pan-y"
            }}
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 30, stiffness: 300 }}
            onClick={(e) => e.stopPropagation()}
            drag="y"
            dragConstraints={{ top: 0, bottom: 0 }}
            dragElastic={0.15}
            onDragEnd={(_, info) => {
              const shouldClose = info.offset.y > 140 || info.velocity.y > 900;
              if (shouldClose) onClose();
            }}
          >
            <div className="flex justify-center py-3">
              <div className="h-1 w-12 rounded-full bg-white/20" />
            </div>

            <div className="px-6 pb-7">
              <h3 className="text-xl font-semibold text-white">Partager</h3>
              <p className="mt-1 text-sm text-sand/70 line-clamp-2">{title}</p>

              <div className="mt-6 grid gap-3">
                <button
                  type="button"
                  onClick={canNativeShare ? handleNativeShare : handleCopy}
                  className="w-full rounded-2xl bg-gold py-3 font-medium text-ink transition-colors hover:bg-gold/90"
                >
                  {canNativeShare ? "Partager" : copied ? "Lien copié" : "Copier le lien"}
                </button>

                <button
                  type="button"
                  onClick={handleCopy}
                  className="w-full rounded-2xl bg-white/10 py-3 font-medium text-white transition-colors hover:bg-white/20"
                >
                  {copied ? "Copié" : "Copier le lien"}
                </button>

                <button
                  type="button"
                  onClick={handleOpenSource}
                  className="w-full rounded-2xl bg-white/10 py-3 font-medium text-white transition-colors hover:bg-white/20"
                >
                  Ouvrir la source
                </button>

                <button
                  type="button"
                  data-close="true"
                  onClick={onClose}
                  className="w-full rounded-2xl py-3 font-medium text-sand/80 transition-colors hover:text-white"
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
