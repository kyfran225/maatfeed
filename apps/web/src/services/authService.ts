import type { UserProfile } from "@maat/shared";
import { clearTokens, getRefreshToken, setTokens } from "../lib/authStorage";
import { getJson, postJson } from "./httpClient";

interface AuthResponse {
  tokens: {
    accessToken: string;
    refreshToken: string;
  };
  profile: UserProfile & { isEmailVerified?: boolean };
  requiresEmailVerification?: boolean;
}

interface RegisterResult {
  profile: UserProfile & { isEmailVerified?: boolean };
  requiresEmailVerification: boolean;
}

export async function register(input: { email: string; password: string; displayName: string }): Promise<RegisterResult> {
  const result = await getJson<AuthResponse>("/api/auth/register", {
    method: "POST",
    body: JSON.stringify(input)
  });

  setTokens(result.tokens);

  return {
    profile: result.profile,
    requiresEmailVerification: result.requiresEmailVerification ?? true
  };
}

export async function login(input: { email: string; password: string }): Promise<RegisterResult> {
  const result = await getJson<AuthResponse>("/api/auth/login", {
    method: "POST",
    body: JSON.stringify(input)
  });

  setTokens(result.tokens);

  return {
    profile: result.profile,
    requiresEmailVerification: !result.profile.isEmailVerified
  };
}


export async function refreshSession() {
  const refreshToken = getRefreshToken();

  if (!refreshToken) {
    throw new Error("No refresh token available.");
  }

  const result = await getJson<{ tokens: { accessToken: string; refreshToken: string } }>("/api/auth/refresh", {
    method: "POST",
    body: JSON.stringify({ refreshToken })
  });

  setTokens(result.tokens);

  return result.tokens;
}

export async function getMe() {
  const result = await getJson<{ profile: UserProfile }>("/api/auth/me");
  return result.profile;
}

export async function logout() {
  const refreshToken = getRefreshToken();

  if (refreshToken) {
    await fetch("/api/auth/logout", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ refreshToken })
    });
  }

  clearTokens();
}

// Email Verification
export async function verifyEmail(token: string) {
  return getJson<{ success: boolean; email: string }>(`/api/auth/verify-email?token=${token}`);
}

export async function resendVerificationEmail() {
  return postJson<{ success: boolean; message: string }>("/api/auth/resend-verification");
}

// Password Reset
export async function forgotPassword(email: string) {
  return postJson<{ success: boolean; message: string }>("/api/auth/forgot-password", { email });
}

export async function resetPassword(token: string, newPassword: string) {
  return postJson<{ success: boolean; message: string }>("/api/auth/reset-password", { token, newPassword });
}

export async function changePassword(currentPassword: string, newPassword: string) {
  return postJson<{ success: boolean; message: string }>("/api/auth/change-password", {
    currentPassword,
    newPassword
  });
}
