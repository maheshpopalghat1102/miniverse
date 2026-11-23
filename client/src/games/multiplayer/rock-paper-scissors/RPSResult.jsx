
import React from "react";
import {
  RPS_ICONS,
  RPS_LABELS,
} from "./rpsLogic";

function RPSResult({
  roundWinner,
  matchWinner,
  choices,
  mySymbol = null,
  onNextRound,
  onRematch,
  onExit,
  isOnline = false,
  waitingForOpponent = false,
  loading = false,
}) {
  if (!roundWinner && !matchWinner) {
    return waitingForOpponent ? (
      <div className="rps-waiting">
        <span className="rps-waiting-dot" />
        Waiting for your opponent's choice...
      </div>
    ) : null;
  }

  const isMatchFinished = Boolean(matchWinner);

  let heading = "Round Draw!";
  let description = "Both players selected the same move.";

  if (roundWinner === "X" || roundWinner === "O") {
    heading = mySymbol
      ? roundWinner === mySymbol
        ? "You Won This Round!"
        : "You Lost This Round!"
      : `Player ${roundWinner} Wins This Round!`;

    description = "Nice move! Get ready for the next round.";
  }

  if (isMatchFinished) {
    heading = mySymbol
      ? matchWinner === mySymbol
        ? "You Won the Match!"
        : "You Lost the Match!"
      : `Player ${matchWinner} Won the Match!`;

    description = "The match is complete. Great game!";
  }

  return (
    <div className="rps-result">
      <div className="rps-result-icon">
        {isMatchFinished ? "🏆" : roundWinner === "draw" ? "🤝" : "🎉"}
      </div>

      <h2>{heading}</h2>
      <p>{description}</p>

      <div className="rps-revealed-choices">
        {["X", "O"].map((symbol) => (
          <div className="rps-revealed-player" key={symbol}>
            <span className="rps-revealed-label">
              Player {symbol}
            </span>

            <span className="rps-revealed-icon">
              {choices?.[symbol]
                ? RPS_ICONS[choices[symbol]]
                : "❔"}
            </span>

            <strong>
              {choices?.[symbol]
                ? RPS_LABELS[choices[symbol]]
                : "Not available"}
            </strong>
          </div>
        ))}
      </div>

      <div className="rps-result-actions">
        {isMatchFinished ? (
          <button
            type="button"
            className="rps-primary-button"
            onClick={onRematch}
            disabled={loading}
          >
            {loading ? "Waiting..." : "Play Again"}
          </button>
        ) : (
          <button
            type="button"
            className="rps-primary-button"
            onClick={onNextRound}
            disabled={loading || (isOnline && !onNextRound)}
          >
            {loading ? "Please wait..." : "Next Round"}
          </button>
        )}

        <button
          type="button"
          className="rps-secondary-button"
          onClick={onExit}
        >
          Exit Game
        </button>
      </div>
    </div>
  );
}

export default RPSResult;
