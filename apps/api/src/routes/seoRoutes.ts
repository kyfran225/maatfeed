import { Router } from "express";
import { ContentModel } from "../models/Content.js";
import { CommunityPostModel } from "../models/CommunityPost.js";
import { AudioTrackModel } from "../models/AudioTrack.js";

const router = Router();

const BASE_URL = process.env.APP_BASE_URL || "https://www.maatfeed.com";

interface SitemapUrl {
  loc: string;
  lastmod?: string;
  changefreq?: "always" | "hourly" | "daily" | "weekly" | "monthly" | "yearly" | "never";
  priority?: number;
}

function generateSitemapXml(urls: SitemapUrl[]): string {
  const urlEntries = urls.map((url) => {
    const lastmod = url.lastmod ? `    <lastmod>${url.lastmod}</lastmod>\n` : "";
    const changefreq = url.changefreq ? `    <changefreq>${url.changefreq}</changefreq>\n` : "";
    const priority = url.priority !== undefined ? `    <priority>${url.priority.toFixed(1)}</priority>\n` : "";
    
    return `  <url>\n    <loc>${url.loc}</loc>\n${lastmod}${changefreq}${priority}  </url>`;
  }).join("\n");

  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urlEntries}\n</urlset>`;
}

function generateRobotsTxt(): string {
  return `User-agent: *
Allow: /

# Sitemap
Sitemap: ${BASE_URL}/api/sitemap.xml

# Disallow admin and private routes
Disallow: /admin/
Disallow: /api/
Disallow: /auth/
Disallow: /profile/settings/
Disallow: /notifications/

# Crawl-delay for bots
Crawl-delay: 1
`;
}

// Static pages with their priorities and change frequencies
const STATIC_PAGES: SitemapUrl[] = [
  { loc: `${BASE_URL}/`, changefreq: "daily", priority: 1.0 },
  { loc: `${BASE_URL}/explore`, changefreq: "daily", priority: 0.9 },
  { loc: `${BASE_URL}/community`, changefreq: "hourly", priority: 0.9 },
  { loc: `${BASE_URL}/audio`, changefreq: "daily", priority: 0.8 },
  { loc: `${BASE_URL}/sponsor`, changefreq: "weekly", priority: 0.6 },
  { loc: `${BASE_URL}/privacy`, changefreq: "monthly", priority: 0.4 },
  { loc: `${BASE_URL}/terms`, changefreq: "monthly", priority: 0.4 },
  { loc: `${BASE_URL}/legal`, changefreq: "monthly", priority: 0.4 },
];

// GET /api/sitemap.xml - Dynamic sitemap
router.get("/sitemap.xml", async (_req, res) => {
  try {
    const urls: SitemapUrl[] = [...STATIC_PAGES];

    // Add published content (last 1000 items)
    const contents = await ContentModel.find({
      processingStatus: "published",
      sourceProvider: { $in: ["youtube", "tiktok"] }
    })
      .sort({ publishedAt: -1 })
      .limit(1000)
      .select("_id publishedAt updatedAt")
      .lean();

    for (const content of contents) {
      urls.push({
        loc: `${BASE_URL}/content/${content._id.toString()}`,
        lastmod: (content.updatedAt || content.publishedAt).toISOString().split("T")[0],
        changefreq: "weekly",
        priority: 0.7
      });
    }

    // Add community posts (discussions, questions)
    const communityPosts = await CommunityPostModel.find({
      isHidden: false,
      type: { $in: ["discussion", "question"] }
    })
      .sort({ createdAt: -1 })
      .limit(500)
      .select("_id updatedAt createdAt")
      .lean();

    for (const post of communityPosts) {
      urls.push({
        loc: `${BASE_URL}/community/post/${post._id.toString()}`,
        lastmod: (post.updatedAt || post.createdAt).toISOString().split("T")[0],
        changefreq: "daily",
        priority: 0.6
      });
    }

    // Add audio tracks
    const audioTracks = await AudioTrackModel.find({ isPublic: true })
      .sort({ updatedAt: -1 })
      .limit(200)
      .select("_id updatedAt createdAt")
      .lean();

    for (const track of audioTracks) {
      urls.push({
        loc: `${BASE_URL}/audio/track/${track._id.toString()}`,
        lastmod: (track.updatedAt || track.createdAt).toISOString().split("T")[0],
        changefreq: "weekly",
        priority: 0.5
      });
    }

    const sitemapXml = generateSitemapXml(urls);

    res.setHeader("Content-Type", "application/xml");
    res.setHeader("Cache-Control", "public, max-age=3600"); // Cache 1 hour
    res.send(sitemapXml);
  } catch (error) {
    console.error("Sitemap generation error:", error);
    res.status(500).send("Error generating sitemap");
  }
});

// GET /api/robots.txt - Robots.txt
router.get("/robots.txt", (_req, res) => {
  const robotsTxt = generateRobotsTxt();
  
  res.setHeader("Content-Type", "text/plain");
  res.setHeader("Cache-Control", "public, max-age=86400"); // Cache 24 hours
  res.send(robotsTxt);
});

export { router as seoRouter };
