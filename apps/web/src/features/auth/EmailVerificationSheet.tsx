import { AnimatePresence, motion } from "framer-motion";
import type { MouseEvent } from "react";
import { useState } from "react";
import { resendVerificationEmail } from "../../services/authService";

const logoUrl = "/favicon_io/logo-kemet-site.webp";

interface EmailVerificationSheetProps {
  isOpen: boolean;
  onClose: () => void;
}

export function EmailVerificationSheet({ isOpen, onClose }: EmailVerificationSheetProps) {
  const [isSending, setIsSending] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [isError, setIsError] = useState(false);

  const handleResend = async (event: MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    setIsSending(true);
    setMessage(null);
    setIsError(false);

    try {
      const result = await resendVerificationEmail();
      setMessage(result.message || "Email envoyé ! Vérifiez votre boîte de réception.");
    } catch (error) {
      setIsError(true);
      setMessage(error instanceof Error ? error.message : "Erreur lors de l'envoi");
    } finally {
      setIsSending(false);
    }
  };

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
            className="bg-ink border-t border-amber-500/30 rounded-t-3xl w-full max-h-[80vh] overflow-hidden"
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
            style={{ touchAction: "pan-y" }}
          >
            <div className="flex justify-center py-3">
              <div className="w-12 h-1 bg-amber-500/40 rounded-full" />
            </div>

            <div className="px-6 pb-7">
              <div className="flex items-center gap-4">
                <div className="h-14 w-14 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center overflow-hidden">
                  <img src={logoUrl} alt="MAAT" className="h-10 w-10 object-contain" />
                </div>

                <div className="min-w-0">
                  <h3 className="text-xl font-semibold text-white">Vérifiez votre email</h3>
                  <p className="text-sm text-amber-200/70 mt-1">
                    Cette action nécessite une adresse email confirmée.
                  </p>
                </div>
              </div>

              {message && (
                <div className={`mt-4 p-3 rounded-xl text-sm ${isError ? 'bg-red-500/20 text-red-200' : 'bg-green-500/20 text-green-200'}`}>
                  {message}
                </div>
              )}

              <div className="mt-6 grid gap-3">
                <button
                  type="button"
                  onClick={handleResend}
                  disabled={isSending}
                  className="w-full py-3 bg-amber-500 hover:bg-amber-400 text-ink rounded-2xl font-medium transition-colors disabled:opacity-50"
                >
                  {isSending ? "Envoi en cours..." : "📧 Renvoyer l'email de vérification"}
                </button>
                <button
                  type="button"
                  onClick={onClose}
                  className="w-full py-3 bg-white/10 hover:bg-white/20 text-white rounded-2xl font-medium transition-colors"
                >
                  Plus tard
                </button>
              </div>

              <p className="mt-4 text-xs text-sand/50 text-center">
                Vérifiez aussi votre dossier spam si vous ne trouvez pas l'email.
              </p>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
