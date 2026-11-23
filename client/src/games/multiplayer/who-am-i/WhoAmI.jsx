
import React, {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import IdentityCard from "./IdentityCard";
import ClueDisplay from "./ClueDisplay";

import {
  SAMPLE_IDENTITIES,
  WHO_AM_I_CONFIG,
  WHO_AM_I_STATUS,
  createInitialWhoAmIState,
  startWhoAmIRound,
  revealNextClue,
  submitIdentityGuess,
  advanceWhoAmIRound,
  revealIdentityAnswer,
  getRandomIdentity,
  getWhoAmIWinner,
} from "./whoAmILogic";

import {
  WHO_AM_I_EVENTS,
  subscribeWhoAmIEvents,
  startWhoAmIGame,
  revealWhoAmIClue,
  submitWhoAmIGuess,
  requestNextWhoAmIRound,
} from "./whoAmISocket";

import "./whoAmI.css";

const WhoAmI = ({
  socket = null,
  roomId = null,
  players: suppliedPlayers = [],
  identities = SAMPLE_IDENTITIES,
  totalRounds,
  onExit,
}) => {
  const [game, setGame] = useState(() =>
    createInitialWhoAmIState(suppliedPlayers)
  );

  const [guess, setGuess] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [resultMessage, setResultMessage] = useState("");
  const [revealedIdentity, setRevealedIdentity] = useState(null);
  const [usedIdentityIds, setUsedIdentityIds] = useState([]);

  const isOnline = Boolean(socket && roomId);

  const me = suppliedPlayers.find((player) => player.isMe);

  const myId = String(me?.id || me?._id || "");

  const currentPlayer = useMemo(
    () =>
      game.players.find(
        (player) => player.id === game.currentPlayerId
      ) || null,
    [game.players, game.currentPlayerId]
  );

  const isMyTurn = Boolean(
    myId && myId === String(game.currentPlayerId)
  );

  const isLocalMode = !isOnline;

  const isPlaying = game.status === WHO_AM_I_STATUS.PLAYING;
  const isAnswered = game.status === WHO_AM_I_STATUS.ANSWERED;
  const isCompleted = game.status === WHO_AM_I_STATUS.COMPLETED;

  const updateError = useCallback((message) => {
    setError(message || "Something went wrong.");
  }, []);

  useEffect(() => {
    if (!isOnline) return undefined;

    const unsubscribe = subscribeWhoAmIEvents(socket, {
      onState: (newState) => {
        setGame((previous) => ({
          ...previous,
          ...newState,
        }));
      },

      onIdentity: (payload) => {
        // The server must send private identity data only to its intended player.
        setGame((previous) => ({
          ...previous,
          identity: payload.identity || null,
          visibleClues: payload.visibleClues || [],
          status: WHO_AM_I_STATUS.PLAYING,
        }));
      },

      onClue: (payload) => {
        setGame((previous) => ({
          ...previous,
          visibleClues: payload.visibleClues || [
            ...previous.visibleClues,
            payload.clue,
          ],
          hintsUsed: payload.hintsUsed ?? previous.hintsUsed + 1,
        }));
      },

      onResult: (payload) => {
        setResultMessage(payload.message || "");
        setGame((previous) => ({
          ...previous,
          players: payload.players || previous.players,
          pointsEarned: payload.pointsEarned || 0,
          status: payload.isCorrect
            ? WHO_AM_I_STATUS.ANSWERED
            : WHO_AM_I_STATUS.PLAYING,
        }));
      },

      onRoundEnd: (payload) => {
        setRevealedIdentity(payload.identity || null);
        setGame((previous) => ({
          ...previous,
          ...payload.state,
          status: WHO_AM_I_STATUS.ANSWERED,
        }));
      },

      onGameOver: (payload) => {
        setGame((previous) => ({
          ...previous,
          ...payload.state,
          players: payload.players || previous.players,
          status: WHO_AM_I_STATUS.COMPLETED,
        }));
      },

      onError: (payload) => {
        updateError(payload?.message || "Game error.");
      },
    });

    return unsubscribe;
  }, [isOnline, socket, updateError]);

  const handleStart = async () => {
    setError("");
    setResultMessage("");
    setRevealedIdentity(null);
    setGuess("");

    const rounds =
      totalRounds || Math.max(1, suppliedPlayers.length);

    if (isOnline) {
      try {
        setLoading(true);

        await startWhoAmIGame(socket, {
          roomId,
          totalRounds: rounds,
        });
      } catch (err) {
        updateError(err.message);
      } finally {
        setLoading(false);
      }

      return;
    }

    if (game.players.length < 2) {
      updateError("At least two players are required.");
      return;
    }

    const identity = getRandomIdentity(
      identities,
      usedIdentityIds
    );

    if (!identity) {
      updateError("No unused identities are available.");
      return;
    }

    setUsedIdentityIds((previous) => [
      ...previous,
      identity.identityId,
    ]);

    const initialState = {
      ...game,
      totalRounds: rounds,
    };

    setGame(startWhoAmIRound(initialState, identity));
  };

  const handleRevealClue = async () => {
    setError("");

    if (!isMyTurn) {
      updateError("Wait for your turn.");
      return;
    }

    if (isOnline) {
      try {
        setLoading(true);

        await revealWhoAmIClue(socket, {
          roomId,
        });
      } catch (err) {
        updateError(err.message);
      } finally {
        setLoading(false);
      }

      return;
    }

    try {
      setGame((previous) => revealNextClue(previous));
    } catch (err) {
      updateError(err.message);
    }
  };

  const handleGuess = async (event) => {
    event.preventDefault();

    if (!guess.trim()) return;

    if (!isMyTurn) {
      updateError("Wait for your turn.");
      return;
    }

    setError("");
    setResultMessage("");

    if (isOnline) {
      try {
        setLoading(true);

        await submitWhoAmIGuess(socket, {
          roomId,
          guess: guess.trim(),
        });

        setGuess("");
      } catch (err) {
        updateError(err.message);
      } finally {
        setLoading(false);
      }

      return;
    }

    try {
      const nextState = submitIdentityGuess(game, guess);

      setGame(nextState);
      setGuess("");

      if (nextState.status === WHO_AM_I_STATUS.ANSWERED) {
        setResultMessage("🎉 Correct! You identified the mystery!");
        setRevealedIdentity(nextState.identity);
      } else {
        setResultMessage("❌ Not quite! Try another guess.");
      }
    } catch (err) {
      updateError(err.message);
    }
  };

  const handleRevealAnswer = () => {
    if (!isMyTurn && isLocalMode) {
      updateError("Only the current player can reveal the answer.");
      return;
    }

    if (isOnline) {
      updateError("The host must end the round through the game controls.");
      return;
    }

    setGame((previous) => revealIdentityAnswer(previous));
    setRevealedIdentity(game.identity);
    setResultMessage("The mystery identity has been revealed.");
  };

  const handleNextRound = async () => {
    setError("");
    setGuess("");
    setResultMessage("");
    setRevealedIdentity(null);

    if (isOnline) {
      try {
        setLoading(true);

        await requestNextWhoAmIRound(socket, {
          roomId,
        });
      } catch (err) {
        updateError(err.message);
      } finally {
        setLoading(false);
      }

      return;
    }

    const nextIndex = game.currentPlayerIndex + 1;
    const nextRound = game.round + 1;

    if (nextRound > game.totalRounds) {
      setGame((previous) => ({
        ...previous,
        identity: null,
        status: WHO_AM_I_STATUS.COMPLETED,
      }));
      return;
    }

    const identity = getRandomIdentity(
      identities,
      usedIdentityIds
    );

    if (!identity) {
      setGame((previous) => ({
        ...previous,
        identity: null,
        status: WHO_AM_I_STATUS.COMPLETED,
      }));
      return;
    }

    setUsedIdentityIds((previous) => [
      ...previous,
      identity.identityId,
    ]);

    const nextState = {
      ...game,
      currentPlayerIndex:
        nextIndex % game.players.length,
      currentPlayerId:
        game.players[nextIndex % game.players.length].id,
      round: nextRound,
    };

    setGame(startWhoAmIRound(nextState, identity, nextRound));
  };

  const handleExit = () => {
    onExit?.();
  };

  const winner = useMemo(
    () => getWhoAmIWinner(game.players),
    [game.players]
  );

  const isCurrentPlayer = isLocalMode || isMyTurn;

  return (
    <main className="who-am-i-game">
      <header className="wai-header">
        <div className="wai-header-title">
          <span className="wai-header-icon">🕵️</span>

          <div>
            <h1>Who Am I?</h1>
            <p>Use the clues and discover your identity!</p>
          </div>
        </div>

        <button
          type="button"
          className="wai-exit-button"
          onClick={handleExit}
        >
          ✕ Exit
        </button>
      </header>

      {error && (
        <div className="wai-error" role="alert">
          <span>⚠️</span>
          <p>{error}</p>
          <button
            type="button"
            onClick={() => setError("")}
            aria-label="Dismiss error"
          >
            ✕
          </button>
        </div>
      )}

      {game.status === WHO_AM_I_STATUS.WAITING && (
        <section className="wai-start-screen">
          <div className="wai-start-icon">🎭</div>
          <h2>Can You Discover Your Identity?</h2>
          <p>
            Listen to the clues, think carefully, and guess the mystery
            identity before your opponents.
          </p>

          <div className="wai-start-stats">
            <div>
              <strong>{game.players.length}</strong>
              <span>Players</span>
            </div>
            <div>
              <strong>{totalRounds || game.players.length}</strong>
              <span>Rounds</span>
            </div>
            <div>
              <strong>100</strong>
              <span>Base points</span>
            </div>
          </div>

          <button
            type="button"
            className="wai-primary-button"
            onClick={handleStart}
            disabled={loading}
          >
            {loading ? "Starting..." : "Start Game →"}
          </button>
        </section>
      )}

      {(isPlaying || isAnswered) && (
        <>
          <section className="wai-game-info">
            <div>
              <span>ROUND</span>
              <strong>
                {game.round} / {game.totalRounds}
              </strong>
            </div>

            <div>
              <span>PLAYER</span>
              <strong>{currentPlayer?.name || "Player"}</strong>
            </div>

            <div>
              <span>HINTS USED</span>
              <strong>
                {game.hintsUsed}/{WHO_AM_I_CONFIG.MAX_HINTS}
              </strong>
            </div>
          </section>

          {!isMyTurn && isOnline && (
            <div className="wai-waiting-message">
              ⏳ Waiting for {currentPlayer?.name || "the current player"}...
            </div>
          )}

          <IdentityCard
            category={game.identity?.category || "Mystery"}
            difficulty={game.identity?.difficulty || "medium"}
            round={game.round}
            isRevealed={isAnswered || Boolean(revealedIdentity)}
            identityName={
              revealedIdentity?.name || game.identity?.name || ""
            }
            isCurrentPlayer={isCurrentPlayer}
          />

          <div className="wai-main-layout">
            <div className="wai-game-panel">
              <ClueDisplay
                clues={game.visibleClues}
                totalClues={game.identity?.clues?.length || 4}
                hintsUsed={game.hintsUsed}
                maxHints={WHO_AM_I_CONFIG.MAX_HINTS}
                onRevealNext={handleRevealClue}
                disabled={
                  loading ||
                  !isPlaying ||
                  !isMyTurn ||
                  game.hintsUsed >= WHO_AM_I_CONFIG.MAX_HINTS
                }
              />

              {isPlaying && (
                <form
                  className="wai-guess-form"
                  onSubmit={handleGuess}
                >
                  <label htmlFor="wai-guess-input">
                    What's your guess?
                  </label>

                  <div className="wai-guess-input-row">
                    <input
                      id="wai-guess-input"
                      type="text"
                      value={guess}
                      onChange={(event) => setGuess(event.target.value)}
                      placeholder="Enter your answer..."
                      maxLength={WHO_AM_I_CONFIG.MAX_GUESS_LENGTH}
                      autoComplete="off"
                      disabled={loading || !isMyTurn}
                    />

                    <button
                      type="submit"
                      className="wai-primary-button"
                      disabled={loading || !guess.trim() || !isMyTurn}
                    >
                      Guess
                    </button>
                  </div>
                </form>
              )}

              {resultMessage && (
                <div className="wai-result-message">
                  {resultMessage}
                </div>
              )}

              {isPlaying && (
                <button
                  type="button"
                  className="wai-reveal-answer-button"
                  onClick={handleRevealAnswer}
                  disabled={loading || isOnline || !isMyTurn}
                >
                  Reveal Answer & End Round
                </button>
              )}

              {isAnswered && (
                <section className="wai-round-result">
                  <div className="wai-round-result-icon">🎉</div>
                  <h3>Round Completed!</h3>

                  <p>
                    The identity was{" "}
                    <strong>
                      {revealedIdentity?.name ||
                        game.identity?.name ||
                        "Unknown"}
                    </strong>
                  </p>

                  <p className="wai-points-earned">
                    Points earned: {game.pointsEarned}
                  </p>

                  <button
                    type="button"
                    className="wai-primary-button"
                    onClick={handleNextRound}
                    disabled={loading}
                  >
                    {loading
                      ? "Loading..."
                      : game.round >= game.totalRounds
                        ? "Finish Game"
                        : "Next Round →"}
                  </button>
                </section>
              )}
            </div>

            <aside className="wai-sidebar">
              <div className="wai-scoreboard">
                <h3>🏆 Scoreboard</h3>

                {[...game.players]
                  .sort((a, b) => b.score - a.score)
                  .map((player, index) => (
                    <div className="wai-player-score" key={player.id}>
                      <span>
                        {index === 0
                          ? "🥇"
                          : index === 1
                            ? "🥈"
                            : "🥉"}
                      </span>
                      <strong>{player.name}</strong>
                      <span>{player.score}</span>
                    </div>
                  ))}
              </div>

              <div className="wai-rules">
                <h3>📜 How to Play</h3>
                <ul>
                  <li>Read the clues one by one.</li>
                  <li>Submit your guess.</li>
                  <li>Using more hints reduces your points.</li>
                  <li>Reveal the answer if you cannot guess.</li>
                </ul>
              </div>
            </aside>
          </div>
        </>
      )}

      {isCompleted && (
        <section className="wai-completed-screen">
          <div className="wai-completed-icon">🏆</div>
          <h2>Game Completed!</h2>

          <p>
            {winner?.isDraw
              ? "It's a tie! Great game!"
              : `${winner?.players?.[0]?.name || "Player"} wins!`}
          </p>

          <div className="wai-final-scoreboard">
            {[...game.players]
              .sort((a, b) => b.score - a.score)
              .map((player, index) => (
                <div className="wai-final-player" key={player.id}>
                  <span>
                    {index === 0 ? "🥇" : index === 1 ? "🥈" : "🥉"}
                  </span>
                  <strong>{player.name}</strong>
                  <span>{player.score} points</span>
                </div>
              ))}
          </div>

          <button
            type="button"
            className="wai-primary-button"
            onClick={() => {
              setGame(createInitialWhoAmIState(suppliedPlayers));
              setUsedIdentityIds([]);
              setGuess("");
              setResultMessage("");
              setRevealedIdentity(null);
            }}
          >
            Play Again
          </button>
        </section>
      )}

      {loading && (
        <div className="wai-loading">
          <div className="wai-spinner" />
          <span>Updating game...</span>
        </div>
      )}
    </main>
  );
};

export default WhoAmI;
