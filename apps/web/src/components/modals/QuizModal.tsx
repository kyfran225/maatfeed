import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { CheckCircle2, X } from "lucide-react";
import type { QuizQuestion } from "../../services/quizService";
import { getQuizQuestion, submitQuizAnswer } from "../../services/quizService";
import { useAuth } from "../../hooks/useAuth";

interface QuizModalProps {
  contentId: string;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (correct: boolean) => void;
}

export function QuizModal({ contentId, isOpen, onClose, onSuccess }: QuizModalProps) {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = useState(false);
  const [quiz, setQuiz] = useState<QuizQuestion | null>(null);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [result, setResult] = useState<{
    correct: boolean;
    feedback: string;
    explanation: string;
  } | null>(null);

  const redirectToAuth = () => {
    const returnTo = `${location.pathname}${location.search}${location.hash}`;
    navigate(`/auth?returnTo=${encodeURIComponent(returnTo)}`);
  };

  const handleOpenQuiz = async () => {
    setLoading(true);
    try {
      const q = await getQuizQuestion(contentId);
      if (q) {
        setQuiz(q);
        setSelectedAnswer(null);
        setResult(null);
      } else {
        onClose();
      }
    } catch (error) {
      console.error("Failed to load quiz:", error);
      onClose();
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!quiz || !selectedAnswer) return;

    if (!isAuthenticated) {
      redirectToAuth();
      return;
    }

    setLoading(true);
    try {
      const response = await submitQuizAnswer(contentId, selectedAnswer, quiz);
      setResult({
        correct: response.correct,
        feedback: response.feedback,
        explanation: response.explanation
      });
      onSuccess(response.correct);
    } catch (error) {
      console.error("Failed to submit answer:", error);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-md rounded-xl border border-white/10 bg-gradient-to-b from-white/8 to-white/3 p-6 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute right-4 top-4 rounded-lg p-1 hover:bg-white/10"
        >
          <X className="h-5 w-5" />
        </button>

        {!quiz && !result && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-white">Vérifier ta compréhension</h3>
            <p className="text-sm text-sand/70">
              Une question rapide basée sur ce contenu. Pas de note, juste pour vérifier.
            </p>
            <button
              onClick={handleOpenQuiz}
              disabled={loading}
              className="w-full rounded-lg bg-gold px-4 py-2 text-sm font-semibold text-ink transition disabled:opacity-50 hover:bg-gold/90"
            >
              {loading ? "Chargement..." : "Commencer"}
            </button>
            <button
              onClick={onClose}
              className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold text-sand/70 transition hover:bg-white/10"
            >
              Plus tard
            </button>
          </div>
        )}

        {quiz && !result && (
          <div className="space-y-4">
            <h3 className="text-base font-semibold text-white">{quiz.question}</h3>
            {!isAuthenticated && (
              <div className="rounded-2xl border border-amber-300/20 bg-amber-300/5 p-3 text-sm text-amber-100">
                Pour conserver ta réponse et mettre à jour ton suivi, connecte-toi d'abord.
              </div>
            )}
            <div className="space-y-2">
              {quiz.options.map((option, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedAnswer(option)}
                  className={`w-full rounded-lg border px-3 py-2 text-left text-sm transition ${
                    selectedAnswer === option
                      ? "border-gold bg-gold/10 text-white"
                      : "border-white/10 bg-white/5 text-sand/70 hover:bg-white/10"
                  }`}
                >
                  {option}
                </button>
              ))}
            </div>
            <button
              onClick={handleSubmit}
              disabled={!selectedAnswer || loading}
              className="w-full rounded-lg bg-gold px-4 py-2 text-sm font-semibold text-ink transition disabled:opacity-50 hover:bg-gold/90"
            >
              {loading ? "Vérification..." : isAuthenticated ? "Valider" : "Se connecter pour valider"}
            </button>
          </div>
        )}

        {result && (
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <CheckCircle2
                className={`h-6 w-6 flex-shrink-0 ${
                  result.correct ? "text-emerald-400" : "text-amber-400"
                }`}
              />
              <div>
                <p className="font-semibold text-white">{result.feedback}</p>
                <p className="mt-1 text-sm text-sand/70">{result.explanation}</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="w-full rounded-lg bg-gold px-4 py-2 text-sm font-semibold text-ink transition hover:bg-gold/90"
            >
              Fermer
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
