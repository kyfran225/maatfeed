import { Router } from "express";
import { adminRouter } from "./adminRoutes.js";
import { keywordAdminRouter } from "./keywordAdminRoutes.js";
import { authRouter } from "./authRoutes.js";
import feedRouter from "./feedRoutes.js";
import { healthRouter } from "./healthRoutes.js";
import { interactionRouter } from "./interactionRoutes.js";
import commentRouter from "./commentRoutes.js";
import audioRouter from "./audioRoutes.js";
import profileRouter from "./profileRoutes.js";
import communityRouter from "./communityRoutes.js";
import { communityPostRoutes } from "./communityPostRoutes.js";
import { trendRoutes } from "./trendRoutes.js";
import { failureRouter } from "./failureRoutes.js";
import { auditRouter } from "./auditRoutes.js";
import { embedRouter } from "./embedRoutes.js";
import { notificationRouter } from "./notificationRoutes.js";
import { searchRouter } from "./searchRoutes.js";
import { contentRouter } from "./contentRoutes.js";
import { participativeAIRoutes } from "./participativeAIRoutes.js";
import multiPersonalityAIRoutes from "./multiPersonalityAIRoutes.js";
import gdprRouter from "./gdpr.js";
import { paymentRouter } from "./paymentRoutes.js";
import { learningProgressRouter } from "./learningProgressRoutes.js";
import sponsorRouter from "./sponsorRoutes.js";
import { seoRouter } from "./seoRoutes.js";
import { seoMetaRouter } from "./seoMetaRoutes.js";
import { pushRouter } from "./pushRoutes.js";
import { analyticsDashboardRouter } from "./analyticsDashboardRoutes.js";
import { quizRouter } from "./quizRoutes.js";
<<<<<<< HEAD
=======
import { sitemapDirectRouter } from "./sitemapDirectRoutes.js";
>>>>>>> staging

export const apiRouter = Router();

apiRouter.use("/auth", authRouter);
apiRouter.use("/admin", adminRouter);
apiRouter.use("/admin/keywords", keywordAdminRouter);
apiRouter.use("/feed", feedRouter);
apiRouter.use("/interactions", interactionRouter);
apiRouter.use("/comments", commentRouter);
apiRouter.use("/audio", audioRouter);
apiRouter.use("/community", communityRouter);
apiRouter.use("/community/posts", communityPostRoutes);
apiRouter.use("/profile", profileRouter);
apiRouter.use("/notifications", notificationRouter);
apiRouter.use("/trends", trendRoutes);
apiRouter.use("/failures", failureRouter);
apiRouter.use("/audit", auditRouter);
apiRouter.use("/search", searchRouter);
apiRouter.use("/content", contentRouter);
apiRouter.use("/embed", embedRouter);
apiRouter.use("/ai", participativeAIRoutes);
apiRouter.use("/ai/v2", multiPersonalityAIRoutes);
apiRouter.use("/gdpr", gdprRouter);
apiRouter.use("/payments", paymentRouter);
apiRouter.use("/learning", learningProgressRouter);
apiRouter.use("/sponsors", sponsorRouter);
<<<<<<< HEAD
apiRouter.use("/sitemap.xml", seoRouter);
=======
apiRouter.use("/sitemap.xml", sitemapDirectRouter);
>>>>>>> staging
apiRouter.use("/robots.txt", seoRouter);
apiRouter.use("/meta", seoMetaRouter);
apiRouter.use("/push", pushRouter);
apiRouter.use("/analytics", analyticsDashboardRouter);
apiRouter.use("/quiz", quizRouter);
apiRouter.use("/", healthRouter);
