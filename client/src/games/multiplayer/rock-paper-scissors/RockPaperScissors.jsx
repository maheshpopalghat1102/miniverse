
import React, { useCallback, useEffect, useState } from "react";

import RPSChoices from "./RPSChoices";
import RPSResult from "./RPSResult";

import {
  RPS_ICONS,
  RPS_LABELS,
  createInitialRPSState,
  resolveRound,
  startNextRound,
} from "./rpsLogic";

import {
  sendRPSChoice,
  requestRPSNextRound,
  requestRPSRematch,
  subscribeRPS,
} from "./rpsSocket";

import "./rps.css";

function RockPaperScissors({
  socket = null,
  roomId = null,
  mySymbol = null,
  playerX = "Player X",
  playerO = "Player O",
  bestOf = 3,
  onExit = () => {},
  onGameOver = () => {},
}) {
  const isOnline = Boolean(socket && roomId);

  const [game, setGame] = useState(() =>
    createInitialRPSState(bestOf)
  );

  const [localChoices, setLocalChoices] = useState({
    X: null,
    O: null,
  });

  const [myChoice, setMyChoice] = useState(null);
  const [opponentSubmitted, setOpponentSubmitted] = useState(false);
  const [rematchLoading, setRematchLoading] = useState(false);
  const [rematchRequested, setRematchRequested] = useState(false);
  const [error, setError] = useState("");

  const localCurrentSymbol = localChoices.X ? "O" : "X";

  const localHasChosen = Boolean(
    localChoices[localCurrentSymbol]
  );

  const currentLocalPlayer =
    localCurrentSymbol === "X" ? playerX : playerO;

  const handleLocalChoice = (choice) => {
    if (game.status !== "playing") return;
    if (localChoices[localCurrentSymbol]) return;

    const updatedChoices = {
      ...localChoices,
      [localCurrentSymbol]: choice,
    };

    setLocalChoices(updatedChoices);
    setError("");

    if (updatedChoices.X && updatedChoices.O) {
      try {
        const nextState = resolveRound(
          game,
          updatedChoices.X,
          updatedChoices.O
        );

        setGame(nextState);

        if (nextState.status === "finished") {
          onGameOver(nextState);
        }
      } catch (err) {
        setError(err.message);
      }
    }
  };

  const handleOnlineChoice = (choice) => {
    if (!isOnline || game.status !== "playing") return;
    if (!["X", "O"].includes(mySymbol)) return;
    if (myChoice || opponentSubmitted && game.choices?.[mySymbol]) {
      return;
    }

    try {
      sendRPSChoice(socket, roomId, choice);
      setMyChoice(choice);
      setError("");
    } catch (err) {
      setError(err.message || "Unable to submit your choice.");
    }
  };

  const handleChoice = (choice) => {
    if (isOnline) {
      handleOnlineChoice(choice);
    } else {
      handleLocalChoice(choice);
    }
  };

  const handleNextRound = () => {
    if (isOnline) {
      try {
        requestRPSNextRound(socket, roomId);
        setRematchLoading(true);
        setError("");
      } catch (err) {
        setRematchLoading(false);
        setError(err.message);
      }

      return;
    }

    try {
      setGame((previous) => startNextRound(previous));
      setLocalChoices({ X: null, O: null });
      setError("");
    } catch (err) {
      setError(err.message);
    }
  };

  const handleRematch = () => {
    if (isOnline) {
      try {
        setRematchLoading(true);
        requestRPSRematch(socket, roomId);
        setError("");
      } catch (err) {
        setRematchLoading(false);
        setError(err.message);
      }

      return;
    }

    setGame(createInitialRPSState(bestOf));
    setLocalChoices({ X: null, O: null });
    setMyChoice(null);
    setOpponentSubmitted(false);
    setRematchRequested(false);
    setError("");
  };

  const handleServerState = useCallback(
    (serverState) => {
      if (!serverState || !serverState.scores) return;

      setGame((previous) => ({
        ...previous,
        ...serverState,
        choices: serverState.choices ?? {
          X: null,
          O: null,
        },
        scores: {
          X: serverState.scores.X ?? 0,
          O: serverState.scores.O ?? 0,
          draws: serverState.scores.draws ?? 0,
        },
      }));

      setMyChoice(serverState.myChoice ?? null);
      setOpponentSubmitted(
        Boolean(serverState.opponentSubmitted)
      );

      setRematchLoading(false);
      setError("");

      if (serverState.status === "finished") {
        onGameOver(serverState);
      }
    },
    [onGameOver]
  );

  useEffect(() => {
    if (!isOnline) return undefined;

    return subscribeRPS(socket, {
      onState: handleServerState,

      onError: (serverError) => {
        setError(
          serverError?.message || "Something went wrong."
        );
        setRematchLoading(false);
      },

      onRematchRequested: () => {
        setRematchRequested(true);
      },

      onRematchStarted: (serverState) => {
        if (serverState?.scores) {
          handleServerState(serverState);
        } else {
          setGame(createInitialRPSState(bestOf));
          setMyChoice(null);
          setOpponentSubmitted(false);
        }

        setRematchLoading(false);
        setRematchRequested(false);
      },
    });
  }, [socket, isOnline, handleServerState, bestOf]);

  const currentPlayerName =
    game.status === "playing"
      ? isOnline
        ? myChoice
          ? "Waiting for opponent"
          : "Your turn"
        : currentLocalPlayer
      : "Round complete";

  const selectedChoice = isOnline
    ? myChoice
    : localChoices[localCurrentSymbol];

  const choicesLocked = isOnline
    ? Boolean(myChoice) || game.status !== "playing"
    : Boolean(localChoices.X && localChoices.O) ||
      game.status !== "playing";

  const targetWins = game.targetWins || Math.ceil(bestOf / 2);

  return (
    <section className="rps-container">
      <header className="rps-header">
        <div>
          <span className="rps-eyebrow">MINIVERSE GAME</span>
          <h1>Rock Paper Scissors</h1>
          <p>Choose wisely. Outsmart your opponent.</p>
        </div>

        <button
          type="button"
          className="rps-exit-button"
          onClick={onExit}
        >
          Exit
        </button>
      </header>

      <div className="rps-match-info">
        <span>{isOnline ? "Online Match" : "Local Match"}</span>
        <span>Best of {game.bestOf || bestOf}</span>
        <span>First to {targetWins} wins</span>
      </div>

      <div className="rps-scoreboard">
        <div className="rps-score-player">
          <span className="rps-score-symbol rps-x">X</span>
          <strong>{playerX}</strong>
          <span className="rps-score-number">
            {game.scores.X}
          </span>
          <small>Wins</small>
        </div>

        <div className="rps-score-divider">VS</div>

        <div className="rps-score-player">
          <span className="rps-score-symbol rps-o">O</span>
          <strong>{playerO}</strong>
          <span className="rps-score-number">
            {game.scores.O}
          </span>
          <small>Wins</small>
        </div>
      </div>

      <div className="rps-round-info">
        <span>ROUND {game.round}</span>
        <span>Draws: {game.scores.draws}</span>
      </div>

      <div className="rps-turn-indicator">
        <span className="rps-turn-dot" />
        {isOnline
          ? currentPlayerName
          : game.status === "playing"
            ? `${currentLocalPlayer}'s turn`
            : "Round completed"}
      </div>

      {error && (
        <div className="rps-error" role="alert">
          {error}
        </div>
      )}

      {game.status === "playing" ? (
        <>
          {!isOnline && localChoices.X && !localChoices.O && (
            <div className="rps-local-notice">
              Player X has selected. Now it's Player O's turn.
            </div>
          )}

          {isOnline && myChoice && (
            <div className="rps-local-notice">
              Your choice has been submitted.
              {opponentSubmitted
                ? " Revealing the round..."
                : " Waiting for your opponent..."}
            </div>
          )}

          <RPSChoices
            onSelect={handleChoice}
            disabled={choicesLocked}
            selectedChoice={selectedChoice}
            title={
              isOnline
                ? myChoice
                  ? "Choice submitted"
                  : "Choose your move"
                : `Choose your move, ${currentLocalPlayer}`
            }
          />
        </>
      ) : null}

      <RPSResult
        roundWinner={game.roundWinner}
        matchWinner={game.matchWinner}
        choices={game.choices}
        mySymbol={isOnline ? mySymbol : null}
        onNextRound={handleNextRound}
        onRematch={handleRematch}
        onExit={onExit}
        isOnline={isOnline}
        loading={rematchLoading}
      />

      {rematchRequested && (
        <div className="rps-rematch-notice">
          Your opponent has requested a rematch!
        </div>
      )}

      <footer className="rps-footer">
        <span>Rock beats Scissors</span>
        <span>Paper beats Rock</span>
        <span>Scissors beats Paper</span>
      </footer>
    </section>
  );
}

export default RockPaperScissors;
