
import React, { useCallback, useEffect, useRef, useState } from "react";

import Game2048Board from "./Game2048Board";

import {
  createInitial2048State,
  make2048Move,
  reset2048Game,
  continue2048AfterWin,
  pause2048Game,
  resume2048Game,
} from "./game2048Logic";

import "./game2048.css";

const KEY_DIRECTIONS = {
  ArrowLeft: "left",
  a: "left",
  A: "left",
  ArrowRight: "right",
  d: "right",
  D: "right",
  ArrowUp: "up",
  w: "up",
  W: "up",
  ArrowDown: "down",
  s: "down",
  S: "down",
};

function Game2048({ onExit }) {
  const [game, setGame] = useState(() => {
    const initial = createInitial2048State();

    try {
      const storedBest = Number(
        localStorage.getItem("miniverse-2048-best") || 0
      );

      return {
        ...initial,
        bestScore: storedBest,
      };
    } catch {
      return initial;
    }
  });

  const touchStart = useRef(null);
  const boardRef = useRef(null);

  const updateBestScore = useCallback((score) => {
    try {
      const currentBest = Number(
        localStorage.getItem("miniverse-2048-best") || 0
      );

      if (score > currentBest) {
        localStorage.setItem(
          "miniverse-2048-best",
          String(score)
        );
      }
    } catch {
      // The game still works if local storage is unavailable.
    }
  }, []);

  useEffect(() => {
    updateBestScore(game.score);
  }, [game.score, updateBestScore]);

  const handleMove = useCallback((direction) => {
    setGame((previous) =>
      make2048Move(previous, direction)
    );
  }, []);

  const handleRestart = () => {
    let best = game.bestScore || 0;

    try {
      best = Math.max(
        best,
        Number(localStorage.getItem("miniverse-2048-best") || 0)
      );
    } catch {
      // Use the in-memory best score.
    }

    setGame(reset2048Game(best));
  };

  const handleContinue = () => {
    setGame((previous) => continue2048AfterWin(previous));
  };

  const handlePause = () => {
    setGame((previous) => pause2048Game(previous));
  };

  const handleResume = () => {
    setGame((previous) => resume2048Game(previous));
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

      if (direction) {
        event.preventDefault();
        handleMove(direction);
        return;
      }

      if (event.code === "Space") {
        event.preventDefault();

        setGame((previous) => {
          if (previous.status === "playing") {
            return pause2048Game(previous);
          }

          if (previous.status === "paused") {
            return resume2048Game(previous);
          }

          return previous;
        });
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () =>
      window.removeEventListener("keydown", handleKeyDown);
  }, [handleMove]);

  const handleTouchStart = (event) => {
    const touch = event.touches[0];

    touchStart.current = {
      x: touch.clientX,
      y: touch.clientY,
    };
  };

  const handleTouchEnd = (event) => {
    if (!touchStart.current) return;

    const touch = event.changedTouches[0];

    const deltaX = touch.clientX - touchStart.current.x;
    const deltaY = touch.clientY - touchStart.current.y;

    touchStart.current = null;

    const minimumSwipeDistance = 25;

    if (
      Math.max(Math.abs(deltaX), Math.abs(deltaY)) <
      minimumSwipeDistance
    ) {
      return;
    }

    if (Math.abs(deltaX) > Math.abs(deltaY)) {
      handleMove(deltaX > 0 ? "right" : "left");
    } else {
      handleMove(deltaY > 0 ? "down" : "up");
    }
  };

  const isGameOver = game.status === "game-over";
  const isWon = game.status === "won";
  const isPaused = game.status === "paused";

  return (
    <main className="g2048-container">
      <header className="g2048-header">
        <div>
          <span className="g2048-eyebrow">
            MINIVERSE SINGLE PLAYER
          </span>

          <h1>🔢 2048</h1>

          <p>
            Combine matching numbers and reach the 2048 tile.
          </p>
        </div>

        {onExit && (
          <button
            type="button"
            className="g2048-exit-button"
            onClick={onExit}
          >
            Exit
          </button>
        )}
      </header>

      <section className="g2048-game">
        <div className="g2048-topbar">
          <div className="g2048-score-box">
            <span>Score</span>
            <strong>{game.score}</strong>
          </div>

          <div className="g2048-score-box">
            <span>Best</span>
            <strong>{game.bestScore}</strong>
          </div>
        </div>

        <div className="g2048-action-row">
          <button
            type="button"
            className="g2048-button g2048-new-game"
            onClick={handleRestart}
          >
            ↻ New Game
          </button>

          {game.status === "playing" && (
            <button
              type="button"
              className="g2048-button g2048-pause"
              onClick={handlePause}
            >
              Pause
            </button>
          )}

          {isPaused && (
            <button
              type="button"
              className="g2048-button g2048-pause"
              onClick={handleResume}
            >
              Resume
            </button>
          )}
        </div>

        <div
          className="g2048-board-wrapper"
          ref={boardRef}
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
        >
          <Game2048Board board={game.board} />

          {(isGameOver || isWon || isPaused) && (
            <div className="g2048-overlay">
              {isGameOver && (
                <>
                  <h2>Game Over!</h2>
                  <p>No more moves available.</p>

                  <button
                    type="button"
                    className="g2048-button g2048-new-game"
                    onClick={handleRestart}
                  >
                    Try Again
                  </button>
                </>
              )}

              {isWon && (
                <>
                  <h2>🎉 You reached 2048!</h2>
                  <p>Excellent work! You can keep playing.</p>

                  <button
                    type="button"
                    className="g2048-button g2048-new-game"
                    onClick={handleContinue}
                  >
                    Continue Playing
                  </button>

                  <button
                    type="button"
                    className="g2048-button g2048-pause"
                    onClick={handleRestart}
                  >
                    New Game
                  </button>
                </>
              )}

              {isPaused && (
                <>
                  <h2>Game Paused</h2>
                  <p>Take a break and resume when ready.</p>

                  <button
                    type="button"
                    className="g2048-button g2048-new-game"
                    onClick={handleResume}
                  >
                    Resume Game
                  </button>
                </>
              )}
            </div>
          )}
        </div>

        <div className="g2048-mobile-controls">
          <button
            type="button"
            onClick={() => handleMove("up")}
            disabled={game.status !== "playing"}
            aria-label="Move up"
          >
            ↑
          </button>

          <div>
            <button
              type="button"
              onClick={() => handleMove("left")}
              disabled={game.status !== "playing"}
              aria-label="Move left"
            >
              ←
            </button>

            <button
              type="button"
              onClick={() => handleMove("down")}
              disabled={game.status !== "playing"}
              aria-label="Move down"
            >
              ↓
            </button>

            <button
              type="button"
              onClick={() => handleMove("right")}
              disabled={game.status !== "playing"}
              aria-label="Move right"
            >
              →
            </button>
          </div>
        </div>

        <div className="g2048-instructions">
          <h3>How to Play</h3>

          <p>
            Use the arrow keys or swipe to move all tiles. When two
            tiles with the same number touch, they merge into one.
            Keep merging to reach 2048!
          </p>

          <div className="g2048-key-hints">
            <kbd>↑</kbd>
            <kbd>↓</kbd>
            <kbd>←</kbd>
            <kbd>→</kbd>
            <span>Move tiles</span>
          </div>

          <p className="g2048-move-count">
            Total moves: {game.moves}
          </p>
        </div>
      </section>
    </main>
  );
}

export default Game2048;
