import { getJson, postJson } from "./httpClient";

export type LearningProgressStatus = "new" | "learned" | "review";

export type LearningProgressItem = {
  contentId: string;
  status: LearningProgressStatus;
  quizAttempts: number;
  correctQuizAttempts: number;
  lastQuizResult: boolean | null;
  lastReviewedAt: string | null;
  nextReviewAt: string | null;
  learnedAt: string | null;
  updatedAt: string;
};

export type LearningSummary = {
  learned: number;
  review: number;
  dueForReview: number;
  total: number;
};

export type LearningProgressResponse = {
  items: LearningProgressItem[];
  summary: LearningSummary;
};

export type LearningCoachResult = {
  feedback: string;
  gap: string;
  nextQuestion: string;
};

export async function getLearningProgress(contentIds: string[]) {
  const params = new URLSearchParams();
  if (contentIds.length > 0) {
    params.set("contentIds", contentIds.join(","));
  }

  const response = await getJson<{ data: LearningProgressResponse }>(`/api/learning/progress?${params.toString()}`);
  return response.data;
}

export async function updateLearningProgress(input: {
  contentId: string;
  status: LearningProgressStatus;
  quizCorrect?: boolean;
}) {
  const response = await postJson<{
    data: {
      progress: LearningProgressItem;
      summary: LearningSummary;
    };
  }>("/api/learning/progress", input);

  return response.data;
}

export async function requestLearningCoach(input: {
  answer: string;
  contextTitle?: string;
  contextDescription?: string;
}) {
  const response = await postJson<{ data: LearningCoachResult }>("/api/learning/coach", input);
  return response.data;
}
