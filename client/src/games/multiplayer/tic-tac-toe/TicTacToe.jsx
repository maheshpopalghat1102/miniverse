
import React, { useCallback, useEffect, useState } from "react";

import TicTacToeBoard from "./TicTacToeBoard";
import TicTacToeResult from "./TicTacToeResult";

import {
  createInitialGameState,
  applyMove,
} from "./ticTacToeLogic";

import {
  sendTicTacToeMove,
  requestTicTacToeRematch,
  subscribeTicTacToe,
} from "./ticTacToeSocket";

import "./ticTacToe.css";

function TicTacToe({
  socket = null,
  roomId = null,
  mySymbol = null,
  playerX = "Player X",
  playerO = "Player O",
  onExit = () => {},
  onGameOver = () => {},
}) {
  const [game, setGame] = useState(createInitialGameState);
  const [error, setError] = useState("");
  const [rematchLoading, setRematchLoading] = useState(false);
  const [rematchRequested, setRematchRequested] = useState(false);

  const isOnline = Boolean(socket && roomId);

  const isMyTurn = isOnline
    ? game.currentPlayer === mySymbol
    : true;

  const handleMove = useCallback(
    (index) => {
      if (game.status !== "playing") return;

      if (isOnline) {
        if (!isMyTurn) return;

        try {
          sendTicTacToeMove(socket, roomId, index);
          setError("");
        } catch (err) {
          setError(err.message || "Unable to send your move.");
        }

        return;
      }

      try {
        const nextState = applyMove(game, index);
        setGame(nextState);

        if (nextState.status !== "playing") {
          onGameOver(nextState);
        }
      } catch (err) {
        setError(err.message);
      }
    },
    [game, isOnline, isMyTurn, socket, roomId, onGameOver]
  );

  useEffect(() => {
    if (!isOnline) return undefined;

    return subscribeTicTacToe(socket, {
      onState: (serverState) => {
        if (!serverState || !Array.isArray(serverState.board)) {
          return;
        }

        setGame({
          board: serverState.board,
          currentPlayer: serverState.currentPlayer,
          status: serverState.status,
          winner: serverState.winner ?? null,
          winningCombination:
            serverState.winningCombination ?? [],
          moveCount: serverState.moveCount ?? 0,
        });

        setError("");
        setRematchLoading(false);
        setRematchRequested(false);

        if (serverState.status !== "playing") {
          onGameOver(serverState);
        }
      },

      onError: (serverError) => {
        setError(
          serverError?.message || "Something went wrong."
        );
      },

      onRematchRequested: () => {
        setRematchRequested(true);
      },

      onRematchStarted: (serverState) => {
        if (serverState?.board) {
          setGame({
            ...createInitialGameState(),
            ...serverState,
          });
        }

        setRematchLoading(false);
        setRematchRequested(false);
      },
    });
  }, [socket, isOnline, onGameOver]);

  const handleRematch = () => {
    if (isOnline) {
      try {
        setRematchLoading(true);
        requestTicTacToeRematch(socket, roomId);
      } catch (err) {
        setRematchLoading(false);
        setError(err.message);
      }

      return;
    }

    setGame(createInitialGameState());
    setError("");
  };

  const currentPlayerName =
    game.currentPlayer === "X" ? playerX : playerO;

  const currentPlayerSymbol = game.currentPlayer;

  const localPlayerSymbol = isOnline ? mySymbol : null;

  return (
    <section className="ttt-container">
      <header className="ttt-header">
        <div>
          <span className="ttt-eyebrow">MINIVERSE GAME</span>
          <h1>Tic Tac Toe</h1>
          <p>Think ahead. Make your move. Win the match.</p>
        </div>

        <button
          type="button"
          className="ttt-exit-button"
          onClick={onExit}
        >
          Exit
        </button>
      </header>

      <div className="ttt-player-panel">
        <div
          className={`ttt-player ${
            game.currentPlayer === "X" &&
            game.status === "playing"
              ? "ttt-player-active"
              : ""
          }`}
        >
          <span className="ttt-player-symbol ttt-symbol-x">
            X
          </span>

          <div>
            <strong>{playerX}</strong>
            <small>Player X</small>
          </div>
        </div>

        <div className="ttt-vs">VS</div>

        <div
          className={`ttt-player ${
            game.currentPlayer === "O" &&
            game.status === "playing"
              ? "ttt-player-active"
              : ""
          }`}
        >
          <span className="ttt-player-symbol ttt-symbol-o">
            O
          </span>

          <div>
            <strong>{playerO}</strong>
            <small>Player O</small>
          </div>
        </div>
      </div>

      <div className="ttt-turn">
        {game.status === "playing" ? (
          <>
            <span className="ttt-turn-dot" />
            {isOnline && !isMyTurn
              ? "Waiting for opponent..."
              : `${currentPlayerName}'s turn (${currentPlayerSymbol})`}
          </>
        ) : game.status === "draw" ? (
          "The match ended in a draw"
        ) : (
          `Player ${game.winner} won the match`
        )}
      </div>

      {error && (
        <div className="ttt-error" role="alert">
          {error}
        </div>
      )}

      <div className="ttt-board-wrapper">
        <TicTacToeBoard
          board={game.board}
          onCellClick={handleMove}
          disabled={
            game.status !== "playing" ||
            (isOnline && !isMyTurn)
          }
          winningCombination={game.winningCombination}
        />
      </div>

      <div className="ttt-game-info">
        <span>Moves: {game.moveCount}/9</span>
        <span>{isOnline ? "Online Match" : "Local Match"}</span>
      </div>

      {rematchRequested && (
        <p className="ttt-rematch-message">
          Your opponent has requested a rematch.
        </p>
      )}

      <TicTacToeResult
        status={game.status}
        winner={game.winner}
        mySymbol={localPlayerSymbol}
        onRematch={handleRematch}
        onExit={onExit}
        rematchLoading={rematchLoading}
      />
    </section>
  );
}

export default TicTacToe;
