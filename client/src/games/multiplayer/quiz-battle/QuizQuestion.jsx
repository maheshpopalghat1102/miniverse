
import React from "react";
import QuizOptions from "./QuizOptions";

function QuizQuestion({
  question,
  questionNumber,
  totalQuestions,
  selectedIndex,
  onSelect,
  disabled,
  remainingTime,
  correctIndex,
  showCorrectAnswer,
  explanation,
}) {
  if (!question) return null;

  const progress = Math.max(
    0,
    Math.min(100, (remainingTime / 20) * 100)
  );

  return (
    <div className="qb-question-card">
      <div className="qb-question-top">
        <span>
          Question {questionNumber} of {totalQuestions}
        </span>

        <span className="qb-question-category">
          {question.category || "General Knowledge"}
        </span>
      </div>

      <div className="qb-timer">
        <div className="qb-timer-label">
          <span>Time remaining</span>
          <strong>{remainingTime}s</strong>
        </div>

        <div className="qb-timer-track">
          <div
            className="qb-timer-progress"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      <h2 className="qb-question-text">
        {question.question}
      </h2>

      <QuizOptions
        options={question.options}
        selectedIndex={selectedIndex}
        onSelect={onSelect}
        disabled={disabled}
        correctIndex={correctIndex}
        showCorrectAnswer={showCorrectAnswer}
      />

      {showCorrectAnswer && explanation && (
        <div className="qb-explanation">
          <strong>Explanation</strong>
          <p>{explanation}</p>
        </div>
      )}
    </div>
  );
}

export default QuizQuestion;
