import { useState, useEffect } from "react";
import { useSearchParams, useNavigate, Link } from "react-router-dom";
import { resetPassword } from "../services/authService";

export default function ResetPasswordPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get("token");

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!token) {
      setStatus("error");
      setMessage("Lien de réinitialisation invalide ou expiré.");
    }
  }, [token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!token) {
      setStatus("error");
      setMessage("Lien de réinitialisation invalide.");
      return;
    }

    if (newPassword.length < 8) {
      setStatus("error");
      setMessage("Le mot de passe doit contenir au moins 8 caractères.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setStatus("error");
      setMessage("Les mots de passe ne correspondent pas.");
      return;
    }

    setStatus("loading");
    setMessage("");

    try {
      const result = await resetPassword(token, newPassword);
      setStatus("success");
      setMessage(result.message || "Votre mot de passe a été réinitialisé avec succès.");

      // Redirect to auth after 3 seconds
      setTimeout(() => {
        navigate("/auth");
      }, 3000);
    } catch (error) {
      setStatus("error");
      setMessage(error instanceof Error ? error.message : "Une erreur est survenue.");
    }
  };

  if (status === "error" && !token) {
    return (
      <div className="min-h-screen bg-[#201713] flex items-center justify-center px-4">
        <div className="max-w-md w-full bg-white/5 rounded-xl p-8 border border-[#d4af37]/30 text-center">
          <div className="text-4xl mb-4">⚠️</div>
          <h1 className="text-2xl font-bold text-red-400 mb-4">
            Lien invalide
          </h1>
          <p className="text-gray-300 mb-6">{message}</p>
          <Link
            to="/forgot-password"
            className="px-6 py-2 bg-gradient-to-r from-[#d4af37] to-[#b8941f] text-[#201713] rounded-lg font-medium hover:opacity-90 transition-opacity"
          >
            Demander un nouveau lien
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#201713] flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-white/5 rounded-xl p-8 border border-[#d4af37]/30">
        <div className="text-center mb-8">
          <div className="text-4xl mb-2">☥</div>
          <h1 className="text-2xl font-bold text-[#d4af37]">
            Nouveau mot de passe
          </h1>
          <p className="text-gray-400 mt-2">
            Créez un nouveau mot de passe sécurisé
          </p>
        </div>

        {status === "success" ? (
          <div className="text-center space-y-4">
            <div className="text-5xl">✅</div>
            <p className="text-gray-300">{message}</p>
            <p className="text-sm text-gray-500">
              Redirection vers la page de connexion...
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="newPassword" className="block text-sm font-medium text-gray-300 mb-1">
                Nouveau mot de passe
              </label>
              <input
                id="newPassword"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="••••••••"
                minLength={8}
                className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-[#d4af37]"
                required
              />
              <p className="text-xs text-gray-500 mt-1">
                Minimum 8 caractères
              </p>
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-300 mb-1">
                Confirmer le mot de passe
              </label>
              <input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-[#d4af37]"
                required
              />
            </div>

            {status === "error" && (
              <p className="text-red-400 text-sm">{message}</p>
            )}

            <button
              type="submit"
              disabled={status === "loading"}
              className="w-full py-2 bg-gradient-to-r from-[#d4af37] to-[#b8941f] text-[#201713] rounded-lg font-medium hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {status === "loading" ? "Réinitialisation..." : "Réinitialiser le mot de passe"}
            </button>

            <p className="text-center text-sm">
              <Link to="/auth" className="text-[#d4af37] hover:underline">
                Retour à la connexion
              </Link>
            </p>
          </form>
        )}
      </div>
    </div>
  );
}
