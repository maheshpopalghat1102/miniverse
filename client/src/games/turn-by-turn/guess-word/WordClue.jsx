
import React from "react";

function WordClue({
  word,
  hints = [],
  hintsUsed = 0,
  onRevealHint,
  disabled = false,
  maxHints = 2,
}) {
  if (!word) return null;

  return (
    <section className="gw-clue-card">
      <div className="gw-clue-meta">
        <span>{word.category || "General"}</span>
        <span className={`gw-difficulty gw-${word.difficulty || "easy"}`}>
          {word.difficulty || "easy"}
        </span>
      </div>

      <div className="gw-clue-icon">💡</div>

      <span className="gw-clue-label">Guess the hidden word</span>

      <h2>{word.hint}</h2>

      {hints.length > 0 && (
        <div className="gw-extra-hints">
          {hints.map((hint, index) => (
            <p key={`${index}-${hint}`}>
              <strong>Hint {index + 1}:</strong> {hint}
            </p>
          ))}
        </div>
      )}

      <button
        type="button"
        className="gw-hint-button"
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

export default WordClue;
