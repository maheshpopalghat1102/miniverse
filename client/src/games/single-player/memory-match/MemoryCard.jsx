
import React from "react";

function MemoryCard({
  card,
  onClick,
  disabled = false,
}) {
  const isVisible = card.isFlipped || card.isMatched;

  return (
    <button
      type="button"
      className={[
        "memory-card",
        isVisible ? "memory-card-flipped" : "",
        card.isMatched ? "memory-card-matched" : "",
      ]
        .filter(Boolean)
        .join(" ")}
      onClick={() => onClick?.(card.id)}
      disabled={disabled || isVisible}
      aria-label={
        isVisible ? `Card ${card.emoji}` : "Hidden memory card"
      }
      aria-pressed={isVisible}
    >
      <span className="memory-card-inner">
        <span className="memory-card-front">
          <span className="memory-card-symbol">?</span>
        </span>

        <span className="memory-card-back">
          <span className="memory-card-emoji">
            {card.emoji}
          </span>
        </span>
      </span>
    </button>
  );
}

export default MemoryCard;
