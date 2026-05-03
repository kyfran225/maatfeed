import { getJson } from "./httpClient";

export interface QuizQuestion {
  contentId: string;
  question: string;
  options: string[];
}

export interface QuizResponse {
  correct: boolean;
  explanation: string;
  feedback: string;
}

export async function getQuizQuestion(contentId: string): Promise<QuizQuestion | null> {
  try {
    const response = await getJson<{ data: QuizQuestion }>(
      `/api/learning/quiz/${contentId}`
    );
    return response?.data ?? null;
  } catch {
    return null;
  }
}

export async function submitQuizAnswer(
  contentId: string,
  answer: string,
  quiz: QuizQuestion
): Promise<QuizResponse> {
  const response = await getJson<{ data: QuizResponse }>(
    `/api/learning/quiz/${contentId}/answer`,
    {
      method: "POST",
      body: JSON.stringify({ answer, quiz })
    }
  );
  return response?.data ?? { correct: false, explanation: "", feedback: "" };
}
