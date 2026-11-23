
import React, { useEffect, useMemo, useState } from "react";

import WordClue from "./WordClue";
import WordAnswer from "./WordAnswer";

import {
  GUESS_WORD_STATUS,
  GUESS_WORD_CONFIG,
  SAMPLE_WORDS,
  createInitialGuessWordState,
  startGuessWordGame,
  revealWordHint,
  getVisibleWordHints,
  submitWordGuess,
  advanceGuessWordRound,
  getCurrentGuessPlayer,
  getGuessWordLeaderboard,
} from "./guessWordLogic";

import {
  GUESS_WORD_EVENTS,
  startGuessWordSocket,
  submitGuessWordSocket,
  requestGuessWordHint,
  requestNextGuessWordRound,
  requestGuessWordRematch,
  subscribeGuessWord,
} from "./guessWordSocket";

import "./guessWord.css";

function GuessWord({
  socket = null,
  roomId = null,
  players: suppliedPlayers = [],
  words = SAMPLE_WORDS,
  totalRounds = GUESS_WORD_CONFIG.TOTAL_ROUNDS,
  mode = "local",
  onExit,
}) {
  const isOnline = mode === "online" && Boolean(socket && roomId);

  const initialPlayers = useMemo(
    () =>
      suppliedPlayers.length
        ? suppliedPlayers
        : [
            { id: "player-1", name: "Player 1", isMe: true },
            { id: "player-2", name: "Player 2" },
          ],
    [suppliedPlayers]
  );

  const [game, setGame] = useState(() =>
    createInitialGuessWordState({
      players: initialPlayers,
      words,
      totalRounds,
    })
  );

  const [error, setError] = useState("");
  const [waitingForOpponent, setWaitingForOpponent] = useState(false);
  const [rematchRequested, setRematchRequested] = useState(false);

  const currentPlayer = getCurrentGuessPlayer(game);
  const leaderboard = getGuessWordLeaderboard(game.players);

  const isFinished = game.status === GUESS_WORD_STATUS.FINISHED;
  const isRoundResult = game.status === GUESS_WORD_STATUS.ROUND_RESULT;

  const visibleHints = getVisibleWordHints(game);
  const currentRound = game.currentRoundIndex + 1;

  const myPlayer = game.players.find((player) => player.isMe);
  const hasAnswered =
    myPlayer && game.answers[myPlayer.id] !== undefined;

  const startLocalGame = () => {
    const fresh = createInitialGuessWordState({
      players: initialPlayers,
      words,
      totalRounds,
    });

    setGame(startGuessWordGame(fresh));
    setError("");
    setWaitingForOpponent(false);
    setRematchRequested(false);
  };

  const handleOnlineState = (payload) => {
    if (!payload) return;

    setGame((previous) => ({
      ...previous,
      ...payload,
      players: payload.players || previous.players,
      answers: payload.answers || {},
    }));

    setError("");
  };

  const handleOnlineWord = (payload) => {
    if (!payload) return;

    setGame((previous) => ({
      ...previous,
      status: GUESS_WORD_STATUS.PLAYING,
      currentRoundIndex:
        payload.currentRoundIndex ?? previous.currentRoundIndex,
      currentWord: payload.word || payload.currentWord,
      currentTurnIndex: payload.currentTurnIndex ?? 0,
      hintsUsed: payload.hintsUsed ?? 0,
      answers: {},
    }));

    setWaitingForOpponent(false);
  };

  const handleOnlineRoundResult = (payload) => {
    if (!payload) return;

    setGame((previous) => ({
      ...previous,
      ...payload,
      status: GUESS_WORD_STATUS.ROUND_RESULT,
      currentWord: payload.word || previous.currentWord,
      players: payload.players || previous.players,
      answers: payload.answers || previous.answers,
    }));

    setWaitingForOpponent(false);
  };

  const handleOnlineGameOver = (payload) => {
    if (!payload) return;

    setGame((previous) => ({
      ...previous,
      ...payload,
      status: GUESS_WORD_STATUS.FINISHED,
      players: payload.players || previous.players,
    }));
  };

  const handleOnlineRematchStarted = (payload) => {
    setRematchRequested(false);

    if (payload?.state) {
      handleOnlineState(payload.state);
    } else if (payload) {
      handleOnlineState(payload);
    }
  };

  useEffect(() => {
    if (!isOnline) return undefined;

    const unsubscribe = subscribeGuessWord(socket, {
      onState: handleOnlineState,
      onWord: handleOnlineWord,
      onGuessResult: (payload) => {
        if (payload?.message) setError(payload.message);
        setWaitingForOpponent(true);
      },
      onRoundResult: handleOnlineRoundResult,
      onGameOver: handleOnlineGameOver,
      onRematchRequested: () => setRematchRequested(true),
      onRematchStarted: handleOnlineRematchStarted,
      onError: (payload) =>
        setError(payload?.message || "Something went wrong."),
    });

    startGuessWordSocket(socket, roomId);

    return unsubscribe;
  }, [socket, roomId, isOnline]);

  const handleSubmitGuess = (guess) => {
    setError("");

    if (isOnline) {
      submitGuessWordSocket(socket, {
        roomId,
        guess,
      });

      setWaitingForOpponent(true);
      return;
    }

    if (!currentPlayer) return;

    const result = submitWordGuess(
      game,
      currentPlayer.id,
      guess
    );

    if (result.error) {
      setError(result.error);
      return;
    }

    setGame(result.state);
  };

  const handleRevealHint = () => {
    if (isOnline) {
      requestGuessWordHint(socket, roomId);
      return;
    }

    setGame((previous) => revealWordHint(previous));
  };

  const handleNextRound = () => {
    if (isOnline) {
      requestNextGuessWordRound(socket, roomId);
      return;
    }

    setGame((previous) => advanceGuessWordRound(previous));
    setError("");
  };

  const handleRematch = () => {
    if (isOnline) {
      requestGuessWordRematch(socket, roomId);
      setRematchRequested(true);
      return;
    }

    startLocalGame();
  };

  const handleStartOnline = () => {
    socket.emit(GUESS_WORD_EVENTS.START, { roomId });
  };

  const renderLeaderboard = () => (
    <div className="gw-leaderboard">
      <h3>Final Scores</h3>

      {leaderboard.map((player) => (
        <div className="gw-leaderboard-row" key={player.id}>
          <span>#{player.rank}</span>
          <strong>{player.name}</strong>
          <b>{player.score} pts</b>
        </div>
      ))}
    </div>
  );

  if (game.status === GUESS_WORD_STATUS.WAITING) {
    return (
      <main className="gw-container">
        <section className="gw-welcome-card">
          <div className="gw-game-icon">🔤</div>
          <span className="gw-eyebrow">MINIVERSE TURN-BY-TURN</span>
          <h1>Guess the Word</h1>

          <p>
            Read the clues, reveal hints, and guess the hidden
            word before your opponent.
          </p>

          <div className="gw-player-preview">
            {game.players.map((player) => (
              <div className="gw-player-chip" key={player.id}>
                👤 {player.name}
              </div>
            ))}
          </div>

          {error && <p className="gw-error">{error}</p>}

          <button
            type="button"
            className="gw-primary-button"
            onClick={isOnline ? handleStartOnline : startLocalGame}
          >
            Start Game
          </button>

          {onExit && (
            <button
              type="button"
              className="gw-text-button"
              onClick={onExit}
            >
              Exit game
            </button>
          )}
        </section>
      </main>
    );
  }

  if (isFinished) {
    return (
      <main className="gw-container">
        <section className="gw-result-card">
          <div className="gw-result-icon">
            {game.isDraw ? "🤝" : "🏆"}
          </div>

          <span className="gw-eyebrow">GAME COMPLETED</span>

          <h1>
            {game.isDraw
              ? "It's a Draw!"
              : `${game.winner?.name || "Winner"} Wins!`}
          </h1>

          <p>Here are the final Guess the Word scores.</p>

          {renderLeaderboard()}

          <button
            type="button"
            className="gw-primary-button"
            onClick={handleRematch}
          >
            Play Again
          </button>

          {rematchRequested && isOnline && (
            <p className="gw-muted">
              Waiting for the other player to accept...
            </p>
          )}

          {onExit && (
            <button
              type="button"
              className="gw-text-button"
              onClick={onExit}
            >
              Exit game
            </button>
          )}
        </section>
      </main>
    );
  }

  return (
    <main className="gw-container">
      <header className="gw-header">
        <div>
          <span className="gw-eyebrow">MINIVERSE GAME</span>
          <h1>🔤 Guess the Word</h1>
        </div>

        {onExit && (
          <button
            type="button"
            className="gw-exit-button"
            onClick={onExit}
          >
            Exit
          </button>
        )}
      </header>

      <div className="gw-layout">
        <section className="gw-main">
          <div className="gw-round-info">
            <span>
              Round {currentRound} / {game.totalRounds}
            </span>

            <span>
              {game.currentWord?.difficulty || "easy"}
            </span>
          </div>

          <WordClue
            word={game.currentWord}
            hints={visibleHints}
            hintsUsed={game.hintsUsed}
            onRevealHint={handleRevealHint}
            disabled={
              isRoundResult ||
              game.hintsUsed >= GUESS_WORD_CONFIG.MAX_HINTS
            }
            maxHints={GUESS_WORD_CONFIG.MAX_HINTS}
          />

          {isRoundResult ? (
            <div className="gw-round-result">
              <div className="gw-result-icon">🎯</div>
              <h2>Round Completed!</h2>

              <p>
                The correct word was{" "}
                <strong>{game.currentWord?.word}</strong>
              </p>

              <div className="gw-round-players">
                {game.players.map((player) => {
                  const answer = game.answers[player.id];

                  return (
                    <div key={player.id}>
                      <span>{player.name}</span>
                      <strong>
                        {answer?.isCorrect
                          ? `✓ ${answer.points} pts`
                          : "No points"}
                      </strong>
                    </div>
                  );
                })}
              </div>

              <button
                type="button"
                className="gw-primary-button"
                onClick={handleNextRound}
              >
                {currentRound >= game.totalRounds
                  ? "View Final Results"
                  : "Next Word"}
              </button>
            </div>
          ) : (
            <>
              <div className="gw-turn-indicator">
                <span>Current player</span>
                <strong>{currentPlayer?.name || "Waiting"}</strong>
              </div>

              <WordAnswer
                onSubmit={handleSubmitGuess}
                disabled={
                  isOnline
                    ? Boolean(hasAnswered || waitingForOpponent)
                    : false
                }
              />

              {waitingForOpponent && (
                <p className="gw-muted">
                  Guess submitted. Waiting for the next player...
                </p>
              )}

              {error && <p className="gw-error">{error}</p>}
            </>
          )}
        </section>

        <aside className="gw-sidebar">
          <div className="gw-score-card">
            <h3>Player Scores</h3>

            {leaderboard.map((player) => (
              <div className="gw-score-row" key={player.id}>
                <div className="gw-avatar">👤</div>

                <div>
                  <strong>{player.name}</strong>
                  <span>{player.score} points</span>
                </div>
              </div>
            ))}
          </div>

          <div className="gw-rules-card">
            <h3>How to Play</h3>

            <ul>
              <li>Read the main clue carefully.</li>
              <li>Reveal up to two extra hints.</li>
              <li>Each player gets one guess per round.</li>
              <li>Fewer hints mean more points.</li>
              <li>The highest total score wins.</li>
            </ul>
          </div>
        </aside>
      </div>
    </main>
  );
}

export default GuessWord;
