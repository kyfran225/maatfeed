import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { AICommentReplyResult, Comment, Reply, ReplyMutationAnalytics } from "../../services/commentService";
import { InlineReplyInput } from "./InlineReplyInput";
import { ReplyItem } from "./ReplyItem";
import { CommentActions } from "./CommentActions";
import { CommentHeader } from "./CommentHeader";
import type { ThreadedComment } from "./threading";
import { fireAndForgetDiscussionAnalyticsEvent } from "../../services/communityAnalyticsService";

interface CommentItemProps {
  comment: Comment;
  flatReplies?: ThreadedComment[];
  rootCommentId: string;
  contentId: string;
  contentCreatorId?: string | null;
  depth: number;
  maxDepth: number;
  onReply: (commentId: string) => void;
  onReplySubmit: (commentId: string, body: string, replyMode: "nested" | "flat", analytics?: ReplyMutationAnalytics) => void;
  onReplyToReplySubmit?: (
    replyId: string,
    commentId: string,
    body: string,
    replyMode: "nested" | "flat",
    analytics?: ReplyMutationAnalytics
  ) => void;
  onVote: (commentId: string, direction: "up" | "down" | null) => void;
  onAIReply?: (commentId: string) => Promise<AICommentReplyResult>;
  onReplyVote?: (replyId: string, direction: "up" | "down" | null) => void;
  onReport: (commentId: string, reason: string) => void;
  onReplyReport?: (replyId: string, reason: string) => void;
  onLoadMoreReplies?: (replyId: string) => Promise<Reply[]>;
  activeReplyTargetId: string | null;
  onCancelReply: () => void;
  onReplyDraftChange?: (value: string) => void;
  expandedCommentIds: Set<string>;
  onToggleExpand: (commentId: string) => void;
  onNavigateToMessage: (messageId: string, messageType?: "comment" | "reply" | null) => void;
  highlightedCommentId?: string | null;
}

// Maximum replies to show before "View more" button
const MAX_VISIBLE_REPLIES = 3;

export function CommentItem({
  comment,
  flatReplies = [],
  rootCommentId,
  contentId,
  contentCreatorId,
  depth,
  maxDepth,
  onReply,
  onReplySubmit,
  onReplyToReplySubmit,
  onVote,
  onAIReply,
  onReplyVote,
  onReport,
  onReplyReport,
  onLoadMoreReplies,
  activeReplyTargetId,
  onCancelReply,
  onReplyDraftChange,
  expandedCommentIds,
  onToggleExpand,
  onNavigateToMessage,
  highlightedCommentId,
}: CommentItemProps) {
  const [userVote, setUserVote] = useState<"up" | "down" | null>(null);
  const [localScore, setLocalScore] = useState(comment.likeCount || 0);
  const [showAllReplies, setShowAllReplies] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [replyingToReply, setReplyingToReply] = useState<string | null>(null);
  const [isAIReplying, setIsAIReplying] = useState(false);
  const [aiReplyFeedback, setAIReplyFeedback] = useState<string | null>(null);
  const [shareCopied, setShareCopied] = useState(false);
  const replyInputRef = useRef<HTMLDivElement>(null);
  const commentRef = useRef<HTMLDivElement>(null);

  const isAI = comment.aiGenerated;
  const isFlatReply = comment.replyMode === "flat";
  const isCreator = Boolean(contentCreatorId && comment.userId === contentCreatorId);
  const commentId = comment._id || comment.id;
  const parentCommentId = comment.inReplyToCommentId || commentId;
  const replyTargetCommentId = isFlatReply ? rootCommentId : commentId;
  const isReplying = activeReplyTargetId === commentId;
  const isExpanded = expandedCommentIds.has(commentId);
  const replyEntries = [
    ...flatReplies.map((replyThread) => ({
      id: replyThread.comment._id || replyThread.comment.id,
      createdAt: replyThread.comment.createdAt,
      type: "flat" as const,
      data: replyThread,
    })),
    ...(comment.replies || []).map((reply) => ({
      id: reply.id,
      createdAt: reply.createdAt,
      type: "nested" as const,
      data: reply,
    })),
  ].sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
  const hasReplies = replyEntries.length > 0;
  const visibleReplyCount = Math.max(comment.replyCount || 0, replyEntries.length);
  const visibleReplyEntries = showAllReplies
    ? replyEntries
    : replyEntries.slice(0, MAX_VISIBLE_REPLIES);
  const hiddenCount = replyEntries.length - MAX_VISIBLE_REPLIES;
  const hasAIFlatReply = flatReplies.some((replyThread) => replyThread.comment.aiGenerated);
  const canInviteAI = !isAI && !hasAIFlatReply && Boolean(onAIReply);

  // Handle vote
  const handleVote = useCallback((direction: "up" | "down") => {
    if (userVote === direction) {
      // Remove vote
      setUserVote(null);
      setLocalScore(prev => direction === "up" ? prev - 1 : prev + 1);
      onVote(comment._id || comment.id, null);
    } else {
      // Change vote
      const previousVote = userVote;
      setUserVote(direction);
      if (direction === "up") {
        setLocalScore(prev => previousVote === "down" ? prev + 2 : prev + 1);
      } else {
        setLocalScore(prev => previousVote === "up" ? prev - 2 : prev - 1);
      }
      onVote(comment._id || comment.id, direction);
    }
  }, [userVote, comment._id, comment.id, onVote]);

  // Handle reply submit
  const handleReplySubmit = useCallback((body: string, replyMode: "nested" | "flat") => {
    onReplySubmit(replyTargetCommentId, body, replyMode, {
      targetType: isFlatReply ? "flat_reply" : "comment",
      targetId: commentId,
      parentCommentId: rootCommentId,
      replyToCommentId: commentId
    });
  }, [commentId, isFlatReply, onReplySubmit, replyTargetCommentId, rootCommentId]);

  // Handle reply to reply
  const handleReplyToReply = useCallback((replyId: string) => {
    setReplyingToReply(replyId);
  }, []);

  // Handle reply to reply submit
  const handleReplyToReplySubmit = useCallback((
    replyId: string,
    replyCommentId: string,
    body: string,
    replyMode: "nested" | "flat"
  ) => {
    if (onReplyToReplySubmit) {
      onReplyToReplySubmit(replyId, replyCommentId, body, replyMode, {
        targetType: "nested_reply",
        targetId: replyId,
        parentCommentId: replyCommentId,
        replyToReplyId: replyId
      });
    }
    setReplyingToReply(null);
  }, [onReplyToReplySubmit]);

  const handleOpenReply = useCallback(() => {
    if (isReplying) {
      onCancelReply();
      return;
    }

    fireAndForgetDiscussionAnalyticsEvent(contentId, "discussion_reply_opened", {
      surface: "debate_detail",
      targetType: isFlatReply ? "flat_reply" : "comment",
      targetId: commentId,
      parentCommentId: rootCommentId
    });
    onReply(commentId);
  }, [commentId, contentId, isFlatReply, isReplying, onCancelReply, onReply, rootCommentId]);

  // Handle load more replies
  const handleLoadMoreReplies = useCallback(async () => {
    if (!hasReplies || hiddenCount <= 0) return;

    if (onLoadMoreReplies) {
      const lastVisibleNestedReply = [...(comment.replies || [])][MAX_VISIBLE_REPLIES - 1];
      if (lastVisibleNestedReply?.nestedReplyCount) {
        setIsLoadingMore(true);
        try {
          await onLoadMoreReplies(lastVisibleNestedReply.id);
        } finally {
          setIsLoadingMore(false);
        }
      }
    }
    setShowAllReplies(true);
  }, [hasReplies, hiddenCount, comment.replies, onLoadMoreReplies]);

  // Auto-scroll to reply input when opened
  useEffect(() => {
    if (isReplying && replyInputRef.current) {
      setTimeout(() => {
        replyInputRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
      }, 100);
    }
  }, [isReplying]);

  // Auto-scroll if highlighted
  useEffect(() => {
    if (highlightedCommentId === (comment._id || comment.id) && commentRef.current) {
      setTimeout(() => {
        commentRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
      }, 300);
    }
  }, [highlightedCommentId, comment._id, comment.id]);

  useEffect(() => {
    if (!aiReplyFeedback) {
      return;
    }

    const timeoutId = window.setTimeout(() => {
      setAIReplyFeedback(null);
    }, 5000);

    return () => window.clearTimeout(timeoutId);
  }, [aiReplyFeedback]);

  useEffect(() => {
    if (!shareCopied) {
      return;
    }

    const timeoutId = window.setTimeout(() => {
      setShareCopied(false);
    }, 2000);

    return () => window.clearTimeout(timeoutId);
  }, [shareCopied]);

  const handleAIReply = useCallback(async () => {
    if (!onAIReply || isAIReplying) {
      return;
    }

    setIsAIReplying(true);
    setAIReplyFeedback(null);

    try {
      const result = await onAIReply(commentId);
      if (result.responseGenerated) {
        setAIReplyFeedback("L'IA a rejoint cette discussion.");
      } else {
        setAIReplyFeedback(result.reason || "L'IA n'a pas jugé utile d'intervenir ici.");
      }
    } catch (error) {
      setAIReplyFeedback(error instanceof Error ? error.message : "Impossible de solliciter l'IA pour le moment.");
    } finally {
      setIsAIReplying(false);
    }
  }, [commentId, isAIReplying, onAIReply]);

  return (
    <div
      ref={commentRef}
      id={`comment-${commentId}`}
      className={`relative ${depth > 0 ? "ml-2 sm:ml-4" : ""} ${isFlatReply ? "ml-2 sm:ml-3" : ""}`}
    >
      {/* Thread line - only show for nested items */}
      {depth > 0 && (
        <div 
          className="absolute -left-2 sm:-left-4 top-0 bottom-0 w-px bg-gradient-to-b from-sand/20 via-sand/10 to-transparent"
          aria-hidden="true"
        />
      )}

      <article
        className={`relative rounded-xl transition-[background-color,border-color,box-shadow] duration-200 ${
          isAI
            ? "bg-gradient-to-r from-blue-950/20 to-cyan-950/10 border border-cyan-500/10 hover:border-cyan-500/20"
            : isFlatReply
              ? "bg-gold/[0.04] border border-gold/15 hover:border-gold/25 shadow-[inset_3px_0_0_rgba(212,175,55,0.45)]"
            : "bg-sand/5 border border-sand/10 hover:border-sand/20"
        } ${
          highlightedCommentId === (comment._id || comment.id)
            ? "ring-2 ring-gold/40 bg-gold/5"
            : ""
        }`}
      >
        {/* Comment Header */}
        <CommentHeader
          authorName={comment.authorName}
          authorAvatar={comment.aiPersonaAvatar || comment.authorAvatar}
          isAI={isAI}
          aiPersonaName={comment.aiPersonaName}
          isCreator={isCreator}
          createdAt={comment.createdAt}
          debateScore={comment.debateScore}
          qualityScore={comment.analysis?.qualityScore}
          isFlatReply={isFlatReply}
          replyTargetAuthorName={comment.replyTargetAuthorName || comment.parentAuthorName}
          onReplyTargetClick={
            comment.replyTargetId
              ? () => onNavigateToMessage(comment.replyTargetId!, comment.replyTargetType)
              : undefined
          }
          onShare={() => {
            const url = `${window.location.origin}/debate/${contentId}#comment-${commentId}`;
            navigator.clipboard.writeText(url);
            setShareCopied(true);
          }}
          shareCopied={shareCopied}
        />

        {/* Comment Body */}
        <div className="px-3 sm:px-4 pb-2">
          <p className="text-sand/90 text-sm leading-relaxed whitespace-pre-wrap">
            {comment.body}
          </p>
        </div>

        {/* Comment Actions */}
        <CommentActions
          score={localScore}
          userVote={userVote}
          replyCount={visibleReplyCount}
          onVote={handleVote}
          onReply={handleOpenReply}
          onAIReply={canInviteAI ? handleAIReply : undefined}
          onReport={() => onReport(commentId, "inappropriate")}
          isReplying={isReplying}
          showAIReply={canInviteAI}
          isAIReplying={isAIReplying}
          hasReplies={hasReplies && depth < maxDepth}
          isExpanded={isExpanded}
          onToggleReplies={() => onToggleExpand(commentId)}
          replyToggleLabel={`Voir les réponses (${visibleReplyCount})`}
        />

        <AnimatePresence>
          {aiReplyFeedback && (
            <motion.div
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              className="px-3 sm:px-4 pb-3"
            >
              <div className="rounded-lg border border-cyan-500/15 bg-cyan-500/5 px-3 py-2 text-xs text-cyan-100/85">
                {aiReplyFeedback}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Inline Reply Input */}
        <AnimatePresence>
          {isReplying && (
            <motion.div
              ref={replyInputRef}
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
              className="px-3 sm:px-4 pb-3"
            >
              <InlineReplyInput
                placeholder={
                  isFlatReply
                    ? `Répondre à ${comment.authorName || "Utilisateur"} dans le fil...`
                    : `Répondre à ${comment.authorName || "Utilisateur"}...`
                }
                onSubmit={(body) => handleReplySubmit(body, "flat")}
                onCancel={onCancelReply}
                autoFocus
                onDraftChange={onReplyDraftChange}
              />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Replies Section */}
        {hasReplies && depth < maxDepth && isExpanded && (
          <div id={`replies-${commentId}`} className="px-3 sm:px-4 pb-3">
              {visibleReplyEntries.map((entry) => (
                <div key={entry.id}>
                  {entry.type === "flat" ? (
                    <CommentItem
                      comment={entry.data.comment}
                      flatReplies={entry.data.flatReplies}
                      rootCommentId={rootCommentId}
                      contentId={contentId}
                      contentCreatorId={contentCreatorId}
                      depth={depth + 1}
                      maxDepth={maxDepth}
                      onReply={onReply}
                      onReplySubmit={onReplySubmit}
                      onReplyToReplySubmit={onReplyToReplySubmit}
                      onVote={onVote}
                      onAIReply={onAIReply}
                      onReplyVote={onReplyVote}
                      onReport={onReport}
                      onReplyReport={onReplyReport}
                      onLoadMoreReplies={onLoadMoreReplies}
                      activeReplyTargetId={activeReplyTargetId}
                      onCancelReply={onCancelReply}
                      expandedCommentIds={expandedCommentIds}
                      onToggleExpand={onToggleExpand}
                      onNavigateToMessage={onNavigateToMessage}
                      highlightedCommentId={highlightedCommentId}
                    />
                  ) : (
                    <ReplyItem
                      reply={entry.data}
                      depth={depth + 1}
                      maxDepth={maxDepth}
                      contentId={contentId}
                      onReply={handleReplyToReply}
                      onReplySubmit={handleReplyToReplySubmit}
                      onVote={onReplyVote}
                      onReport={onReplyReport}
                      activeReplyId={replyingToReply}
                      onCancelReply={() => setReplyingToReply(null)}
                      highlightedCommentId={highlightedCommentId}
                      onDraftChange={onReplyDraftChange}
                    />
                  )}
                </div>
              ))}

            {/* Show more button */}
            {hiddenCount > 0 && !showAllReplies && (
              <button
                onClick={handleLoadMoreReplies}
                disabled={isLoadingMore}
                className="mt-2 ml-6 sm:ml-7 flex items-center gap-2 text-xs text-sand/60 hover:text-sand transition-colors group"
              >
                <div className="w-6 h-px bg-sand/20 group-hover:bg-sand/40 transition-colors" />
                {isLoadingMore ? (
                  <>
                    <div className="w-3 h-3 border border-sand/30 border-t-sand rounded-full animate-spin" />
                    Chargement...
                  </>
                ) : (
                  <>
                    <span>Voir {hiddenCount} réponse{hiddenCount > 1 ? "s" : ""} supplémentaire{hiddenCount > 1 ? "s" : ""}</span>
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </>
                )}
              </button>
            )}

            {/* Continue thread button - for deep threads */}
            {depth >= maxDepth && hasReplies && (
              <button
                className="mt-3 flex items-center gap-2 px-4 py-2 text-xs font-medium text-gold bg-gold/5 hover:bg-gold/10 rounded-lg transition-colors border border-gold/20"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
                Continuer ce fil ({visibleReplyCount} réponses)
              </button>
            )}
          </div>
        )}
      </article>
    </div>
  );
}
