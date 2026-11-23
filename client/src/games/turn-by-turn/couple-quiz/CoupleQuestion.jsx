
import React from "react";

function CoupleQuestion({
  question,
  currentQuestion = 1,
  totalQuestions = 10,
}) {
  if (!question) {
    return (
      <div className="cq-question-card">
        <p>Waiting for the next question...</p>
      </div>
    );
  }

  const progress =
    (currentQuestion / Math.max(1, totalQuestions)) * 100;

  return (
    <section className="cq-question-card">
      <div className="cq-question-top">
        <span>{question.category || "Couple Quiz"}</span>
        <span>
          {currentQuestion} / {totalQuestions}
        </span>
      </div>

      <div className="cq-progress-track">
        <div
          className="cq-progress-fill"
          style={{ width: `${progress}%` }}
        />
      </div>

      <div className="cq-question-content">
        <span className="cq-question-icon">💞</span>
        <h2>{question.question}</h2>
      </div>
    </section>
  );
}

export default CoupleQuestion;
