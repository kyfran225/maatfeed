/**
 * Content statistics service
 * Provides counts and stats about ingested content
 */
import { ContentModel } from "../models/Content.js";
import { logger } from "../config/logger.js";

export interface ContentStats {
  total: number;
  byProvider: {
    youtube: number;
    tiktok: number;
    internal: number;
  };
  byStatus: Record<string, number>;
  recent24h: number;
  recent7d: number;
}

export async function getContentStats(): Promise<ContentStats> {
  try {
    const now = new Date();
    const ago24h = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const ago7d = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    // Total count
    const total = await ContentModel.countDocuments();

    // By provider
    const [youtube, tiktok, internal] = await Promise.all([
      ContentModel.countDocuments({ sourceProvider: "youtube" }),
      ContentModel.countDocuments({ sourceProvider: "tiktok" }),
      ContentModel.countDocuments({ sourceProvider: "internal" }),
    ]);

    // By status
    const statusCounts = await ContentModel.aggregate([
      { $group: { _id: "$processingStatus", count: { $sum: 1 } } },
    ]);
    const byStatus: Record<string, number> = {};
    for (const s of statusCounts) {
      byStatus[s._id] = s.count;
    }

    // Recent content
    const recent24h = await ContentModel.countDocuments({
      publishedAt: { $gte: ago24h },
    });
    const recent7d = await ContentModel.countDocuments({
      publishedAt: { $gte: ago7d },
    });

    return {
      total,
      byProvider: { youtube, tiktok, internal },
      byStatus,
      recent24h,
      recent7d,
    };
  } catch (err) {
    logger.error({ err }, "Failed to get content stats");
    throw err;
  }
}
