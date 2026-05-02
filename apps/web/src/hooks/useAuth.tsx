import type { UserProfile } from "@maat/shared";
import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type PropsWithChildren
} from "react";
import { clearTokens, getAccessToken, getRefreshToken } from "../lib/authStorage";
import { getMe, login, logout, refreshSession, register } from "../services/authService";

type AuthContextValue = {
  profile: UserProfile | null;
  isAuthenticated: boolean;
  isBootstrapping: boolean;
  isEmailVerified: boolean;
  registerUser: typeof register;
  loginUser: typeof login;
  logoutUser: () => Promise<void>;
  refreshProfile: () => Promise<void>;
  resendVerification: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: PropsWithChildren) {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isEmailVerified, setIsEmailVerified] = useState(true);
  const [isBootstrapping, setIsBootstrapping] = useState(true);

  async function refreshProfile() {
    const me = await getMe();
    setProfile(me);
    setIsEmailVerified(me.isEmailVerified ?? true);
  }

  async function resendVerification() {
    await refreshProfile();
  }

  async function registerUser(input: Parameters<typeof register>[0]) {
    const result = await register(input);
    setProfile(result.profile);
    setIsEmailVerified(!result.requiresEmailVerification);
    return result;
  }

  async function loginUser(input: Parameters<typeof login>[0]) {
    const result = await login(input);
    setProfile(result.profile);
    setIsEmailVerified(!result.requiresEmailVerification);
    return result;
  }

  async function logoutUser() {
    await logout();
    setProfile(null);
  }

  useEffect(() => {
    async function bootstrap() {
      try {
        if (!getAccessToken() && !getRefreshToken()) {
          return;
        }

        try {
          await refreshProfile();
        } catch {
          await refreshSession();
          await refreshProfile();
        }
      } catch {
        clearTokens();
        setProfile(null);
      } finally {
        setIsBootstrapping(false);
      }
    }

    void bootstrap();
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      profile,
      isAuthenticated: Boolean(profile),
      isBootstrapping,
      isEmailVerified,
      registerUser,
      loginUser,
      logoutUser,
      refreshProfile,
      resendVerification
    }),
    [isBootstrapping, profile, isEmailVerified]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    // Return default values during initialization to prevent "Consume appContext before init" error
    return {
      profile: null,
      isAuthenticated: false,
      isBootstrapping: true,
      isEmailVerified: true,
      registerUser: async () => {
        throw new Error("Auth not initialized");
      },
      loginUser: async () => {
        throw new Error("Auth not initialized");
      },
      logoutUser: async () => {
        throw new Error("Auth not initialized");
      },
      refreshProfile: async () => {
        throw new Error("Auth not initialized");
      },
      resendVerification: async () => {
        throw new Error("Auth not initialized");
      }
    };
  }

  return context;
}
