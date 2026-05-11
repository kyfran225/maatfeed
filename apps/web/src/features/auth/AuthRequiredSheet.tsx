import { AnimatePresence, motion } from "framer-motion";
import type { MouseEvent } from "react";
import { useNavigate } from "react-router-dom";

const logoUrl = "/favicon_io/logo-kemet-site.webp";

interface AuthRequiredSheetProps {
  isOpen: boolean;
  onClose: () => void;
  returnTo: string;
}

export function AuthRequiredSheet({ isOpen, onClose, returnTo }: AuthRequiredSheetProps) {
  const navigate = useNavigate();

  const handleContinue = (event: MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    onClose();
    navigate(`/auth?returnTo=${encodeURIComponent(returnTo)}`);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          data-overlay="true"
          className="fixed inset-0 z-[210] flex items-end bg-[#120d0b]/30 backdrop-blur-[2px]"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            className="w-full max-h-[80vh] overflow-hidden rounded-t-3xl border-t border-amber-500/30"
            style={{
              background:
                "radial-gradient(circle at top, rgba(212,106,54,0.18), transparent 38%), linear-gradient(180deg, rgba(32,23,19,0.98) 0%, rgba(22,18,15,0.98) 48%, rgba(15,12,10,0.98) 100%)",
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
              <div className="h-1 w-12 rounded-full bg-amber-500/40" />
            </div>

            <div className="px-6 pb-7">
              <div className="flex items-center gap-4">
                <div className="flex h-14 w-14 items-center justify-center overflow-hidden rounded-2xl border border-amber-500/20 bg-amber-500/10">
                  <img src={logoUrl} alt="MAAT" className="h-10 w-10 object-contain" />
                </div>

                <div className="min-w-0">
                  <h3 className="text-xl font-semibold text-white">Connecte-toi pour continuer</h3>
                  <p className="mt-1 text-sm text-amber-200/70">
                    Cette action nécessite un compte.
                  </p>
                </div>
              </div>

              <div className="mt-4 rounded-2xl border border-gold/15 bg-gradient-to-r from-[#3a2a20]/80 via-[#2a1d16]/65 to-[#1d1511]/45 px-4 py-3">
                <p className="text-sm text-sand/85">
                  Rejoins la communauté MAAT pour liker, commenter, partager et participer aux débats.
                </p>
              </div>

              <div className="mt-6 grid gap-3">
                <button
                  type="button"
                  onClick={handleContinue}
                  className="w-full rounded-2xl bg-gold py-3 font-medium text-ink transition-colors hover:bg-gold/90"
                >
                  Se connecter / Créer un compte
                </button>
                <button
                  type="button"
                  onClick={onClose}
                  className="w-full rounded-2xl border border-white/10 bg-white/5 py-3 font-medium text-sand/85 transition-colors hover:bg-white/10 hover:text-white"
                >
                  Plus tard
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
