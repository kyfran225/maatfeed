import React from 'react';

interface QuizRecapCardProps {
  contentIds: string[];
  onComplete?: () => void;
}

export function QuizRecapCard({ contentIds, onComplete }: QuizRecapCardProps) {
  return (
    <div className="quiz-recap-card">
      <h3>Quiz Recap</h3>
      <p>Content IDs: {contentIds.join(', ')}</p>
      {onComplete && (
        <button onClick={onComplete}>
          Complete
        </button>
      )}
    </div>
  );
}
