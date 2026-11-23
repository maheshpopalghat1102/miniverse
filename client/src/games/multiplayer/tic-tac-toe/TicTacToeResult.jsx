
import React from "react";

function TicTacToeResult({
  status,
  winner,
  mySymbol,
  onRematch,
  onExit,
  rematchLoading = false,
}) {
  if (status === "playing") return null;

  const isDraw = status === "draw";
  const isMyWin = mySymbol ? winner === mySymbol : false;

  return (
    <div className="ttt-result-overlay">
      <div className="ttt-result-card">
        <div className="ttt-result-icon">
          {isDraw ? "🤝" : isMyWin ? "🏆" : "🎮"}
        </div>

        <h2>
  {isDraw
    ? "It's a Draw!"
    : mySymbol
      ? isMyWin
        ? "You Won!"
        : "You Lost!"
      : `Player ${winner} Won!`}
        </h2>

        <p>
          {isDraw
            ? "Great match! Both players played well."
            : `Player ${winner} wins the match.`}
        </p>

        <div className="ttt-result-actions">
          <button
            type="button"
            className="ttt-primary-button"
            onClick={onRematch}
            disabled={rematchLoading}
          >
            {rematchLoading ? "Waiting..." : "Play Again"}
          </button>

          <button
            type="button"
            className="ttt-secondary-button"
            onClick={onExit}
          >
            Exit Game
          </button>
        </div>
      </div>
    </div>
  );
}

export default TicTacToeResult;
