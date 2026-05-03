import { useEffect, useCallback } from "react";
import { useLocation } from "react-router-dom";
import {
  initializeAnalytics,
  setUserProperties,
  trackPageView,
  trackContentView,
  trackWatchProgress,
  trackContentInteraction,
  trackLearningProgress,
  trackQuizAttempt,
  trackQuizComplete,
  trackSpacedReview,
  trackCommunityInteraction,
  trackAIInteraction,
  trackAudioListen,
  trackAudioMark,
  trackSubscriptionStart,
  trackSubscriptionComplete,
  trackSponsorAction,
  trackSessionStart,
  trackFeatureDiscovery,
  trackError
} from "../services/analyticsService";
import { useAuth } from "./useAuth";

// Initialize analytics on app start
export function useAnalyticsInit(): void {
  const { profile } = useAuth();

  useEffect(() => {
    // Initialize GA4
    initializeAnalytics();

    // Track session start
    const sessionNumber = parseInt(sessionStorage.getItem("session_number") || "0", 10) + 1;
    sessionStorage.setItem("session_number", sessionNumber.toString());

    const lastSession = localStorage.getItem("last_session_date");
    const now = new Date();
    const daysSinceLastSession = lastSession
      ? Math.floor((now.getTime() - new Date(lastSession).getTime()) / (1000 * 60 * 60 * 24))
      : undefined;

    localStorage.setItem("last_session_date", now.toISOString());

    trackSessionStart(sessionNumber, daysSinceLastSession);

    // Set user properties if authenticated
    if (profile) {
      setUserProperties({
        user_id: profile.id,
        user_trust_level: profile.trustLevel,
        subscription_status: "free", // Default, can be updated when subscription data is available
        content_language: "fr", // Default language
        account_age_days: 0 // Not available in current profile type
      });
    }
  }, [profile]);
}

// Track page views automatically
export function usePageTracking(): void {
  const location = useLocation();
  const { profile } = useAuth();

  useEffect(() => {
    const pageTitle = document.title || "MAAT FEED";
    const pageLocation = window.location.href;
    const pagePath = location.pathname + location.search;

    trackPageView(pageTitle, pageLocation, pagePath);
  }, [location, profile]);
}

// Content tracking hook
export function useContentTracking(contentId: string | undefined) {
  const trackView = useCallback(
    (
      contentTitle: string,
      contentType: "video" | "audio" | "article",
      bucket: "viral" | "educational" | "deep",
      creatorName: string,
      duration?: number
    ) => {
      if (!contentId) return;
      trackContentView(contentId, contentTitle, contentType, bucket, creatorName, duration);
    },
    [contentId]
  );

  const trackProgress = useCallback(
    (progressPercent: number, watchTimeSeconds: number, completed: boolean) => {
      if (!contentId) return;
      trackWatchProgress(contentId, progressPercent, watchTimeSeconds, completed);
    },
    [contentId]
  );

  const trackInteraction = useCallback(
    (action: "like" | "save" | "share" | "comment" | "quiz_start" | "quiz_complete", value?: number) => {
      if (!contentId) return;
      trackContentInteraction(contentId, action, value);
    },
    [contentId]
  );

  const trackLearning = useCallback(
    (
      previousStatus: "new" | "learned" | "review",
      newStatus: "new" | "learned" | "review",
      quizScore?: number
    ) => {
      if (!contentId) return;
      trackLearningProgress(contentId, previousStatus, newStatus, quizScore);
    },
    [contentId]
  );

  const trackQuiz = useCallback(
    (score: number, totalQuestions: number, correctAnswers: number, timeSpentSeconds: number) => {
      if (!contentId) return;
      trackQuizComplete(contentId, score, totalQuestions, correctAnswers, timeSpentSeconds);
    },
    [contentId]
  );

  const trackQuizQuestion = useCallback(
    (questionIndex: number, correct: boolean, responseTimeMs: number) => {
      if (!contentId) return;
      trackQuizAttempt(contentId, questionIndex, correct, responseTimeMs);
    },
    [contentId]
  );

  const trackReview = useCallback(
    (reviewCount: number, daysSinceLastReview: number) => {
      if (!contentId) return;
      trackSpacedReview(contentId, reviewCount, daysSinceLastReview);
    },
    [contentId]
  );

  return {
    trackView,
    trackProgress,
    trackInteraction,
    trackLearning,
    trackQuiz,
    trackQuizQuestion,
    trackReview
  };
}

// Community tracking hook
export function useCommunityTracking() {
  const trackPost = useCallback((postId: string, postType?: "discussion" | "question" | "post") => {
    trackCommunityInteraction("post_create", postId, postType);
  }, []);

  const trackUpvote = useCallback((postId: string, postType?: "discussion" | "question" | "post") => {
    trackCommunityInteraction("post_upvote", postId, postType);
  }, []);

  const trackComment = useCallback((postId: string) => {
    trackCommunityInteraction("comment", postId);
  }, []);

  const trackReply = useCallback((postId: string) => {
    trackCommunityInteraction("reply", postId);
  }, []);

  const trackAICorrection = useCallback((postId: string, aiPersona?: string) => {
    trackAIInteraction("ai_correction_click", postId, aiPersona);
  }, []);

  const trackAIReply = useCallback((postId: string, aiPersona?: string) => {
    trackAIInteraction("ai_reply_click", postId, aiPersona);
  }, []);

  const trackAIVote = useCallback((postId: string, vote: "up" | "down", aiPersona?: string) => {
    trackAIInteraction(vote === "up" ? "ai_vote_up" : "ai_vote_down", postId, aiPersona);
  }, []);

  return {
    trackPost,
    trackUpvote,
    trackComment,
    trackReply,
    trackAICorrection,
    trackAIReply,
    trackAIVote
  };
}

// Audio tracking hook
export function useAudioTracking(trackId: string | undefined) {
  const trackListen = useCallback(
    (trackTitle: string, playlistId: string | null, startTime: number, isResumed: boolean) => {
      if (!trackId) return;
      trackAudioListen(trackId, trackTitle, playlistId, startTime, isResumed);
    },
    [trackId]
  );

  const trackMark = useCallback(
    (markTime: number, hasNote: boolean) => {
      if (!trackId) return;
      trackAudioMark(trackId, markTime, hasNote);
    },
    [trackId]
  );

  return { trackListen, trackMark };
}

// Subscription tracking hook
export function useSubscriptionTracking() {
  const trackStart = useCallback(
    (plan: "premium_monthly" | "creator_monthly", source: "feed" | "profile" | "sponsor" | "popup") => {
      trackSubscriptionStart(plan, source);
    },
    []
  );

  const trackComplete = useCallback(
    (
      plan: "premium_monthly" | "creator_monthly",
      value: number,
      currency: string = "EUR",
      transactionId?: string
    ) => {
      trackSubscriptionComplete(plan, value, currency, transactionId);
    },
    []
  );

  return { trackStart, trackComplete };
}

// Sponsor tracking hook
export function useSponsorTracking(sponsorId: string | undefined, sponsorName: string | undefined) {
  const trackView = useCallback(() => {
    if (!sponsorId || !sponsorName) return;
    trackSponsorAction("view", sponsorId, sponsorName);
  }, [sponsorId, sponsorName]);

  const trackClick = useCallback(() => {
    if (!sponsorId || !sponsorName) return;
    trackSponsorAction("click", sponsorId, sponsorName);
  }, [sponsorId, sponsorName]);

  const trackApply = useCallback(() => {
    if (!sponsorId || !sponsorName) return;
    trackSponsorAction("apply", sponsorId, sponsorName);
  }, [sponsorId, sponsorName]);

  return { trackView, trackClick, trackApply };
}

// Feature discovery tracking
export function useFeatureDiscovery() {
  const trackDiscovery = useCallback((feature: string) => {
    trackFeatureDiscovery(feature);
  }, []);

  return { trackDiscovery };
}

// Error tracking
export function useErrorTracking() {
  const track = useCallback((errorType: string, errorMessage: string, component?: string) => {
    trackError(errorType, errorMessage, component);
  }, []);

  return { trackError: track };
}

// Combined hook for easy usage
export function useAnalytics() {
  useAnalyticsInit();
  usePageTracking();

  return {
    content: useContentTracking,
    community: useCommunityTracking,
    audio: useAudioTracking,
    subscription: useSubscriptionTracking,
    sponsor: useSponsorTracking,
    feature: useFeatureDiscovery,
    error: useErrorTracking
  };
}
