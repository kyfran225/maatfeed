import { useState, useCallback, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "../../hooks/useAuth";
import type { AICommentReplyResult, Comment, Reply, ReplyMutationAnalytics } from "../../services/commentService";
import { CommentItem } from "./CommentItem";
import { ThreadSortBar } from "./ThreadSortBar";
import {
  buildCommentThreads,
  countAllThreadReplies,
  countRootThreads,
  type ThreadSortOption
} from "./threading";
import { fireAndForgetDiscussionAnalyticsEvent } from "../../services/communityAnalyticsService";

export type SortOption = ThreadSortOption;

// Allow a few visible reply levels so follow-up answers to flat replies,
// including AI responses, stay visible inside the same sheet.
const MAX_THREAD_DEPTH = 3;

interface CommentThreadProps {
  comments: Comment[];
  contentId: string;
  contentCreatorId?: string;
  isLoading?: boolean;
  isRefreshing?: boolean;
  emptyStateTitle?: string;
  emptyStateAuthenticatedSubtitle?: string;
  emptyStateGuestSubtitle?: string;
  onReply: (
    commentId: string,
    body: string,
    replyMode: "nested" | "flat",
    analytics?: ReplyMutationAnalytics
  ) => void;
  onReplyToReply?: (
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
  isCreating?: boolean;
  replyingTo: string | null;
  setReplyingTo: (id: string | null) => void;
  onReplyDraftChange?: (value: string) => void;
  targetMessageId?: string | null;
  targetMessageType?: "comment" | "reply" | null;
  onHashChange?: (hash: string) => void;
  onHighlightMessage: (id: string | null) => void;
  highlightedCommentId?: string | null;
}

export function CommentThread({
  comments,
  contentId,
  contentCreatorId,
  isLoading,
  isRefreshing,
  emptyStateTitle = "Aucune contribution pour le moment",
  emptyStateAuthenticatedSubtitle = "Soyez le premier a lancer la discussion !",
  emptyStateGuestSubtitle = "Connectez-vous pour participer a la discussion",
  onReply,
  onReplyToReply,
  onVote,
  onAIReply,
  onReplyVote,
  onReport,
  onReplyReport,
  onLoadMoreReplies,
  isCreating,
  replyingTo,
  setReplyingTo,
  onReplyDraftChange,
  targetMessageId,
  targetMessageType,
  onHashChange,
  onHighlightMessage,
  highlightedCommentId,
}: CommentThreadProps) {
  const [sortBy, setSortBy] = useState<SortOption>("relevant");
  const [expandedThreads, setExpandedThreads] = useState<Set<string>>(new Set());
  const { isAuthenticated } = useAuth();
  const hasTrackedInitialSortRef = useRef(false);
  const lastHandledTargetRef = useRef<string | null>(null);

  const threads = buildCommentThreads(comments, sortBy);
  const rootCount = countRootThreads(threads);
  const totalReplyCount = countAllThreadReplies(threads);
  const messageAncestors = new Map<string, string[]>();

  const registerReplyTree = (reply: Reply, ancestors: string[]) => {
    messageAncestors.set(reply.id, ancestors);
    for (const childReply of reply.nestedReplies || []) {
      registerReplyTree(childReply, ancestors);
    }
  };

  const registerThread = (thread: typeof threads[number], ancestors: string[]) => {
    const commentId = thread.comment._id || thread.comment.id;
    messageAncestors.set(commentId, ancestors);

    for (const reply of thread.comment.replies || []) {
      registerReplyTree(reply, [...ancestors, commentId]);
    }

    for (const childThread of thread.flatReplies) {
      registerThread(childThread, [...ancestors, commentId]);
    }
  };

  for (const thread of threads) {
    registerThread(thread, []);
  }

  const handleToggleThread = useCallback((commentId: string) => {
    setExpandedThreads(prev => {
      const next = new Set(prev);
      if (next.has(commentId)) {
        next.delete(commentId);
      } else {
        next.add(commentId);
      }
      return next;
    });
  }, []);

  const handleReplySubmit = useCallback((
    commentId: string,
    body: string,
    replyMode: "nested" | "flat",
    analytics?: ReplyMutationAnalytics
  ) => {
    onReply(commentId, body, replyMode, analytics);
    setReplyingTo(null);
  }, [onReply, setReplyingTo]);

  const handleReplyToReplySubmit = useCallback((
    replyId: string,
    commentId: string,
    body: string,
    replyMode: "nested" | "flat",
    analytics?: ReplyMutationAnalytics
  ) => {
    if (onReplyToReply) {
      onReplyToReply(replyId, commentId, body, replyMode, analytics);
    }
    setReplyingTo(null);
  }, [onReplyToReply, setReplyingTo]);

  const handleSortChange = useCallback((nextSort: SortOption) => {
    setSortBy(nextSort);

    if (hasTrackedInitialSortRef.current || nextSort !== "relevant") {
      fireAndForgetDiscussionAnalyticsEvent(contentId, "discussion_sort_selected", {
        surface: "debate_detail",
        sortBy: nextSort
      });
    }

    hasTrackedInitialSortRef.current = true;
  }, [contentId]);

  const handleNavigateToMessage = useCallback((
    messageId: string,
    messageType?: "comment" | "reply" | null,
    options?: { updateHash?: boolean }
  ) => {
    const ancestors = messageAncestors.get(messageId) || [];
    if (ancestors.length > 0) {
      setExpandedThreads((prev) => {
        const next = new Set(prev);
        for (const ancestorId of ancestors) {
          next.add(ancestorId);
        }
        return next;
      });
    }

    if (options?.updateHash !== false) {
      const prefix = messageType === "reply" ? "reply" : "comment";
      onHashChange?.(`#${prefix}-${messageId}`);
    }

    onHighlightMessage(messageId);
    setTimeout(() => {
      const targetElement = document.getElementById(`comment-${messageId}`) || document.getElementById(`reply-${messageId}`);
      if (targetElement) {
        targetElement.scrollIntoView({ behavior: "smooth", block: "center" });
        return;
      }

      const fallbackCommentId = ancestors[ancestors.length - 1];
      if (!fallbackCommentId) {
        return;
      }

      const fallbackElement = document.getElementById(`comment-${fallbackCommentId}`);
      fallbackElement?.scrollIntoView({ behavior: "smooth", block: "center" });
    }, 120);
  }, [messageAncestors, onHashChange, onHighlightMessage]);

  useEffect(() => {
    if (!targetMessageId) {
      lastHandledTargetRef.current = null;
      return;
    }

    if (lastHandledTargetRef.current === targetMessageId) {
      return;
    }

    const targetExists =
      messageAncestors.has(targetMessageId) ||
      Boolean(document.getElementById(`comment-${targetMessageId}`)) ||
      Boolean(document.getElementById(`reply-${targetMessageId}`));

    if (!targetExists) {
      return;
    }

    handleNavigateToMessage(targetMessageId, targetMessageType, { updateHash: false });
    lastHandledTargetRef.current = targetMessageId;
  }, [handleNavigateToMessage, targetMessageId, targetMessageType]);

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="animate-pulse">
            <div className="flex gap-3">
              <div className="w-10 h-10 rounded-full bg-sand/10" />
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-sand/10 rounded w-32" />
                <div className="h-3 bg-sand/10 rounded w-full" />
                <div className="h-3 bg-sand/10 rounded w-3/4" />
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (comments.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-sand/5 flex items-center justify-center">
          <svg className="w-8 h-8 text-sand/40" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
        </div>
        <p className="text-sand/60 mb-2">{emptyStateTitle}</p>
        <p className="text-sm text-sand/50">
          {isAuthenticated ? emptyStateAuthenticatedSubtitle : emptyStateGuestSubtitle}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <ThreadSortBar
        sortBy={sortBy}
        onSortChange={handleSortChange}
        rootCount={rootCount}
        totalReplyCount={totalReplyCount}
      />

      <div className="space-y-4">
        <AnimatePresence>
          {threads.map((thread, index) => (
            <motion.div
              key={thread.comment._id || thread.comment.id}
              id={`comment-${thread.comment._id || thread.comment.id}`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ 
                opacity: 1, 
                y: 0,
                scale: highlightedCommentId === (thread.comment._id || thread.comment.id) ? [1, 1.02, 1] : 1,
              }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ 
                delay: index * 0.05,
                duration: 0.3,
                scale: { duration: 0.5 }
              }}
              className={
                highlightedCommentId === (thread.comment._id || thread.comment.id) 
                  ? "ring-2 ring-gold/30 rounded-xl" 
                  : ""
              }
            >
              <CommentItem
                comment={thread.comment}
                flatReplies={thread.flatReplies}
                rootCommentId={thread.comment._id || thread.comment.id}
                contentId={contentId}
                contentCreatorId={contentCreatorId}
                depth={0}
                maxDepth={MAX_THREAD_DEPTH}
                onReply={setReplyingTo}
                onReplySubmit={handleReplySubmit}
                onReplyToReplySubmit={handleReplyToReplySubmit}
                onVote={onVote}
                onAIReply={onAIReply}
                onReplyVote={onReplyVote}
                onReport={onReport}
                onReplyReport={onReplyReport}
                onLoadMoreReplies={onLoadMoreReplies}
                activeReplyTargetId={replyingTo}
                onCancelReply={() => setReplyingTo(null)}
                onReplyDraftChange={onReplyDraftChange}
                expandedCommentIds={expandedThreads}
                onToggleExpand={handleToggleThread}
                onNavigateToMessage={handleNavigateToMessage}
                highlightedCommentId={highlightedCommentId}
              />
            </motion.div>
          ))}
        </AnimatePresence>

        {isCreating && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-3 p-4 bg-sand/5 rounded-xl border border-sand/10"
          >
            <div className="w-5 h-5 border-2 border-gold/30 border-t-gold rounded-full animate-spin" />
            <span className="text-sm text-sand/60">Publication en cours...</span>
          </motion.div>
        )}
      </div>
    </div>
  );
}
