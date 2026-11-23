
import React, { useCallback, useEffect, useState } from "react";

import ConnectFourBoard from "./ConnectFourBoard";

import {
  PLAYERS,
  createInitialConnectFourState,
  dropDisc,
} from "./connectFourLogic";

import {
  sendConnectFourMove,
  requestConnectFourRematch,
  subscribeConnectFour,
} from "./connectFourSocket";

import "./connectFour.css";

function ConnectFour({
  socket = null,
  roomId = null,
  myColor = null,
  playerRed = "Player Red",
  playerYellow = "Player Yellow",
  onExit = () => {},
  onGameOver = () => {},
}) {
  const isOnline = Boolean(socket && roomId);

  const [game, setGame] = useState(createInitialConnectFourState);
  const [error, setError] = useState("");
  const [rematchLoading, setRematchLoading] = useState(false);
  const [rematchRequested, setRematchRequested] = useState(false);

  const isMyTurn = !isOnline || game.currentPlayer === myColor;

  const handleMove = (column) => {
    if (game.status !== "playing" || !isMyTurn) return;

    if (isOnline) {
      try {
        sendConnectFourMove(socket, roomId, column);
        setError("");
      } catch (err) {
        setError(err.message);
      }
      return;
    }

    try {
      const nextState = dropDisc(game, column);
      setGame(nextState);

      if (nextState.status !== "playing") {
        onGameOver(nextState);
      }
    } catch (err) {
      setError(err.message);
    }
  };

  const handleServerState = useCallback(
    (serverState) => {
      if (!serverState || !Array.isArray(serverState.board)) return;

      setGame({
        ...createInitialConnectFourState(),
        ...serverState,
        winningCells: serverState.winningCells ?? [],
      });

      setError("");
      setRematchLoading(false);
      setRematchRequested(false);

      if (serverState.status === "won" || serverState.status === "draw") {
        onGameOver(serverState);
      }
    },
    [onGameOver]
  );

  useEffect(() => {
    if (!isOnline) return undefined;

    return subscribeConnectFour(socket, {
      onState: handleServerState,

      onError: (serverError) => {
        setError(serverError?.message || "An error occurred.");
        setRematchLoading(false);
      },

      onRematchRequested: () => setRematchRequested(true),

      onRematchStarted: (serverState) => {
        if (serverState?.board) {
          handleServerState(serverState);
        } else {
          setGame(createInitialConnectFourState());
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
        requestConnectFourRematch(socket, roomId);
      } catch (err) {
        setRematchLoading(false);
        setError(err.message);
      }
      return;
    }

    setGame(createInitialConnectFourState());
    setError("");
  };

  const currentPlayerName =
    game.currentPlayer === PLAYERS.RED ? playerRed : playerYellow;

  const winnerName =
    game.winner === PLAYERS.RED ? playerRed : playerYellow;

  const myWin = isOnline && game.winner === myColor;

  return (
    <section className="c4-container">
      <header className="c4-header">
        <div>
          <span className="c4-eyebrow">MINIVERSE GAME</span>
          <h1>Connect Four</h1>
          <p>Connect four discs to win the match.</p>
        </div>

        <button
          type="button"
          className="c4-exit-button"
          onClick={onExit}
        >
          Exit
        </button>
      </header>

      <div className="c4-player-panel">
        <div className={`c4-player ${game.currentPlayer === "red" && game.status === "playing" ? "c4-player-active" : ""}`}>
          <span className="c4-player-disc c4-red" />
          <div>
            <strong>{playerRed}</strong>
            <small>Red Player</small>
          </div>
        </div>

        <span className="c4-vs">VS</span>

        <div className={`c4-player ${game.currentPlayer === "yellow" && game.status === "playing" ? "c4-player-active" : ""}`}>
          <span className="c4-player-disc c4-yellow" />
          <div>
            <strong>{playerYellow}</strong>
            <small>Yellow Player</small>
          </div>
        </div>
      </div>

      <div className="c4-turn-indicator">
        {game.status === "playing"
          ? isOnline && !isMyTurn
            ? "Waiting for opponent..."
            : `${currentPlayerName}'s turn`
          : game.status === "draw"
            ? "The match is a draw!"
            : `${winnerName} won the match!`}
      </div>

      {error && (
        <div className="c4-error" role="alert">
          {error}
        </div>
      )}

      <ConnectFourBoard
        board={game.board}
        onColumnClick={handleMove}
        disabled={game.status !== "playing" || !isMyTurn}
        winningCells={game.winningCells}
      />

      <div className="c4-game-info">
        <span>Moves: {game.moveCount}/42</span>
        <span>{isOnline ? "Online Match" : "Local Match"}</span>
      </div>

      {rematchRequested && (
        <p className="c4-rematch-notice">
          Your opponent has requested a rematch.
        </p>
      )}

      {game.status !== "playing" && (
        <div className="c4-result-overlay">
          <div className="c4-result-card">
            <div className="c4-result-icon">
              {game.status === "draw" ? "🤝" : "🏆"}
            </div>

            <h2>
              {game.status === "draw"
                ? "It's a Draw!"
                : isOnline
                  ? myWin
                    ? "You Won!"
                    : "You Lost!"
                  : `${winnerName} Won!`}
            </h2>

            <p>
              {game.status === "draw"
                ? "The board is full. Great game!"
                : `${winnerName} connected four discs.`}
            </p>

            <button
              type="button"
              className="c4-primary-button"
              onClick={handleRematch}
              disabled={rematchLoading}
            >
              {rematchLoading ? "Waiting..." : "Play Again"}
            </button>

            <button
              type="button"
              className="c4-secondary-button"
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

export default ConnectFour;
