import { useState } from "react";
import { CheckCircle2, X, Sparkles } from "lucide-react";
import type { RecapQuiz, QuizResponse } from "../../services/quizService";
import { getRecapQuiz, submitRecapQuizAnswer } from "../../services/quizService";

interface QuizRecapCardProps {
  contentIds: string[];
  onComplete?: () => void;
}

export function QuizRecapCard({ contentIds, onComplete }: QuizRecapCardProps) {
  const [loading, setLoading] = useState(false);
  const [quiz, setQuiz] = useState<RecapQuiz | null>(null);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [result, setResult] = useState<QuizResponse | null>(null);

  const handleStart = async () => {
    setLoading(true);
    try {
      const q = await getRecapQuiz(contentIds);
      if (q) {
        setQuiz(q);
        setSelectedAnswer(null);
        setResult(null);
      }
    } catch (error) {
      console.error("Failed to load recap quiz:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!quiz || !selectedAnswer) return;

    setLoading(true);
    try {
      const response = await submitRecapQuizAnswer(selectedAnswer, quiz);
      setResult(response);
      onComplete?.();
    } catch (error) {
      console.error("Failed to submit answer:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setQuiz(null);
    setSelectedAnswer(null);
    setResult(null);
  };

  // Preview state - before user clicks
  if (!quiz && !result) {
    return (
      <article className="overflow-hidden rounded-lg border border-amber-300/20 bg-gradient-to-br from-amber-400/5 to-transparent p-4">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-400/10">
            <Sparkles className="h-5 w-5 text-amber-300" />
          </div>
          <div className="flex-1">
            <h3 className="font-medium text-white">Récap rapide</h3>
            <p className="text-sm text-sand/60">
              2 questions sur ce que tu viens de voir
            </p>
          </div>
          <button
            onClick={handleStart}
            disabled={loading}
            className="rounded-md bg-gold px-3 py-1.5 text-sm font-medium text-ink transition hover:bg-gold/90 disabled:opacity-50"
          >
            {loading ? "..." : "Go"}
          </button>
        </div>
      </article>
    );
  }

  // Quiz question state
  if (quiz && !result) {
    return (
      <article className="overflow-hidden rounded-lg border border-amber-300/20 bg-gradient-to-br from-amber-400/5 to-transparent p-4">
        <div className="mb-3 flex items-center justify-between">
          <span className="text-xs uppercase tracking-wider text-amber-300/70">Récap</span>
          <button onClick={handleClose} className="rounded p-1 hover:bg-white/10">
            <X className="h-4 w-4 text-sand/50" />
          </button>
        </div>

        <p className="mb-3 text-sm text-white">{quiz.question}</p>

        <div className="space-y-1.5">
          {quiz.options.map((option, idx) => (
            <button
<<<<<<< HEAD
              key={idx}
              onClick={() => setSelectedAnswer(option)}
              disabled={loading}
              className={`w-full rounded-md border px-3 py-2 text-left text-sm transition ${
                selectedAnswer === option
=======
              key={`option-${idx}`}
              onClick={() => setSelectedAnswer(String(option))}
              disabled={loading}
              className={`w-full rounded-md border px-3 py-2 text-left text-sm transition ${
                selectedAnswer === String(option)
>>>>>>> staging
                  ? "border-gold bg-gold/10 text-white"
                  : "border-white/10 bg-white/[0.04] text-sand/70 hover:bg-white/[0.08]"
              }`}
            >
<<<<<<< HEAD
              {option}
=======
              {String(option)}
>>>>>>> staging
            </button>
          ))}
        </div>

        <button
          onClick={handleSubmit}
          disabled={!selectedAnswer || loading}
          className="mt-3 w-full rounded-md bg-gold py-2 text-sm font-medium text-ink transition disabled:opacity-50 hover:bg-gold/90"
        >
          {loading ? "..." : "Valider"}
        </button>
      </article>
    );
  }

  // Result state
  return (
    <article className="overflow-hidden rounded-lg border border-amber-300/20 bg-gradient-to-br from-amber-400/5 to-transparent p-4">
      <div className="flex items-start gap-3">
        <CheckCircle2
          className={`h-5 w-5 flex-shrink-0 ${
            result?.correct ? "text-emerald-400" : "text-amber-400"
          }`}
        />
        <div className="flex-1">
          <p className="text-sm text-white">{result?.feedback}</p>
          <p className="mt-1 text-xs text-sand/50">{result?.explanation}</p>
        </div>
      </div>
      <button
        onClick={handleClose}
        className="mt-3 w-full rounded-md border border-white/10 bg-white/[0.04] py-2 text-sm text-sand/70 transition hover:bg-white/[0.08]"
      >
        Continuer
      </button>
    </article>
  );
}
