import { Router } from "express";
import { getContentMetaTags, getCommunityPostMetaTags, getDefaultMetaTags } from "../services/seoMetaService.js";

const router = Router();

// GET /api/meta/content/:contentId - Get meta tags for content
router.get("/content/:contentId", async (req, res) => {
  try {
    const { contentId } = req.params;
    const meta = await getContentMetaTags(contentId);
    
    if (!meta) {
      res.status(404).json({ error: "Content not found" });
      return;
    }
    
    res.json(meta);
  } catch (error) {
    console.error("Error fetching content meta:", error);
    res.status(500).json({ error: "Failed to fetch meta tags" });
  }
});

// GET /api/meta/community/:postId - Get meta tags for community post
router.get("/community/:postId", async (req, res) => {
  try {
    const { postId } = req.params;
    const meta = await getCommunityPostMetaTags(postId);
    
    if (!meta) {
      res.status(404).json({ error: "Post not found" });
      return;
    }
    
    res.json(meta);
  } catch (error) {
    console.error("Error fetching community post meta:", error);
    res.status(500).json({ error: "Failed to fetch meta tags" });
  }
});

// GET /api/meta/default - Get default meta tags
router.get("/default", async (req, res) => {
  const path = (req.query.path as string) || "/";
  const meta = getDefaultMetaTags(path);
  res.json(meta);
});

export { router as seoMetaRouter };
