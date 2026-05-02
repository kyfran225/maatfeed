/**
 * Mass ingestion script - Populate database with content immediately
 * Usage: npm --workspace @maat/api run tsx infra/scripts/mass-ingest.ts
 */
import { ingestByKeyword } from "../../apps/api/src/services/contentIngestionService.js";
import { getAllThematicKeywords } from "../../apps/api/src/services/keywordRotationService.js";
import { logger } from "../../apps/api/src/config/logger.js";

const BATCH_SIZE = 3; // Keywords per batch
const DELAY_BETWEEN_BATCHES = 5000; // 5 seconds between batches to avoid rate limits

async function delay(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function massIngest() {
  const keywords = getAllThematicKeywords();
  logger.info({ totalKeywords: keywords.length }, "Starting mass ingestion");

  let totalPersisted = 0;
  let totalYouTube = 0;
  let totalTikTok = 0;

  // Process in batches
  for (let i = 0; i < keywords.length; i += BATCH_SIZE) {
    const batch = keywords.slice(i, i + BATCH_SIZE);
    logger.info(
      { batch: Math.floor(i / BATCH_SIZE) + 1, keywords: batch.map(k => k.keyword) },
      "Processing batch"
    );

    const results = await Promise.allSettled(
      batch.map(async (tk) => {
        try {
          return await ingestByKeyword({ keyword: tk.keyword, limitPerProvider: 15 });
        } catch (err) {
          logger.error({ err, keyword: tk.keyword }, "Ingestion failed for keyword");
          throw err;
        }
      })
    );

    for (const result of results) {
      if (result.status === "fulfilled") {
        totalPersisted += result.value.counts.persisted;
        totalYouTube += result.value.counts.youtube;
        totalTikTok += result.value.counts.tiktok;
      }
    }

    logger.info(
      { batchPersisted: results.filter(r => r.status === "fulfilled").length, totalPersisted },
      "Batch complete"
    );

    if (i + BATCH_SIZE < keywords.length) {
      await delay(DELAY_BETWEEN_BATCHES);
    }
  }

  logger.info(
    {
      totalPersisted,
      totalYouTube,
      totalTikTok,
      keywordsProcessed: keywords.length
    },
    "Mass ingestion complete"
  );

  return { totalPersisted, totalYouTube, totalTikTok };
}

massIngest()
  .then(result => {
    console.log("\n✅ Mass ingestion complete!");
    console.log(`   Total videos: ${result.totalPersisted}`);
    console.log(`   YouTube: ${result.totalYouTube}`);
    console.log(`   TikTok: ${result.totalTikTok}`);
    process.exit(0);
  })
  .catch(err => {
    console.error("\n❌ Mass ingestion failed:", err);
    process.exit(1);
  });
