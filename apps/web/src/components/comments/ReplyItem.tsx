import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { Reply } from "../../services/commentService";
import { InlineReplyInput } from "./InlineReplyInput";
import { fireAndForgetDiscussionAnalyticsEvent } from "../../services/communityAnalyticsService";

interface ReplyItemProps {
  reply: Reply;
  depth: number;
  maxDepth: number;
  contentId: string;
  onReply: (replyId: string) => void;
  onReplySubmit: (replyId: string, commentId: string, body: string, replyMode: "nested" | "flat") => void;
  onVote?: (replyId: string, direction: "up" | "down" | null) => void;
  onReport?: (commentId: string, reason: string) => void;
  activeReplyId?: string | null;
  onCancelReply: () => void;
  highlightedCommentId?: string | null;
  onDraftChange?: (value: string) => void;
}

export function ReplyItem({
  reply,
  depth,
  maxDepth,
  contentId,
  onReply,
  onReplySubmit,
  onVote,
  onReport,
  activeReplyId,
  onCancelReply,
  highlightedCommentId,
  onDraftChange,
}: ReplyItemProps) {
  const [userVote, setUserVote] = useState<"up" | "down" | null>(null);
  const [localScore, setLocalScore] = useState(reply.likeCount || 0);
  const [showActions, setShowActions] = useState(false);
  const [showReportConfirm, setShowReportConfirm] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleVote = useCallback((direction: "up" | "down") => {
    if (userVote === direction) {
      setUserVote(null);
      setLocalScore(prev => direction === "up" ? prev - 1 : prev + 1);
      onVote?.(reply.id, null);
    } else {
      const previousVote = userVote;
      setUserVote(direction);
      if (direction === "up") {
        setLocalScore(prev => previousVote === "down" ? prev + 2 : prev + 1);
      } else {
        setLocalScore(prev => previousVote === "up" ? prev - 2 : prev - 1);
      }
      onVote?.(reply.id, direction);
    }
  }, [userVote, reply.id, onVote]);

  const isHighlighted = highlightedCommentId === reply.id;
  const isReplying = activeReplyId === reply.id;
  const handleReplyButtonClick = useCallback(() => {
    if (isReplying) {
      onCancelReply();
      return;
    }

    fireAndForgetDiscussionAnalyticsEvent(contentId, "discussion_reply_opened", {
      surface: "debate_detail",
      targetType: "nested_reply",
      targetId: reply.id,
      parentCommentId: reply.commentId
    });
    onReply(reply.id);
  }, [contentId, isReplying, onCancelReply, onReply, reply.commentId, reply.id]);

  const handleShare = useCallback(() => {
    navigator.clipboard.writeText(`${window.location.origin}/debate/${contentId}#reply-${reply.id}`);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 2000);
  }, [contentId, reply.id]);

  const handleReport = useCallback(() => {
    if (!showReportConfirm) {
      setShowReportConfirm(true);
      window.setTimeout(() => setShowReportConfirm(false), 3000);
      return;
    }

    onReport?.(reply.id, "inappropriate");
    setShowReportConfirm(false);
  }, [onReport, reply.id, showReportConfirm]);

  return (
    <div id={`reply-${reply.id}`} className={`relative ${depth > 0 ? "ml-1.5 sm:ml-3" : ""}`}>
      {/* Thread line */}
      {depth > 0 && (
        <div 
          className="absolute -left-1.5 sm:-left-3 top-0 bottom-0 w-px bg-gradient-to-b from-sand/15 to-transparent"
          aria-hidden="true"
        />
      )}

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ 
          opacity: 1,
          scale: isHighlighted ? [1, 1.01, 1] : 1,
        }}
        transition={{ scale: { duration: 0.4 } }}
        className={`relative rounded-lg p-2.5 sm:p-3 mb-1 transition-all duration-200 ${
          isHighlighted
            ? "bg-gold/5 ring-1 ring-gold/30"
            : "bg-sand/5 hover:bg-sand/[0.07]"
        }`}
        onMouseEnter={() => setShowActions(true)}
        onMouseLeave={() => setShowActions(false)}
        onTouchStart={() => setShowActions(true)}
      >
        {/* Header */}
        <div className="flex items-center gap-2 mb-1.5">
          <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-full overflow-hidden bg-gold/10 flex-shrink-0">
            <img
              src={reply.authorAvatar || "/avatars/users/maat-avatar-homme-64.png"}
              alt={reply.authorName || "Utilisateur"}
              className="w-full h-full object-cover"
              onError={(e) => {
                e.currentTarget.src = "/avatars/users/maat-avatar-homme-64.png";
              }}
            />
          </div>
          <div className="flex items-center gap-2 min-w-0">
            <span className="font-medium text-sm text-white truncate">
              {reply.authorName || "Utilisateur"}
            </span>
            <span className="text-xs text-sand/50 flex-shrink-0">
              {formatTimeAgo(reply.createdAt)}
            </span>
          </div>
        </div>

        {/* Body */}
        <p className="text-sand/80 text-sm leading-relaxed mb-2 pl-7 sm:pl-8">
          {reply.body}
        </p>

        {/* Actions - visible on mobile, desktop on hover */}
        <div className={`pl-7 sm:pl-8 transition-opacity duration-200 ${
          showActions ? "opacity-100" : "opacity-100 sm:opacity-0"
        }`}>
          <div className="flex flex-nowrap items-center gap-1.5 overflow-x-auto pb-1">
            <div className="flex items-center bg-sand/5 rounded-lg">
              <button
                onClick={() => handleVote("up")}
                aria-label="Vote positif sur la réponse"
                className={`p-1.5 rounded-l-lg transition-colors ${
                  userVote === "up"
                    ? "text-ember bg-ember/10"
                    : "text-sand/50 hover:text-ember hover:bg-ember/5"
                }`}
              >
                <svg className="w-3.5 h-3.5" fill={userVote === "up" ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 15l7-7 7 7" />
                </svg>
              </button>
              <span className={`text-xs font-medium px-1 min-w-[1.5rem] text-center ${
                userVote === "up" ? "text-ember" : userVote === "down" ? "text-blue-400" : "text-sand/60"
              }`}>
                {localScore}
              </span>
              <button
                onClick={() => handleVote("down")}
                aria-label="Vote négatif sur la réponse"
                className={`p-1.5 rounded-r-lg transition-colors ${
                  userVote === "down"
                    ? "text-blue-400 bg-blue-400/10"
                    : "text-sand/50 hover:text-blue-400 hover:bg-blue-400/5"
                }`}
              >
                <svg className="w-3.5 h-3.5" fill={userVote === "down" ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                </svg>
              </button>
            </div>

            <button
              onClick={handleReplyButtonClick}
              aria-label={isReplying ? "Annuler la réponse" : "Répondre à cette réponse"}
              className={`inline-flex shrink-0 items-center gap-1 rounded-lg px-2 py-1.5 text-xs transition-colors ${
                isReplying
                  ? "text-gold bg-gold/10"
                  : "text-sand/55 hover:text-sand hover:bg-sand/5"
              }`}
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
              </svg>
              <span>{isReplying ? "Annuler" : "Répondre"}</span>
            </button>

            <button
              onClick={handleShare}
              aria-label="Copier le lien de la réponse"
              className="inline-flex shrink-0 items-center gap-1 rounded-lg px-2 py-1.5 text-xs text-sand/55 transition-colors hover:bg-sand/5 hover:text-sand"
            >
              {copied ? (
                <svg className="w-3.5 h-3.5 text-green-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              ) : (
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                </svg>
              )}
              <span className="hidden sm:inline">{copied ? "Copié" : "Lien"}</span>
            </button>

            <button
              onClick={handleReport}
              aria-label={showReportConfirm ? "Confirmer le signalement" : "Signaler la réponse"}
              className={`ml-auto shrink-0 rounded-lg p-1.5 transition-colors ${
                showReportConfirm
                  ? "bg-red-400/10 text-red-400"
                  : "text-sand/35 hover:text-red-400 hover:bg-red-400/5"
              }`}
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 5v14M5 5c5 0 5 2 10 2V3C10 3 10 1 5 1v4z" />
              </svg>
            </button>
          </div>
        </div>

        <AnimatePresence>
          {showReportConfirm && (
            <motion.div
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              className="mt-2 rounded-lg bg-red-400/5 px-2.5 py-2 text-[11px] text-red-300 ml-7 sm:ml-8"
            >
              Cliquez à nouveau pour confirmer le signalement
            </motion.div>
          )}
        </AnimatePresence>

        {/* Inline Reply Input */}
        <AnimatePresence>
          {isReplying && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-3 pl-7 sm:pl-8"
            >
              <InlineReplyInput
                placeholder={`Répondre à ${reply.authorName || "Utilisateur"}...`}
                onSubmit={(body) => onReplySubmit(reply.id, reply.commentId, body, "flat")}
                onCancel={onCancelReply}
                autoFocus
                onDraftChange={onDraftChange}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}

function formatTimeAgo(date: string | Date): string {
  const now = new Date();
  const then = new Date(date);
  const diffMs = now.getTime() - then.getTime();
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHours = Math.floor(diffMin / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffDays > 0) return `${diffDays}j`;
  if (diffHours > 0) return `${diffHours}h`;
  if (diffMin > 0) return `${diffMin}m`;
  return "maintenant";
}
