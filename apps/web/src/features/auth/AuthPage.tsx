import { useState } from "react";
import { useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { SEO } from "../../components/SEO";
import { Button } from "../../components/ui/Button";
import { useLoginForm, useRegisterForm } from "../../hooks/useAuthForm";
import { useAuthStore } from "../../stores";

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
  const { isAuthenticated } = useAuthStore();
  const [mode, setMode] = useState<"login" | "register">("login");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const returnToFromQuery = searchParams.get("returnTo");
  const returnToFromState = (location.state as any)?.from as string | undefined;
  const returnTo = returnToFromQuery || returnToFromState || "/profile";

  // Hooks pour les formulaires
  const loginForm = useLoginForm();
  const registerForm = useRegisterForm();

  // Rediriger si déjà authentifié
  if (isAuthenticated) {
    navigate(returnTo, { replace: true });
  }

  const handleLogin = async (data: any) => {
    try {
      setError(null);
      await loginForm.onSubmit(data);
      navigate(returnTo, { replace: true });
    } catch (err: any) {
      setError(err.message || "Erreur lors de la connexion");
    }
  };

  const handleRegister = async (data: any) => {
    try {
      setError(null);
      await registerForm.onSubmit(data);
      navigate(returnTo, { replace: true });
    } catch (err: any) {
      setError(err.message || "Erreur lors de l'inscription");
    }
  };

  const loginFormObj = loginForm.form;
  const registerFormObj = registerForm.form;
  const isSubmitting = mode === "login" ? loginForm.isSubmitting : registerForm.isSubmitting;

  return (
    <>
      <SEO title="Connexion / Inscription" description="Connectez-vous ou inscrivez-vous sur MAATFEED" />
      
      <div className="min-h-screen bg-[#000000] flex items-center justify-center px-4">
        <div className="w-full max-w-md">
          {/* Logo */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-[#FF6B35] mb-2">MAATFEED</h1>
            <p className="text-gray-400">
              {mode === "login" ? "Connectez-vous à votre compte" : "Créez votre compte"}
            </p>
          </div>

          {/* Error message */}
          {error && (
            <div className="mb-6 p-4 bg-red-900/20 border border-red-500/50 rounded-lg">
              <p className="text-red-400 text-sm">{error}</p>
            </div>
          )}

          {/* Form */}
          <form onSubmit={mode === "login" ? loginFormObj.handleSubmit(handleLogin) : registerFormObj.handleSubmit(handleRegister)} className="space-y-6">
            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-2">
                Email
              </label>
              <input
                {...(mode === "login" ? loginFormObj.register("email") : registerFormObj.register("email"))}
                type="email"
                id="email"
                className="w-full px-4 py-3 bg-[#1A1A1A] border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#FF6B35] focus:border-transparent"
                placeholder="votre@email.com"
              />
              {mode === "login" && loginForm.errors.email && (
                <p className="mt-1 text-sm text-red-400">{loginForm.errors.email.message}</p>
              )}
              {mode === "register" && registerForm.errors.email && (
                <p className="mt-1 text-sm text-red-400">{registerForm.errors.email.message}</p>
              )}
            </div>

            {/* Username (register only) */}
            {mode === "register" && (
              <div>
                <label htmlFor="username" className="block text-sm font-medium text-gray-300 mb-2">
                  Nom d'utilisateur
                </label>
                <input
                  {...registerFormObj.register("username")}
                  type="text"
                  id="username"
                  className="w-full px-4 py-3 bg-[#1A1A1A] border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#FF6B35] focus:border-transparent"
                  placeholder="@pseudo"
                />
                {registerForm.errors.username && (
                  <p className="mt-1 text-sm text-red-400">{registerForm.errors.username.message}</p>
                )}
              </div>
            )}

            {/* Password */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-2">
                Mot de passe
              </label>
              <div className="relative">
                <input
                  {...(mode === "login" ? loginFormObj.register("password") : registerFormObj.register("password"))}
                  type={showPassword ? "text" : "password"}
                  id="password"
                  className="w-full px-4 py-3 pr-12 bg-[#1A1A1A] border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#FF6B35] focus:border-transparent"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-300"
                >
                  <EyeIcon visible={showPassword} />
                </button>
              </div>
              {mode === "login" && loginForm.errors.password && (
                <p className="mt-1 text-sm text-red-400">{loginForm.errors.password.message}</p>
              )}
              {mode === "register" && registerForm.errors.password && (
                <p className="mt-1 text-sm text-red-400">{registerForm.errors.password.message}</p>
              )}
            </div>

            {/* Confirm Password (register only) */}
            {mode === "register" && (
              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-300 mb-2">
                  Confirmer le mot de passe
                </label>
                <div className="relative">
                  <input
                    {...registerFormObj.register("confirmPassword")}
                    type={showConfirmPassword ? "text" : "password"}
                    id="confirmPassword"
                    className="w-full px-4 py-3 pr-12 bg-[#1A1A1A] border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#FF6B35] focus:border-transparent"
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-300"
                  >
                    <EyeIcon visible={showConfirmPassword} />
                  </button>
                </div>
                {registerForm.errors.confirmPassword && (
                  <p className="mt-1 text-sm text-red-400">{registerForm.errors.confirmPassword.message}</p>
                )}
              </div>
            )}

            {/* Submit button */}
            <Button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3 bg-[#FF6B35] hover:bg-[#FF8555] text-white font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <div className="flex items-center justify-center">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                  {mode === "login" ? "Connexion..." : "Inscription..."}
                </div>
              ) : (
                mode === "login" ? "Se connecter" : "S'inscrire"
              )}
            </Button>
          </form>

          {/* Mode toggle */}
          <div className="mt-6 text-center">
            <p className="text-gray-400">
              {mode === "login" ? "Pas encore de compte ?" : "Déjà un compte ?"}{" "}
              <button
                type="button"
                onClick={() => {
                  setMode(mode === "login" ? "register" : "login");
                  setError(null);
                  loginFormObj.reset();
                  registerFormObj.reset();
                }}
                className="text-[#FF6B35] hover:text-[#FF8555] font-medium"
              >
                {mode === "login" ? "S'inscrire" : "Se connecter"}
              </button>
            </p>
          </div>

          {/* Forgot password (login only) */}
          {mode === "login" && (
            <div className="mt-4 text-center">
              <button
                type="button"
                onClick={() => navigate("/forgot-password")}
                className="text-gray-400 hover:text-gray-300 text-sm"
              >
                Mot de passe oublié ?
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
