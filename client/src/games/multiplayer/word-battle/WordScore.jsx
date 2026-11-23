
import React from "react";

function WordScore({
  scores = { X: 0, O: 0 },
  playerX = "Player X",
  playerO = "Player O",
  currentPlayer,
}) {
  const players = [
    {
      id: "X",
      name: playerX,
      score: scores.X ?? 0,
    },
    {
      id: "O",
      name: playerO,
      score: scores.O ?? 0,
    },
  ];

  return (
    <div className="wb-scoreboard">
      {players.map((player) => (
        <div
          key={player.id}
          className={`wb-score-player ${
            currentPlayer === player.id
              ? "wb-score-active"
              : ""
          }`}
        >
          <span className={`wb-score-symbol wb-symbol-${player.id.toLowerCase()}`}>
            {player.id}
          </span>

          <strong>{player.name}</strong>

          <span className="wb-score-number">
            {player.score}
          </span>

          <small>Points</small>
        </div>
      ))}
    </div>
  );
}

export default WordScore;
