import { Router } from "express";
import { getTiktokEmbed, getYoutubeEmbed, proxyTiktokApi } from "../controllers/embedController.js";

const embedRouter = Router();

// TikTok embed proxy
embedRouter.get("/tiktok/:videoId", getTiktokEmbed);

// YouTube embed proxy  
embedRouter.get("/youtube/:videoId", getYoutubeEmbed);

// TikTok API proxy - handle all TikTok API requests
embedRouter.use("/tiktok-api", proxyTiktokApi);

export { embedRouter };
