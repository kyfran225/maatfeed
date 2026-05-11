import { useState, useEffect } from "react";
import { resendVerificationEmail } from "../../services/authService";

interface EmailVerificationBannerProps {
  isVerified: boolean;
  onVerificationSent?: () => void;
}

export function EmailVerificationBanner({ isVerified, onVerificationSent }: EmailVerificationBannerProps) {
  const [isSending, setIsSending] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [isError, setIsError] = useState(false);

  // Auto-hide success message after 4 seconds
  useEffect(() => {
    if (message && !isError) {
      const timer = setTimeout(() => {
        setMessage(null);
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [message, isError]);

  if (isVerified) return null;

  const handleResend = async () => {
    setIsSending(true);
    setMessage(null);
    setIsError(false);

    try {
      const result = await resendVerificationEmail();
      setMessage(result.message || "Email envoyé !");
      onVerificationSent?.();
    } catch (error) {
      setIsError(true);
      setMessage(error instanceof Error ? error.message : "Erreur");
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="email-verification-banner fixed left-0 right-0 z-[100] bg-gradient-to-r from-amber-500/90 to-orange-500/90 backdrop-blur-md border-b border-amber-500/50 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 py-2 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 min-w-0">
          <span className="text-xl flex-shrink-0">📧</span>
          {message ? (
            <span className={`text-sm truncate ${isError ? 'text-red-300' : 'text-green-300'}`}>
              {message}
            </span>
          ) : (
            <span className="text-sm text-amber-100 truncate">
              Vérifiez votre email
            </span>
          )}
        </div>

        <button
          onClick={handleResend}
          disabled={isSending}
          className="px-3 py-1.5 text-xs font-medium bg-amber-500/20 hover:bg-amber-500/30 text-white rounded-lg transition-colors disabled:opacity-50 whitespace-nowrap flex-shrink-0"
        >
          {isSending ? "Envoi..." : "Renvoyer"}
        </button>
      </div>
    </div>
  );
}
