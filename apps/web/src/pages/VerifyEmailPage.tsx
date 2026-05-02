import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { verifyEmail } from "../services/authService";
import { EmailVerificationKemetIcon } from "../components/icons/EmailVerificationKemetIcon";

export default function VerifyEmailPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [message, setMessage] = useState("Vérification en cours...");

  const token = searchParams.get("token");

  useEffect(() => {
    if (!token) {
      setStatus("error");
      setMessage("Lien de vérification invalide ou expiré.");
      return;
    }

    const verify = async () => {
      try {
        await verifyEmail(token);
        setStatus("success");
        setMessage("✅ Votre email a été vérifié avec succès !");

        // Redirect to feed after 3 seconds
        setTimeout(() => {
          navigate("/");
        }, 3000);
      } catch (error) {
        setStatus("error");
        setMessage(error instanceof Error ? error.message : "Échec de la vérification.");
      }
    };

    verify();
  }, [token, navigate]);

  return (
    <div className="min-h-screen bg-[#201713] flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-white/5 rounded-xl p-8 border border-[#d4af37]/30 text-center">
        <EmailVerificationKemetIcon className="w-20 h-20 mx-auto mb-4 text-[#d4af37]" />
        <h1 className="text-2xl font-bold text-[#d4af37] mb-4">
          Vérification d'email
        </h1>

        {status === "loading" && (
          <div className="flex flex-col items-center gap-4">
            <div className="w-8 h-8 border-2 border-[#d4af37] border-t-transparent rounded-full animate-spin" />
            <p className="text-gray-300">{message}</p>
          </div>
        )}

        {status === "success" && (
          <div className="space-y-4">
            <div className="text-5xl">🎉</div>
            <p className="text-gray-300">{message}</p>
            <p className="text-sm text-gray-500">
              Redirection vers le feed dans quelques secondes...
            </p>
            <button
              onClick={() => navigate("/")}
              className="mt-4 px-6 py-2 bg-gradient-to-r from-[#d4af37] to-[#b8941f] text-[#201713] rounded-lg font-medium hover:opacity-90 transition-opacity"
            >
              Aller au feed
            </button>
          </div>
        )}

        {status === "error" && (
          <div className="space-y-4">
            <div className="text-5xl">⚠️</div>
            <p className="text-red-400">{message}</p>
            <div className="flex gap-3 justify-center">
              <button
                onClick={() => navigate("/auth")}
                className="px-6 py-2 bg-gradient-to-r from-[#d4af37] to-[#b8941f] text-[#201713] rounded-lg font-medium hover:opacity-90 transition-opacity"
              >
                Se connecter
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
