import { useState, useEffect, useRef, useCallback } from "react";
import { useParams, Link, useNavigate, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useQueryClient } from "@tanstack/react-query";
import { SEO } from "../components/SEO";
import {
  useComments,
  useCreateComment,
  useCreateReply,
  useDebate,
  useAIPersonalities,
  useDebateStats,
  useDiscussionAnalyticsSummary,
  useAISummary,
  useLikeComment,
  useUnlikeComment,
  useLikeReply,
  useUnlikeReply,
  useReportComment,
  useReportReply,
} from "../hooks/useComments";
import { useDiscussionTyping } from "../hooks/useDiscussionTyping";
import { useAuth } from "../hooks/useAuth";
import { useLayout } from "../contexts/LayoutContext";
import { TopDebate, createDebateThread, getTopDebates } from "../services/communityService";
import {
  Comment,
  Reply,
  ReplyMutationAnalytics,
  checkAICommentReply,
  requestAICommentReply,
  routeAICommentPersonality,
  type AIInteractionContext
} from "../services/commentService";
import { contentService, ContentItem } from "../services/contentService";
import { SkeletonLoader } from "../components/motion/SkeletonLoader";
import { ErrorState } from "../components/motion/ErrorState";
import { TouchFeedback } from "../components/motion/TouchFeedback";
import { CommentThread } from "../components/comments/CommentThread";

// ==================== TYPES ====================

type TabType = "discussion" | "summary" | "stats";
type HashTargetType = "comment" | "reply";

interface AITypingState {
  targetCommentId: string;
  speaker: string;
  message: string;
  startedAt: number;
}

const AI_TYPING_MIN_VISIBLE_MS = 1600;
const AI_TYPING_MAX_VISIBLE_MS = 18000;

// ==================== UTILS ====================

function formatTimeAgo(date: string | Date): string {
  const now = new Date();
  const then = new Date(date);
  const diffMs = now.getTime() - then.getTime();
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHours = Math.floor(diffMin / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffDays > 0) return `Il y a ${diffDays} jour${diffDays > 1 ? "s" : ""}`;
  if (diffHours > 0) return `Il y a ${diffHours} heure${diffHours > 1 ? "s" : ""}`;
  if (diffMin > 0) return `Il y a ${diffMin} min`;
  return "À l'instant";
}

function parseDiscussionHash(hash: string): { id: string; type: HashTargetType } | null {
  const normalizedHash = hash.replace(/^#/, "");
  if (!normalizedHash) {
    return null;
  }

  if (normalizedHash.startsWith("comment-")) {
    return { id: normalizedHash.slice("comment-".length), type: "comment" };
  }

  if (normalizedHash.startsWith("reply-")) {
    return { id: normalizedHash.slice("reply-".length), type: "reply" };
  }

  return null;
}

function resolveAvatarUrl(url: string | undefined): string | undefined {
  if (!url) return undefined;
  if (url.startsWith("http") || url.startsWith("data:")) return url;
  if (url.startsWith("/")) return `${window.location.origin}${url}`;
  return url;
}

// ==================== COMPONENTS ====================

// --- Debate Header ---
interface DebateHeaderProps {
  debate: {
    id: string;
    contentId: string;
    title: string;
    description: string;
    debateScore: number;
    participantCount: number;
    tags: string[];
    createdAt: string;
    imageUrl?: string;
    likes?: number;
    isFollowing?: boolean;
  };
  commentCount: number;
  onFollowToggle: () => void;
}

function DebateHeader({ debate, commentCount, onFollowToggle }: DebateHeaderProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-sand/10 to-sand/5 border border-sand/20"
    >
      {/* Cover Image */}
      <div className="relative h-48 sm:h-64 overflow-hidden">
        <img
          src={debate.imageUrl || "/maat-avatar/Calque 4.png"}
          alt={debate.title}
          className="w-full h-full object-cover"
          onError={(e) => {
            e.currentTarget.src = "/maat-avatar/Calque 4.png";
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/50 to-transparent" />
        
        {/* Category Badge */}
        {debate.tags[0] && (
          <div className="absolute top-4 left-4">
            <span className="px-3 py-1.5 bg-purple-500/30 backdrop-blur-sm border border-purple-400/30 rounded-full text-xs font-medium text-purple-200">
              {debate.tags[0]}
            </span>
          </div>
        )}

        {/* Follow Button */}
        <div className="absolute top-4 right-4">
          <button
            onClick={onFollowToggle}
            className={`px-4 py-2 rounded-full font-medium text-sm transition-all ${
              debate.isFollowing
                ? "bg-sand/20 text-sand border border-sand/30"
                : "bg-gold text-ink hover:bg-gold/90"
            }`}
          >
            {debate.isFollowing ? "Suivi" : "+ Suivre"}
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 sm:p-6 -mt-16 relative">
        <h1 className="text-xl sm:text-2xl font-bold text-white leading-tight mb-3">
          {debate.title}
        </h1>

        {/* Stats */}
        <div className="flex items-center gap-4 text-sm text-sand/70 mb-4">
          <div className="flex items-center gap-1.5">
            <svg className="w-4 h-4 text-ember" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
            </svg>
            <span>{debate.likes || debate.debateScore}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <svg className="w-4 h-4 text-sand/60" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
            <span>{commentCount}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <svg className="w-4 h-4 text-sand/60" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>{formatTimeAgo(debate.createdAt)}</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

// --- Tabs Component ---
interface DebateTabsProps {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
  commentCount: number;
}

function DebateTabs({ activeTab, onTabChange, commentCount }: DebateTabsProps) {
  const tabs: { id: TabType; label: string; icon?: React.ReactNode }[] = [
    { id: "discussion", label: "Discussion" },
    { 
      id: "summary", 
      label: "Résumé IA",
      icon: (
        <svg className="w-3.5 h-3.5 ml-1" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
        </svg>
      )
    },
    { id: "stats", label: "Statistiques" },
  ];

  return (
    <div className="border-b border-sand/20">
      <div className="flex">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={`relative flex items-center gap-1 px-4 py-3 text-sm font-medium transition-colors ${
              activeTab === tab.id
                ? "text-gold"
                : "text-sand/60 hover:text-sand/80"
            }`}
          >
            {tab.label}
            {tab.icon}
            {tab.id === "discussion" && (
              <span className="ml-1.5 px-1.5 py-0.5 bg-sand/20 rounded-full text-xs">
                {commentCount}
              </span>
            )}
            {activeTab === tab.id && (
              <motion.div
                layoutId="activeTab"
                className="absolute bottom-0 left-0 right-0 h-0.5 bg-gold"
              />
            )}
          </button>
        ))}
      </div>
    </div>
  );
}

// --- Comment Item ---
interface CommentItemProps {
  comment: Comment;
  depth?: number;
  contentId: string;
  onReply: (commentId: string) => void;
  replyingTo: string | null;
  onReplySubmit: (commentId: string, body: string) => void;
  onReplyCancel: () => void;
}

function CommentItem({
  comment,
  depth = 0,
  contentId,
  onReply,
  replyingTo,
  onReplySubmit,
  onReplyCancel,
}: CommentItemProps) {
  const [isExpanded, setIsExpanded] = useState(true);
  const [replyText, setReplyText] = useState("");
  const [hasLiked, setHasLiked] = useState(false);
  const [localLikeCount, setLocalLikeCount] = useState(comment.likeCount || 0);
  const [showReportModal, setShowReportModal] = useState(false);
  const likeMutation = useLikeComment(contentId);
  const unlikeMutation = useUnlikeComment(contentId);
  const reportMutation = useReportComment();

  const isAI = comment.aiGenerated;
  const isReplying = replyingTo === (comment._id || comment.id);
  const maxDepth = 3;
  const canNest = depth < maxDepth;

  const handleLike = async () => {
    try {
      if (hasLiked) {
        await unlikeMutation.mutateAsync(comment._id || comment.id);
        setLocalLikeCount((prev: number) => Math.max(0, prev - 1));
      } else {
        await likeMutation.mutateAsync(comment._id || comment.id);
        setLocalLikeCount((prev: number) => prev + 1);
      }
      setHasLiked(!hasLiked);
    } catch (error) {
      console.error("Failed to toggle like:", error);
    }
  };

  const handleReplySubmit = () => {
    if (replyText.trim()) {
      onReplySubmit(comment._id || comment.id, replyText);
      setReplyText("");
    }
  };

  const handleReport = async (reason: string) => {
    try {
      await reportMutation.mutateAsync({
        commentId: comment._id || comment.id,
        reason: reason as any,
      });
      setShowReportModal(false);
    } catch (error) {
      console.error("Failed to report:", error);
    }
  };

  return (
    <div className={`relative ${depth > 0 ? "ml-4 sm:ml-8" : ""}`}>
      {/* Thread Line */}
      {depth > 0 && (
        <div className="absolute -left-4 sm:-left-8 top-0 bottom-0 w-px bg-gradient-to-b from-sand/30 to-transparent" />
      )}

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className={`relative rounded-xl p-3 sm:p-4 mb-3 ${
          isAI
            ? "bg-gradient-to-r from-blue-950/30 to-cyan-950/20 border border-cyan-500/20"
            : "bg-sand/5 border border-sand/10"
        }`}
      >
        {/* Header */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-2.5">
            {/* Avatar */}
            <div className={`relative w-9 h-9 sm:w-10 sm:h-10 rounded-full overflow-hidden flex-shrink-0 ${
              isAI ? "ring-2 ring-cyan-500/30" : ""
            }`}>
              <img
                src={resolveAvatarUrl(comment.aiPersonaAvatar || comment.authorAvatar) || "/avatars/users/maat-avatar-homme-64.png"}
                alt={comment.aiPersonaName || comment.authorName || "User"}
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.currentTarget.src = "/avatars/users/maat-avatar-homme-64.png";
                }}
              />
              {isAI && (
                <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 rounded-full border-2 border-ink" />
              )}
            </div>

            {/* Name & Info */}
            <div>
              <div className="flex items-center gap-2">
                <span className={`font-medium text-sm ${isAI ? "text-cyan-300" : "text-white"}`}>
                  {comment.aiPersonaName || comment.authorName || "Utilisateur"}
                </span>
                {isAI && (
                  <span className="px-1.5 py-0.5 bg-blue-500/20 rounded text-[10px] font-medium text-blue-300">
                    IA
                  </span>
                )}
                {!isAI && comment.debateScore > 10 && (
                  <span className="px-1.5 py-0.5 bg-teal-500/20 rounded text-[10px] font-medium text-teal-300">
                    Contributeur
                  </span>
                )}
              </div>
              <span className="text-xs text-sand/50">
                {formatTimeAgo(comment.createdAt)}
              </span>
            </div>
          </div>

          {/* AI Badge */}
          {isAI && (
            <span className="text-xs text-cyan-400/70">
              {comment.aiPersonaName?.includes("Sage") ? "IA Sage" : "IA Expert"}
            </span>
          )}
        </div>

        {/* Body */}
        <p className="text-sand/90 text-sm leading-relaxed mb-3 whitespace-pre-wrap">
          {comment.body}
        </p>

        {/* Actions */}
        <div className="flex items-center gap-4">
          {/* Vote Buttons */}
          <div className="flex items-center gap-1">
            <button
              onClick={handleLike}
              className={`p-1.5 rounded-lg transition-colors ${
                hasLiked ? "text-ember bg-ember/10" : "text-sand/60 hover:text-ember hover:bg-ember/5"
              }`}
            >
              <svg className="w-4 h-4" fill={hasLiked ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 15l7-7 7 7M12 8v13" />
              </svg>
            </button>
            <span className={`text-xs font-medium ${hasLiked ? "text-ember" : "text-sand/60"}`}>
              {localLikeCount}
            </span>
          </div>

          {/* Reply Button */}
          <button
            onClick={() => onReply(comment._id || comment.id)}
            className="flex items-center gap-1.5 text-xs text-sand/60 hover:text-white transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
            </svg>
            Répondre
          </button>

          {/* Share Button */}
          <button
            onClick={() => {
              navigator.clipboard.writeText(`${window.location.origin}/debate/${contentId}#comment-${comment._id || comment.id}`);
            }}
            className="flex items-center gap-1.5 text-xs text-sand/60 hover:text-white transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
            </svg>
            Partager
          </button>

          {/* Report Button (non-AI only) */}
          {!isAI && (
            <button
              onClick={() => setShowReportModal(true)}
              className="text-sand/40 hover:text-red-400 transition-colors ml-auto"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
              </svg>
            </button>
          )}
        </div>

        {/* Reply Composer */}
        <AnimatePresence>
          {isReplying && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-3 pt-3 border-t border-sand/10"
            >
              <div className="flex gap-2">
                <input
                  type="text"
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  placeholder="Écrire une réponse..."
                  className="flex-1 bg-sand/10 border border-sand/20 rounded-lg px-3 py-2 text-sm text-white placeholder-sand/50 focus:outline-none focus:border-gold/50"
                  autoFocus
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      handleReplySubmit();
                    }
                  }}
                />
                <button
                  onClick={handleReplySubmit}
                  disabled={!replyText.trim()}
                  className="px-4 py-2 bg-gold text-ink rounded-lg text-sm font-medium hover:bg-gold/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Envoyer
                </button>
                <button
                  onClick={onReplyCancel}
                  className="px-3 py-2 text-sand/60 hover:text-white text-sm transition-colors"
                >
                  Annuler
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Nested Replies */}
        {canNest && comment.replies && comment.replies.length > 0 && isExpanded && (
          <div className="mt-4">
            {comment.replies.map((reply) => (
              <ReplyItem
                key={reply.id}
                reply={reply}
                depth={depth + 1}
                parentCommentId={comment._id || comment.id}
                onReply={onReply}
              />
            ))}
          </div>
        )}
      </motion.div>

      {/* Report Modal */}
      <ReportModal
        isOpen={showReportModal}
        onClose={() => setShowReportModal(false)}
        onSubmit={handleReport}
      />
    </div>
  );
}

// --- Reply Item ---
interface ReplyItemProps {
  reply: Reply;
  depth: number;
  parentCommentId: string;
  onReply?: (commentId: string) => void;
}

function ReplyItem({ reply, depth, parentCommentId, onReply }: ReplyItemProps) {
  const [hasLiked, setHasLiked] = useState(false);
  const [localLikeCount, setLocalLikeCount] = useState(0);
  const likeMutation = useLikeReply();
  const unlikeMutation = useUnlikeReply();

  const handleReply = () => {
    if (onReply) {
      onReply(parentCommentId);
    }
  };

  const handleLike = async () => {
    try {
      if (hasLiked) {
        await unlikeMutation.mutateAsync(reply.id);
        setLocalLikeCount((prev) => Math.max(0, prev - 1));
      } else {
        await likeMutation.mutateAsync(reply.id);
        setLocalLikeCount((prev) => prev + 1);
      }
      setHasLiked(!hasLiked);
    } catch (error) {
      console.error("Failed to toggle like:", error);
    }
  };

  return (
    <div className={`relative ${depth > 0 ? "ml-4 sm:ml-6" : ""}`}>
      {/* Thread Line */}
      <div className="absolute -left-4 sm:-left-6 top-0 bottom-0 w-px bg-gradient-to-b from-sand/20 to-transparent" />

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="relative rounded-lg p-3 mb-2 bg-sand/5 border border-sand/10"
      >
        {/* Header */}
        <div className="flex items-center gap-2 mb-2">
          <div className="w-7 h-7 rounded-full overflow-hidden flex-shrink-0 bg-gold/20">
            <img
              src={resolveAvatarUrl(reply.authorAvatar) || "/avatars/users/maat-avatar-homme-64.png"}
              alt={reply.authorName || "User"}
              className="w-full h-full object-cover"
              onError={(e) => {
                e.currentTarget.src = "/avatars/users/maat-avatar-homme-64.png";
              }}
            />
          </div>
          <div className="flex items-center gap-2">
            <span className="font-medium text-sm text-white">
              {reply.authorName || "Utilisateur"}
            </span>
            <span className="text-xs text-sand/50">
              {formatTimeAgo(reply.createdAt)}
            </span>
          </div>
        </div>

        {/* Body */}
        <p className="text-sand/80 text-sm leading-relaxed mb-2">
          {reply.body}
        </p>

        {/* Actions */}
        <div className="flex items-center gap-3">
          <button
            onClick={handleLike}
            className={`flex items-center gap-1 text-xs transition-colors ${
              hasLiked ? "text-ember" : "text-sand/50 hover:text-ember"
            }`}
          >
            <svg className="w-3.5 h-3.5" fill={hasLiked ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 15l7-7 7 7" />
            </svg>
            {localLikeCount > 0 && localLikeCount}
          </button>
          <button
            onClick={handleReply}
            className="text-xs text-sand/50 hover:text-white transition-colors"
          >
            Répondre
          </button>
        </div>
      </motion.div>
    </div>
  );
}

// --- Report Modal ---
function ReportModal({
  isOpen,
  onClose,
  onSubmit,
}: {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (reason: string) => void;
}) {
  const reasons = [
    { id: "spam", label: "Spam" },
    { id: "harassment", label: "Harcèlement" },
    { id: "hate_speech", label: "Discours de haine" },
    { id: "misinformation", label: "Désinformation" },
    { id: "inappropriate", label: "Contenu inapproprié" },
    { id: "other", label: "Autre" },
  ];

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[300] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-ink border border-sand/20 rounded-2xl p-5 max-w-sm w-full"
      >
        <h3 className="text-lg font-semibold text-white mb-4">Signaler ce commentaire</h3>
        <p className="text-sm text-sand/60 mb-4">Pourquoi signalez-vous ce contenu ?</p>
        <div className="space-y-2">
          {reasons.map((reason) => (
            <button
              key={reason.id}
              onClick={() => onSubmit(reason.id)}
              className="w-full text-left px-4 py-3 rounded-lg bg-sand/5 hover:bg-sand/10 text-sand/80 hover:text-white text-sm transition-colors"
            >
              {reason.label}
            </button>
          ))}
        </div>
        <button
          onClick={onClose}
          className="w-full mt-4 px-4 py-2 text-sand/60 hover:text-white text-sm transition-colors"
        >
          Annuler
        </button>
      </motion.div>
    </div>
  );
}

// --- Comment Input ---
interface CommentInputProps {
  onSubmit: (body: string) => void;
  isLoading?: boolean;
  placeholder?: string;
  typingSummary?: string | null;
  onDraftChange?: (value: string) => void;
}

function CommentInput({
  onSubmit,
  isLoading,
  placeholder = "Ajoutez votre contribution...",
  typingSummary,
  onDraftChange
}: CommentInputProps) {
  const [text, setText] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = () => {
    if (text.trim() && !isLoading) {
      onSubmit(text);
      setText("");
      onDraftChange?.("");
    }
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 z-[250] bg-ink border-t border-sand/10 lg:sticky lg:bottom-0 lg:z-50">
      <div className="max-w-7xl mx-auto px-3 py-3">
        {typingSummary && (
          <div className="mb-2 flex items-center gap-2 px-1 text-xs text-sand/55">
            <div className="flex items-center gap-1" aria-hidden="true">
              <span className="h-1.5 w-1.5 rounded-full bg-gold/70 animate-pulse" />
              <span className="h-1.5 w-1.5 rounded-full bg-gold/60 animate-pulse [animation-delay:120ms]" />
              <span className="h-1.5 w-1.5 rounded-full bg-gold/50 animate-pulse [animation-delay:240ms]" />
            </div>
            <span>{typingSummary}</span>
          </div>
        )}

        <div className="flex items-center gap-3">
          {/* Avatar - visible on desktop */}
          <div className="w-9 h-9 rounded-full overflow-hidden flex-shrink-0 bg-gold/20 hidden lg:block">
            <img
              src="/avatars/users/maat-avatar-homme-64.png"
              alt="Vous"
              className="w-full h-full object-cover"
            />
          </div>

          {/* Input with integrated icons */}
          <div className="flex-1 relative">
            <input
              ref={inputRef}
              type="text"
              value={text}
              onChange={(e) => {
                setText(e.target.value);
                onDraftChange?.(e.target.value);
              }}
              placeholder={placeholder}
              className="w-full h-11 bg-[#1f1a14] border border-sand/20 rounded-full px-4 pr-20 text-sm text-white placeholder-sand/50 focus:outline-none focus:border-gold/50"
              onBlur={() => onDraftChange?.("")}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  handleSubmit();
                }
              }}
            />
            
            {/* Action Buttons inside input */}
            <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
              <button className="p-2 text-sand/40 hover:text-sand/60 transition-colors">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </button>
              <button className="p-2 text-sand/40 hover:text-sand/60 transition-colors">
                <span className="text-xs font-bold">GIF</span>
              </button>
            </div>
          </div>

          {/* Send Button - aligned center with input */}
          <button
            onClick={handleSubmit}
            disabled={!text.trim() || isLoading}
            className="w-11 h-11 flex items-center justify-center rounded-full bg-gold text-ink hover:bg-gold/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex-shrink-0"
          >
            {isLoading ? (
              <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
            ) : (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

// --- Sidebar Components ---

function DebateSidebar({ contentId }: { contentId: string }) {
  const { data: aiPersonalities, isLoading: aiLoading } = useAIPersonalities(contentId);
  const { data: stats, isLoading: statsLoading } = useDebateStats(contentId);
  const activePersonalities = (aiPersonalities || []).filter((personality) => personality.participated);
  const availablePersonalities = (aiPersonalities || []).filter((personality) => !personality.participated);
  const hasActiveAI = activePersonalities.length > 0;

  return (
    <div className="space-y-4">
      {/* About Card */}
      <div className="bg-sand/5 border border-sand/10 rounded-xl p-4">
        <h3 className="font-semibold text-white mb-2">À propos de ce débat</h3>
        <p className="text-sm text-sand/70 leading-relaxed">
          Discussions liées au contenu.
        </p>
        <div className="mt-3 pt-3 border-t border-sand/10">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full overflow-hidden">
              <img
                src="/maat-avatar/Calque 4.png"
                alt="MaatFeed"
                className="w-full h-full object-cover"
              />
            </div>
            <div>
              <p className="text-sm text-white">Créé par <span className="font-medium">MaatFeed</span></p>
              <p className="text-xs text-sand/50">Le {new Date().toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
            </div>
          </div>
        </div>
      </div>

      {/* AI Personalities */}
      <div className="bg-sand/5 border border-sand/10 rounded-xl p-4">
        <h3 className="font-semibold text-white mb-1">
          {hasActiveAI ? "IA actives dans ce debat" : "IA disponibles pour ce debat"}
        </h3>
        <p className="mb-3 text-xs text-sand/50">
          {hasActiveAI
            ? "Ces personnalites ont deja contribue a la discussion."
            : "Elles peuvent intervenir quand un commentaire le justifie ou si vous les invitez."}
        </p>
        {aiLoading ? (
          <div className="space-y-2">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-12 bg-sand/10 rounded-lg animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="space-y-2">
            {(hasActiveAI ? activePersonalities : availablePersonalities).map((personality) => (
              <div key={personality.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-sand/5 transition-colors">
                <div className="relative w-10 h-10 rounded-full overflow-hidden ring-2 ring-cyan-500/30">
                  <img
                    src={resolveAvatarUrl(personality.avatar) || "/avatars/users/maat-avatar-homme-64.png"}
                    alt={personality.name}
                    className="w-full h-full object-cover"
                  />
                  {personality.isOnline && (
                    <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-green-500 rounded-full border-2 border-ink" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-white truncate">{personality.name}</p>
                  <p className="text-xs text-sand/50 truncate">{personality.expertise.join(", ")}</p>
                </div>
                <span className={`text-xs ${personality.participated ? "text-green-400" : "text-sand/45"}`}>
                  {personality.participated ? `${personality.commentCount} repl.` : "Disponible"}
                </span>
              </div>
            ))}
            {!aiPersonalities?.length && (
              <p className="text-sm text-sand/50 text-center py-2">Aucune personnalite IA disponible</p>
            )}
          </div>
        )}
      </div>

      {/* Rules */}
      <div className="bg-sand/5 border border-sand/10 rounded-xl p-4">
        <h3 className="font-semibold text-white mb-3">Règles du débat</h3>
        <ul className="space-y-2">
          <li className="flex items-start gap-2 text-sm text-sand/70">
            <span className="text-gold">⚖️</span>
            <span>Respectez toutes les opinions</span>
          </li>
          <li className="flex items-start gap-2 text-sm text-sand/70">
            <span className="text-gold">🚫</span>
            <span>Pas d'attaques personnelles</span>
          </li>
          <li className="flex items-start gap-2 text-sm text-sand/70">
            <span className="text-gold">📚</span>
            <span>Apportez des sources si possible</span>
          </li>
          <li className="flex items-start gap-2 text-sm text-sand/70">
            <span className="text-gold">🤖</span>
            <span>Les IA ne remplacent pas la vérité absolue 😉</span>
          </li>
        </ul>
      </div>
    </div>
  );
}

// --- Left Sidebar (Desktop) with Debates List ---

function LeftSidebarDebates() {
  const [debates, setDebates] = useState<TopDebate[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const loadDebates = async () => {
      try {
        const data = await getTopDebates(10);
        setDebates(data);
      } catch (error) {
        console.error("Failed to load debates:", error);
      } finally {
        setLoading(false);
      }
    };
    loadDebates();
  }, []);

  const navItems = [
    { to: "/", label: "Accueil", icon: "🏠" },
    { to: "/explore", label: "Découvrir", icon: "✨" },
    { to: "/community", label: "Communautés", icon: "👥" },
    { to: "/debates", label: "Débats", icon: "💬", active: true },
    { to: "/notifications", label: "Notifications", icon: "🔔", badge: 3 },
    { to: "/messages", label: "Messages", icon: "✉️" },
    { to: "/profile", label: "Profil", icon: "👤" },
    { to: "/bookmarks", label: "Signets", icon: "🔖" },
  ];

  return (
    <div className="w-64 flex-shrink-0 sticky top-20 h-fit space-y-4 hidden lg:block">
      {/* Create Debate Button */}
      <button className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gold text-ink rounded-xl font-medium hover:bg-gold/90 transition-colors">
        <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
        </svg>
        Créer un débat
      </button>

      {/* Navigation */}
      <nav className="space-y-1">
        {navItems.map((item) => (
          <Link
            key={item.to}
            to={item.to}
            className={`flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm transition-colors ${
              item.active
                ? "bg-sand/10 text-gold font-medium"
                : "text-sand/70 hover:bg-sand/5 hover:text-sand"
            }`}
          >
            <span>{item.icon}</span>
            <span className="flex-1">{item.label}</span>
            {item.badge && (
              <span className="px-1.5 py-0.5 bg-ember text-white text-xs rounded-full">
                {item.badge}
              </span>
            )}
          </Link>
        ))}
      </nav>

      {/* Debates List */}
      <div className="border-t border-sand/10 pt-4">
        <h3 className="px-4 text-xs font-semibold text-sand/50 uppercase tracking-wider mb-2">
          Débats en cours
        </h3>
        {loading ? (
          <div className="space-y-2 px-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-10 bg-sand/10 rounded-lg animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="space-y-1">
            {debates.slice(0, 5).map((debate) => (
              <button
                key={debate.contentId}
                onClick={() => navigate(`/debate/${debate.contentId}`)}
                className="w-full text-left px-4 py-2.5 rounded-lg hover:bg-sand/5 transition-colors group"
              >
                <p className="text-sm text-sand/80 group-hover:text-white line-clamp-2">
                  {debate.title}
                </p>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-xs text-sand/50">{debate.participantCount} participants</span>
                  {debate.debateScore >= 30 && (
                    <span className="text-xs text-ember">🔥</span>
                  )}
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Trending Debate Card */}
      <div className="border-t border-sand/10 pt-4">
        <div className="mx-4 p-4 bg-gradient-to-br from-ember/10 to-gold/5 border border-ember/20 rounded-xl">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-ember">🔥</span>
            <span className="text-xs font-medium text-ember">Débat en tendance</span>
          </div>
          <p className="text-sm text-sand/80 mb-3">
            La technologie nous éloigne-t-elle de notre humanité ?
          </p>
          <div className="flex -space-x-2 mb-3">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="w-7 h-7 rounded-full bg-sand/20 border-2 border-ink"
              />
            ))}
            <div className="w-7 h-7 rounded-full bg-sand/30 border-2 border-ink flex items-center justify-center text-xs text-sand/70">
              +124
            </div>
          </div>
          <button className="w-full py-2 bg-sand/10 hover:bg-sand/20 text-sand text-sm rounded-lg transition-colors">
            Rejoindre le débat
          </button>
        </div>
      </div>
    </div>
  );
}

// --- AI Summary Tab ---

function AISummaryTab({ contentId }: { contentId: string }) {
  const { data: summary, isLoading } = useAISummary(contentId);

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="h-4 bg-sand/10 rounded animate-pulse w-3/4" />
        <div className="h-4 bg-sand/10 rounded animate-pulse" />
        <div className="h-4 bg-sand/10 rounded animate-pulse w-5/6" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Summary */}
      <div className="bg-gradient-to-br from-blue-950/20 to-cyan-950/10 border border-cyan-500/20 rounded-xl p-5">
        <div className="flex items-center gap-2 mb-3">
          <svg className="w-5 h-5 text-cyan-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
          <h3 className="font-semibold text-white">Résumé généré par IA</h3>
        </div>
        <p className="text-sand/80 leading-relaxed">
          {summary?.summary || "Le débat explore la nature de la vérité dans un monde en constante évolution. Les participants examinent si la vérité est absolue ou relative à notre perception et notre époque."}
        </p>
      </div>

      {/* Key Points */}
      <div>
        <h4 className="font-medium text-white mb-3">Points clés</h4>
        <ul className="space-y-2">
          {(summary?.keyPoints || [
            "La vérité (Maat) est un principe d'harmonie universelle dans la philosophie égyptienne",
            "Les scribes de l'Égypte ancienne cherchaient la vérité à travers l'observation",
            "La vérité est alignée avec l'ordre cosmique selon les textes de Ptahhotep"
          ]).map((point, i) => (
            <li key={i} className="flex items-start gap-3">
              <span className="w-6 h-6 rounded-full bg-gold/20 text-gold flex items-center justify-center text-xs flex-shrink-0 mt-0.5">
                {i + 1}
              </span>
              <span className="text-sand/80 text-sm">{point}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Perspectives */}
      <div>
        <h4 className="font-medium text-white mb-3">Perspectives des IA</h4>
        <div className="space-y-3">
          {(summary?.perspectives || [
            { persona: "Maat Sage", viewpoint: "La vérité est immuable bien que notre compréhension évolue" },
            { persona: "Kemet Expert", viewpoint: "Historiquement, la vérité se mesure par l'équilibre et l'harmonie" }
          ]).map((perspective, i) => (
            <div key={i} className="bg-sand/5 border border-sand/10 rounded-lg p-3">
              <p className="text-xs text-cyan-400 mb-1">{perspective.persona}</p>
              <p className="text-sm text-sand/80">{perspective.viewpoint}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// --- Stats Tab ---

function StatsTab({ contentId }: { contentId: string }) {
  const { data: stats, isLoading } = useDebateStats(contentId);
  const { data: analytics, isLoading: analyticsLoading } = useDiscussionAnalyticsSummary(contentId);

  if (isLoading) {
    return (
      <div className="grid grid-cols-2 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-24 bg-sand/10 rounded-xl animate-pulse" />
        ))}
      </div>
    );
  }

  const statCards = [
    { label: "Commentaires", value: stats?.totalComments || 0, icon: "💬" },
    { label: "Réponses", value: stats?.totalReplies || 0, icon: "↩️" },
    { label: "Contributions IA", value: stats?.aiContributions || 0, icon: "🤖" },
    { label: "Taux d'engagement", value: `${Math.round((stats?.engagementRate || 0) * 100)}%`, icon: "📊" },
  ];
  const topSorts = Object.entries(analytics?.sortSelections || {}).sort(([, left], [, right]) => right - left).slice(0, 4);
  const replyOpenTargets = Object.entries(analytics?.replyOpens || {}).sort(([, left], [, right]) => right - left).slice(0, 4);
  const replySubmissionTargets = Object.entries(analytics?.replySubmissions || {}).sort(([, left], [, right]) => right - left).slice(0, 4);

  const formatReplyTargetLabel = (target: string) => {
    switch (target) {
      case "comment":
        return "Point de vue";
      case "flat_reply":
        return "Réponse plate";
      case "nested_reply":
        return "Réponse ciblée";
      default:
        return target;
    }
  };

  return (
    <div className="space-y-6">
      {/* Stat Grid */}
      <div className="grid grid-cols-2 gap-4">
        {statCards.map((stat) => (
          <div key={stat.label} className="bg-sand/5 border border-sand/10 rounded-xl p-4 text-center">
            <div className="text-2xl mb-1">{stat.icon}</div>
            <div className="text-2xl font-bold text-gold">{stat.value}</div>
            <div className="text-xs text-sand/60">{stat.label}</div>
          </div>
        ))}
      </div>

      <div className="bg-sand/5 border border-sand/10 rounded-xl p-4">
        <div className="flex items-center justify-between gap-3 mb-4">
          <div>
            <h4 className="font-medium text-white">Usage du fil</h4>
            <p className="text-xs text-sand/55">
              Tris utilisés, ouvertures de réponses et destinations les plus sollicitées.
            </p>
          </div>
          <span className="text-xs text-sand/45">
            {analytics?.totals.events || 0} événement{(analytics?.totals.events || 0) > 1 ? "s" : ""}
          </span>
        </div>

        {analyticsLoading ? (
          <div className="grid grid-cols-2 gap-3">
            {[1, 2, 3, 4].map((item) => (
              <div key={item} className="h-16 rounded-lg bg-sand/10 animate-pulse" />
            ))}
          </div>
        ) : analytics?.totals.events ? (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              <div className="rounded-lg bg-sand/5 border border-sand/10 p-3">
                <div className="text-lg font-semibold text-gold">{analytics.totals.sortSelections}</div>
                <div className="text-xs text-sand/55">changements de tri</div>
              </div>
              <div className="rounded-lg bg-sand/5 border border-sand/10 p-3">
                <div className="text-lg font-semibold text-gold">{analytics.totals.replyOpens}</div>
                <div className="text-xs text-sand/55">ouvertures de réponse</div>
              </div>
              <div className="rounded-lg bg-sand/5 border border-sand/10 p-3">
                <div className="text-lg font-semibold text-gold">{Object.keys(analytics.replyOpens || {}).length}</div>
                <div className="text-xs text-sand/55">types de cible ouverts</div>
              </div>
              <div className="rounded-lg bg-sand/5 border border-sand/10 p-3">
                <div className="text-lg font-semibold text-gold">{analytics.totals.replySubmissions}</div>
                <div className="text-xs text-sand/55">réponses envoyées</div>
              </div>
            </div>

            <div className="grid gap-4 lg:grid-cols-2">
              <div>
                <h5 className="text-sm font-medium text-white mb-2">Tris les plus utilisés</h5>
                <div className="space-y-2">
                  {topSorts.length ? topSorts.map(([sortKey, count]) => (
                    <div key={sortKey} className="flex items-center justify-between rounded-lg bg-sand/5 px-3 py-2 text-sm">
                      <span className="text-sand/75">{sortKey}</span>
                      <span className="text-gold font-medium">{count}</span>
                    </div>
                  )) : (
                    <p className="text-sm text-sand/50">Aucun changement de tri observé pour le moment.</p>
                  )}
                </div>
              </div>

              <div>
                <h5 className="text-sm font-medium text-white mb-2">Cibles de réponse les plus utilisées</h5>
                <div className="space-y-2">
                  {replyOpenTargets.length ? replyOpenTargets.map(([target, count]) => (
                    <div key={target} className="rounded-lg bg-sand/5 px-3 py-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-sand/75">{formatReplyTargetLabel(target)}</span>
                        <span className="text-gold font-medium">{count}</span>
                      </div>
                      <p className="mt-1 text-xs text-sand/50">
                        {replySubmissionTargets.find(([submissionTarget]) => submissionTarget === target)?.[1] || 0} réponse{(replySubmissionTargets.find(([submissionTarget]) => submissionTarget === target)?.[1] || 0) > 1 ? "s" : ""} envoyée{(replySubmissionTargets.find(([submissionTarget]) => submissionTarget === target)?.[1] || 0) > 1 ? "s" : ""}
                      </p>
                    </div>
                  )) : (
                    <p className="text-sm text-sand/50">Aucune donnée de ciblage disponible pour le moment.</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        ) : (
          <p className="text-sm text-sand/50">
            Aucune donnée d'usage du fil n'a encore été collectée sur ce débat.
          </p>
        )}
      </div>

      {/* Top Contributors */}
      <div>
        <h4 className="font-medium text-white mb-3">Top contributeurs</h4>
        <div className="space-y-2">
          {(stats?.topContributors || []).map((contributor, i) => (
            <div key={i} className="flex items-center gap-3 p-3 bg-sand/5 rounded-lg">
              <div className="w-8 h-8 rounded-full overflow-hidden">
                <img
                  src={resolveAvatarUrl(contributor.avatar) || "/avatars/users/maat-avatar-homme-64.png"}
                  alt={contributor.name}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="flex-1">
                <p className="text-sm text-white">{contributor.name}</p>
              </div>
              <div className="px-2 py-1 bg-gold/20 rounded-lg">
                <span className="text-xs text-gold font-medium">{contributor.count}</span>
              </div>
            </div>
          ))}
          {!stats?.topContributors?.length && (
            <p className="text-sm text-sand/50 text-center py-4">
              Les statistiques des contributeurs seront bientôt disponibles
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

// ==================== MAIN PAGE ====================

export default function DebateDetailPage() {
  const { contentId } = useParams<{ contentId: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, isBootstrapping } = useAuth();
  const queryClient = useQueryClient();
  const { setHideBottomNav } = useLayout();
  const hashTarget = parseDiscussionHash(location.hash);
  
  const [activeTab, setActiveTab] = useState<TabType>("discussion");
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [isFollowing, setIsFollowing] = useState(false);
  const [highlightedCommentId, setHighlightedCommentId] = useState<string | null>(null);
  const [content, setContent] = useState<ContentItem | null>(null);
  const [isContentLoading, setIsContentLoading] = useState(false);
  const [isCreatingDebate, setIsCreatingDebate] = useState(false);
  const [aiTypingState, setAITypingState] = useState<AITypingState | null>(null);
  const aiTypingStateRef = useRef<AITypingState | null>(null);
  const aiTypingTimeoutRef = useRef<number | null>(null);
  const resolvedAITypingTargetRef = useRef<string | null>(null);

  const syncAITypingState = useCallback((nextState: AITypingState | null) => {
    aiTypingStateRef.current = nextState;
    setAITypingState(nextState);
  }, []);

  const clearAITypingTimeout = useCallback(() => {
    if (aiTypingTimeoutRef.current) {
      window.clearTimeout(aiTypingTimeoutRef.current);
      aiTypingTimeoutRef.current = null;
    }
  }, []);

  const clearAITypingIndicator = useCallback((minVisibleMs = 0) => {
    const currentState = aiTypingStateRef.current;
    if (!currentState) {
      return;
    }

    clearAITypingTimeout();

    const elapsedMs = Date.now() - currentState.startedAt;
    const remainingMs = Math.max(0, minVisibleMs - elapsedMs);

    if (remainingMs === 0) {
      syncAITypingState(null);
      return;
    }

    aiTypingTimeoutRef.current = window.setTimeout(() => {
      syncAITypingState(null);
    }, remainingMs);
  }, [clearAITypingTimeout, syncAITypingState]);

  const startAITypingIndicator = useCallback((targetCommentId: string, speakerName?: string | null) => {
    const speaker = speakerName?.trim() || "L'IA";
    resolvedAITypingTargetRef.current = null;
    clearAITypingTimeout();

    syncAITypingState({
      targetCommentId,
      speaker,
      message: `${speaker} redige une reponse...`,
      startedAt: Date.now()
    });

    aiTypingTimeoutRef.current = window.setTimeout(() => {
      syncAITypingState(null);
    }, AI_TYPING_MAX_VISIBLE_MS);
  }, [clearAITypingTimeout, syncAITypingState]);

  const updateAITypingSpeaker = useCallback((targetCommentId: string, speakerName?: string | null) => {
    const currentState = aiTypingStateRef.current;
    const speaker = speakerName?.trim();

    if (!currentState || currentState.targetCommentId !== targetCommentId || !speaker || currentState.speaker === speaker) {
      return;
    }

    syncAITypingState({
      ...currentState,
      speaker,
      message: `${speaker} redige une reponse...`
    });
  }, [syncAITypingState]);

  useEffect(() => {
    if (!highlightedCommentId) {
      return;
    }

    const timeoutId = window.setTimeout(() => {
      setHighlightedCommentId(null);
    }, 2200);

    return () => window.clearTimeout(timeoutId);
  }, [highlightedCommentId]);

  useEffect(() => {
    return () => {
      clearAITypingTimeout();
    };
  }, [clearAITypingTimeout]);

  useEffect(() => {
    if (hashTarget && activeTab !== "discussion") {
      setActiveTab("discussion");
    }
  }, [activeTab, hashTarget]);

  // Vote hooks
  const { data: debate, isLoading: debateLoading, refetch: refetchDebate } = useDebate(contentId || "");
  const discussionContentId = debate?.contentId || contentId || "";
  const likeCommentMutation = useLikeComment(discussionContentId);
  const unlikeCommentMutation = useUnlikeComment(discussionContentId);
  const reportCommentMutation = useReportComment();
  const reportReplyMutation = useReportReply();

  // Hide bottom nav on mount, restore on unmount
  useEffect(() => {
    setHideBottomNav(true);
    return () => {
      setHideBottomNav(false);
    };
  }, [setHideBottomNav]);

  useEffect(() => {
    let isMounted = true;

    async function loadContentDetails() {
      if (!contentId) {
        return;
      }

      // Standalone community debates are keyed by their own post id, not a feed content id.
      // In that case there is no matching /api/content/:id document to load.
      if (debateLoading) {
        return;
      }

      if (debate && debate.id === contentId) {
        if (isMounted) {
          setContent(null);
          setIsContentLoading(false);
        }
        return;
      }

      setIsContentLoading(true);
      try {
        const result = await contentService.getContentById(contentId);
        if (isMounted) {
          setContent(result);
        }
      } finally {
        if (isMounted) {
          setIsContentLoading(false);
        }
      }
    }

    void loadContentDetails();

    return () => {
      isMounted = false;
    };
  }, [contentId, debate, debateLoading]);

  // Queries
  const createCommentMutation = useCreateComment(discussionContentId);
  const createReplyMutation = useCreateReply(discussionContentId);
  const { data: comments, isLoading: commentsLoading, isFetching: commentsRefreshing } = useComments(discussionContentId, {
    live: activeTab === "discussion",
    pauseLive: Boolean(replyingTo) || createCommentMutation.isPending || createReplyMutation.isPending,
    intervalMs: aiTypingState ? 3000 : 15000
  });
  const {
    typingSummary,
    handleDraftChange: handleTypingDraftChange,
    stopTyping
  } = useDiscussionTyping(discussionContentId, activeTab === "discussion");

  const ensureAuthenticated = useCallback(() => {
    if (isBootstrapping) {
      return false;
    }

    if (!isAuthenticated) {
      const returnTo = `${location.pathname}${location.search}${location.hash}`;
      navigate(`/auth?returnTo=${encodeURIComponent(returnTo)}`);
      return false;
    }

    return true;
  }, [isAuthenticated, isBootstrapping, location.hash, location.pathname, location.search, navigate]);

  const buildAIInteractionContext = useCallback((): AIInteractionContext => {
    const sourceComments = comments || [];

    return {
      recentCommentCount: sourceComments.length,
      discussionActive: sourceComments.length >= 3,
      lastAIResponses: sourceComments
        .filter((comment) => comment.aiGenerated && comment.aiPersona)
        .sort((left, right) => new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime())
        .slice(0, 4)
        .map((comment) => ({
          personalityId: comment.aiPersona as string,
          timestamp: new Date(comment.createdAt).getTime()
        }))
    };
  }, [comments]);

  const previewAITypingSpeaker = useCallback(async (
    targetCommentId: string,
    text: string,
    context?: AIInteractionContext
  ) => {
    const trimmedText = text.trim();
    if (!trimmedText) {
      return;
    }

    try {
      const routing = await routeAICommentPersonality(trimmedText, context || buildAIInteractionContext());
      updateAITypingSpeaker(
        targetCommentId,
        routing.personality?.displayName || routing.personality?.name || null
      );
    } catch (error) {
      console.error("Failed to preview AI personality:", error);
    }
  }, [buildAIInteractionContext, updateAITypingSpeaker]);

  const maybeShowAutomaticAITyping = useCallback(async (targetCommentId: string, text: string) => {
    const baseContext = buildAIInteractionContext();
    const nextCommentCount = (baseContext.recentCommentCount || 0) + 1;
    const context: AIInteractionContext = {
      ...baseContext,
      recentCommentCount: nextCommentCount,
      discussionActive: nextCommentCount >= 3
    };

    try {
      const [checkResult, routingResult] = await Promise.all([
        checkAICommentReply(targetCommentId, context),
        routeAICommentPersonality(text, context).catch(() => ({ personality: null }))
      ]);

      if (!checkResult.shouldRespond) {
        return;
      }

      startAITypingIndicator(
        targetCommentId,
        routingResult.personality?.displayName || routingResult.personality?.name || null
      );
    } catch (error) {
      console.error("Failed to prepare automatic AI typing:", error);
    }
  }, [buildAIInteractionContext, startAITypingIndicator]);

  const handleHashChange = useCallback((hash: string) => {
    navigate(
      {
        pathname: location.pathname,
        search: location.search,
        hash,
      },
      { replace: true }
    );
  }, [location.pathname, location.search, navigate]);

  useEffect(() => {
    if (!aiTypingState || !comments?.length) {
      return;
    }

    if (resolvedAITypingTargetRef.current === aiTypingState.targetCommentId) {
      return;
    }

    const aiReplyHasArrived = comments.some((comment) =>
      comment.aiGenerated && comment.inReplyToCommentId === aiTypingState.targetCommentId
    );

    if (!aiReplyHasArrived) {
      return;
    }

    resolvedAITypingTargetRef.current = aiTypingState.targetCommentId;
    clearAITypingIndicator(AI_TYPING_MIN_VISIBLE_MS);

    void Promise.all([
      queryClient.invalidateQueries({ queryKey: ["ai-personalities", discussionContentId] }),
      queryClient.invalidateQueries({ queryKey: ["debate-stats", discussionContentId] }),
      queryClient.invalidateQueries({ queryKey: ["ai-summary", discussionContentId] })
    ]);
  }, [aiTypingState, clearAITypingIndicator, comments, discussionContentId, queryClient]);

  // Handlers
  const handleFollowToggle = () => {
    setIsFollowing(!isFollowing);
  };

  const handleCommentSubmit = (body: string) => {
    if (!ensureAuthenticated()) {
      return;
    }

    createCommentMutation.mutate(body, {
      onSuccess: (newComment) => {
        stopTyping();
        void maybeShowAutomaticAITyping(newComment._id || newComment.id, newComment.body);
      }
    });
  };

  const handleReplySubmit = (
    commentId: string,
    body: string,
    replyMode: "nested" | "flat",
    analytics?: ReplyMutationAnalytics
  ) => {
    if (!ensureAuthenticated()) {
      return;
    }
    createReplyMutation.mutate({
      commentId,
      body,
      replyMode,
      replyToCommentId: analytics?.replyToCommentId,
      replyToReplyId: analytics?.replyToReplyId,
      analytics
    }, {
      onSuccess: (newReply) => {
        stopTyping();
        setReplyingTo(null);

        if (replyMode === "flat") {
          void maybeShowAutomaticAITyping(newReply.id, newReply.body);
        }
      }
    });
  };

  const handleReplyToReplySubmit = (
    _replyId: string,
    commentId: string,
    body: string,
    replyMode: "nested" | "flat",
    analytics?: ReplyMutationAnalytics
  ) => {
    if (!ensureAuthenticated()) {
      return;
    }

    createReplyMutation.mutate({
      commentId,
      body,
      replyMode,
      replyToCommentId: analytics?.replyToCommentId,
      replyToReplyId: analytics?.replyToReplyId,
      analytics
    }, {
      onSuccess: (newReply) => {
        stopTyping();
        setReplyingTo(null);

        if (replyMode === "flat") {
          void maybeShowAutomaticAITyping(newReply.id, newReply.body);
        }
      }
    });
  };

  const handleReplyCancel = () => {
    stopTyping();
    setReplyingTo(null);
  };

  const handleLaunchDebate = async () => {
    if (!contentId) {
      return;
    }

    if (!ensureAuthenticated()) {
      return;
    }

    setIsCreatingDebate(true);
    try {
      await createDebateThread({
        contentId,
        title: content?.title,
        description: content?.description,
        tags: content?.tags
      });
      await refetchDebate();
    } finally {
      setIsCreatingDebate(false);
    }
  };

  // Handle vote (upvote/downvote)
  const handleVote = useCallback((commentId: string, direction: "up" | "down" | null) => {
    if (!ensureAuthenticated()) {
      return;
    }
    
    if (direction === "up") {
      likeCommentMutation.mutate(commentId);
    } else if (direction === null) {
      unlikeCommentMutation.mutate(commentId);
    }
    // Note: downvote is not yet implemented in backend, treat as unlike for now
  }, [ensureAuthenticated, likeCommentMutation, unlikeCommentMutation]);

  // Handle report
  const handleReport = useCallback((commentId: string, reason: string) => {
    if (!ensureAuthenticated()) {
      return;
    }
    
    reportCommentMutation.mutate({ 
      commentId, 
      reason: reason as any 
    }, {
      onSuccess: () => {
        // Could show a toast notification here
        console.log("Comment reported successfully");
      }
    });
  }, [ensureAuthenticated, reportCommentMutation]);

  const handleReplyReport = useCallback((replyId: string, reason: string) => {
    if (!ensureAuthenticated()) {
      return;
    }

    reportReplyMutation.mutate({
      replyId,
      reason: reason as any
    }, {
      onSuccess: () => {
        console.log("Reply reported successfully");
      }
    });
  }, [ensureAuthenticated, reportReplyMutation]);

  const handleInviteAIReply = useCallback(async (commentId: string) => {
    if (!ensureAuthenticated()) {
      throw new Error("Connectez-vous pour inviter l'IA dans ce debat.");
    }

    const sourceComment = (comments || []).find((comment) => (comment._id || comment.id) === commentId);
    const context = buildAIInteractionContext();

    startAITypingIndicator(commentId);
    if (sourceComment?.body) {
      void previewAITypingSpeaker(commentId, sourceComment.body, context);
    }

    try {
      const result = await requestAICommentReply(commentId, context);

      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["comments", discussionContentId] }),
        queryClient.invalidateQueries({ queryKey: ["ai-personalities", discussionContentId] }),
        queryClient.invalidateQueries({ queryKey: ["debate-stats", discussionContentId] }),
        queryClient.invalidateQueries({ queryKey: ["ai-summary", discussionContentId] })
      ]);

      if (!result.responseGenerated) {
        clearAITypingIndicator(AI_TYPING_MIN_VISIBLE_MS);
      }

      return result;
    } catch (error) {
      clearAITypingIndicator(AI_TYPING_MIN_VISIBLE_MS);
      throw error;
    }
  }, [
    buildAIInteractionContext,
    clearAITypingIndicator,
    comments,
    discussionContentId,
    ensureAuthenticated,
    previewAITypingSpeaker,
    queryClient,
    startAITypingIndicator
  ]);

  // Loading state
  if (!contentId || (debateLoading && isContentLoading)) {
    return (
      <>
        <SEO pageKey="debate" title="Chargement du débat..." />
        <div className="min-h-screen pb-[80px]">
        <div className="max-w-7xl mx-auto flex gap-6">
          <LeftSidebarDebates />
          <div className="flex-1 max-w-3xl">
            <SkeletonLoader type="card" count={3} />
          </div>
          <div className="w-80 hidden xl:block">
            <div className="h-64 bg-sand/10 rounded-xl animate-pulse" />
          </div>
        </div>
      </div>
      </>
    );
  }

  // Error state
  if (!debate && !content && !isContentLoading) {
    return (
      <>
        <SEO pageKey="debate" title="Débat non trouvé" />
        <div className="min-h-screen pb-[80px]">
        <div className="max-w-7xl mx-auto flex gap-6">
          <LeftSidebarDebates />
          <div className="flex-1 max-w-3xl">
            <div className="text-center py-12">
              <h2 className="text-xl font-semibold text-white mb-2">Débat non trouvé</h2>
              <p className="text-sand/60 mb-4">Ce débat n'existe pas ou a été supprimé.</p>
              <button
                onClick={() => navigate("/community")}
                className="px-4 py-2 bg-gold text-ink rounded-lg hover:bg-gold/90 transition-colors"
              >
                Retour aux débats
              </button>
            </div>
          </div>
        </div>
      </div>
      </>
    );
  }

  const headerData = debate ? {
    ...debate,
    likes: debate.debateScore,
    isFollowing,
    imageUrl: content?.thumbnailUrl || "/maat-avatar/Calque 4.png"
  } : {
    id: content?.id || contentId,
    contentId: discussionContentId,
    title: content?.title || "Discussion",
    description: content?.description || "Ouvrez la discussion autour de ce contenu.",
    debateScore: 0,
    participantCount: 0,
    tags: content?.tags || [],
    createdAt: content?.createdAt || new Date().toISOString(),
    likes: content?.comments || 0,
    isFollowing,
    imageUrl: content?.thumbnailUrl || "/maat-avatar/Calque 4.png"
  };
  const combinedTypingSummary = aiTypingState?.message
    ? (typingSummary ? `${aiTypingState.message} | ${typingSummary}` : aiTypingState.message)
    : typingSummary;

  const debateTitle = debate?.title || content?.title || "Discussion";
  const debateDescription = debate?.description || content?.description || "Ouvrez la discussion autour de ce contenu.";

  return (
    <>
      <SEO 
        pageKey="debate"
        title={debateTitle}
        description={debateDescription}
        image={content?.thumbnailUrl}
        url={`https://maatfeed.com/debate/${contentId}`}
        type="article"
      />
      <div className="min-h-screen pb-[80px] lg:pb-6">
      <div className="max-w-7xl mx-auto flex gap-6">
        {/* Left Sidebar - Desktop Only */}
        <LeftSidebarDebates />

        {/* Main Content */}
        <div className="flex-1 max-w-3xl w-full">
          {/* Back Button & Breadcrumb */}
          <div className="flex items-center gap-2 px-4 lg:px-0 py-3 text-sm">
            <button
              onClick={() => navigate("/community")}
              className="flex items-center gap-1 text-sand/60 hover:text-white transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
              </svg>
              Retour aux débats
            </button>
            <span className="text-sand/30">/</span>
            <span className="text-sand/40 truncate">{headerData.tags[0] || "General"}</span>
          </div>

          {/* Header */}
          <DebateHeader
            debate={headerData}
            commentCount={comments?.length || 0}
            onFollowToggle={handleFollowToggle}
          />

          {!debate && content && (
            <div className="mt-4 px-4 lg:px-0">
              <div className="rounded-2xl border border-gold/20 bg-gold/10 p-4 sm:p-5">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <h2 className="text-base font-semibold text-white">Discussion ouverte, debat non formalise</h2>
                    <p className="mt-1 text-sm text-sand/70">
                      Des contributions existent deja sur cette video. Vous pouvez participer tout de suite ou formaliser un vrai debat.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={handleLaunchDebate}
                    disabled={isCreatingDebate}
                    className="rounded-xl bg-gold px-4 py-2 text-sm font-medium text-ink transition-colors hover:bg-gold/90 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {isCreatingDebate ? "Creation..." : "Lancer le debat"}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Tabs */}
          <div className="mt-6 px-4 lg:px-0">
            <DebateTabs
              activeTab={activeTab}
              onTabChange={setActiveTab}
              commentCount={comments?.length || 0}
            />
          </div>

          {/* Tab Content */}
          <div className="mt-4 px-4 lg:px-0">
            <AnimatePresence mode="wait">
              {activeTab === "discussion" && (
                <motion.div
                  key="discussion"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                >
                  {/* Comments Thread - Using new enhanced component */}
                  <CommentThread
                    comments={comments || []}
                    contentId={discussionContentId}
                    isLoading={commentsLoading}
                    isRefreshing={commentsRefreshing && !commentsLoading}
                    emptyStateTitle={debate ? "Aucune prise de position pour le moment" : "Aucune contribution pour le moment"}
                    emptyStateAuthenticatedSubtitle={debate ? "Soyez le premier a ouvrir le debat !" : "Soyez le premier a lancer la discussion !"}
                    emptyStateGuestSubtitle="Connectez-vous pour participer a la discussion"
                    onReply={handleReplySubmit}
                    onReplyToReply={handleReplyToReplySubmit}
                    onVote={handleVote}
                    onAIReply={handleInviteAIReply}
                    onReport={handleReport}
                    onReplyReport={handleReplyReport}
                    isCreating={isBootstrapping || createCommentMutation.isPending || createReplyMutation.isPending}
                    replyingTo={replyingTo}
                    setReplyingTo={setReplyingTo}
                    onReplyDraftChange={handleTypingDraftChange}
                    targetMessageId={hashTarget?.id}
                    targetMessageType={hashTarget?.type}
                    onHashChange={handleHashChange}
                    onHighlightMessage={setHighlightedCommentId}
                    highlightedCommentId={highlightedCommentId}
                  />
                </motion.div>
              )}

              {activeTab === "summary" && (
                <motion.div
                  key="summary"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                >
                  <AISummaryTab contentId={discussionContentId} />
                </motion.div>
              )}

              {activeTab === "stats" && (
                <motion.div
                  key="stats"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                >
                  <StatsTab contentId={discussionContentId} />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Right Sidebar - Desktop Only */}
        <div className="w-80 hidden xl:block">
          <div className="sticky top-20">
            <DebateSidebar contentId={discussionContentId} />
          </div>
        </div>
      </div>

      {/* Comment Input - Fixed at bottom on mobile, sticky on desktop */}
      {activeTab === "discussion" && (
        <CommentInput
          onSubmit={handleCommentSubmit}
          isLoading={isBootstrapping || createCommentMutation.isPending}
          placeholder={debate ? "Defendez votre point de vue..." : "Partagez votre point de vue..."}
          typingSummary={combinedTypingSummary}
          onDraftChange={handleTypingDraftChange}
        />
      )}
    </div>
    </>
  );
}
