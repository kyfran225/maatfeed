import { AudioTrackModel } from "../models/AudioTrack.js";
import { ContentModel } from "../models/Content.js";
import { env } from "../config/env.js";

const baseAudioKeywords = [
  "kemet music",
  "african spirituality music",
  "meditation africa",
  "ancient egypt sound",
  "african drums",
  "kemetic frequency",
  "afro philosophy audio"
];

const interestKeywordMap: Record<string, string[]> = {
  spirituality: ["maat meditation", "kemetic prayer", "african spirituality podcast"],
  culture: ["african heritage audio", "kemet culture podcast"],
  debate: ["kemet debate audio", "history debate podcast"],
  history: ["ancient egypt lecture audio", "nubian history audio"],
  philosophie: ["afro philosophy audio", "ma'at principles audio"],
  education: ["kemet education audio", "african science lecture"]
};

export function getDynamicAudioKeywords(interests: string[] = []) {
  const keywords = new Set(baseAudioKeywords);

  for (const interest of interests) {
    const mapped = interestKeywordMap[interest.toLowerCase()];
    mapped?.forEach((keyword) => keywords.add(keyword));
  }

  return Array.from(keywords);
}

export async function getAudioSourceBlueprint(interests: string[] = []) {
  const configuredFeeds = env.AUDIO_PODCAST_FEEDS
    .split(/[\r\n,]+/)
    .map((value) => value.trim())
    .filter(Boolean);
  const [publishedAudioCount, trackCount, contextLinkedCount] = await Promise.all([
    ContentModel.countDocuments({ mediaType: "audio", processingStatus: "published" }),
    AudioTrackModel.countDocuments({ isPublic: true }),
    AudioTrackModel.countDocuments({ isPublic: true, contextUrl: { $ne: null } })
  ]);

  return {
    keywords: getDynamicAudioKeywords(interests),
    providers: ["rss_audio", "direct_audio", "hybrid_context"],
    stats: {
      publishedAudioCount,
      curatedTrackCount: trackCount,
      configuredFeedCount: configuredFeeds.length,
      configuredDirectCount: env.AUDIO_DIRECT_MANIFEST_PATH || env.AUDIO_DIRECT_MANIFEST_URL ? 1 : 0,
      contextLinkedCount
    }
  };
}
