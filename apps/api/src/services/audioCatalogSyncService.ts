import crypto from "node:crypto";
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { z } from "zod";
import { env } from "../config/env.js";
import { logger } from "../config/logger.js";
import { AudioTrackModel } from "../models/AudioTrack.js";
import { ContentClassificationModel } from "../models/ContentClassification.js";
import { ContentEnrichmentModel } from "../models/ContentEnrichment.js";
import { ContentModel } from "../models/Content.js";
import { ContentScoreModel } from "../models/ContentScore.js";
import { PlaylistModel } from "../models/Playlist.js";
import { createRawContent } from "../repositories/contentRepository.js";

type AudioGenre = "kemet" | "spiritual" | "educational" | "debate" | "ambient";
type AudioContextType = "video" | "debate" | "article" | "reference";

interface CuratedFeedRule {
  match: string;
  maxItems?: number;
  includeKeywords?: string[];
  excludeKeywords?: string[];
  forcedGenre?: AudioGenre;
  additionalTags?: string[];
  contextQueryPrefix?: string;
  contextTitle?: string;
  contextType?: AudioContextType;
}

export interface SyncedAudioSource {
  externalId: string;
  title: string;
  artist: string;
  description: string;
  mediaUrl: string;
  duration: number;
  coverImageUrl?: string;
  tags: string[];
  genre: AudioGenre;
  sourceProvider: "rss" | "direct";
  canonicalUrl: string;
  publishedAt: Date;
  playCount?: number;
  language?: string;
  contextUrl?: string;
  contextTitle?: string;
  contextType?: AudioContextType;
}

const directManifestSchema = z.object({
  items: z.array(
    z.object({
      id: z.string().min(1),
      title: z.string().min(1),
      artist: z.string().min(1),
      description: z.string().default(""),
      mediaUrl: z.string().url(),
      duration: z.number().int().positive().optional(),
      coverImageUrl: z.string().url().optional(),
      tags: z.array(z.string()).default([]),
      genre: z.enum(["kemet", "spiritual", "educational", "debate", "ambient"]).default("kemet"),
      sourcePageUrl: z.string().url().optional(),
      contextUrl: z.string().url().optional(),
      contextTitle: z.string().optional(),
      contextType: z.enum(["video", "debate", "article", "reference"]).optional(),
      playCount: z.number().int().min(0).optional()
    })
  )
});

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../../../../");
const curatedFeedRules: CuratedFeedRule[] = [
  {
    match: "librivox.org/rss/10155",
    maxItems: 5,
    forcedGenre: "educational",
    additionalTags: ["ancient egypt", "kemet", "literature"],
    contextQueryPrefix: "ancient egypt tales",
    contextTitle: "Voir le contexte video",
    contextType: "video"
  },
  {
    match: "librivox.org/rss/12931",
    maxItems: 10,
    forcedGenre: "educational",
    additionalTags: ["herodotus", "egypt", "history"],
    contextQueryPrefix: "herodotus egypt",
    contextTitle: "Voir le contexte video",
    contextType: "video"
  },
  {
    match: "librivox.org/rss/12136",
    maxItems: 6,
    includeKeywords: ["egypt", "nile", "papyrus", "mummy", "pharaoh", "ahtka-ra", "hatatcha"],
    forcedGenre: "debate",
    additionalTags: ["egyptology", "fiction", "debate prompt"],
    contextQueryPrefix: "the last egyptian l frank baum",
    contextTitle: "Voir le contexte video",
    contextType: "video"
  },
  {
    match: "librivox.org/rss/12495",
    maxItems: 8,
    includeKeywords: ["pyramid", "giza", "seti", "abu simbel", "nubia", "obelisk", "thebes", "ammon"],
    forcedGenre: "educational",
    additionalTags: ["pyramids", "nubia", "archaeology"],
    contextQueryPrefix: "egypt and nubia archaeology",
    contextTitle: "Voir le contexte video",
    contextType: "video"
  },
  {
    match: "away-with-the-pharaohs",
    maxItems: 10,
    includeKeywords: ["egyptian", "pharaoh", "book of the dead", "gods", "goddesses", "temples", "afterlife", "ma'at", "pyramid"],
    additionalTags: ["ees", "ancient egypt", "kemet"],
    contextQueryPrefix: "Egypt Exploration Society",
    contextTitle: "Voir le contexte video",
    contextType: "video"
  },
  {
    match: "ottomanhistorypodcast/rev",
    maxItems: 6,
    includeKeywords: ["egypt", "nubia", "nasser", "cairo", "aswan", "egyptian labor corps"],
    forcedGenre: "debate",
    additionalTags: ["modern egypt", "history", "debate"],
    contextQueryPrefix: "modern egypt history",
    contextTitle: "Voir le contexte video",
    contextType: "video"
  }
];

function splitList(input: string) {
  return input
    .split(/[\r\n,]+/)
    .map((value) => value.trim())
    .filter(Boolean);
}

function getFeedRule(feedUrl: string) {
  return curatedFeedRules.find((rule) => feedUrl.includes(rule.match));
}

function decodeHtml(value: string) {
  return value
    .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, "$1")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, "\"")
    .replace(/&#39;/g, "'")
    .replace(/&apos;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">");
}

function stripHtml(value: string) {
  return decodeHtml(value).replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
}

function extractTagValue(xml: string, tagName: string) {
  const pattern = new RegExp(`<${tagName}(?:\\s+[^>]*)?>([\\s\\S]*?)</${tagName}>`, "i");
  return pattern.exec(xml)?.[1]?.trim() ?? "";
}

function extractTagValues(xml: string, tagName: string) {
  const pattern = new RegExp(`<${tagName}(?:\\s+[^>]*)?>([\\s\\S]*?)</${tagName}>`, "gi");
  return Array.from(xml.matchAll(pattern)).map((match) => stripHtml(match[1] ?? "")).filter(Boolean);
}

function extractAttribute(xml: string, tagName: string, attributeName: string) {
  const pattern = new RegExp(`<${tagName}\\b[^>]*\\b${attributeName}="([^"]+)"[^>]*>`, "i");
  return pattern.exec(xml)?.[1]?.trim() ?? "";
}

function hashSource(value: string) {
  return crypto.createHash("sha1").update(value).digest("hex").slice(0, 16);
}

function buildVideoSearchUrl(queryParts: Array<string | undefined>) {
  const query = queryParts
    .map((part) => (part ?? "").trim())
    .filter(Boolean)
    .join(" ");

  if (!query) {
    return undefined;
  }

  return `https://www.youtube.com/results?search_query=${encodeURIComponent(query)}`;
}

function parseDuration(value: string) {
  const trimmed = value.trim();
  if (!trimmed) {
    return 0;
  }

  if (/^\d+$/.test(trimmed)) {
    return Number(trimmed);
  }

  const parts = trimmed.split(":").map((part) => Number(part));
  if (parts.some((part) => Number.isNaN(part))) {
    return 0;
  }

  if (parts.length === 3) {
    return (parts[0] * 3600) + (parts[1] * 60) + parts[2];
  }

  if (parts.length === 2) {
    return (parts[0] * 60) + parts[1];
  }

  return 0;
}

function inferGenre(input: { title: string; description: string; tags: string[] }): AudioGenre {
  const haystack = `${input.title} ${input.description} ${input.tags.join(" ")}`.toLowerCase();

  if (/(debate|discussion|argument|controvers|question)/.test(haystack)) {
    return "debate";
  }

  if (/(meditation|breath|calm|relax)/.test(haystack)) {
    return "spiritual";
  }

  if (/(ambient|soundscape|drum|rhythm|percussion)/.test(haystack)) {
    return "ambient";
  }

  if (/(lecture|history|learn|chapter|papyri|science|philosophy|book)/.test(haystack)) {
    return "educational";
  }

  return "kemet";
}

function shouldKeepFeedItem(input: { title: string; description: string; tags: string[] }, rule?: CuratedFeedRule) {
  if (!rule) {
    return true;
  }

  const haystack = `${input.title} ${input.description} ${input.tags.join(" ")}`.toLowerCase();
  const includes = rule.includeKeywords?.some((keyword) => haystack.includes(keyword.toLowerCase())) ?? true;
  const excludes = rule.excludeKeywords?.some((keyword) => haystack.includes(keyword.toLowerCase())) ?? false;
  return includes && !excludes;
}

function buildSummary(description: string, title: string) {
  const compactDescription = stripHtml(description);
  const firstSentence = compactDescription.split(/[.!?]/)[0]?.trim();
  return firstSentence || `Capsule audio autour de ${title}.`;
}

function buildDebatePrompt(title: string, genre: AudioGenre) {
  if (genre === "debate" || genre === "educational") {
    return `Quel point merite d'etre creuse ou conteste dans "${title}" ?`;
  }

  return `Quel contexte historique, culturel ou spirituel enrichit l'ecoute de "${title}" ?`;
}

function computeBucket(genre: AudioGenre) {
  if (genre === "educational") {
    return "educational" as const;
  }

  if (genre === "debate") {
    return "deep" as const;
  }

  return "viral" as const;
}

function computeScore(item: SyncedAudioSource) {
  const baseEngagement = Math.min(300, item.playCount ?? 0);
  const durationWeight = item.duration <= 420 ? 18 : item.duration <= 1800 ? 12 : 9;
  const contextBoost = item.contextType === "video" ? 12 : item.contextUrl ? 7 : 0;
  return baseEngagement + durationWeight + contextBoost + Math.min(18, item.tags.length * 2);
}

async function fetchText(url: string) {
  const response = await fetch(url, {
    headers: {
      "user-agent": "MaatFeedAudioSync/1.0 (+https://maatfeed.local)"
    }
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch ${url}: ${response.status}`);
  }

  return response.text();
}

async function loadDirectManifestItems(): Promise<SyncedAudioSource[]> {
  const sources: SyncedAudioSource[] = [];
  const manifestPath = env.AUDIO_DIRECT_MANIFEST_PATH.trim();
  const manifestUrl = env.AUDIO_DIRECT_MANIFEST_URL.trim();
  const manifestPayloads: string[] = [];

  if (manifestPath) {
    const absolutePath = path.isAbsolute(manifestPath) ? manifestPath : path.resolve(repoRoot, manifestPath);
    try {
      manifestPayloads.push(await fs.readFile(absolutePath, "utf8"));
    } catch (error) {
      logger.warn({ error, absolutePath }, "Audio direct manifest path could not be read");
    }
  }

  if (manifestUrl) {
    try {
      manifestPayloads.push(await fetchText(manifestUrl));
    } catch (error) {
      logger.warn({ error, manifestUrl }, "Audio direct manifest URL could not be fetched");
    }
  }

  for (const payload of manifestPayloads) {
    const parsed = directManifestSchema.parse(JSON.parse(payload));
    for (const item of parsed.items) {
      sources.push({
        externalId: item.id,
        title: item.title,
        artist: item.artist,
        description: item.description,
        mediaUrl: item.mediaUrl,
        duration: item.duration ?? 180,
        coverImageUrl: item.coverImageUrl,
        tags: item.tags,
        genre: item.genre,
        sourceProvider: "direct",
        canonicalUrl: item.sourcePageUrl ?? item.mediaUrl,
        publishedAt: new Date(),
        playCount: item.playCount,
        contextUrl: item.contextUrl,
        contextTitle: item.contextTitle,
        contextType: item.contextType
      });
    }
  }

  return sources;
}

function normalizeRssItems(feedXml: string, feedUrl: string): SyncedAudioSource[] {
  const itemBlocks = Array.from(feedXml.matchAll(/<item\b[\s\S]*?<\/item>/gi)).map((match) => match[0]);
  const fallbackCoverImage = extractAttribute(feedXml, "itunes:image", "href");
  const feedTitle = stripHtml(extractTagValue(feedXml, "title")) || "Audio feed";
  const rule = getFeedRule(feedUrl);
  const items: SyncedAudioSource[] = [];

  for (const block of itemBlocks) {
    const enclosureUrl = extractAttribute(block, "enclosure", "url");
    if (!enclosureUrl) {
      continue;
    }

    const title = stripHtml(extractTagValue(block, "title"));
    const description = stripHtml(extractTagValue(block, "description"));
    const author =
      stripHtml(extractTagValue(block, "itunes:author")) ||
      stripHtml(extractTagValue(block, "author")) ||
      feedTitle;
    const duration = parseDuration(extractTagValue(block, "itunes:duration"));
    const guid = stripHtml(extractTagValue(block, "guid")) || enclosureUrl;
    const categories = extractTagValues(block, "category");
    const coverImageUrl = extractAttribute(block, "itunes:image", "href") || fallbackCoverImage || undefined;
    const publishedAtRaw = stripHtml(extractTagValue(block, "pubDate"));
    const publishedAt = publishedAtRaw ? new Date(publishedAtRaw) : new Date();
    const additionalTags = rule?.additionalTags ?? [];
    const combinedTags = Array.from(new Set([...(categories.length > 0 ? categories : [feedTitle.toLowerCase(), "podcast"]), ...additionalTags]));
    const genre = rule?.forcedGenre ?? inferGenre({ title, description, tags: combinedTags });
    const safeDescription = description || `Episode audio issu du flux ${feedTitle}.`;
    const contextUrl = buildVideoSearchUrl([
      rule?.contextQueryPrefix,
      title,
      author,
      "youtube"
    ]);

    if (!shouldKeepFeedItem({ title, description: safeDescription, tags: combinedTags }, rule)) {
      continue;
    }

    items.push({
      externalId: `rss:${hashSource(`${feedUrl}:${guid}`)}`,
      title,
      artist: author,
      description: safeDescription,
      mediaUrl: enclosureUrl,
      duration: duration || 900,
      coverImageUrl,
      tags: combinedTags,
      genre,
      sourceProvider: "rss",
      canonicalUrl: stripHtml(extractTagValue(block, "link")) || enclosureUrl,
      publishedAt: Number.isNaN(publishedAt.getTime()) ? new Date() : publishedAt,
      language: "en",
      contextUrl,
      contextTitle: rule?.contextTitle || "Voir le contexte video",
      contextType: rule?.contextType || "video"
    });
  }

  return rule?.maxItems ? items.slice(0, rule.maxItems) : items;
}

async function loadRssFeedItems(): Promise<SyncedAudioSource[]> {
  const feedUrls = splitList(env.AUDIO_PODCAST_FEEDS);
  if (feedUrls.length === 0) {
    return [];
  }

  const settled = await Promise.allSettled(
    feedUrls.map(async (feedUrl) => normalizeRssItems(await fetchText(feedUrl), feedUrl))
  );

  const items: SyncedAudioSource[] = [];
  for (const result of settled) {
    if (result.status === "fulfilled") {
      items.push(...result.value);
      continue;
    }

    logger.warn({ error: result.reason }, "Audio RSS feed sync failed");
  }

  return items;
}

async function syncTrackCatalog(item: SyncedAudioSource) {
  const content = await createRawContent({
    sourceProvider: "internal",
    externalId: item.externalId,
    canonicalUrl: item.canonicalUrl,
    mediaType: "audio",
    mediaUrl: item.mediaUrl,
    thumbnailUrl: item.coverImageUrl,
    title: item.title,
    description: item.description,
    creatorName: item.artist,
    tags: item.tags
  });

  await ContentModel.updateOne(
    { _id: content._id },
    {
      $set: {
        processingStatus: "published",
        publishedAt: item.publishedAt,
        duration: item.duration,
        language: item.language ?? "en"
      }
    }
  );

  await Promise.all([
    ContentClassificationModel.findOneAndUpdate(
      { contentId: content._id },
      {
        $set: {
          bucket: computeBucket(item.genre),
          debateScore: item.genre === "debate" ? 84 : item.genre === "educational" ? 65 : 28,
          emotionScore: item.genre === "spiritual" || item.genre === "ambient" ? 72 : 46,
          educationScore: item.genre === "educational" ? 90 : item.genre === "debate" ? 74 : 42,
          confidence: 0.82
        }
      },
      { upsert: true, new: true }
    ),
    ContentEnrichmentModel.findOneAndUpdate(
      { contentId: content._id },
      {
        $set: {
          summary: buildSummary(item.description, item.title),
          keyIdeas: item.tags.slice(0, 5),
          debatePrompt: buildDebatePrompt(item.title, item.genre),
          thematicTags: item.tags
        }
      },
      { upsert: true, new: true }
    ),
    ContentScoreModel.findOneAndUpdate(
      { contentId: content._id },
      {
        $set: {
          likes: Math.round((item.playCount ?? 0) * 0.08),
          comments: Math.round((item.playCount ?? 0) * 0.02),
          views: item.playCount ?? 0,
          debateScore: item.genre === "debate" ? 18 : item.genre === "educational" ? 10 : 4,
          recencyBoost: 8,
          finalScore: computeScore(item),
          scoreVersion: "audio-sync-v1"
        }
      },
      { upsert: true, new: true }
    )
  ]);

  const updatePayload: Record<string, unknown> = {
    title: item.title,
    artist: item.artist,
    description: item.description,
    mediaUrl: item.mediaUrl,
    duration: item.duration,
    coverImageUrl: item.coverImageUrl ?? null,
    tags: item.tags,
    genre: item.genre,
    contentId: content._id,
    isPublic: true,
    sourceProvider: item.sourceProvider,
    sourcePageUrl: item.canonicalUrl,
    externalSourceId: item.externalId,
    contextUrl: item.contextUrl ?? null,
    contextTitle: item.contextTitle ?? null,
    contextType: item.contextType ?? null
  };

  await AudioTrackModel.findOneAndUpdate(
    { externalSourceId: item.externalId },
    {
      $set: updatePayload,
      $setOnInsert: {
        ...(typeof item.playCount === "number" ? {} : { playCount: 0 })
      }
    },
    { upsert: true, new: true }
  );

  if (typeof item.playCount === "number") {
    await AudioTrackModel.updateOne(
      { externalSourceId: item.externalId },
      {
        $set: {
          playCount: item.playCount
        }
      }
    );
  }
}

async function upsertAutoPlaylist(name: string, description: string, trackIds: unknown[], tags: string[], generationConfig: Record<string, unknown>) {
  if (trackIds.length === 0) {
    return;
  }

  await PlaylistModel.create({
    name,
    description,
    trackIds,
    tags,
    generationConfig,
    userId: null,
    isPublic: true,
    isAutoGenerated: true
  });
}

async function retirePlaceholderTracks() {
  await AudioTrackModel.updateMany(
    {
      mediaUrl: /example\.com/i
    },
    {
      $set: {
        isPublic: false
      }
    }
  );
}

async function retireStaleSyncedTracks(activeExternalIds: string[]) {
  await AudioTrackModel.updateMany(
    {
      sourceProvider: { $in: ["rss", "direct"] },
      externalSourceId: {
        $nin: activeExternalIds
      }
    },
    {
      $set: {
        isPublic: false
      }
    }
  );
}

async function syncSystemPlaylists() {
  const playlistNames = [
    "Kemet Essentials",
    "Kemet Spiritual Mix",
    "Kemet Learning Hub",
    "Debat Audio Kemet",
    "Mode Immersion"
  ];
  const existingPlaylists = await PlaylistModel.find({
    name: { $in: playlistNames }
  });
  await PlaylistModel.deleteMany({
    _id: { $in: existingPlaylists.map((playlist) => playlist._id) }
  });

  const tracks = await AudioTrackModel.find({ isPublic: true, isDeleted: { $ne: true } }).sort({ playCount: -1, createdAt: -1 }).lean();
  const essentials = tracks.slice(0, 24).map((track) => track._id);
  const spiritual = tracks.filter((track) => track.genre === "spiritual").slice(0, 20).map((track) => track._id);
  const educational = tracks.filter((track) => track.genre === "educational").slice(0, 20).map((track) => track._id);
  const debate = tracks.filter((track) => track.genre === "debate").slice(0, 20).map((track) => track._id);
  const immersion = tracks.filter((track) => track.genre === "ambient" || track.genre === "spiritual").slice(0, 20).map((track) => track._id);

  await Promise.all([
    upsertAutoPlaylist(
      "Kemet Essentials",
      "Selection audio alignee sur les meilleures pistes publiques du moment.",
      essentials,
      ["essentials", "kemet", "audio"],
      { type: "system", section: "trending" }
    ),
    upsertAutoPlaylist(
      "Kemet Spiritual Mix",
      "Meditation, recentrage et respiration longue pour le mode immersion.",
      spiritual,
      ["spiritual", "meditation", "immersion"],
      { type: "system", section: "relax" }
    ),
    upsertAutoPlaylist(
      "Kemet Learning Hub",
      "Capsules, lectures et episodes pour apprendre pendant le scroll.",
      educational,
      ["education", "learn", "audio"],
      { type: "system", section: "learn" }
    ),
    upsertAutoPlaylist(
      "Debat Audio Kemet",
      "Pistes longues pour argumenter, comparer et ouvrir la discussion.",
      debate,
      ["debate", "discussion", "analysis"],
      { type: "system", section: "debate" }
    ),
    upsertAutoPlaylist(
      "Mode Immersion",
      "Ambiances, percussions et pistes lentes pour lire, travailler ou mediter.",
      immersion,
      ["immersion", "ambient", "focus"],
      { type: "system", section: "immersion" }
    )
  ]);
}

export async function syncConfiguredAudioSources() {
  await retirePlaceholderTracks();

  const [rssItems, directItems] = await Promise.all([loadRssFeedItems(), loadDirectManifestItems()]);
  const merged = [...directItems, ...rssItems];
  const deduped = new Map<string, SyncedAudioSource>();

  for (const item of merged) {
    if (!item.mediaUrl || !item.title) {
      continue;
    }

    deduped.set(item.externalId, item);
  }

  const items = Array.from(deduped.values());
  await retireStaleSyncedTracks(items.map((item) => item.externalId));

  for (const item of items) {
    await syncTrackCatalog(item);
  }

  await syncSystemPlaylists();

  logger.info(
    {
      syncedCount: items.length,
      rssCount: rssItems.length,
      directCount: directItems.length
    },
    "Audio catalog sync completed"
  );

  return {
    syncedCount: items.length,
    rssCount: rssItems.length,
    directCount: directItems.length
  };
}
