import dotenv from "dotenv";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { z } from "zod";

const configDir = path.dirname(fileURLToPath(import.meta.url));
const repoRootEnvPath = path.resolve(configDir, "../../../../.env");
const loaded = dotenv.config({ path: repoRootEnvPath });

if (loaded.error) {
  dotenv.config();
}

function extractSenderEmail(value: string): string {
  const trimmed = value.trim();
  const formattedMatch = trimmed.match(/<\s*([^<>]+)\s*>$/);
  return formattedMatch ? formattedMatch[1].trim() : trimmed;
}

function isValidSender(value: string): boolean {
  return z.string().email().safeParse(extractSenderEmail(value)).success;
}

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production", "staging"]).default("development"),
  PORT: z.coerce.number().int().positive().default(4000),
  MONGODB_URI: z.string().min(1).default("mongodb://localhost:27017/maat_feed"),
  REDIS_URL: z.string().min(1).default("redis://localhost:6380"),
  JWT_ACCESS_SECRET: z.string().min(16).default("replace-with-a-long-random-secret"),
  JWT_REFRESH_SECRET: z.string().min(16).default("replace-with-another-long-random-secret"),
  // Email configuration (Resend)
  RESEND_API_KEY: z.string().optional().default(""),
  FROM_EMAIL: z
    .string()
    .trim()
    .min(1)
    .refine(isValidSender, "Invalid email address")
    .optional()
    .default("noreply@maatfeed.com"),
  // App URLs
  APP_BASE_URL: z.string().optional().default("http://localhost:5173"),
  API_BASE_URL: z.string().optional().default("http://localhost:4000"),
  // External APIs
  YOUTUBE_API_KEY: z.string().optional().default(""),
  YOUTUBE_API_BASE_URL: z.string().optional().default(""),
  TIKTOK_PROVIDER_BASE_URL: z.string().optional().default(""),
  APIFY_API_TOKEN: z.string().optional().default(""),
  GROQ_API_KEY: z.string().optional().default(""),
  GROQ_BASE_URL: z.string().optional().default("https://api.groq.com/openai/v1"),
  GROQ_MODEL: z.string().optional().default("llama-3.1-8b-instant"),
  GEMINI_API_KEY: z.string().optional().default(""),
  GEMINI_BASE_URL: z.string().optional().default("https://generativelanguage.googleapis.com/v1beta/models"),
  GEMINI_MODEL: z.string().optional().default("gemini-1.5-flash"),
  OPENROUTER_API_KEY: z.string().optional().default(""),
  OPENROUTER_BASE_URL: z.string().optional().default("https://openrouter.ai/api/v1"),
  OPENROUTER_MODEL: z.string().optional().default("openai/gpt-4o-mini"),
  AUDIO_PODCAST_FEEDS: z
    .string()
    .optional()
    .default(
      [
        "https://librivox.org/rss/10155?fullfeed=1",
        "https://librivox.org/rss/12931?fullfeed=1",
        "https://librivox.org/rss/12136?fullfeed=1",
        "https://librivox.org/rss/12495?fullfeed=1",
        "https://media.rss.com/away-with-the-pharaohs/feed.xml",
        "https://feeds.feedburner.com/ottomanhistorypodcast/rev"
      ].join(",")
    ),
  AUDIO_DIRECT_MANIFEST_URL: z.string().optional().default(""),
  AUDIO_DIRECT_MANIFEST_PATH: z.string().optional().default("infra/config/audio-public-sources.json"),
  // Web Push VAPID keys
  VAPID_PUBLIC_KEY: z.string().optional().default(""),
  VAPID_PRIVATE_KEY: z.string().optional().default(""),
  VAPID_SUBJECT: z.string().optional().default("mailto:noreply@maatfeed.com"),
  // Payments. Use an aggregator first; direct operator APIs can be added behind the same routes later.
  PAYMENT_PROVIDER: z
    .enum(["manual", "paydunya", "fedapay", "flutterwave", "cinetpay", "simiz"])
    .default("manual"),
  PAYMENT_SUCCESS_URL: z.string().url().default("http://localhost:5173/profile"),
  PAYMENT_CANCEL_URL: z.string().url().default("http://localhost:5173/profile"),
  PAYDUNYA_MASTER_KEY: z.string().optional().default(""),
  PAYDUNYA_PRIVATE_KEY: z.string().optional().default(""),
  PAYDUNYA_PUBLIC_KEY: z.string().optional().default(""),
  PAYDUNYA_TOKEN: z.string().optional().default(""),
  FEDAPAY_SECRET_KEY: z.string().optional().default(""),
  FLUTTERWAVE_SECRET_KEY: z.string().optional().default(""),
  CINETPAY_API_KEY: z.string().optional().default(""),
  CINETPAY_SITE_ID: z.string().optional().default(""),
  SIMIZ_API_KEY: z.string().optional().default(""),
  // Cloudinary configuration
  CLOUDINARY_CLOUD_NAME: z.string().optional().default(""),
  CLOUDINARY_API_KEY: z.string().optional().default(""),
  CLOUDINARY_API_SECRET: z.string().optional().default("")
});

export const env = envSchema.parse(process.env);
