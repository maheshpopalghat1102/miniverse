

import React from "react";

function EmojiQuestion({
  question,
  hints = [],
  round = 1,
  totalRounds = 10,
  hintsUsed = 0,
  onRevealHint,
  disabled = false,
  maxHints = 2,
}) {
  if (!question) return null;

  return (
    <section className="ec-question-card">
      <div className="ec-question-meta">
        <span>{question.category || "Emoji Challenge"}</span>
        <span>
          {round} / {totalRounds}
        </span>
      </div>

      <div className="ec-progress-track">
        <div
          className="ec-progress-fill"
          style={{
            width: `${(round / Math.max(1, totalRounds)) * 100}%`,
          }}
        />
      </div>

      <div className="ec-emoji-display">
        {question.emoji}
      </div>

      <h2>What do these emojis represent?</h2>

      <div className="ec-hints">
        {hints.map((hint, index) => (
          <p key={`${index}-${hint}`}>
            <strong>Hint {index + 1}:</strong> {hint}
          </p>
        ))}
      </div>

      <button
        type="button"
        className="ec-hint-button"
        onClick={onRevealHint}
        disabled={disabled || hintsUsed >= maxHints}
      >
        {hintsUsed >= maxHints
          ? "All hints revealed"
          : `Reveal Hint (${hintsUsed}/${maxHints})`}
      </button>
    </section>
  );
}

export default EmojiQuestion;
