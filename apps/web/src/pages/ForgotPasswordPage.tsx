import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { forgotPassword } from "../services/authService";

export default function ForgotPasswordPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email) {
      setStatus("error");
      setMessage("Veuillez entrer votre email.");
      return;
    }

    setStatus("loading");
    setMessage("");

    try {
      const result = await forgotPassword(email);
      setStatus("success");
      setMessage(result.message || "Si un compte existe avec cet email, un lien de réinitialisation a été envoyé.");
    } catch (error) {
      setStatus("error");
      setMessage(error instanceof Error ? error.message : "Une erreur est survenue.");
    }
  };

  return (
    <div className="min-h-screen bg-[#201713] flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-white/5 rounded-xl p-8 border border-[#d4af37]/30">
        <div className="text-center mb-8">
          <div className="text-4xl mb-2">☥</div>
          <h1 className="text-2xl font-bold text-[#d4af37]">
            Mot de passe oublié
          </h1>
          <p className="text-gray-400 mt-2">
            Entrez votre email pour recevoir un lien de réinitialisation
          </p>
        </div>

        {status === "success" ? (
          <div className="text-center space-y-4">
            <div className="text-5xl">📧</div>
            <p className="text-gray-300">{message}</p>
            <button
              onClick={() => navigate("/auth")}
              className="mt-4 px-6 py-2 bg-gradient-to-r from-[#d4af37] to-[#b8941f] text-[#201713] rounded-lg font-medium hover:opacity-90 transition-opacity"
            >
              Retour à la connexion
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-1">
                Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="votre@email.com"
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
              {status === "loading" ? "Envoi en cours..." : "Envoyer le lien"}
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
