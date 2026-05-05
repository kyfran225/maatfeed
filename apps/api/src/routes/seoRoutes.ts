import { Router } from "express";

const router = Router();

const BASE_URL = process.env.APP_BASE_URL || "https://www.maatfeed.com";

function generateRobotsTxt(): string {
  return `User-agent: *
Allow: /

# Sitemap
Sitemap: ${BASE_URL}/sitemap.xml
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

// Mounted at /api/robots.txt
router.get("/", (_req, res) => {
  const robotsTxt = generateRobotsTxt();

  res.setHeader("Content-Type", "text/plain");
  res.setHeader("Cache-Control", "public, max-age=86400");
  res.send(robotsTxt);
});

export { router as seoRouter };
