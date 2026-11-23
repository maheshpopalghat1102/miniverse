
import React, { useEffect, useState } from "react";

import PuzzleBoard from "./PuzzleBoard";

import {
  createInitialPuzzleState,
  movePuzzleTile,
  movePuzzleDirection,
  resetNumberPuzzle,
  getPuzzleElapsedSeconds,
  formatPuzzleTime,
} from "./numberPuzzleLogic";

import "./numberPuzzle.css";

const PUZZLE_DIFFICULTIES = {
  easy: { label: "3 × 3", size: 3 },
  medium: { label: "4 × 4", size: 4 },
  hard: { label: "5 × 5", size: 5 },
};

const KEY_DIRECTIONS = {
  ArrowUp: "up",
  w: "up",
  W: "up",
  ArrowDown: "down",
  s: "down",
  S: "down",
  ArrowLeft: "left",
  a: "left",
  A: "left",
  ArrowRight: "right",
  d: "right",
  D: "right",
};

function NumberPuzzle({ onExit }) {
  const [difficulty, setDifficulty] = useState("medium");

  const [game, setGame] = useState(() =>
    createInitialPuzzleState(4)
  );

  const [elapsedSeconds, setElapsedSeconds] = useState(0);

  const size = game.size;

  useEffect(() => {
    if (game.status !== "playing") return undefined;

    const interval = window.setInterval(() => {
      setElapsedSeconds(
        getPuzzleElapsedSeconds(game.startedAt, null)
      );
    }, 1000);

    return () => window.clearInterval(interval);
  }, [game.status, game.startedAt]);

  const handleTileClick = (index) => {
    setGame((previous) =>
      movePuzzleTile(previous, index)
    );
  };

  const handleDirection = (direction) => {
    setGame((previous) =>
      movePuzzleDirection(previous, direction)
    );
  };

  const handleRestart = () => {
    const nextSize = PUZZLE_DIFFICULTIES[difficulty].size;

    setGame(resetNumberPuzzle(nextSize));
    setElapsedSeconds(0);
  };

  const handleDifficultyChange = (nextDifficulty) => {
    setDifficulty(nextDifficulty);

    const nextSize =
      PUZZLE_DIFFICULTIES[nextDifficulty].size;

    setGame(resetNumberPuzzle(nextSize));
    setElapsedSeconds(0);
  };

  useEffect(() => {
    const handleKeyDown = (event) => {
      const target = event.target;

      if (
        target instanceof HTMLElement &&
        (target.isContentEditable ||
          ["INPUT", "TEXTAREA", "SELECT"].includes(target.tagName))
      ) {
        return;
      }

      const direction = KEY_DIRECTIONS[event.key];

      if (!direction) return;

      event.preventDefault();
      handleDirection(direction);
    };

    window.addEventListener("keydown", handleKeyDown);

    return () =>
      window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const finalTime =
    game.status === "won"
      ? getPuzzleElapsedSeconds(
          game.startedAt,
          game.completedAt
        )
      : elapsedSeconds;

  const formattedTime = formatPuzzleTime(finalTime);

  const totalTiles = size * size - 1;

  return (
    <main className="puzzle-container">
      <header className="puzzle-header">
        <div>
          <span className="puzzle-eyebrow">
            MINIVERSE SINGLE PLAYER
          </span>

          <h1>🔢 Number Puzzle</h1>

          <p>
            Slide the tiles and arrange the numbers in the correct order.
          </p>
        </div>

        {onExit && (
          <button
            type="button"
            className="puzzle-exit-button"
            onClick={onExit}
          >
            Exit
          </button>
        )}
      </header>

      <section className="puzzle-game">
        <div className="puzzle-difficulty">
          <span>Difficulty</span>

          <div className="puzzle-difficulty-options">
            {Object.entries(PUZZLE_DIFFICULTIES).map(
              ([key, item]) => (
                <button
                  key={key}
                  type="button"
                  className={
                    difficulty === key
                      ? "puzzle-difficulty-active"
                      : ""
                  }
                  disabled={game.status === "won"}
                  onClick={() => handleDifficultyChange(key)}
                >
                  {item.label}
                </button>
              )
            )}
          </div>
        </div>

        <div className="puzzle-stats">
          <div className="puzzle-stat">
            <span>Moves</span>
            <strong>{game.moves}</strong>
          </div>

          <div className="puzzle-stat">
            <span>Time</span>
            <strong>⏱ {formattedTime}</strong>
          </div>

          <div className="puzzle-stat">
            <span>Tiles</span>
            <strong>{totalTiles}</strong>
          </div>
        </div>

        {game.status === "won" ? (
          <div className="puzzle-win-panel">
            <div className="puzzle-win-icon">🏆</div>

            <h2>Puzzle Completed!</h2>

            <p>
              Excellent work! You arranged all the numbers correctly.
            </p>

            <div className="puzzle-win-stats">
              <div>
                <strong>{game.moves}</strong>
                <span>Total moves</span>
              </div>

              <div>
                <strong>{formattedTime}</strong>
                <span>Time taken</span>
              </div>
            </div>

            <button
              type="button"
              className="puzzle-primary-button"
              onClick={handleRestart}
            >
              Play Again
            </button>
          </div>
        ) : (
          <>
            <div className="puzzle-board-section">
              <PuzzleBoard
                board={game.board}
                size={size}
                onTileClick={handleTileClick}
              />
            </div>

            <div className="puzzle-controls">
              <button
                type="button"
                className="puzzle-direction up"
                onClick={() => handleDirection("up")}
                aria-label="Move empty space up"
              >
                ↑
              </button>

              <div className="puzzle-horizontal-controls">
                <button
                  type="button"
                  className="puzzle-direction"
                  onClick={() => handleDirection("left")}
                  aria-label="Move empty space left"
                >
                  ←
                </button>

                <button
                  type="button"
                  className="puzzle-direction"
                  onClick={() => handleDirection("down")}
                  aria-label="Move empty space down"
                >
                  ↓
                </button>

                <button
                  type="button"
                  className="puzzle-direction"
                  onClick={() => handleDirection("right")}
                  aria-label="Move empty space right"
                >
                  →
                </button>
              </div>
            </div>

            <div className="puzzle-actions">
              <button
                type="button"
                className="puzzle-primary-button"
                onClick={handleRestart}
              >
                ↻ Restart Puzzle
              </button>
            </div>
          </>
        )}

        <div className="puzzle-instructions">
          <h3>How to Play</h3>

          <ul>
            <li>Tap a tile next to the empty space to move it.</li>
            <li>Use arrow keys on your keyboard.</li>
            <li>Arrange numbers from 1 to {totalTiles}.</li>
            <li>Keep the empty space in the bottom-right corner.</li>
            <li>Complete the puzzle in as few moves as possible.</li>
          </ul>
        </div>
      </section>
    </main>
  );
}

export default NumberPuzzle;
