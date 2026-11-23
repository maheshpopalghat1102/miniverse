
import React, { useCallback, useEffect, useState } from "react";

import NumberInput from "./NumberInput";
import GuessHistory from "./GuessHistory";

import {
  createInitialGuessState,
  generateSecretNumber,
  applyGuess,
} from "./guessNumberLogic";

import {
  sendNumberGuess,
  requestGuessNumberRematch,
  subscribeGuessNumber,
} from "./guessNumberSocket";

import "./guessNumber.css";

function GuessNumber({
  socket = null,
  roomId = null,
  mySymbol = null,
  playerX = "Player X",
  playerO = "Player O",
  min = 1,
  max = 100,
  onExit = () => {},
  onGameOver = () => {},
}) {
  const isOnline = Boolean(socket && roomId);

  const [game, setGame] = useState(() =>
    createInitialGuessState({ min, max })
  );

  // Only used for local testing. Never send this value to online clients.
  const [localSecret, setLocalSecret] = useState(() =>
  generateSecretNumber(min, max)
);

  const [error, setError] = useState("");
  const [rematchLoading, setRematchLoading] = useState(false);
  const [rematchRequested, setRematchRequested] = useState(false);

  const playerNames = {
    X: playerX,
    O: playerO,
  };

  const isMyTurn = !isOnline || game.currentPlayer === mySymbol;

  const handleGuess = (guess) => {
    if (game.status !== "playing") return;

    if (isOnline) {
      if (!isMyTurn) {
        setError("It is not your turn.");
        return;
      }

      try {
        sendNumberGuess(socket, roomId, guess);
        setError("");
      } catch (err) {
        setError(err.message);
      }

      return;
    }

    try {
      const nextState = applyGuess(game, guess, localSecret);

      setGame(nextState);
      setError("");

      if (nextState.status === "finished") {
        onGameOver(nextState);
      }
    } catch (err) {
      setError(err.message);
    }
  };

  const handleServerState = useCallback(
    (serverState) => {
      if (!serverState || !serverState.attempts) return;

      setGame((previous) => ({
        ...previous,
        ...serverState,
        attempts: {
          X: serverState.attempts.X ?? 0,
          O: serverState.attempts.O ?? 0,
        },
        history: serverState.history ?? [],
      }));

      setError("");
      setRematchLoading(false);

      if (serverState.status === "finished") {
        onGameOver(serverState);
      }
    },
    [onGameOver]
  );

  useEffect(() => {
    if (!isOnline) return undefined;

    return subscribeGuessNumber(socket, {
      onState: handleServerState,

      onError: (serverError) => {
        setError(serverError?.message || "An error occurred.");
        setRematchLoading(false);
      },

      onRematchRequested: () => setRematchRequested(true),

      onRematchStarted: (serverState) => {
        if (serverState?.attempts) {
          handleServerState(serverState);
        }

        setRematchLoading(false);
        setRematchRequested(false);
      },
    });
  }, [socket, isOnline, handleServerState]);

  const handleRematch = () => {
    if (isOnline) {
      try {
        setRematchLoading(true);
        requestGuessNumberRematch(socket, roomId);
      } catch (err) {
        setRematchLoading(false);
        setError(err.message);
      }

      return;
    }

    // Start a fresh local game with a fresh secret.
    const newSecret = generateSecretNumber(min, max);
    setLocalSecretForRematch(newSecret);
  };

  // Keep a separate state for the local secret so it can change on rematch.
  // The first game uses the initial localSecret above.
  const [rematchSecret, setRematchSecret] = useState(null);

  function setLocalSecretForRematch(newSecret) {
    setRematchSecret(newSecret);
    setGame(createInitialGuessState({ min, max }));
    setError("");
  }

  const activeLocalSecret = rematchSecret ?? localSecret;

  // Local guesses use the active secret, including after a rematch.
  const handleLocalGuess = (guess) => {
    try {
      const nextState = applyGuess(game, guess, activeLocalSecret);
      setGame(nextState);
      setError("");

      if (nextState.status === "finished") {
        onGameOver(nextState);
      }
    } catch (err) {
      setError(err.message);
    }
  };

  const currentPlayerName =
    game.currentPlayer === "X" ? playerX : playerO;

  const winnerName =
    game.winner ? playerNames[game.winner] : "";

  const totalGuesses = game.totalAttempts ?? game.history.length;

  return (
    <section className="gn-container">
      <header className="gn-header">
        <div>
          <span className="gn-eyebrow">MINIVERSE GAME</span>
          <h1>Guess the Number</h1>
          <p>Think carefully and find the secret number.</p>
        </div>

        <button
          type="button"
          className="gn-exit-button"
          onClick={onExit}
        >
          Exit
        </button>
      </header>

      <div className="gn-range-card">
        <span className="gn-range-icon">🔐</span>
        <div>
          <small>SECRET NUMBER RANGE</small>
          <strong>{min} – {max}</strong>
        </div>
      </div>

      <div className="gn-player-panel">
        <div className={`gn-player ${game.currentPlayer === "X" && game.status === "playing" ? "gn-player-active" : ""}`}>
          <span className="gn-player-symbol gn-symbol-x">X</span>
          <div>
            <strong>{playerX}</strong>
            <small>{game.attempts.X} guesses</small>
          </div>
        </div>

        <span className="gn-vs">VS</span>

        <div className={`gn-player ${game.currentPlayer === "O" && game.status === "playing" ? "gn-player-active" : ""}`}>
          <span className="gn-player-symbol gn-symbol-o">O</span>
          <div>
            <strong>{playerO}</strong>
            <small>{game.attempts.O} guesses</small>
          </div>
        </div>
      </div>

      <div className="gn-turn-indicator">
        {game.status === "playing"
          ? isOnline && !isMyTurn
            ? "Waiting for opponent..."
            : `${currentPlayerName}'s turn`
          : `${winnerName} found the number!`}
      </div>

      {error && (
        <div className="gn-error" role="alert">
          {error}
        </div>
      )}

      {game.status === "playing" && (
        <div className="gn-play-area">
          <div className="gn-guess-icon">🎯</div>

          <h2>Find the secret number</h2>

          <p>
            {isOnline
              ? isMyTurn
                ? "Enter your guess below."
                : "Your opponent is thinking..."
              : `${currentPlayerName}, enter your guess.`}
          </p>

          <NumberInput
            min={game.min}
            max={game.max}
            onSubmit={isOnline ? handleGuess : handleLocalGuess}
            disabled={isOnline && !isMyTurn}
          />
        </div>
      )}

      <div className="gn-stats">
        <div>
          <strong>{totalGuesses}</strong>
          <small>Total guesses</small>
        </div>

        <div>
          <strong>{game.round ?? 1}</strong>
          <small>Game round</small>
        </div>

        <div>
          <strong>{game.status === "finished" ? "Finished" : "Playing"}</strong>
          <small>Game status</small>
        </div>
      </div>

      <GuessHistory
        history={game.history}
        playerNames={playerNames}
      />

      {rematchRequested && (
        <p className="gn-rematch-notice">
          Your opponent has requested a rematch.
        </p>
      )}

      {game.status === "finished" && (
        <div className="gn-result-overlay">
          <div className="gn-result-card">
            <div className="gn-result-icon">🏆</div>

            <h2>
              {isOnline
                ? game.winner === mySymbol
                  ? "You Won!"
                  : "You Lost!"
                : `${winnerName} Won!`}
            </h2>

            <p>
              The correct number was found in{" "}
              {totalGuesses} total guesses.
            </p>

            <button
              type="button"
              className="gn-primary-button"
              onClick={handleRematch}
              disabled={rematchLoading}
            >
              {rematchLoading ? "Waiting..." : "Play Again"}
            </button>

            <button
              type="button"
              className="gn-secondary-button"
              onClick={onExit}
            >
              Exit Game
            </button>
          </div>
        </div>
      )}

      <footer className="gn-footer">
        <span>🔼 Too High</span>
        <span>🔽 Too Low</span>
        <span>🎯 Correct</span>
      </footer>
    </section>
  );
}

export default GuessNumber;
