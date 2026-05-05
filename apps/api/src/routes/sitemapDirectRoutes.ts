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
  image?: {
    loc: string;
    title?: string;
    caption?: string;
  };
  alternate?: {
    hreflang: string;
    href: string;
  }[];
}

function generateSitemapXml(urls: SitemapUrl[]): string {
  const urlEntries = urls.map((url) => {
    let xml = `  <url>\n    <loc>${url.loc}</loc>\n`;
    
    if (url.lastmod) {
      xml += `    <lastmod>${url.lastmod}</lastmod>\n`;
    }
    if (url.changefreq) {
      xml += `    <changefreq>${url.changefreq}</changefreq>\n`;
    }
    if (url.priority !== undefined) {
      xml += `    <priority>${url.priority.toFixed(1)}</priority>\n`;
    }
    
    // Add alternate language links
    if (url.alternate && url.alternate.length > 0) {
      url.alternate.forEach(alt => {
        xml += `    <xhtml:link rel="alternate" hreflang="${alt.hreflang}" href="${alt.href}" />\n`;
      });
    }
    
    // Add image
    if (url.image) {
      xml += `    <image:image>\n`;
      xml += `      <image:loc>${url.image.loc}</image:loc>\n`;
      if (url.image.title) {
        xml += `      <image:title>${url.image.title}</image:title>\n`;
      }
      if (url.image.caption) {
        xml += `      <image:caption>${url.image.caption}</image:caption>\n`;
      }
      xml += `    </image:image>\n`;
    }
    
    xml += `  </url>`;
    return xml;
  }).join("\n");

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset 
  xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
  xmlns:xhtml="http://www.w3.org/1999/xhtml"
  xmlns:image="http://www.google.com/schemas/sitemap-image/1.1"
  xmlns:video="http://www.google.com/schemas/sitemap-video/1.1"
>
${urlEntries}
</urlset>`;
}

// Static pages with their priorities and change frequencies
const STATIC_PAGES: SitemapUrl[] = [
  {
    loc: `${BASE_URL}/`,
    changefreq: "hourly",
    priority: 1.0,
    image: {
      loc: `${BASE_URL}/og-image.png`,
      title: "MAATFEED - Le feed africain du savoir",
      caption: "Plateforme de débats et de découverte du savoir africain"
    },
    alternate: [
      { hreflang: "fr", href: `${BASE_URL}/` },
      { hreflang: "en", href: `${BASE_URL}/?lang=en` },
      { hreflang: "x-default", href: `${BASE_URL}/` }
    ]
  },
  {
    loc: `${BASE_URL}/explore`,
    changefreq: "hourly",
    priority: 0.9,
    alternate: [
      { hreflang: "fr", href: `${BASE_URL}/explore` },
      { hreflang: "en", href: `${BASE_URL}/explore?lang=en` }
    ]
  },
  {
    loc: `${BASE_URL}/community`,
    changefreq: "hourly",
    priority: 0.8,
    alternate: [
      { hreflang: "fr", href: `${BASE_URL}/community` },
      { hreflang: "en", href: `${BASE_URL}/community?lang=en` }
    ]
  },
  {
    loc: `${BASE_URL}/audio`,
    changefreq: "daily",
    priority: 0.7,
    alternate: [
      { hreflang: "fr", href: `${BASE_URL}/audio` },
      { hreflang: "en", href: `${BASE_URL}/audio` }
    ]
  }
];

// GET /sitemap.xml - Dynamic sitemap
router.get("/", async (_req, res) => {
  try {
    const urls: SitemapUrl[] = [...STATIC_PAGES];
    const currentDate = new Date().toISOString().split('T')[0];

    // Add published content (last 1000 items)
    const contents = await ContentModel.find({
      processingStatus: "published",
      sourceProvider: { $in: ["youtube", "tiktok"] }
    })
      .sort({ publishedAt: -1 })
      .limit(1000)
      .select("_id publishedAt updatedAt title description thumbnailUrl")
      .lean();

    for (const content of contents) {
      const lastmod = (content.updatedAt || content.publishedAt).toISOString().split('T')[0];
      urls.push({
        loc: `${BASE_URL}/content/${(content._id as any).toString()}`,
        lastmod,
        changefreq: "weekly",
        priority: 0.6,
        image: (content as any).thumbnailUrl ? {
          loc: (content as any).thumbnailUrl,
          title: (content as any).title || "Contenu MAATFEED",
          caption: (content as any).description || "Découvrez ce contenu sur MAATFEED"
        } : undefined
      });
    }

    // Add community posts (discussions, questions)
    const communityPosts = await CommunityPostModel.find({
      isHidden: false,
      type: { $in: ["discussion", "question"] }
    })
      .sort({ createdAt: -1 })
      .limit(500)
      .select("_id updatedAt createdAt title content")
      .lean();

    for (const post of communityPosts) {
      const lastmod = (post.updatedAt || post.createdAt).toISOString().split('T')[0];
      urls.push({
        loc: `${BASE_URL}/community/post/${(post._id as any).toString()}`,
        lastmod,
        changefreq: "daily",
        priority: 0.5
      });
    }

    // Add audio tracks
    const audioTracks = await AudioTrackModel.find({ isPublic: true })
      .sort({ updatedAt: -1 })
      .limit(200)
      .select("_id updatedAt createdAt title thumbnailUrl")
      .lean();

    for (const track of audioTracks) {
      const lastmod = (track.updatedAt || track.createdAt).toISOString().split('T')[0];
      urls.push({
        loc: `${BASE_URL}/audio/track/${(track._id as any).toString()}`,
        lastmod,
        changefreq: "weekly",
        priority: 0.4,
        image: (track as any).thumbnailUrl ? {
          loc: (track as any).thumbnailUrl,
          title: (track as any).title || "Piste Audio MAATFEED",
          caption: "Écoutez cette piste audio sur MAATFEED"
        } : undefined
      });
    }

    const sitemapXml = generateSitemapXml(urls);

    res.setHeader("Content-Type", "application/xml");
    res.setHeader("Cache-Control", "public, max-age=3600, s-maxage=3600"); // Cache 1 hour
    res.setHeader("Last-Modified", new Date().toUTCString());
    res.send(sitemapXml);
  } catch (error) {
    console.error("Sitemap generation error:", error);
    res.status(500).send("Error generating sitemap");
  }
});

export { router as sitemapDirectRouter };
