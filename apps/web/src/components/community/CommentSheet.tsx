import { motion, AnimatePresence } from "framer-motion";
import { useCallback, useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  useComments,
  useCreateComment,
  useCreateReply,
  useLikeComment,
  useUnlikeComment,
  useLikeReply,
  useUnlikeReply,
  useReportComment,
  useReportReply,
} from "../../hooks/useComments";
import { useAuth } from "../../hooks/useAuth";
import type { ReplyMutationAnalytics } from "../../services/commentService";
import { CommentThread } from "../comments/CommentThread";
import { CommentComposer } from "./CommentComposer";

const useDelayedFetching = (isFetching: boolean, delayMs = 800) => {
  const [showFetching, setShowFetching] = useState(false);

  useEffect(() => {
    if (!isFetching) {
      setShowFetching(false);
      return;
    }

    const timer = setTimeout(() => {
      setShowFetching(true);
    }, delayMs);

    return () => clearTimeout(timer);
  }, [isFetching, delayMs]);

  return showFetching;
};

interface CommentSheetProps {
  isOpen: boolean;
  onClose: () => void;
  contentId: string;
}

export function CommentSheet({ isOpen, onClose, contentId }: CommentSheetProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, isBootstrapping } = useAuth();
  const createCommentMutation = useCreateComment(contentId);
  const createReplyMutation = useCreateReply(contentId);
  const likeCommentMutation = useLikeComment(contentId);
  const unlikeCommentMutation = useUnlikeComment(contentId);
  const likeReplyMutation = useLikeReply();
  const unlikeReplyMutation = useUnlikeReply();
  const reportCommentMutation = useReportComment();
  const reportReplyMutation = useReportReply();
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isComposerFocused, setIsComposerFocused] = useState(false);
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [highlightedCommentId, setHighlightedCommentId] = useState<string | null>(null);
  const { data: comments, isLoading, error, isFetching } = useComments(contentId, {
    live: isOpen,
    pauseLive: Boolean(replyingTo) || createCommentMutation.isPending || createReplyMutation.isPending,
    intervalMs: 15_000
  });
  const showFetchingIndicator = useDelayedFetching(isFetching, 800);

  useEffect(() => {
    if (!highlightedCommentId) {
      return;
    }

    const timeoutId = window.setTimeout(() => {
      setHighlightedCommentId(null);
    }, 2200);

    return () => window.clearTimeout(timeoutId);
  }, [highlightedCommentId]);

  // Block body scroll when sheet is open
  useEffect(() => {
    if (isOpen) {
      const originalOverflow = document.body.style.overflow;
      const originalTouchAction = document.body.style.touchAction;
      document.body.style.overflow = "hidden";
      document.body.style.touchAction = "none";

      return () => {
        document.body.style.overflow = originalOverflow;
        document.body.style.touchAction = originalTouchAction;
      };
    }
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) {
      setSubmitError(null);
      setIsComposerFocused(false);
      setReplyingTo(null);
      setHighlightedCommentId(null);
    }
  }, [isOpen]);

  const ensureAuthenticated = useCallback(() => {
    if (isBootstrapping) {
      return false;
    }

    if (!isAuthenticated) {
      const returnTo = `${location.pathname}${location.search}${location.hash}`;
      onClose();
      navigate(`/auth?returnTo=${encodeURIComponent(returnTo)}`);
      return false;
    }

    return true;
  }, [isAuthenticated, isBootstrapping, location.hash, location.pathname, location.search, navigate, onClose]);

  const handleCommentSubmit = async (body: string) => {
    setSubmitError(null);

    if (!ensureAuthenticated()) {
      return false;
    }

    try {
      await createCommentMutation.mutateAsync(body);
      return true;
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : "Échec de publication du commentaire.");
      return false;
    }
  };

  const handleReplySubmit = useCallback((
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
    });
  }, [createReplyMutation, ensureAuthenticated]);

  const handleReplyToReplySubmit = useCallback((
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
    });
  }, [createReplyMutation, ensureAuthenticated]);

  const handleVote = useCallback((commentId: string, direction: "up" | "down" | null) => {
    if (!ensureAuthenticated()) {
      return;
    }

    if (direction === "up") {
      likeCommentMutation.mutate(commentId);
      return;
    }

    unlikeCommentMutation.mutate(commentId);
  }, [ensureAuthenticated, likeCommentMutation, unlikeCommentMutation]);

  const handleReplyVote = useCallback((replyId: string, direction: "up" | "down" | null) => {
    if (!ensureAuthenticated()) {
      return;
    }

    if (direction === "up") {
      likeReplyMutation.mutate(replyId);
      return;
    }

    unlikeReplyMutation.mutate(replyId);
  }, [ensureAuthenticated, likeReplyMutation, unlikeReplyMutation]);

  const handleReport = useCallback((commentId: string, reason: string) => {
    if (!ensureAuthenticated()) {
      return;
    }

    reportCommentMutation.mutate({
      commentId,
      reason: reason as "spam" | "harassment" | "hate_speech" | "misinformation" | "inappropriate" | "other"
    });
  }, [ensureAuthenticated, reportCommentMutation]);

  const handleReplyReport = useCallback((replyId: string, reason: string) => {
    if (!ensureAuthenticated()) {
      return;
    }

    reportReplyMutation.mutate({
      replyId,
      reason: reason as "spam" | "harassment" | "hate_speech" | "misinformation" | "inappropriate" | "other"
    });
  }, [ensureAuthenticated, reportReplyMutation]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          data-overlay="true"
          className="fixed inset-0 z-[210] flex items-end"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            className="bg-ink border-t border-white/10 rounded-t-3xl w-full h-[82vh] sm:h-[88vh] max-h-[82vh] sm:max-h-[88vh] overflow-hidden flex flex-col"
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 30, stiffness: 300 }}
            onClick={(e) => e.stopPropagation()}
            drag={createCommentMutation.isPending || createReplyMutation.isPending || isComposerFocused ? false : "y"}
            dragConstraints={{ top: 0, bottom: 0 }}
            dragElastic={{ top: 0, bottom: 0.18 }}
            dragMomentum={false}
            onDragEnd={(_, info) => {
              const shouldClose = info.offset.y > 140 || info.velocity.y > 900;
              if (shouldClose) onClose();
            }}
            style={{ touchAction: "pan-y" }}
          >
            <div className="flex justify-center py-2">
              <div className="h-1 w-10 rounded-full bg-white/20" />
            </div>

            <div className="flex items-center justify-between border-b border-white/10 px-4 py-2.5 sm:px-6 sm:py-3">
              <div>
                <p className="text-xs sm:text-sm text-sand/70">
                  {comments?.length || 0} commentaire{comments?.length !== 1 ? "s" : ""}
                </p>
                {showFetchingIndicator && !isLoading && (
                  <p className="mt-0.5 text-[11px] text-sand/45">Mise à jour en direct…</p>
                )}
              </div>
              <button
                data-close="true"
                onClick={onClose}
                className="flex h-7 w-7 items-center justify-center rounded-full bg-white/10 transition-colors hover:bg-white/20 sm:h-8 sm:w-8"
                aria-label="Close comments"
              >
                <svg className="h-4 w-4 text-white sm:h-5 sm:w-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="flex-1 overflow-y-auto overscroll-contain px-4 sm:px-6 py-3 sm:py-4" style={{ touchAction: "pan-y" }}>
              {error ? (
                <div className="rounded-[1rem] border border-red-500/30 bg-red-500/10 p-4">
                  <p className="text-red-400">Erreur lors du chargement des commentaires</p>
                </div>
              ) : (
                <CommentThread
                  comments={comments || []}
                  contentId={contentId}
                  isLoading={isLoading}
                  isRefreshing={showFetchingIndicator && !isLoading}
                  emptyStateTitle="Aucune contribution pour le moment"
                  emptyStateAuthenticatedSubtitle="Soyez le premier à lancer la discussion !"
                  emptyStateGuestSubtitle="Connectez-vous pour participer à la discussion"
                  onReply={handleReplySubmit}
                  onReplyToReply={handleReplyToReplySubmit}
                  onVote={handleVote}
                  onReplyVote={handleReplyVote}
                  onReport={handleReport}
                  onReplyReport={handleReplyReport}
                  isCreating={createCommentMutation.isPending || createReplyMutation.isPending}
                  replyingTo={replyingTo}
                  setReplyingTo={setReplyingTo}
                  onHighlightMessage={setHighlightedCommentId}
                  highlightedCommentId={highlightedCommentId}
                />
              )}
            </div>

            <div className="border-t border-white/10 p-4 sm:p-6">
              <CommentComposer
                onSubmit={handleCommentSubmit}
                disabled={createCommentMutation.isPending || createReplyMutation.isPending}
                placeholder="Partagez votre point de vue..."
                errorMessage={submitError}
                onFocusChange={setIsComposerFocused}
              />
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
