import { env } from "../config/env.js";
import { llmRateLimiter } from "./llmRateLimiter.js";

export type ChatMessage = {
  role: "system" | "user" | "assistant";
  content: string;
};

export async function chatComplete(input: {
  messages: ChatMessage[];
  temperature?: number;
  maxTokens?: number;
}): Promise<string> {
  if (!env.GROQ_API_KEY) {
    throw new Error("GROQ_API_KEY is not configured.");
  }

  // Estimate tokens: ~4 chars per token on average, plus overhead
  const totalChars = input.messages.reduce((sum, m) => sum + m.content.length, 0);
  const estimatedTokens = Math.ceil(totalChars / 4) + 200;

  // Wait for rate limit slot
  await llmRateLimiter.acquire(estimatedTokens);

  const baseUrl = env.GROQ_BASE_URL || "https://api.groq.com/openai/v1";
  const url = new URL(`${baseUrl.replace(/\/$/, "")}/chat/completions`);

  const response = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${env.GROQ_API_KEY}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      model: env.GROQ_MODEL || "llama3-8b-8192",
      messages: input.messages,
      temperature: input.temperature ?? 0.2,
      max_tokens: input.maxTokens ?? 700,
      response_format: { type: "json_object" }
    })
  });

  if (!response.ok) {
    const errorBody = await response.text().catch(() => "");
    throw new Error(`Groq chat completion failed with status ${response.status}.${errorBody ? ` Body: ${errorBody}` : ""}`);
  }

  const payload = (await response.json()) as {
    choices?: Array<{ message?: { content?: string } }>;
  };

  const content = payload.choices?.[0]?.message?.content;
  if (!content) {
    throw new Error("Groq chat completion returned empty content.");
  }

  return content;
}
