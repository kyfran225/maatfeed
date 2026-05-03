import mongoose from "mongoose";
import { createRequire } from "module";
import { ContentModel } from "../../apps/api/src/models/Content.js";
import { ContentScoreModel } from "../../apps/api/src/models/ContentScore.js";
import { ContentClassificationModel } from "../../apps/api/src/models/ContentClassification.js";
import { ContentEnrichmentModel } from "../../apps/api/src/models/ContentEnrichment.js";
import { CommentModel } from "../../apps/api/src/models/Comment.js";
import { ReplyModel } from "../../apps/api/src/models/Reply.js";
import { InteractionModel } from "../../apps/api/src/models/Interaction.js";
import { CommunityPostModel } from "../../apps/api/src/models/CommunityPost.js";
import { FeedSnapshotModel } from "../../apps/api/src/models/FeedSnapshot.js";
import { createRedisClient } from "../../apps/api/src/db/redis.js";
import { invalidateCacheKeys } from "../../apps/api/src/services/cacheService.js";
import { redisKeys } from "@maat/shared";

// Load environment variables from .env file
const require = createRequire(import.meta.url);
const dotenv = require("dotenv");
dotenv.config({ path: "../../apps/api/.env" });

// URL of the content to delete (CLI arg takes priority, then env var, then default)
const TARGET_URL = process.argv[2] || process.env.TARGET_URL || "https://m.youtube.com/watch?v=RJLfbuM4c-M";

async function deleteContentByUrl(url: string) {
  console.log(`🔍 Searching for content with URL: ${url}`);

  // Extract video ID from URL
  const videoIdMatch = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|m\.youtube\.com\/watch\?v=)([^&\n?#]+)/);
  const videoId = videoIdMatch ? videoIdMatch[1] : null;
  
  console.log(`🎥 Extracted video ID: ${videoId}`);

  // Try multiple search strategies
  let content = null;
  
  // 1. Exact URL match
  content = await ContentModel.findOne({
    $or: [
      { mediaUrl: url },
      { mediaUrl: url.replace("m.youtube.com", "youtube.com") },
      { mediaUrl: url.replace("youtube.com", "m.youtube.com") }
    ]
  });

  // 2. Search by video ID in mediaUrl
  if (!content && videoId) {
    content = await ContentModel.findOne({
      mediaUrl: { $regex: videoId, $options: 'i' }
    });
  }

  // 3. Search by video ID in any field
  if (!content && videoId) {
    content = await ContentModel.findOne({
      $or: [
        { mediaUrl: { $regex: videoId, $options: 'i' } },
        { title: { $regex: videoId, $options: 'i' } },
        { description: { $regex: videoId, $options: 'i' } }
      ]
    });
  }

  if (!content) {
    console.log(`❌ Content with URL "${url}" or video ID "${videoId}" not found`);
    
    // Show some sample content for debugging
    console.log(`\n📋 Sample YouTube content in database:`);
    const samples = await ContentModel.find({ 
      sourceProvider: "youtube", 
      mediaType: "video" 
    }).limit(5).select("mediaUrl title createdAt").lean();
    
    samples.forEach((sample, index) => {
      console.log(`  ${index + 1}. ${sample.title}`);
      console.log(`     URL: ${sample.mediaUrl}`);
      console.log(`     Created: ${sample.createdAt}`);
      console.log();
    });
    
    return false;
  }

  const contentId = content._id;
  console.log(`✅ Found content: ${contentId} (${content.title})`);
  console.log(`📹 Provider: ${content.sourceProvider}, Type: ${content.mediaType}`);
  console.log(`🗑️  Starting deletion of content and related data...\n`);

  const results: Record<string, number> = {};

  // 1. Delete Content Scores
  const scoreResult = await ContentScoreModel.deleteMany({ contentId });
  results["ContentScores"] = scoreResult.deletedCount || 0;
  console.log(`  Content Scores: ${scoreResult.deletedCount} deleted`);

  // 2. Delete Content Classifications
  const classificationResult = await ContentClassificationModel.deleteMany({ contentId });
  results["ContentClassifications"] = classificationResult.deletedCount || 0;
  console.log(`  Content Classifications: ${classificationResult.deletedCount} deleted`);

  // 3. Delete Content Enrichments
  const enrichmentResult = await ContentEnrichmentModel.deleteMany({ contentId });
  results["ContentEnrichments"] = enrichmentResult.deletedCount || 0;
  console.log(`  Content Enrichments: ${enrichmentResult.deletedCount} deleted`);

  // 4. Delete Comments
  const commentResult = await CommentModel.deleteMany({ contentId });
  results["Comments"] = commentResult.deletedCount || 0;
  console.log(`  Comments: ${commentResult.deletedCount} deleted`);

  // 5. Delete Replies (need to find comment IDs first)
  const comments = await CommentModel.find({ contentId }).select("_id");
  const commentIds = comments.map(c => c._id);
  const replyResult = await ReplyModel.deleteMany({ commentId: { $in: commentIds } });
  results["Replies"] = replyResult.deletedCount || 0;
  console.log(`  Replies: ${replyResult.deletedCount} deleted`);

  // 6. Delete Interactions
  const interactionResult = await InteractionModel.deleteMany({ contentId });
  results["Interactions"] = interactionResult.deletedCount || 0;
  console.log(`  Interactions: ${interactionResult.deletedCount} deleted`);

  // 7. Delete Community Posts
  const communityPostResult = await CommunityPostModel.deleteMany({ feedContentId: contentId });
  results["CommunityPosts"] = communityPostResult.deletedCount || 0;
  console.log(`  Community Posts: ${communityPostResult.deletedCount} deleted`);

  // 8. Remove from Feed Snapshots
  const snapshotResult = await FeedSnapshotModel.updateMany(
    { contentIds: contentId },
    { $pull: { contentIds: contentId } }
  );
  results["FeedSnapshotsUpdated"] = snapshotResult.modifiedCount || 0;
  console.log(`  Feed Snapshots: ${snapshotResult.modifiedCount} updated`);

  // 9. Finally, delete the Content itself
  const contentResult = await ContentModel.deleteOne({ _id: contentId });
  results["Content"] = contentResult.deletedCount || 0;
  console.log(`  Content: ${contentResult.deletedCount} deleted`);

  // Summary
  console.log(`\n📊 Deletion Summary:`);
  console.log(`====================`);
  const totalDeleted = Object.values(results).reduce((sum, count) => sum + count, 0);
  for (const [model, count] of Object.entries(results)) {
    if (count > 0) {
      console.log(`  ${model}: ${count}`);
    }
  }
  console.log(`\n✅ Content "${url}" and all associated data deleted successfully!`);
  console.log(`   Total records deleted/updated: ${totalDeleted}`);

  return true;
}

async function invalidateFeedCaches() {
  console.log(`\n🔄 Invalidating feed caches...`);
  
  try {
    const redisClient = createRedisClient();
    if (redisClient.status === "wait") {
      await redisClient.connect();
    }

    // Invalidate global feed cache
    await invalidateCacheKeys([redisKeys.globalFeed]);
    console.log(`✅ Feed caches invalidated`);

    if (redisClient.status === "ready") {
      await redisClient.quit();
    }
  } catch (err) {
    console.log(`⚠️  Cache invalidation failed (non-critical):`, (err as Error).message);
  }
}

async function main() {
  try {
    const mongoUri = process.env.MONGODB_URI || "mongodb://localhost:27017/maat-feed";

    console.log("🔗 Connecting to MongoDB...");
    await mongoose.connect(mongoUri);
    console.log("✅ Connected to MongoDB\n");

    const deleted = await deleteContentByUrl(TARGET_URL);

    if (deleted) {
      await invalidateFeedCaches();
    }

    await mongoose.disconnect();
    console.log("\n👋 Disconnected from database");

    process.exit(deleted ? 0 : 1);
  } catch (error) {
    console.error("❌ Error:", error);
    process.exit(1);
  }
}

main();
