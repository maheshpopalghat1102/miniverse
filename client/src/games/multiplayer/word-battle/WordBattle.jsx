
import React, { useCallback, useEffect, useState } from "react";

import WordInput from "./WordInput";
import WordScore from "./WordScore";

import {
  createInitialWordBattleState,
  submitWord,
  getNextRequiredLetter,
} from "./wordBattleLogic";

import {
  sendBattleWord,
  requestWordBattleRematch,
  subscribeWordBattle,
} from "./wordBattleSocket";

import "./wordBattle.css";

function WordBattle({
  socket = null,
  roomId = null,
  mySymbol = null,
  playerX = "Player X",
  playerO = "Player O",
  maxRounds = 10,
  onExit = () => {},
  onGameOver = () => {},
}) {
  const isOnline = Boolean(socket && roomId);

  const [game, setGame] = useState(() =>
    createInitialWordBattleState({ maxRounds })
  );

  const [error, setError] = useState("");
  const [rematchLoading, setRematchLoading] = useState(false);
  const [rematchRequested, setRematchRequested] = useState(false);

  const playerNames = {
    X: playerX,
    O: playerO,
  };

  const isMyTurn = !isOnline || game.currentPlayer === mySymbol;

  const handleWordSubmit = (word) => {
    if (game.status !== "playing") return;

    if (isOnline) {
      if (!isMyTurn) {
        setError("It is not your turn.");
        return;
      }

      try {
        sendBattleWord(socket, roomId, word);
        setError("");
      } catch (err) {
        setError(err.message);
      }

      return;
    }

    try {
      const nextState = submitWord(game, word);
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
      if (
        !serverState ||
        !serverState.scores ||
        !Array.isArray(serverState.history)
      ) {
        return;
      }

      setGame((previous) => ({
        ...previous,
        ...serverState,
        usedWords: serverState.usedWords ?? [],
        history: serverState.history,
        scores: {
          X: serverState.scores.X ?? 0,
          O: serverState.scores.O ?? 0,
        },
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

    return subscribeWordBattle(socket, {
      onState: handleServerState,

      onError: (serverError) => {
        setError(serverError?.message || "Unable to submit word.");
        setRematchLoading(false);
      },

      onRematchRequested: () => setRematchRequested(true),

      onRematchStarted: (serverState) => {
        if (serverState?.scores) {
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
        requestWordBattleRematch(socket, roomId);
      } catch (err) {
        setRematchLoading(false);
        setError(err.message);
      }

      return;
    }

    setGame(createInitialWordBattleState({ maxRounds }));
    setError("");
  };

  const requiredLetter = getNextRequiredLetter(game.lastWord);

  const currentPlayerName = playerNames[game.currentPlayer];

  const winnerName =
    game.winner === "draw"
      ? "Nobody"
      : playerNames[game.winner];

  return (
    <section className="wb-container">
      <header className="wb-header">
        <div>
          <span className="wb-eyebrow">MINIVERSE GAME</span>
          <h1>Word Battle</h1>
          <p>Build words and challenge your opponent.</p>
        </div>

        <button
          type="button"
          className="wb-exit-button"
          onClick={onExit}
        >
          Exit
        </button>
      </header>

      <div className="wb-game-info">
        <span>{isOnline ? "Online Match" : "Local Match"}</span>
        <span>Round {Math.min(game.round, game.maxRounds)} / {game.maxRounds}</span>
        <span>Words: {game.usedWords.length}</span>
      </div>

      <WordScore
        scores={game.scores}
        playerX={playerX}
        playerO={playerO}
        currentPlayer={game.status === "playing" ? game.currentPlayer : null}
      />

      <div className="wb-chain-card">
        <small>LAST WORD</small>
        <strong>{game.lastWord || "START"}</strong>

        {requiredLetter && (
          <p>
            Next word starts with{" "}
            <strong>{requiredLetter.toUpperCase()}</strong>
          </p>
        )}
      </div>

      {game.status === "playing" && (
        <>
          <div className="wb-turn">
            {isOnline && !isMyTurn
              ? "Waiting for opponent..."
              : `${currentPlayerName}'s turn`}
          </div>

          {error && (
            <div className="wb-error" role="alert">
              {error}
            </div>
          )}

          <WordInput
            onSubmit={handleWordSubmit}
            requiredLetter={requiredLetter}
            disabled={isOnline && !isMyTurn}
          />
        </>
      )}

      <div className="wb-history">
        <div className="wb-history-heading">
          <h3>Word History</h3>
          <span>{game.history.length} words</span>
        </div>

        {game.history.length === 0 ? (
          <div className="wb-empty">
            <span>🔤</span>
            <p>No words submitted yet.</p>
          </div>
        ) : (
          <div className="wb-history-list">
            {[...game.history].reverse().map((item, index) => (
              <div
                className="wb-history-item"
                key={`${item.player}-${item.round}-${index}`}
              >
                <span className="wb-history-round">
                  {item.round}
                </span>

                <div>
                  <strong>{item.word}</strong>
                  <small>{playerNames[item.player]}</small>
                </div>

                <span className="wb-history-points">
                  +{item.score}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {rematchRequested && (
        <p className="wb-rematch-notice">
          Your opponent requested a rematch.
        </p>
      )}

      {game.status === "finished" && (
        <div className="wb-result-overlay">
          <div className="wb-result-card">
            <div className="wb-result-icon">
              {game.winner === "draw" ? "🤝" : "🏆"}
            </div>

            <h2>
              {game.winner === "draw"
                ? "It's a Draw!"
                : isOnline
                  ? game.winner === mySymbol
                    ? "You Won!"
                    : "You Lost!"
                  : `${winnerName} Won!`}
            </h2>

            <p>
              Final score: {game.scores.X} – {game.scores.O}
            </p>

            <button
              type="button"
              className="wb-primary-button"
              onClick={handleRematch}
              disabled={rematchLoading}
            >
              {rematchLoading ? "Waiting..." : "Play Again"}
            </button>

            <button
              type="button"
              className="wb-secondary-button"
              onClick={onExit}
            >
              Exit Game
            </button>
          </div>
        </div>
      )}
    </section>
  );
}

export default WordBattle;
