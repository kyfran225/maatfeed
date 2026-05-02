import { llmRateLimiter } from "../ai/llmRateLimiter.js";
import { env } from "../config/env.js";
import { logger } from "../config/logger.js";

export type ProviderName = "gemini" | "groq" | "openrouter";

export interface AIRouterRequest {
  systemPrompt: string;
  userPrompt: string;
  complex?: boolean;
  fast?: boolean;
  temperature?: number;
  maxTokens?: number;
  jsonMode?: boolean;
  providers?: ProviderName[];
}

export interface AIRouterResponse {
  provider: ProviderName;
  text: string;
}

type GeminiModelDescriptor = {
  name?: string;
  supportedGenerationMethods?: string[];
  displayName?: string;
};

const GROQ_RETRYABLE_STATUS_CODES = new Set([429, 500, 502, 503, 504]);
const GEMINI_MODEL_CANDIDATE_HINTS = [
  "gemini-2.0-flash",
  "gemini-2.0-flash-lite",
  "gemini-1.5-flash",
  "gemini-1.5-pro"
];
const providerCooldownUntil = new Map<ProviderName, number>();

let resolvedGeminiModelName: string | null = null;
let geminiResolutionAttempted = false;

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function estimateRequestTokens(request: AIRouterRequest): number {
  const chars = request.systemPrompt.length + request.userPrompt.length;
  const estimatedInputTokens = Math.ceil(chars / 4);
  const estimatedOutputTokens = request.maxTokens ?? 400;
  return estimatedInputTokens + estimatedOutputTokens + 60;
}

function extractRetryAfterMs(errorBody: string): number | null {
  const match = errorBody.match(/try again in\s+([0-9.]+)s/i);
  if (!match) {
    return null;
  }

  const seconds = Number(match[1]);
  if (!Number.isFinite(seconds) || seconds <= 0) {
    return null;
  }

  return Math.ceil(seconds * 1000);
}

function getProviderCooldownMs(provider: ProviderName): number {
  return Math.max(0, (providerCooldownUntil.get(provider) ?? 0) - Date.now());
}

function ensureProviderAvailable(provider: ProviderName) {
  const cooldownMs = getProviderCooldownMs(provider);
  if (cooldownMs > 0) {
    throw new Error(`${provider} provider is on cooldown for ${cooldownMs}ms.`);
  }
}

function setProviderCooldown(provider: ProviderName, cooldownMs: number) {
  providerCooldownUntil.set(provider, Date.now() + cooldownMs);
}

function buildGeminiModelsBaseUrl(): string {
  return env.GEMINI_BASE_URL.replace(/\/$/, "").replace(/\/models$/, "");
}

function normalizeGeminiModelName(model: string): string {
  return model.replace(/^models\//, "").trim();
}

function buildGeminiGenerateUrl(model: string): string {
  const base = buildGeminiModelsBaseUrl();
  const normalizedModel = normalizeGeminiModelName(model);
  return `${base}/models/${encodeURIComponent(normalizedModel)}:generateContent?key=${encodeURIComponent(env.GEMINI_API_KEY)}`;
}

async function fetchGeminiModelCatalog(): Promise<GeminiModelDescriptor[]> {
  const response = await fetch(
    `${buildGeminiModelsBaseUrl()}/models?key=${encodeURIComponent(env.GEMINI_API_KEY)}`,
    {
      method: "GET"
    }
  );

  if (!response.ok) {
    const errorBody = await response.text().catch(() => "");
    throw new Error(
      `Gemini listModels failed with status ${response.status}.${errorBody ? ` Body: ${errorBody}` : ""}`
    );
  }

  const payload = (await response.json()) as { models?: GeminiModelDescriptor[] };
  return payload.models ?? [];
}

function chooseGeminiModel(models: GeminiModelDescriptor[]): string | null {
  const candidates = models.filter((model) =>
    Array.isArray(model.supportedGenerationMethods) &&
    model.supportedGenerationMethods.includes("generateContent") &&
    typeof model.name === "string"
  );

  for (const hint of GEMINI_MODEL_CANDIDATE_HINTS) {
    const match = candidates.find((model) => model.name?.includes(hint));
    if (match?.name) {
      return normalizeGeminiModelName(match.name);
    }
  }

  const fallback = candidates.find((model) => model.name?.includes("flash")) ?? candidates[0];
  return fallback?.name ? normalizeGeminiModelName(fallback.name) : null;
}

function isGeminiModelNotFoundError(status: number, body: string): boolean {
  return status === 404 && /not found|not supported/i.test(body);
}

async function resolveGeminiModelName(forceRefresh: boolean = false): Promise<string> {
  if (!env.GEMINI_API_KEY) {
    throw new Error("GEMINI_API_KEY is not configured.");
  }

  if (resolvedGeminiModelName && !forceRefresh) {
    return resolvedGeminiModelName;
  }

  if (!forceRefresh && geminiResolutionAttempted) {
    return normalizeGeminiModelName(env.GEMINI_MODEL);
  }

  geminiResolutionAttempted = true;

  try {
    const models = await fetchGeminiModelCatalog();
    const selected = chooseGeminiModel(models);
    if (selected) {
      resolvedGeminiModelName = selected;
      logger.info({ geminiModel: selected }, "Resolved Gemini model dynamically");
      return selected;
    }
  } catch (error) {
    logger.warn({ err: error }, "Failed to resolve Gemini model dynamically");
  }

  return normalizeGeminiModelName(env.GEMINI_MODEL);
}

async function callGroq(request: AIRouterRequest): Promise<string> {
  if (!env.GROQ_API_KEY) {
    throw new Error("GROQ_API_KEY is not configured.");
  }

  ensureProviderAvailable("groq");

  const estimatedTokens = estimateRequestTokens(request);

  for (let attempt = 0; attempt < 2; attempt += 1) {
    await llmRateLimiter.acquire(estimatedTokens);

    const response = await fetch(`${env.GROQ_BASE_URL.replace(/\/$/, "")}/chat/completions`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${env.GROQ_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: env.GROQ_MODEL,
        temperature: request.temperature ?? 0.5,
        max_tokens: request.maxTokens ?? 350,
        ...(request.jsonMode ? { response_format: { type: "json_object" } } : {}),
        messages: [
          { role: "system", content: request.systemPrompt },
          { role: "user", content: request.userPrompt }
        ]
      })
    });

    if (!response.ok) {
      const errorBody = await response.text().catch(() => "");
      if (GROQ_RETRYABLE_STATUS_CODES.has(response.status) && attempt === 0) {
        const retryAfterMs = extractRetryAfterMs(errorBody) ?? 2000;
        logger.warn(
          { status: response.status, retryAfterMs, model: env.GROQ_MODEL },
          "Groq request hit retryable limit, retrying once"
        );
        await delay(retryAfterMs);
        continue;
      }

      if (response.status === 429) {
        setProviderCooldown("groq", extractRetryAfterMs(errorBody) ?? 3000);
      }

      throw new Error(`Groq request failed with status ${response.status}.${errorBody ? ` Body: ${errorBody}` : ""}`);
    }

    const payload = (await response.json()) as { choices?: Array<{ message?: { content?: string } }> };
    const content = payload.choices?.[0]?.message?.content?.trim();

    if (!content) {
      throw new Error("Groq response was empty.");
    }

    return content;
  }

  throw new Error("Groq request exhausted retries.");
}

async function callGemini(request: AIRouterRequest): Promise<string> {
  if (!env.GEMINI_API_KEY) {
    throw new Error("GEMINI_API_KEY is not configured.");
  }

  ensureProviderAvailable("gemini");

  for (let attempt = 0; attempt < 2; attempt += 1) {
    const modelName = await resolveGeminiModelName(attempt > 0);
    const response = await fetch(buildGeminiGenerateUrl(modelName), {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        generationConfig: {
          temperature: request.temperature ?? 0.45,
          maxOutputTokens: request.maxTokens ?? 400,
          ...(request.jsonMode ? { responseMimeType: "application/json" } : {})
        },
        contents: [
          {
            role: "user",
            parts: [
              {
                text: `${request.systemPrompt}\n\n${request.userPrompt}`
              }
            ]
          }
        ]
      })
    });

    if (!response.ok) {
      const errorBody = await response.text().catch(() => "");
      if (attempt === 0 && isGeminiModelNotFoundError(response.status, errorBody)) {
        logger.warn({ configuredModel: env.GEMINI_MODEL, attemptedModel: modelName }, "Gemini model rejected, refreshing model catalog");
        resolvedGeminiModelName = null;
        continue;
      }

      if (response.status === 429) {
        const retryAfterMs = extractRetryAfterMs(errorBody) ?? 3000;
        const cooldownMs = /per day|limit:\s*0/i.test(errorBody) ? 30 * 60 * 1000 : retryAfterMs;
        setProviderCooldown("gemini", cooldownMs);
      }

      throw new Error(`Gemini request failed with status ${response.status}.${errorBody ? ` Body: ${errorBody}` : ""}`);
    }

    const payload = (await response.json()) as {
      candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }>;
    };
    const content = payload.candidates?.[0]?.content?.parts?.map((part) => part.text ?? "").join("").trim();

    if (!content) {
      throw new Error("Gemini response was empty.");
    }

    return content;
  }

  throw new Error("Gemini request exhausted retries.");
}

async function callOpenRouter(request: AIRouterRequest): Promise<string> {
  if (!env.OPENROUTER_API_KEY) {
    throw new Error("OPENROUTER_API_KEY is not configured.");
  }

  ensureProviderAvailable("openrouter");

  const response = await fetch(`${env.OPENROUTER_BASE_URL.replace(/\/$/, "")}/chat/completions`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${env.OPENROUTER_API_KEY}`,
      "Content-Type": "application/json",
      "HTTP-Referer": env.APP_BASE_URL,
      "X-Title": "MAAT Feed Community AI"
    },
    body: JSON.stringify({
      model: env.OPENROUTER_MODEL,
      temperature: request.temperature ?? 0.5,
      max_tokens: request.maxTokens ?? 400,
      ...(request.jsonMode ? { response_format: { type: "json_object" } } : {}),
      messages: [
        { role: "system", content: request.systemPrompt },
        { role: "user", content: request.userPrompt }
      ]
    })
  });

  if (!response.ok) {
    const errorBody = await response.text().catch(() => "");
    throw new Error(`OpenRouter request failed with status ${response.status}.${errorBody ? ` Body: ${errorBody}` : ""}`);
  }

  const payload = (await response.json()) as { choices?: Array<{ message?: { content?: string } }> };
  const content = payload.choices?.[0]?.message?.content?.trim();

  if (!content) {
    throw new Error("OpenRouter response was empty.");
  }

  return content;
}

export async function generateWithAIProvider(provider: ProviderName, request: AIRouterRequest): Promise<string> {
  return provider === "gemini"
    ? callGemini(request)
    : provider === "groq"
      ? callGroq(request)
      : callOpenRouter(request);
}

export async function generateWithAIRouter(request: AIRouterRequest): Promise<AIRouterResponse> {
  const orderedProviders: ProviderName[] = request.providers
    ? [...request.providers]
    : request.complex
      ? ["gemini", "groq", "openrouter"]
      : request.fast
        ? ["groq", "openrouter", "gemini"]
        : ["groq", "gemini", "openrouter"];

  const errors: string[] = [];

  for (const provider of orderedProviders) {
    try {
      const text = await generateWithAIProvider(provider, request);

      return {
        provider,
        text
      };
    } catch (error) {
      errors.push(`${provider}:${error instanceof Error ? error.message : String(error)}`);
    }
  }

  logger.warn({ errors }, "All AI providers failed.");

  throw new Error(errors.join(" | "));
}
