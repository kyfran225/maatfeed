import { useState, type FormEvent } from "react";
import { useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { SEO } from "../components/SEO";
import { Button } from "../components/ui/Button";
import { useAuth } from "../hooks/useAuth";

// Eye icon for password visibility toggle
function EyeIcon({ visible }: { visible: boolean }) {
  return visible ? (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
      <circle cx="12" cy="12" r="3" />
      <path d="M4 4l16 16" />
    </svg>
  ) : (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

export function AuthPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const { loginUser, registerUser, isAuthenticated } = useAuth();
  const [mode, setMode] = useState<"login" | "register">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [displayName, setDisplayName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const returnToFromQuery = searchParams.get("returnTo");
  const returnToFromState = (location.state as any)?.from as string | undefined;
  const returnTo = returnToFromQuery || returnToFromState || "/profile";

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      let authResult;
      if (mode === "login") {
        authResult = await loginUser({ email, password });
      } else {
        authResult = await registerUser({ email, password, displayName });
      }

      const userProfile = authResult.profile;

      // Redirect to onboarding if not completed, otherwise go to returnTo
      if (userProfile && !userProfile.onboardingCompleted) {
        navigate("/onboarding", { replace: true });
      } else {
        navigate(returnTo);
      }
    } catch (submissionError) {
      setError(submissionError instanceof Error ? submissionError.message : "Échec de l'authentification.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <>
      <SEO pageKey="auth" />
      <section className="px-4 py-6">
      <h1 className="font-display text-3xl text-gold">Accès</h1>
      <p className="mt-3 text-sand/75">
        {isAuthenticated ? "Session active. Vous pouvez accéder à votre profil." : "Créez un compte ou connectez-vous."}
      </p>
      <div className="mt-6 inline-flex rounded-full border border-white/10 p-1">
        <button
          className={`rounded-full px-4 py-2 ${mode === "login" ? "bg-gold text-ink" : "text-sand/70"}`}
          onClick={() => setMode("login")}
          type="button"
        >
          Connexion
        </button>
        <button
          className={`rounded-full px-4 py-2 ${mode === "register" ? "bg-gold text-ink" : "text-sand/70"}`}
          onClick={() => setMode("register")}
          type="button"
        >
          S'inscrire
        </button>
      </div>
      <form className="mt-6 grid gap-4 rounded-[1.5rem] border border-white/10 bg-white/5 p-5" onSubmit={handleSubmit}>
        {mode === "register" ? (
          <label className="grid gap-2 text-sm">
            <span className="uppercase tracking-[0.16em] text-sand/70">Nom d'affichage</span>
            <input
              name="displayName"
              className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-sand"
              onChange={(event) => setDisplayName(event.target.value)}
              required
              value={displayName}
            />
          </label>
        ) : null}
        <label className="grid gap-2 text-sm">
          <span className="uppercase tracking-[0.16em] text-sand/70">Email</span>
          <input
            name="email"
            className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-sand"
            onChange={(event) => setEmail(event.target.value)}
            required
            type="email"
            value={email}
          />
        </label>
        <label className="grid gap-2 text-sm">
          <span className="uppercase tracking-[0.16em] text-sand/70">Mot de passe</span>
          <div className="relative">
            <input
              name="password"
              className="w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3 pr-12 text-sand"
              minLength={8}
              onChange={(event) => setPassword(event.target.value)}
              required
              type={showPassword ? "text" : "password"}
              value={password}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-sand/50 hover:text-sand/80 transition-colors"
              aria-label={showPassword ? "Masquer le mot de passe" : "Afficher le mot de passe"}
            >
              <EyeIcon visible={showPassword} />
            </button>
          </div>
        </label>
        {error ? <p className="text-sm text-red-300">{error}</p> : null}
        <Button disabled={isSubmitting} type="submit">
          {isSubmitting ? "Envoi en cours..." : mode === "login" ? "Connexion" : "Créer le compte"}
        </Button>
      </form>
    </section>
    </>
  );
}
