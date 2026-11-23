
import React from "react";

function EmojiQuestion({
  question,
  questionNumber,
  totalQuestions,
}) {
  if (!question) return null;

  return (
    <div className="eg-question-card">
      <div className="eg-question-meta">
        <span>{question.category || "Emoji Challenge"}</span>
        <span>
          {questionNumber} / {totalQuestions}
        </span>
      </div>

      <p className="eg-question-label">
        {question.question || "Guess the answer"}
      </p>

      <div className="eg-emoji-display" aria-label="Emoji clue">
        {question.emojis}
      </div>

      {question.hint && (
        <p className="eg-hint">
          Hint: {question.hint}
        </p>
      )}
    </div>
  );
}

export default EmojiQuestion;
