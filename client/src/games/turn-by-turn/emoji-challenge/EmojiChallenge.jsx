
import React, { useEffect, useMemo, useState } from "react";

import EmojiQuestion from "./EmojiQuestion";
import EmojiAnswer from "./EmojiAnswer";

import {
  EMOJI_CHALLENGE_CONFIG,
  EMOJI_CHALLENGE_STATUS,
  SAMPLE_EMOJI_CHALLENGES,
  createInitialEmojiChallengeState,
  startEmojiChallenge,
  revealEmojiHint,
  getVisibleEmojiHints,
  submitEmojiChallengeAnswer,
  advanceEmojiChallengeRound,
  getCurrentEmojiPlayer,
  getEmojiChallengeLeaderboard,
} from "./emojiChallengeLogic";

import {
  EMOJI_CHALLENGE_EVENTS,
  startEmojiChallengeSocket,
  submitEmojiChallengeSocketAnswer,
  requestEmojiChallengeHint,
  requestNextEmojiChallengeRound,
  requestEmojiChallengeRematch,
  subscribeEmojiChallenge,
} from "./emojiChallengeSocket";

import "./emojiChallenge.css";

function EmojiChallenge({
  socket = null,
  roomId = null,
  players: suppliedPlayers = [],
  questions = SAMPLE_EMOJI_CHALLENGES,
  totalRounds = EMOJI_CHALLENGE_CONFIG.TOTAL_ROUNDS,
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
    createInitialEmojiChallengeState({
      players: initialPlayers,
      questions,
      totalRounds,
    })
  );

  const [error, setError] = useState("");
  const [waiting, setWaiting] = useState(false);
  const [rematchRequested, setRematchRequested] = useState(false);

  const currentPlayer = getCurrentEmojiPlayer(game);
  const leaderboard = getEmojiChallengeLeaderboard(game.players);
  const currentRound = game.currentRoundIndex + 1;
  const isFinished = game.status === EMOJI_CHALLENGE_STATUS.FINISHED;
  const isRoundResult = game.status === EMOJI_CHALLENGE_STATUS.ROUND_RESULT;

  const visibleHints = getVisibleEmojiHints(game);
  const myPlayer = game.players.find((player) => player.isMe);
  const hasAnswered = Boolean(
    myPlayer && game.answers[myPlayer.id] !== undefined
  );

  const startLocalGame = () => {
    const fresh = createInitialEmojiChallengeState({
      players: initialPlayers,
      questions,
      totalRounds,
    });

    setGame(startEmojiChallenge(fresh));
    setError("");
    setWaiting(false);
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

  const handleOnlineQuestion = (payload) => {
    if (!payload) return;

    setGame((previous) => ({
      ...previous,
      status: EMOJI_CHALLENGE_STATUS.PLAYING,
      currentRoundIndex:
        payload.currentRoundIndex ?? previous.currentRoundIndex,
      currentQuestion: payload.question || payload.currentQuestion,
      currentTurnIndex: payload.currentTurnIndex ?? 0,
      hintsUsed: payload.hintsUsed ?? 0,
      answers: {},
    }));

    setWaiting(false);
  };

  const handleOnlineRoundResult = (payload) => {
    if (!payload) return;

    setGame((previous) => ({
      ...previous,
      ...payload,
      status: EMOJI_CHALLENGE_STATUS.ROUND_RESULT,
      currentQuestion: payload.question || previous.currentQuestion,
      players: payload.players || previous.players,
      answers: payload.answers || previous.answers,
    }));

    setWaiting(false);
  };

  const handleOnlineGameOver = (payload) => {
    if (!payload) return;

    setGame((previous) => ({
      ...previous,
      ...payload,
      status: EMOJI_CHALLENGE_STATUS.FINISHED,
      players: payload.players || previous.players,
    }));
  };

  useEffect(() => {
    if (!isOnline) return undefined;

    const unsubscribe = subscribeEmojiChallenge(socket, {
      onState: handleOnlineState,
      onQuestion: handleOnlineQuestion,
      onAnswerResult: (payload) => {
        if (payload?.message) setError(payload.message);
        setWaiting(true);
      },
      onRoundResult: handleOnlineRoundResult,
      onGameOver: handleOnlineGameOver,
      onRematchRequested: () => setRematchRequested(true),
      onRematchStarted: (payload) => {
        setRematchRequested(false);
        handleOnlineState(payload?.state || payload);
      },
      onError: (payload) =>
        setError(payload?.message || "Something went wrong."),
    });

    startEmojiChallengeSocket(socket, roomId);

    return unsubscribe;
  }, [socket, roomId, isOnline]);

  const handleSubmitAnswer = (answer) => {
    setError("");

    if (isOnline) {
      submitEmojiChallengeSocketAnswer(socket, { roomId, answer });
      setWaiting(true);
      return;
    }

    if (!currentPlayer) return;

    const result = submitEmojiChallengeAnswer(
      game,
      currentPlayer.id,
      answer
    );

    if (result.error) {
      setError(result.error);
      return;
    }

    setGame(result.state);
  };

  const handleHint = () => {
    if (isOnline) {
      requestEmojiChallengeHint(socket, roomId);
      return;
    }

    setGame((previous) => revealEmojiHint(previous));
  };

  const handleNextRound = () => {
    if (isOnline) {
      requestNextEmojiChallengeRound(socket, roomId);
      return;
    }

    setGame((previous) => advanceEmojiChallengeRound(previous));
    setError("");
  };

  const handleRematch = () => {
    if (isOnline) {
      requestEmojiChallengeRematch(socket, roomId);
      setRematchRequested(true);
    } else {
      startLocalGame();
    }
  };

  const renderLeaderboard = () => (
    <div className="ec-leaderboard">
      <h3>Final Scores</h3>
      {leaderboard.map((player) => (
        <div className="ec-leaderboard-row" key={player.id}>
          <span>#{player.rank}</span>
          <strong>{player.name}</strong>
          <b>{player.score} pts</b>
        </div>
      ))}
    </div>
  );

  if (game.status === EMOJI_CHALLENGE_STATUS.WAITING) {
    return (
      <main className="ec-container">
        <section className="ec-welcome-card">
          <div className="ec-game-icon">🎭</div>
          <span className="ec-eyebrow">MINIVERSE TURN-BY-TURN</span>
          <h1>Emoji Challenge</h1>
          <p>
            Decode the emojis, reveal clues, and compete to earn
            the most points.
          </p>

          <div className="ec-player-preview">
            {game.players.map((player) => (
              <span className="ec-player-chip" key={player.id}>
                👤 {player.name}
              </span>
            ))}
          </div>

          {error && <p className="ec-error">{error}</p>}

          <button
            type="button"
            className="ec-primary-button"
            onClick={() => {
              if (isOnline) {
                socket.emit(EMOJI_CHALLENGE_EVENTS.START, { roomId });
              } else {
                startLocalGame();
              }
            }}
          >
            Start Challenge
          </button>

          {onExit && (
            <button className="ec-text-button" onClick={onExit}>
              Exit game
            </button>
          )}
        </section>
      </main>
    );
  }

  if (isFinished) {
    return (
      <main className="ec-container">
        <section className="ec-result-card">
          <div className="ec-result-icon">
            {game.isDraw ? "🤝" : "🏆"}
          </div>
          <span className="ec-eyebrow">CHALLENGE COMPLETED</span>
          <h1>
            {game.isDraw
              ? "It's a Draw!"
              : `${game.winner?.name || "Winner"} Wins!`}
          </h1>
          <p>Here are the final challenge scores.</p>

          {renderLeaderboard()}

          <button
            type="button"
            className="ec-primary-button"
            onClick={handleRematch}
          >
            Play Again
          </button>

          {rematchRequested && (
            <p className="ec-muted">Waiting for the other player...</p>
          )}

          {onExit && (
            <button className="ec-text-button" onClick={onExit}>
              Exit game
            </button>
          )}
        </section>
      </main>
    );
  }

  return (
    <main className="ec-container">
      <header className="ec-header">
        <div>
          <span className="ec-eyebrow">MINIVERSE GAME</span>
          <h1>🎭 Emoji Challenge</h1>
        </div>
        {onExit && (
          <button className="ec-exit-button" onClick={onExit}>
            Exit
          </button>
        )}
      </header>

      <div className="ec-layout">
        <section className="ec-main">
          <EmojiQuestion
            question={game.currentQuestion}
            hints={visibleHints}
            round={currentRound}
            totalRounds={game.totalRounds}
            hintsUsed={game.hintsUsed}
            onRevealHint={handleHint}
            disabled={isRoundResult}
            maxHints={EMOJI_CHALLENGE_CONFIG.MAX_HINTS}
          />

          {isRoundResult ? (
            <div className="ec-round-result">
              <div className="ec-result-icon">🎯</div>
              <h2>Round Completed!</h2>
              <p>
                The correct answer was{" "}
                <strong>{game.currentQuestion?.answer}</strong>
              </p>

              <div className="ec-round-players">
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
                className="ec-primary-button"
                onClick={handleNextRound}
              >
                {currentRound >= game.totalRounds
                  ? "View Final Results"
                  : "Next Challenge"}
              </button>
            </div>
          ) : (
            <>
              <div className="ec-turn-indicator">
                <span>Current player</span>
                <strong>{currentPlayer?.name || "Waiting"}</strong>
              </div>

              <EmojiAnswer
                onSubmit={handleSubmitAnswer}
                disabled={waiting || (isOnline && hasAnswered)}
              />

              {waiting && (
                <p className="ec-muted">
                  Answer submitted. Waiting for the other player...
                </p>
              )}

              {error && <p className="ec-error">{error}</p>}
            </>
          )}
        </section>

        <aside className="ec-sidebar">
          <div className="ec-score-card">
            <h3>Player Scores</h3>
            {leaderboard.map((player) => (
              <div className="ec-score-row" key={player.id}>
                <span className="ec-avatar">👤</span>
                <div>
                  <strong>{player.name}</strong>
                  <small>{player.score} points</small>
                </div>
              </div>
            ))}
          </div>

          <div className="ec-rules-card">
            <h3>How to Play</h3>
            <ul>
              <li>Study the emoji combination.</li>
              <li>Take turns submitting answers.</li>
              <li>Use up to two extra hints.</li>
              <li>Correct answers earn up to 100 points.</li>
              <li>Using hints reduces the points earned.</li>
            </ul>
          </div>
        </aside>
      </div>
    </main>
  );
}

export default EmojiChallenge;
