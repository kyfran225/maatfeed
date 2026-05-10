import cors from "cors";
import express from "express";
import helmet from "helmet";
import pinoHttp from "pino-http";
import { env } from "./config/env.js";
import { logger } from "./config/logger.js";
import { errorHandler } from "./middleware/errorHandler.js";
import { notFoundHandler } from "./middleware/notFound.js";
import { apiRouter } from "./routes/index.js";
import { ContentModel } from "./models/Content.js";

const DEFAULT_ALLOWED_ORIGINS = env.NODE_ENV === "production"
  ? ["https://maatfeed.com", "https://www.maatfeed.com", "https://maatfeed.vercel.app", "https://maat-feed.vercel.app"]
  : ["http://localhost:5173", "http://127.0.0.1:5173"];

const CONFIGURED_ALLOWED_ORIGINS = env.CORS_ORIGIN
  .split(",")
  .map(origin => origin.trim())
  .filter(Boolean);

const ALLOWED_ORIGINS = Array.from(
  new Set([...DEFAULT_ALLOWED_ORIGINS, env.APP_BASE_URL, ...CONFIGURED_ALLOWED_ORIGINS].filter(Boolean))
);

function isAllowedOrigin(origin: string) {
  if (ALLOWED_ORIGINS.includes(origin)) {
    return true;
  }

  if (env.NODE_ENV === "development" || env.NODE_ENV === "test") {
    try {
      const { hostname, protocol } = new URL(origin);
      return (
        (protocol === "http:" || protocol === "https:") &&
        (hostname === "localhost" || hostname === "127.0.0.1")
      );
    } catch {
      return false;
    }
  }

  if (env.NODE_ENV === "staging") {
    try {
      const { hostname, protocol } = new URL(origin);
      return (
        protocol === "https:" &&
        /^maatfeed-[a-z0-9-]+-franck-s-projects-8e4e5822\.vercel\.app$/.test(hostname)
      );
    } catch {
      return false;
    }
  }

  return false;
}

export function createApp() {
  const app = express();

  // Security headers
  app.use(helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        imgSrc: ["'self'", "data:", "https:"],
        connectSrc: ["'self'", "https:"],
        fontSrc: ["'self'", "https:", "data:"],
        objectSrc: ["'none'"],
        upgradeInsecureRequests: []
      }
    },
    crossOriginEmbedderPolicy: false
  }));

  app.use(
    cors({
      origin: (origin, callback) => {
        // Allow requests with no origin (mobile apps, curl, etc.)
        if (!origin) return callback(null, true);
        if (isAllowedOrigin(origin)) return callback(null, true);
        callback(new Error("Not allowed by CORS"));
      },
      credentials: env.CORS_CREDENTIALS
    })
  );
  app.use(
    express.json({
      limit: "2mb",
      verify: (request, _response, buffer) => {
        (request as any).rawBody = buffer.toString();
      }
    })
  );
  app.use(pinoHttp({ logger }));

  // Direct sitemap route
  app.get("/sitemap.xml", async (_req, res) => {
    try {
      const BASE_URL = env.APP_BASE_URL || "https://maatfeed.com";
      
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

      function escapeXml(text: string): string {
        if (!text) return "";
        return text
          .replace(/&/g, "&amp;")
          .replace(/</g, "&lt;")
          .replace(/>/g, "&gt;")
          .replace(/\"/g, "&quot;")
          .replace(/'/g, "&apos;");
      }

      function generateSitemapXml(urls: SitemapUrl[]): string {
        const urlEntries = urls.map((url) => {
          let xml = `  <url>\n    <loc>${escapeXml(url.loc)}</loc>\n`;
          
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
              xml += `    <xhtml:link rel="alternate" hreflang="${escapeXml(alt.hreflang)}" href="${escapeXml(alt.href)}" />\n`;
            });
          }
          
          // Add image
          if (url.image) {
            xml += `    <image:image>\n`;
            xml += `      <image:loc>${escapeXml(url.image.loc)}</image:loc>\n`;
            if (url.image.title) {
              xml += `      <image:title>${escapeXml(url.image.title)}</image:title>\n`;
            }
            if (url.image.caption) {
              xml += `      <image:caption>${escapeXml(url.image.caption)}</image:caption>\n`;
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
          lastmod: new Date().toISOString().split('T')[0],
          changefreq: "hourly",
          priority: 1.0,
          image: {
            loc: `${BASE_URL}/og-image.webp`,
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
          lastmod: new Date().toISOString().split('T')[0],
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
        },
        {
          loc: `${BASE_URL}/savoirs-africains`,
          lastmod: new Date().toISOString().split('T')[0],
          changefreq: "weekly",
          priority: 0.9
        },
        {
          loc: `${BASE_URL}/spiritualite-africaine`,
          lastmod: new Date().toISOString().split('T')[0],
          changefreq: "weekly",
          priority: 0.9
        },
        {
          loc: `${BASE_URL}/philosophie-africaine`,
          lastmod: new Date().toISOString().split('T')[0],
          changefreq: "weekly",
          priority: 0.8
        },
        {
          loc: `${BASE_URL}/histoire-africaine`,
          lastmod: new Date().toISOString().split('T')[0],
          changefreq: "weekly",
          priority: 0.8
        },
        {
          loc: `${BASE_URL}/kemet`,
          lastmod: new Date().toISOString().split('T')[0],
          changefreq: "weekly",
          priority: 0.8
        }
      ];

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

      const sitemapXml = generateSitemapXml(urls);

      res.setHeader("Content-Type", "application/xml");
      res.setHeader("Cache-Control", "public, max-age=3600, s-maxage=3600");
      res.setHeader("Last-Modified", new Date().toUTCString());
      res.send(sitemapXml);
    } catch (error) {
      console.error("Sitemap generation error:", error);
      res.status(500).send("Error generating sitemap");
    }
  });

  app.use("/api", apiRouter);
  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}
