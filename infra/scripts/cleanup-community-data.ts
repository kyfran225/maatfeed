import mongoose from 'mongoose';
import { loadEnv } from '../../apps/api/src/bootstrap/loadEnv.js';
import { connectRedis, createRedisClient } from '../../apps/api/src/db/redis.js';

// Import all community-related models
import { CommunityPostModel } from '../../apps/api/src/models/CommunityPost.js';
import { DebateThreadModel } from '../../apps/api/src/models/DebateThread.js';
import { CommentModel } from '../../apps/api/src/models/Comment.js';
import { ReplyModel } from '../../apps/api/src/models/Reply.js';
import { CommentLikeModel } from '../../apps/api/src/models/CommentLike.js';
import { CommentReportModel } from '../../apps/api/src/models/CommentReport.js';

interface CleanupResult {
  model: string;
  deletedCount: number;
  error?: string;
}

async function cleanupCommunityData(): Promise<void> {
  const results: CleanupResult[] = [];

  try {
    // Load environment variables
    loadEnv();

    // Connect to MongoDB
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/maat-feed';
    await mongoose.connect(mongoUri);
    console.log('Connected to MongoDB');

    // Connect to Redis
    await connectRedis();
    const redis = createRedisClient();
    console.log('Connected to Redis');

    console.log('\n=== STARTING COMMUNITY DATA CLEANUP ===\n');

    // 1. Delete all Community Posts
    try {
      const communityPostsResult = await CommunityPostModel.deleteMany({});
      results.push({
        model: 'CommunityPost',
        deletedCount: communityPostsResult.deletedCount || 0
      });
      console.log(`Deleted ${communityPostsResult.deletedCount} community posts`);
    } catch (error) {
      results.push({
        model: 'CommunityPost',
        deletedCount: 0,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      console.error('Error deleting community posts:', error);
    }

    // 2. Delete all Debate Threads
    try {
      const debateThreadsResult = await DebateThreadModel.deleteMany({});
      results.push({
        model: 'DebateThread',
        deletedCount: debateThreadsResult.deletedCount || 0
      });
      console.log(`Deleted ${debateThreadsResult.deletedCount} debate threads`);
    } catch (error) {
      results.push({
        model: 'DebateThread',
        deletedCount: 0,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      console.error('Error deleting debate threads:', error);
    }

    // 3. Delete all Comment Likes (must be before comments/replies due to potential refs)
    try {
      const commentLikesResult = await CommentLikeModel.deleteMany({});
      results.push({
        model: 'CommentLike',
        deletedCount: commentLikesResult.deletedCount || 0
      });
      console.log(`Deleted ${commentLikesResult.deletedCount} comment likes`);
    } catch (error) {
      results.push({
        model: 'CommentLike',
        deletedCount: 0,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      console.error('Error deleting comment likes:', error);
    }

    // 4. Delete all Comment Reports (must be before comments/replies due to potential refs)
    try {
      const commentReportsResult = await CommentReportModel.deleteMany({});
      results.push({
        model: 'CommentReport',
        deletedCount: commentReportsResult.deletedCount || 0
      });
      console.log(`Deleted ${commentReportsResult.deletedCount} comment reports`);
    } catch (error) {
      results.push({
        model: 'CommentReport',
        deletedCount: 0,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      console.error('Error deleting comment reports:', error);
    }

    // 5. Delete all Replies
    try {
      const repliesResult = await ReplyModel.deleteMany({});
      results.push({
        model: 'Reply',
        deletedCount: repliesResult.deletedCount || 0
      });
      console.log(`Deleted ${repliesResult.deletedCount} replies`);
    } catch (error) {
      results.push({
        model: 'Reply',
        deletedCount: 0,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      console.error('Error deleting replies:', error);
    }

    // 6. Delete all Comments
    try {
      const commentsResult = await CommentModel.deleteMany({});
      results.push({
        model: 'Comment',
        deletedCount: commentsResult.deletedCount || 0
      });
      console.log(`Deleted ${commentsResult.deletedCount} comments`);
    } catch (error) {
      results.push({
        model: 'Comment',
        deletedCount: 0,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      console.error('Error deleting comments:', error);
    }

    // 7. Clear Redis cache keys related to community
    console.log('\n--- Clearing Redis Community Cache ---');
    try {
      // Get all keys matching community patterns
      const communityKeyPatterns = [
        'feed:community:*',
        'community:*',
        'debate:*',
        'comments:*',
        'thread:*'
      ];

      let totalDeletedKeys = 0;

      for (const pattern of communityKeyPatterns) {
        const keys = await redis.keys(pattern);
        if (keys.length > 0) {
          await redis.del(...keys);
          totalDeletedKeys += keys.length;
          console.log(`Deleted ${keys.length} Redis keys matching pattern: ${pattern}`);
        }
      }

      console.log(`Total Redis keys deleted: ${totalDeletedKeys}`);
    } catch (error) {
      console.error('Error clearing Redis cache:', error);
    }

    // Summary
    console.log('\n=== COMMUNITY DATA CLEANUP SUMMARY ===');
    console.log('----------------------------------------');
    let totalDeleted = 0;
    for (const result of results) {
      const status = result.error ? 'FAILED' : 'OK';
      console.log(`${result.model.padEnd(20)} | ${String(result.deletedCount).padStart(6)} deleted | ${status}`);
      if (result.error) {
        console.log(`  Error: ${result.error}`);
      }
      totalDeleted += result.deletedCount;
    }
    console.log('----------------------------------------');
    console.log(`Total documents deleted: ${totalDeleted}`);
    console.log('\nCommunity data cleanup completed successfully!');
    console.log('Database is now ready for testing with ZERO community data.');

  } catch (error) {
    console.error('Fatal error during cleanup:', error);
    process.exit(1);
  } finally {
    // Close connections
    await mongoose.disconnect();
    console.log('\nMongoDB connection closed');
    const redis = createRedisClient();
    if (redis) {
      await redis.quit();
      console.log('Redis connection closed');
    }
  }
}

// Run the cleanup
cleanupCommunityData().catch((error) => {
  console.error('Unhandled error:', error);
  process.exit(1);
});
