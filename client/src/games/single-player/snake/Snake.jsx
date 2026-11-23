
import React, { useCallback, useEffect, useRef, useState } from "react";

import SnakeCanvas from "./SnakeCanvas";
import SnakeControls from "./SnakeControls";

import {
  SNAKE_CONFIG,
  DIRECTIONS,
  changeSnakeDirection,
  moveSnake,
  startSnakeGame,
  pauseSnakeGame,
  resumeSnakeGame,
  resetSnakeGame,
  getSnakeLevel,
} from "./snakeLogic";

import "./snake.css";

const DIRECTION_KEYS = {
  ArrowUp: "UP",
  w: "UP",
  W: "UP",
  ArrowDown: "DOWN",
  s: "DOWN",
  S: "DOWN",
  ArrowLeft: "LEFT",
  a: "LEFT",
  A: "LEFT",
  ArrowRight: "RIGHT",
  d: "RIGHT",
  D: "RIGHT",
};

function Snake({ onExit }) {
  const [game, setGame] = useState(resetSnakeGame);
  const [bestScore, setBestScore] = useState(() => {
    try {
      return Number(localStorage.getItem("miniverse-snake-best") || 0);
    } catch {
      return 0;
    }
  });

  const gameRef = useRef(game);

  useEffect(() => {
    gameRef.current = game;
  }, [game]);

  const updateBestScore = useCallback((score) => {
    setBestScore((previous) => {
      const next = Math.max(previous, score);

      try {
        localStorage.setItem("miniverse-snake-best", String(next));
      } catch {
        // Game remains playable if storage is unavailable.
      }

      return next;
    });
  }, []);

  useEffect(() => {
    updateBestScore(game.score);
  }, [game.score, updateBestScore]);

  const handleDirection = useCallback((directionName) => {
    const direction = DIRECTIONS[directionName];

    if (!direction) return;

    setGame((previous) =>
      changeSnakeDirection(previous, direction)
    );
  }, []);

  const handleStart = () => {
    setGame((previous) => startSnakeGame(previous));
  };

  const handlePause = () => {
    setGame((previous) => pauseSnakeGame(previous));
  };

  const handleResume = () => {
    setGame((previous) => resumeSnakeGame(previous));
  };

  const handleRestart = () => {
    setGame(resetSnakeGame());
  };

  useEffect(() => {
    const handleKeyDown = (event) => {
      const directionName = DIRECTION_KEYS[event.key];

      if (directionName) {
        event.preventDefault();

        if (gameRef.current.status === "ready") {
          setGame((previous) => startSnakeGame(previous));
        }

        handleDirection(directionName);
        return;
      }

      if (event.code === "Space") {
        event.preventDefault();

        setGame((previous) => {
          if (previous.status === "playing") {
            return pauseSnakeGame(previous);
          }

          if (previous.status === "paused") {
            return resumeSnakeGame(previous);
          }

          if (previous.status === "ready") {
            return startSnakeGame(previous);
          }

          return previous;
        });
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () =>
      window.removeEventListener("keydown", handleKeyDown);
  }, [handleDirection]);

  useEffect(() => {
    if (game.status !== "playing") return undefined;

    const interval = window.setInterval(() => {
      setGame((previous) => moveSnake(previous));
    }, game.speed);

    return () => window.clearInterval(interval);
  }, [game.status, game.speed]);

  const level = getSnakeLevel(game.foodEaten);

  return (
    <main className="snake-container">
      <header className="snake-header">
        <div>
          <span className="snake-eyebrow">MINIVERSE SINGLE PLAYER</span>
          <h1>🐍 Snake</h1>
          <p>Eat the food, grow longer, and avoid hitting yourself.</p>
        </div>

        {onExit && (
          <button
            type="button"
            className="snake-exit-button"
            onClick={onExit}
          >
            Exit
          </button>
        )}
      </header>

      <div className="snake-game-layout">
        <section className="snake-main">
          <div className="snake-stats">
            <div className="snake-stat-card">
              <span>Score</span>
              <strong>{game.score}</strong>
            </div>

            <div className="snake-stat-card">
              <span>Best</span>
              <strong>{bestScore}</strong>
            </div>

            <div className="snake-stat-card">
              <span>Level</span>
              <strong>{level}</strong>
            </div>

            <div className="snake-stat-card">
              <span>Food</span>
              <strong>{game.foodEaten}</strong>
            </div>
          </div>

          <SnakeCanvas
            snake={game.snake}
            food={game.food}
            status={game.status}
            gridSize={SNAKE_CONFIG.GRID_SIZE}
          />

          <SnakeControls
            onDirection={handleDirection}
            onStart={handleStart}
            onPause={handlePause}
            onResume={handleResume}
            status={game.status}
          />

          {(game.status === "game-over" || game.status === "won") && (
            <div className="snake-game-result">
              <h2>
                {game.status === "won"
                  ? "🏆 Perfect Game!"
                  : "💥 Game Over!"}
              </h2>

              <p>
                Your final score: <strong>{game.score}</strong>
              </p>

              <button
                type="button"
                className="snake-action-button start"
                onClick={handleRestart}
              >
                Play Again
              </button>
            </div>
          )}
        </section>

        <aside className="snake-sidebar">
          <div className="snake-info-card">
            <h3>How to Play</h3>

            <ul>
              <li>Eat the food to grow your snake.</li>
              <li>Each food gives you 10 points.</li>
              <li>Avoid hitting the walls.</li>
              <li>Do not run into your own body.</li>
              <li>Your speed increases as you grow.</li>
            </ul>
          </div>

          <div className="snake-info-card">
            <h3>Controls</h3>

            <div className="snake-key-row">
              <kbd>↑</kbd>
              <span>Move up</span>
            </div>

            <div className="snake-key-row">
              <kbd>↓</kbd>
              <span>Move down</span>
            </div>

            <div className="snake-key-row">
              <kbd>←</kbd>
              <span>Move left</span>
            </div>

            <div className="snake-key-row">
              <kbd>→</kbd>
              <span>Move right</span>
            </div>

            <div className="snake-key-row">
              <kbd>Space</kbd>
              <span>Pause / Resume</span>
            </div>
          </div>
        </aside>
      </div>
    </main>
  );
}

export default Snake;
