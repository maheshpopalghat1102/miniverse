
import React, { useEffect, useRef, useState } from "react";

import MemoryBoard from "./MemoryBoard";

import {
  MEMORY_MATCH_CONFIG,
  createInitialMemoryState,
  startMemoryGame,
  flipMemoryCard,
  checkMemoryMatch,
  hideUnmatchedCards,
  resetMemoryGame,
  getMemoryAccuracy,
  getMemoryElapsedSeconds,
  formatMemoryTime,
} from "./memoryMatchLogic";

import "./memoryMatch.css";

const DIFFICULTIES = {
  easy: { label: "Easy", pairs: 6 },
  medium: { label: "Medium", pairs: 8 },
  hard: { label: "Hard", pairs: 12 },
};

function MemoryMatch({ onExit }) {
  const [difficulty, setDifficulty] = useState("medium");
  const [game, setGame] = useState(() =>
    createInitialMemoryState(
      DIFFICULTIES.medium.pairs
    )
  );

  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const mismatchTimeout = useRef(null);

  const clearMismatchTimeout = () => {
    if (mismatchTimeout.current) {
      window.clearTimeout(mismatchTimeout.current);
      mismatchTimeout.current = null;
    }
  };

  useEffect(() => {
    if (
      game.status !== "playing" ||
      !game.startedAt ||
      game.status === "completed"
    ) {
      return undefined;
    }

    const interval = window.setInterval(() => {
      setElapsedSeconds(
        getMemoryElapsedSeconds(game.startedAt, null)
      );
    }, 1000);

    return () => window.clearInterval(interval);
  }, [game.status, game.startedAt]);

  useEffect(() => {
    if (!game.isChecking) return undefined;

    clearMismatchTimeout();

    mismatchTimeout.current = window.setTimeout(() => {
      setGame((previous) => hideUnmatchedCards(previous));
      mismatchTimeout.current = null;
    }, MEMORY_MATCH_CONFIG.MISMATCH_DELAY);

    return clearMismatchTimeout;
  }, [game.isChecking]);

  useEffect(() => {
    return () => clearMismatchTimeout();
  }, []);

  const handleStart = () => {
    setGame((previous) => startMemoryGame(previous));
    setElapsedSeconds(0);
  };

  const handleCardClick = (cardId) => {
    setGame((previous) => {
      const flipped = flipMemoryCard(previous, cardId);

      if (flipped.flippedCards.length === 2) {
        const result = checkMemoryMatch(flipped);
        return result.state;
      }

      return flipped;
    });
  };

  const handleRestart = () => {
    clearMismatchTimeout();

    setGame(
      resetMemoryGame(DIFFICULTIES[difficulty].pairs)
    );

    setElapsedSeconds(0);
  };

  const handleDifficultyChange = (nextDifficulty) => {
    clearMismatchTimeout();

    setDifficulty(nextDifficulty);

    setGame(
      resetMemoryGame(
        DIFFICULTIES[nextDifficulty].pairs
      )
    );

    setElapsedSeconds(0);
  };

  const accuracy = getMemoryAccuracy(
    game.moves,
    game.matchedPairs
  );

  const currentTime =
    game.status === "completed"
      ? getMemoryElapsedSeconds(
          game.startedAt,
          game.completedAt
        )
      : elapsedSeconds;

  const formattedTime = formatMemoryTime(currentTime);

  const totalPairs = game.cards.length / 2;

  const progress = Math.round(
    (game.matchedPairs / Math.max(1, totalPairs)) * 100
  );

  return (
    <main className="memory-container">
      <header className="memory-header">
        <div>
          <span className="memory-eyebrow">
            MINIVERSE SINGLE PLAYER
          </span>
          <h1>🧠 Memory Match</h1>
          <p>Find matching pairs and test your memory.</p>
        </div>

        {onExit && (
          <button
            type="button"
            className="memory-exit-button"
            onClick={onExit}
          >
            Exit
          </button>
        )}
      </header>

      <section className="memory-game">
        <div className="memory-difficulty">
          <span>Difficulty</span>

          <div className="memory-difficulty-options">
            {Object.entries(DIFFICULTIES).map(
              ([key, item]) => (
                <button
                  key={key}
                  type="button"
                  className={
                    difficulty === key
                      ? "memory-difficulty-active"
                      : ""
                  }
                  disabled={game.status === "playing"}
                  onClick={() => handleDifficultyChange(key)}
                >
                  {item.label}
                </button>
              )
            )}
          </div>
        </div>

        <div className="memory-stats">
          <div className="memory-stat">
            <span>Time</span>
            <strong>⏱ {formattedTime}</strong>
          </div>

          <div className="memory-stat">
            <span>Moves</span>
            <strong>{game.moves}</strong>
          </div>

          <div className="memory-stat">
            <span>Matches</span>
            <strong>
              {game.matchedPairs}/{totalPairs}
            </strong>
          </div>

          <div className="memory-stat">
            <span>Score</span>
            <strong>{game.score}</strong>
          </div>
        </div>

        <div className="memory-progress">
          <div className="memory-progress-label">
            <span>Matching progress</span>
            <strong>{progress}%</strong>
          </div>

          <div className="memory-progress-track">
            <div
              className="memory-progress-fill"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {game.status === "ready" && (
          <div className="memory-start-panel">
            <div className="memory-start-icon">🎴</div>
            <h2>Ready to test your memory?</h2>
            <p>
              Flip two cards at a time. Find all matching pairs
              using as few moves as possible.
            </p>

            <button
              type="button"
              className="memory-primary-button"
              onClick={handleStart}
            >
              Start Game
            </button>
          </div>
        )}

        {game.status !== "ready" && (
          <MemoryBoard
            cards={game.cards}
            onCardClick={handleCardClick}
            disabled={
              game.isChecking ||
              game.status !== "playing"
            }
          />
        )}

        {game.status === "playing" && (
          <div className="memory-game-actions">
            <p>
              {game.isChecking
                ? "Not a match? Cards will turn over shortly."
                : "Choose two cards to find a matching pair."}
            </p>

            <button
              type="button"
              className="memory-secondary-button"
              onClick={handleRestart}
            >
              ↻ Restart
            </button>
          </div>
        )}

        {game.status === "completed" && (
          <div className="memory-complete-panel">
            <div className="memory-start-icon">🏆</div>
            <h2>Excellent Memory!</h2>
            <p>You found every matching pair.</p>

            <div className="memory-final-stats">
              <div>
                <strong>{game.score}</strong>
                <span>Score</span>
              </div>

              <div>
                <strong>{game.moves}</strong>
                <span>Moves</span>
              </div>

              <div>
                <strong>{formattedTime}</strong>
                <span>Time</span>
              </div>

              <div>
                <strong>{accuracy}%</strong>
                <span>Accuracy</span>
              </div>
            </div>

            <button
              type="button"
              className="memory-primary-button"
              onClick={handleRestart}
            >
              Play Again
            </button>
          </div>
        )}
      </section>

      <aside className="memory-help">
        <h3>How to Play</h3>
        <ul>
          <li>Choose a difficulty before starting.</li>
          <li>Flip any two cards.</li>
          <li>Matching cards stay open.</li>
          <li>Non-matching cards turn back over.</li>
          <li>Find every pair to finish the game.</li>
        </ul>
      </aside>
    </main>
  );
}

export default MemoryMatch;
