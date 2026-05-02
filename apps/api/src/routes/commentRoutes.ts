import { Router } from "express";
import {
  createCommentController,
  createReplyController,
  deleteCommentController,
  deleteReplyController,
  getCommentStatsController,
  likeCommentController,
  likeReplyController,
  listCommentsController,
  listNestedRepliesController,
  reportCommentController,
  reportReplyController,
  unlikeCommentController,
  unlikeReplyController,
  updateCommentController,
  updateReplyController
} from "../controllers/commentController.js";
import { optionalAuth, requireVerifiedEmail } from "../middleware/auth.js";
import { commentRateLimiter, editRateLimiter, likeRateLimiter, replyRateLimiter, reportRateLimiter } from "../middleware/rateLimiter.js";

const router = Router();

router.get("/:contentId", optionalAuth, listCommentsController);
router.get("/:contentId/stats", optionalAuth, getCommentStatsController);
router.post("/:contentId", requireVerifiedEmail, commentRateLimiter(), createCommentController);

router.post("/:commentId/replies", requireVerifiedEmail, replyRateLimiter(), createReplyController);
router.put("/:commentId", requireVerifiedEmail, editRateLimiter(), updateCommentController);
router.delete("/:commentId", requireVerifiedEmail, deleteCommentController);
router.post("/:commentId/like", requireVerifiedEmail, likeRateLimiter(), likeCommentController);
router.delete("/:commentId/like", requireVerifiedEmail, likeRateLimiter(), unlikeCommentController);
router.post("/:commentId/report", requireVerifiedEmail, reportRateLimiter(), reportCommentController);

router.get("/replies/:replyId/nested", optionalAuth, listNestedRepliesController);
router.put("/replies/:replyId", requireVerifiedEmail, editRateLimiter(), updateReplyController);
router.delete("/replies/:replyId", requireVerifiedEmail, deleteReplyController);
router.post("/replies/:replyId/like", requireVerifiedEmail, likeRateLimiter(), likeReplyController);
router.delete("/replies/:replyId/like", requireVerifiedEmail, likeRateLimiter(), unlikeReplyController);
router.post("/replies/:replyId/report", requireVerifiedEmail, reportRateLimiter(), reportReplyController);

export default router;
