import { clearTokens, getAccessToken, getRefreshToken, setTokens } from "../lib/authStorage";

interface ApiErrorResponse {
  error?: string | {
    message?: string;
    code?: string;
  };
  message?: string;
  code?: string;
  details?: Array<{ message: string; path: string[] }>;
  action?: {
    type: string;
    endpoint: string;
    message: string;
  };
}

export class EmailVerificationRequiredError extends Error {
  code = "EMAIL_NOT_VERIFIED";
  action: { type: string; endpoint: string; message: string } | null = null;

  constructor(message: string, action?: { type: string; endpoint: string; message: string }) {
    super(message);
    this.name = "EmailVerificationRequiredError";
    if (action) {
      this.action = action;
    }
  }
}

const NON_REFRESHABLE_ENDPOINTS = [
  "/api/auth/login",
  "/api/auth/register",
  "/api/auth/refresh",
  "/api/auth/logout",
  "/api/auth/forgot-password",
  "/api/auth/reset-password",
  "/api/auth/change-password",
  "/api/auth/verify-email"
];

let refreshRequest: Promise<boolean> | null = null;

function buildHeaders(initHeaders?: HeadersInit, accessToken?: string) {
  const headers = new Headers(initHeaders);

  if (!headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  if (accessToken) {
    headers.set("Authorization", `Bearer ${accessToken}`);
  } else {
    headers.delete("Authorization");
  }

  return headers;
}

function buildRequestInit(init?: RequestInit, accessToken?: string): RequestInit {
  return {
    credentials: "include",
    ...init,
    headers: buildHeaders(init?.headers, accessToken)
  };
}

function shouldAttemptSessionRefresh(input: string, hasRetried: boolean) {
  if (hasRetried || !getRefreshToken()) {
    return false;
  }

  return !isNonRefreshableEndpoint(input);
}

function isNonRefreshableEndpoint(input: string) {
  return NON_REFRESHABLE_ENDPOINTS.some((endpoint) => input.startsWith(endpoint));
}

async function refreshAccessToken() {
  if (refreshRequest) {
    return refreshRequest;
  }

  refreshRequest = (async () => {
    const refreshToken = getRefreshToken();

    if (!refreshToken) {
      clearTokens();
      return false;
    }

    try {
      const response = await fetch("/api/auth/refresh", {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ refreshToken })
      });

      if (!response.ok) {
        clearTokens();
        return false;
      }

      const data = await response.json() as { tokens?: { accessToken: string; refreshToken: string } };

      if (!data.tokens?.accessToken || !data.tokens?.refreshToken) {
        clearTokens();
        return false;
      }

      setTokens(data.tokens);
      return true;
    } catch {
      clearTokens();
      return false;
    } finally {
      refreshRequest = null;
    }
  })();

  return refreshRequest;
}

function redirectToAuth() {
  if (typeof window === "undefined") {
    return;
  }

  const returnTo = `${window.location.pathname}${window.location.search}${window.location.hash}`;
  const authUrl = `/auth?returnTo=${encodeURIComponent(returnTo)}`;

  if (window.location.pathname !== "/auth") {
    window.location.assign(authUrl);
  }
}

async function handleErrorResponse(input: string, response: Response): Promise<never> {
  const errorData = await extractErrorData(response);

  if (response.status === 401 && !isNonRefreshableEndpoint(input)) {
    redirectToAuth();
    return new Promise(() => {});
  }

  if (response.status === 403 && errorData.code === "EMAIL_NOT_VERIFIED") {
    throw new EmailVerificationRequiredError(
      errorData.message || "Veuillez verifier votre adresse email pour effectuer cette action.",
      errorData.action
    );
  }

  throw new Error(errorData.message || `Erreur ${response.status}`);
}

async function requestJson<T>(input: string, init?: RequestInit, hasRetried = false): Promise<T> {
  const response = await fetch(input, buildRequestInit(init, getAccessToken() || undefined));

  if (response.ok) {
    return (await response.json()) as T;
  }

  if (response.status === 401 && shouldAttemptSessionRefresh(input, hasRetried)) {
    const refreshed = await refreshAccessToken();

    if (refreshed) {
      return requestJson<T>(input, init, true);
    }
  }

  return handleErrorResponse(input, response);
}

export async function getJson<T>(input: string, init?: RequestInit): Promise<T> {
  return requestJson<T>(input, init);
}

export async function postJson<T>(input: string, body?: unknown, init?: RequestInit): Promise<T> {
  return requestJson<T>(input, {
    method: "POST",
    body: body ? JSON.stringify(body) : undefined,
    ...init
  });
}

export async function putJson<T>(input: string, body?: unknown, init?: RequestInit): Promise<T> {
  return requestJson<T>(input, {
    method: "PUT",
    body: body ? JSON.stringify(body) : undefined,
    ...init
  });
}

export async function deleteJson<T>(input: string, init?: RequestInit): Promise<T> {
  return requestJson<T>(input, init);
}

// Helper to extract both message and structured error data
async function extractErrorData(response: Response): Promise<ApiErrorResponse & { message?: string }> {
  try {
    const data = await response.json() as ApiErrorResponse;
    // Extract error message from various possible formats
    let errorMessage: string | undefined;
    if (typeof data.error === "string") {
      errorMessage = data.error;
    } else if (typeof data.error === "object" && data.error?.message) {
      errorMessage = data.error.message;
    } else if (data.message) {
      errorMessage = data.message;
    }

    return {
      ...data,
      message: errorMessage || response.statusText || `Erreur ${response.status}`,
      code: data.code || (typeof data.error === "object" ? data.error?.code : undefined)
    };
  } catch {
    return {
      message: response.statusText || `Erreur ${response.status}`
    };
  }
}
