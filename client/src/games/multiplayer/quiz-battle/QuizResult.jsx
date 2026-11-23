
import React from "react";

function QuizResult({
  scores,
  winner,
  mySymbol = null,
  playerX = "Player X",
  playerO = "Player O",
  onRematch,
  onExit,
  loading = false,
}) {
  const isDraw = winner === "draw";

  const winnerName =
    winner === "X"
      ? playerX
      : winner === "O"
        ? playerO
        : null;

  const heading = isDraw
    ? "It's a Draw!"
    : mySymbol
      ? winner === mySymbol
        ? "You Won!"
        : "You Lost!"
      : `${winnerName} Won!`;

  return (
    <div className="qb-result-overlay">
      <div className="qb-result-card">
        <div className="qb-result-icon">
          {isDraw ? "🤝" : "🏆"}
        </div>

        <h2>{heading}</h2>

        <p>
          {isDraw
            ? "Both players finished with the same score."
            : `${winnerName} is the Quiz Battle champion!`}
        </p>

        <div className="qb-final-score">
          <div>
            <small>{playerX}</small>
            <strong>{scores.X}</strong>
          </div>

          <span>VS</span>

          <div>
            <small>{playerO}</small>
            <strong>{scores.O}</strong>
          </div>
        </div>

        <button
          type="button"
          className="qb-primary-button"
          onClick={onRematch}
          disabled={loading}
        >
          {loading ? "Waiting..." : "Play Again"}
        </button>

        <button
          type="button"
          className="qb-secondary-button"
          onClick={onExit}
        >
          Exit Game
        </button>
      </div>
    </div>
  );
}

export default QuizResult;
