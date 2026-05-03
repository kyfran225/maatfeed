// GA4 Analytics Service for MAAT FEED
// Tracks user interactions and learning progress

const GA4_MEASUREMENT_ID = import.meta.env.VITE_GA4_MEASUREMENT_ID || "G-XXXXXXXXXX";

// User properties
interface UserProperties {
  user_id?: string;
  user_trust_level?: string;
  subscription_status?: "free" | "premium";
  content_language?: string;
  account_age_days?: number;
}

// Event parameters
interface EventParams {
  [key: string]: string | number | boolean | undefined;
}

// Initialize GA4
declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
    dataLayer?: unknown[];
  }
}

export function initializeAnalytics(): void {
  if (typeof window === "undefined") return;
  if (!GA4_MEASUREMENT_ID || GA4_MEASUREMENT_ID === "G-XXXXXXXXXX") {
    console.warn("[Analytics] GA4 Measurement ID not configured");
    return;
  }

  // Load GA4 script
  const script = document.createElement("script");
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${GA4_MEASUREMENT_ID}`;
  document.head.appendChild(script);

  // Initialize dataLayer
  window.dataLayer = window.dataLayer || [];
  window.gtag = function (...args: unknown[]) {
    window.dataLayer?.push(args);
  };

  window.gtag("js", new Date());
  window.gtag("config", GA4_MEASUREMENT_ID, {
    send_page_view: false, // We'll handle page views manually
    cookie_flags: "SameSite=None;Secure",
    custom_map: {
      custom_parameter_1: "content_id",
      custom_parameter_2: "learning_status",
      custom_parameter_3: "interaction_type"
    }
  });

  console.log("[Analytics] GA4 initialized");
}

// Set user properties
export function setUserProperties(properties: UserProperties): void {
  if (!window.gtag) return;

  window.gtag("set", "user_properties", {
    ...properties,
    platform: "web"
  });
}

// Track page view
export function trackPageView(
  pageTitle: string,
  pageLocation: string,
  pagePath: string
): void {
  if (!window.gtag) return;

  window.gtag("event", "page_view", {
    page_title: pageTitle,
    page_location: pageLocation,
    page_path: pagePath,
    send_to: GA4_MEASUREMENT_ID
  });
}

// ==================== CONTENT EVENTS ====================

// Track content view
export function trackContentView(
  contentId: string,
  contentTitle: string,
  contentType: "video" | "audio" | "article",
  bucket: "viral" | "educational" | "deep",
  creatorName: string,
  duration?: number
): void {
  if (!window.gtag) return;

  window.gtag("event", "content_view", {
    content_id: contentId,
    content_title: contentTitle.slice(0, 100),
    content_type: contentType,
    content_bucket: bucket,
    creator_name: creatorName,
    duration_seconds: duration,
    event_category: "engagement",
    event_label: contentId
  });
}

// Track watch progress
export function trackWatchProgress(
  contentId: string,
  progressPercent: number,
  watchTimeSeconds: number,
  completed: boolean
): void {
  if (!window.gtag) return;

  // Track milestones: 25%, 50%, 75%, 90%, 100%
  const milestones = [25, 50, 75, 90, 100];
  const milestone = milestones.find(m => progressPercent >= m && progressPercent < m + 5);

  if (milestone || completed) {
    window.gtag("event", "watch_progress", {
      content_id: contentId,
      progress_percent: progressPercent,
      watch_time_seconds: watchTimeSeconds,
      milestone_reached: milestone || (completed ? 100 : undefined),
      completed: completed,
      event_category: "engagement"
    });
  }
}

// Track content interaction
export function trackContentInteraction(
  contentId: string,
  action: "like" | "save" | "share" | "comment" | "quiz_start" | "quiz_complete",
  value?: number
): void {
  if (!window.gtag) return;

  window.gtag("event", action, {
    content_id: contentId,
    event_category: "engagement",
    event_label: contentId,
    value: value
  });
}

// ==================== LEARNING EVENTS ====================

// Track learning progress update
export function trackLearningProgress(
  contentId: string,
  previousStatus: "new" | "learned" | "review",
  newStatus: "new" | "learned" | "review",
  quizScore?: number
): void {
  if (!window.gtag) return;

  window.gtag("event", "learning_progress", {
    content_id: contentId,
    previous_status: previousStatus,
    new_status: newStatus,
    quiz_score: quizScore,
    mastered: newStatus === "learned",
    needs_review: newStatus === "review",
    event_category: "learning"
  });
}

// Track quiz attempt
export function trackQuizAttempt(
  contentId: string,
  questionIndex: number,
  correct: boolean,
  responseTimeMs: number
): void {
  if (!window.gtag) return;

  window.gtag("event", "quiz_attempt", {
    content_id: contentId,
    question_index: questionIndex,
    correct: correct,
    response_time_ms: responseTimeMs,
    event_category: "learning"
  });
}

// Track quiz completion
export function trackQuizComplete(
  contentId: string,
  score: number,
  totalQuestions: number,
  correctAnswers: number,
  timeSpentSeconds: number
): void {
  if (!window.gtag) return;

  const percentage = Math.round((correctAnswers / totalQuestions) * 100);

  window.gtag("event", "quiz_complete", {
    content_id: contentId,
    score: score,
    total_questions: totalQuestions,
    correct_answers: correctAnswers,
    percentage: percentage,
    time_spent_seconds: timeSpentSeconds,
    passed: percentage >= 70,
    event_category: "learning"
  });
}

// Track spaced repetition review
export function trackSpacedReview(
  contentId: string,
  reviewCount: number,
  daysSinceLastReview: number
): void {
  if (!window.gtag) return;

  window.gtag("event", "spaced_review", {
    content_id: contentId,
    review_count: reviewCount,
    days_since_last_review: daysSinceLastReview,
    event_category: "learning"
  });
}

// ==================== COMMUNITY EVENTS ====================

// Track community interaction
export function trackCommunityInteraction(
  action: "post_create" | "post_upvote" | "comment" | "reply",
  postId: string,
  postType?: "discussion" | "question" | "post"
): void {
  if (!window.gtag) return;

  window.gtag("event", action, {
    post_id: postId,
    post_type: postType,
    event_category: "community"
  });
}

// Track AI interaction
export function trackAIInteraction(
  action: "ai_correction_click" | "ai_reply_click" | "ai_vote_up" | "ai_vote_down",
  postId: string,
  aiPersona?: string
): void {
  if (!window.gtag) return;

  window.gtag("event", action, {
    post_id: postId,
    ai_persona: aiPersona,
    event_category: "ai_interaction"
  });
}

// ==================== AUDIO EVENTS ====================

// Track audio listening
export function trackAudioListen(
  trackId: string,
  trackTitle: string,
  playlistId: string | null,
  startTime: number,
  isResumed: boolean
): void {
  if (!window.gtag) return;

  window.gtag("event", "audio_listen", {
    track_id: trackId,
    track_title: trackTitle.slice(0, 100),
    playlist_id: playlistId,
    start_time_seconds: startTime,
    resumed: isResumed,
    event_category: "audio"
  });
}

// Track audio mark creation
export function trackAudioMark(
  trackId: string,
  markTime: number,
  hasNote: boolean
): void {
  if (!window.gtag) return;

  window.gtag("event", "audio_mark", {
    track_id: trackId,
    mark_time_seconds: markTime,
    has_note: hasNote,
    event_category: "audio"
  });
}

// ==================== CONVERSION EVENTS ====================

// Track subscription attempt
export function trackSubscriptionStart(
  plan: "premium_monthly" | "creator_monthly",
  source: "feed" | "profile" | "sponsor" | "popup"
): void {
  if (!window.gtag) return;

  window.gtag("event", "begin_checkout", {
    plan: plan,
    source: source,
    event_category: "ecommerce"
  });
}

// Track subscription complete
export function trackSubscriptionComplete(
  plan: "premium_monthly" | "creator_monthly",
  value: number,
  currency: string = "EUR",
  transactionId?: string
): void {
  if (!window.gtag) return;

  window.gtag("event", "purchase", {
    transaction_id: transactionId,
    value: value,
    currency: currency,
    plan: plan,
    event_category: "ecommerce"
  });
}

// Track sponsor action
export function trackSponsorAction(
  action: "view" | "click" | "apply",
  sponsorId: string,
  sponsorName: string
): void {
  if (!window.gtag) return;

  window.gtag("event", `sponsor_${action}`, {
    sponsor_id: sponsorId,
    sponsor_name: sponsorName,
    event_category: "sponsor"
  });
}

// ==================== RETENTION EVENTS ====================

// Track session start
export function trackSessionStart(
  sessionNumber: number,
  daysSinceLastSession?: number
): void {
  if (!window.gtag) return;

  window.gtag("event", "session_start_custom", {
    session_number: sessionNumber,
    days_since_last_session: daysSinceLastSession,
    event_category: "retention"
  });
}

// Track feature discovery
export function trackFeatureDiscovery(feature: string): void {
  if (!window.gtag) return;

  window.gtag("event", "feature_discovery", {
    feature: feature,
    event_category: "onboarding"
  });
}

// Track error
export function trackError(
  errorType: string,
  errorMessage: string,
  component?: string
): void {
  if (!window.gtag) return;

  window.gtag("event", "exception", {
    description: `${errorType}: ${errorMessage.slice(0, 150)}`,
    fatal: false,
    component: component,
    event_category: "error"
  });
}

// Debug mode
export function setAnalyticsDebug(debug: boolean): void {
  if (!window.gtag) return;

  window.gtag("config", GA4_MEASUREMENT_ID, {
    debug_mode: debug
  });
}
