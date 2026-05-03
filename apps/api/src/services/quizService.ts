import mongoose from "mongoose";
import { ContentModel } from "../models/Content.js";
import { generateWithAIRouter } from "./aiRouterService.js";

export type QuizQuestion = {
  question: string;
  options: string[];
  correctIndex: number; // 0-based index of correct answer
  explanation: string;
};

export type QuizDTO = {
  contentId: string;
  question: string;
  options: string[];
  explanation: string;
};

function assertObjectId(value: string, field: string) {
  if (!mongoose.isValidObjectId(value)) {
    throw new Error(`${field} invalide`);
  }
}

async function generateQuizWithAI(content: {
  title: string;
  description?: string;
  summary?: string;
  transcript?: string;
}): Promise<QuizQuestion | null> {
  try {
    const contentText = [
      content.title,
      content.description,
      content.summary,
      content.transcript
    ]
      .filter(Boolean)
      .join("\n\n");

    if (!contentText || contentText.length < 50) {
      return null;
    }

    const userPrompt = `Génère UNE seule question (pas un quiz) basée sur ce contenu :

---
${contentText.substring(0, 1000)}
---

Règles STRICTES :
1. La question doit être brève (une phrase)
2. Propose 3 réponses seulement
3. La réponse correcte doit être à l'index 0, puis mélange les autres
4. L'explication doit être courte et utile
5. Ne pas utiliser de vocabulaire scolaire ("quiz", "test", "répondez")

Réponds UNIQUEMENT en JSON valide, sans backticks, dans ce format exact :
{
  "question": "...",
  "options": ["réponse correcte", "mauvaise réponse", "mauvaise réponse"],
  "correctIndex": 0,
  "explanation": "..."
}`;

    const routed = await generateWithAIRouter({
      complex: false,
      fast: true,
      maxTokens: 300,
      temperature: 0.7,
      systemPrompt: "Tu es un expert en création de questions de compréhension discrètes. Génère une question brève en JSON.",
      userPrompt
    });

    if (!routed || !routed.text) {
      return null;
    }

    const jsonMatch = routed.text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      return null;
    }

    const parsed = JSON.parse(jsonMatch[0]) as QuizQuestion;

    // Validate structure
    if (
      !parsed.question ||
      !Array.isArray(parsed.options) ||
      parsed.options.length !== 3 ||
      typeof parsed.correctIndex !== "number" ||
      !parsed.explanation
    ) {
      return null;
    }

    // Shuffle options but track correct index
    const optionsWithIndex = parsed.options.map((opt, idx) => ({
      option: opt,
      isCorrect: idx === parsed.correctIndex
    }));

    const shuffled = optionsWithIndex.sort(() => Math.random() - 0.5);
    const newCorrectIndex = shuffled.findIndex(item => item.isCorrect);

    return {
      question: parsed.question,
      options: shuffled.map(item => item.option),
      correctIndex: newCorrectIndex,
      explanation: parsed.explanation
    };
  } catch (error) {
    console.error("Error generating quiz with AI:", error);
    return null;
  }
}

export async function generateQuizForContent(contentId: string): Promise<QuizDTO | null> {
  assertObjectId(contentId, "contentId");

  try {
    const content = await ContentModel.findById(contentId).select(
      "title description summary transcript"
    ).lean();

    if (!content) {
      throw new Error("Contenu introuvable");
    }

    const quiz = await generateQuizWithAI(content as any);
    if (!quiz) {
      return null;
    }

    return {
      contentId,
      question: quiz.question,
      options: quiz.options,
      explanation: quiz.explanation
    };
  } catch (error) {
    console.error("Error generating quiz for content:", error);
    return null;
  }
}

export async function validateQuizAnswer(
  contentId: string,
  answer: string,
  quiz: QuizQuestion
): Promise<{ correct: boolean; explanation: string }> {
  try {
    const selectedIndex = quiz.options.indexOf(answer);
    const isCorrect = selectedIndex === quiz.correctIndex;

    return {
      correct: isCorrect,
      explanation: quiz.explanation
    };
  } catch (error) {
    console.error("Error validating quiz answer:", error);
    throw error;
  }
}
