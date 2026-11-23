
import React from "react";

function NumberQuestion({
  question,
  currentRound = 1,
  totalRounds = 10,
  timeLeft = 20,
}) {
  if (!question) {
    return (
      <div className="nb-question-card">
        <p className="nb-muted">Waiting for the next question...</p>
      </div>
    );
  }

  const difficulty = question.difficulty || "medium";

  return (
    <section className="nb-question-card">
      <div className="nb-question-top">
        <span className="nb-round-label">
          Round {currentRound} / {totalRounds}
        </span>

        <span className={`nb-difficulty nb-${difficulty}`}>
          {difficulty}
        </span>
      </div>

      <div className="nb-progress-track">
        <div
          className="nb-progress-fill"
          style={{
            width: `${Math.min(
              100,
              (currentRound / Math.max(1, totalRounds)) * 100
            )}%`,
          }}
        />
      </div>

      <div className="nb-timer">
        <span className="nb-timer-icon">⏱</span>
        <span>{Math.max(0, timeLeft)}s</span>
      </div>

      <div className="nb-question-content">
        <span className="nb-question-eyebrow">Solve this</span>
        <h2>{question.question}</h2>
      </div>

      {question.hint && (
        <p className="nb-question-hint">
          <strong>Hint:</strong> {question.hint}
        </p>
      )}
    </section>
  );
}

export default NumberQuestion;
