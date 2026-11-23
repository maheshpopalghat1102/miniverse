

import React from "react";

const ClueDisplay = ({
  clues = [],
  totalClues = 4,
  onRevealNext,
  disabled = false,
  maxHints = 4,
  hintsUsed = 0,
}) => {
  const canReveal = hintsUsed < maxHints && hintsUsed < totalClues;

  return (
    <section className="wai-clue-section">
      <div className="wai-clue-heading">
        <div>
          <h3>🔍 Your Clues</h3>
          <p>Read each clue carefully to discover the identity.</p>
        </div>

        <span className="wai-clue-counter">
          {clues.length}/{totalClues}
        </span>
      </div>

      <div className="wai-clue-list">
        {clues.map((clue, index) => (
          <div className="wai-clue-item" key={`${index}-${clue}`}>
            <span className="wai-clue-number">
              {index + 1}
            </span>

            <p>{clue}</p>

            <span className="wai-clue-check">✓</span>
          </div>
        ))}

        {clues.length === 0 && (
          <div className="wai-no-clues">
            <span>💡</span>
            <p>No clues revealed yet. Request your first clue!</p>
          </div>
        )}
      </div>

      <button
        type="button"
        className="wai-reveal-button"
        onClick={onRevealNext}
        disabled={disabled || !canReveal}
      >
        💡 Reveal Next Clue
        <small>
          {canReveal
            ? `${maxHints - hintsUsed} hints remaining`
            : "No more hints"}
        </small>
      </button>
    </section>
  );
};

export default ClueDisplay;
