
import React, { useEffect, useMemo, useState } from "react";

import NumberQuestion from "./NumberQuestion";
import NumberAnswer from "./NumberAnswer";

import {
  NUMBER_BATTLE_CONFIG,
  NUMBER_BATTLE_STATUS,
  SAMPLE_NUMBER_QUESTIONS,
  createInitialNumberBattleState,
  startNumberBattle,
  submitNumberAnswer,
  revealNumberRoundResult,
  advanceNumberRound,
  getNumberBattleLeaderboard,
} from "./numberBattleLogic";

import {
  NUMBER_BATTLE_EVENTS,
  startNumberBattleSocket,
  submitNumberBattleSocketAnswer,
  requestNumberBattleNextRound,
  requestNumberBattleRematch,
  subscribeNumberBattle,
} from "./numberBattleSocket";

import "./numberBattle.css";

function NumberBattle({
  socket = null,
  roomId = null,
  players: suppliedPlayers = [],
  questions = SAMPLE_NUMBER_QUESTIONS,
  totalRounds = NUMBER_BATTLE_CONFIG.TOTAL_ROUNDS,
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
    createInitialNumberBattleState({
      players: initialPlayers,
      questions,
      totalRounds,
    })
  );

  const [selectedAnswer, setSelectedAnswer] = useState("");
  const [activeLocalPlayerIndex, setActiveLocalPlayerIndex] =
    useState(0);
  const [timeLeft, setTimeLeft] = useState(
    NUMBER_BATTLE_CONFIG.QUESTION_TIME
  );
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [answerFeedback, setAnswerFeedback] = useState(null);
  const [error, setError] = useState("");
  const [waitingForOpponent, setWaitingForOpponent] = useState(false);
  const [rematchRequested, setRematchRequested] = useState(false);

  const currentQuestion = game.currentQuestion;
  const currentRound = game.currentQuestionIndex + 1;

  const activeLocalPlayer =
    game.players[activeLocalPlayerIndex] || null;

  const localPlayerAnswered = activeLocalPlayer
    ? Boolean(game.answers?.[activeLocalPlayer.id])
    : false;

  const isRoundResult =
    game.status === NUMBER_BATTLE_STATUS.ROUND_RESULT;

  const isFinished =
    game.status === NUMBER_BATTLE_STATUS.FINISHED;

  const leaderboard = getNumberBattleLeaderboard(game.players);

  const localCurrentAnswer = activeLocalPlayer
    ? game.answers?.[activeLocalPlayer.id]
    : null;

  const startLocalGame = () => {
    const freshState = createInitialNumberBattleState({
      players: initialPlayers,
      questions,
      totalRounds,
    });

    setGame(startNumberBattle(freshState));
    setSelectedAnswer("");
    setActiveLocalPlayerIndex(0);
    setTimeLeft(NUMBER_BATTLE_CONFIG.QUESTION_TIME);
    setElapsedSeconds(0);
    setAnswerFeedback(null);
    setError("");
    setWaitingForOpponent(false);
    setRematchRequested(false);
  };

  const handleOnlineState = (serverState) => {
    if (!serverState) return;

    setGame((previous) => ({
      ...previous,
      ...serverState,
      players: serverState.players || previous.players,
      answers: serverState.answers || {},
    }));

    setSelectedAnswer("");
    setAnswerFeedback(null);
    setError("");
  };

  const handleOnlineQuestion = (payload) => {
    if (!payload) return;

    setGame((previous) => ({
      ...previous,
      status: NUMBER_BATTLE_STATUS.PLAYING,
      currentQuestionIndex:
        payload.currentQuestionIndex ??
        previous.currentQuestionIndex,
      totalRounds: payload.totalRounds ?? previous.totalRounds,
      currentQuestion: payload.question || payload.currentQuestion,
      answers: {},
    }));

    setSelectedAnswer("");
    setTimeLeft(payload.timeLimit || NUMBER_BATTLE_CONFIG.QUESTION_TIME);
    setElapsedSeconds(0);
    setAnswerFeedback(null);
    setWaitingForOpponent(false);
  };

  const handleOnlineAnswerResult = (payload) => {
    if (!payload) return;

    setAnswerFeedback(payload);
    setWaitingForOpponent(Boolean(payload.waitingForOpponent));

    if (payload.players) {
      setGame((previous) => ({
        ...previous,
        players: payload.players,
      }));
    }
  };

  const handleOnlineRoundResult = (payload) => {
    if (!payload) return;

    setGame((previous) => ({
      ...previous,
      ...payload,
      status: NUMBER_BATTLE_STATUS.ROUND_RESULT,
      currentQuestion:
        payload.question || previous.currentQuestion,
      players: payload.players || previous.players,
      answers: payload.answers || previous.answers,
    }));

    setWaitingForOpponent(false);
    setAnswerFeedback(payload);
  };

  const handleOnlineTimer = (payload) => {
    const nextTime =
      typeof payload === "number" ? payload : payload?.timeLeft;

    if (Number.isFinite(nextTime)) {
      setTimeLeft(Math.max(0, nextTime));
    }
  };

  const handleOnlineGameOver = (payload) => {
    if (!payload) return;

    setGame((previous) => ({
      ...previous,
      ...payload,
      status: NUMBER_BATTLE_STATUS.FINISHED,
      players: payload.players || previous.players,
    }));
  };

  const handleOnlineRematchStarted = (payload) => {
    setRematchRequested(false);
    setAnswerFeedback(null);
    setSelectedAnswer("");
    setError("");

    if (payload?.state) {
      handleOnlineState(payload.state);
    } else if (payload) {
      handleOnlineState(payload);
    }
  };

  useEffect(() => {
    if (!isOnline) return undefined;

    const unsubscribe = subscribeNumberBattle(socket, {
      onState: handleOnlineState,
      onQuestion: handleOnlineQuestion,
      onAnswerResult: handleOnlineAnswerResult,
      onRoundResult: handleOnlineRoundResult,
      onTimer: handleOnlineTimer,
      onGameOver: handleOnlineGameOver,
      onRematchRequested: () => setRematchRequested(true),
      onRematchStarted: handleOnlineRematchStarted,
      onError: (payload) =>
        setError(payload?.message || "Something went wrong."),
    });

    startNumberBattleSocket(socket, roomId);

    return unsubscribe;
  }, [socket, roomId, isOnline]);

  useEffect(() => {
    if (
      game.status !== NUMBER_BATTLE_STATUS.PLAYING ||
      timeLeft <= 0
    ) {
      return undefined;
    }

    const interval = window.setInterval(() => {
      setTimeLeft((previous) => Math.max(0, previous - 1));
      setElapsedSeconds((previous) => previous + 1);
    }, 1000);

    return () => window.clearInterval(interval);
  }, [game.status, currentRound, timeLeft === 0]);

  useEffect(() => {
    if (
      timeLeft !== 0 ||
      game.status !== NUMBER_BATTLE_STATUS.PLAYING
    ) {
      return;
    }

    if (isOnline) {
      // The server owns timeout and round completion.
      return;
    }

    setGame((previous) => revealNumberRoundResult(previous));
    setError("");
  }, [timeLeft, game.status, isOnline]);

  const handleSubmitAnswer = () => {
    if (!selectedAnswer || !currentQuestion) return;

    if (isOnline) {
      submitNumberBattleSocketAnswer(socket, {
        roomId,
        answer: selectedAnswer,
        elapsedSeconds,
      });

      setWaitingForOpponent(true);
      setSelectedAnswer("");
      return;
    }

    if (!activeLocalPlayer) return;

    const result = submitNumberAnswer(game, {
      playerId: activeLocalPlayer.id,
      answer: selectedAnswer,
      elapsedSeconds,
    });

    if (result.error) {
      setError(result.error);
      return;
    }

    setGame(result.state);
    setAnswerFeedback({
      ...result.answerRecord,
      correctAnswer: currentQuestion.correctAnswer,
      explanation: currentQuestion.explanation,
    });

    setSelectedAnswer("");

    if (result.state.status === NUMBER_BATTLE_STATUS.PLAYING) {
      const nextPlayerIndex = game.players.findIndex(
        (player, index) =>
          index > activeLocalPlayerIndex &&
          !result.state.answers[player.id]
      );

      const firstUnansweredIndex = game.players.findIndex(
        (player) => !result.state.answers[player.id]
      );

      setActiveLocalPlayerIndex(
        nextPlayerIndex >= 0
          ? nextPlayerIndex
          : firstUnansweredIndex
      );
    }
  };

  const handleNextRound = () => {
    if (isOnline) {
      requestNumberBattleNextRound(socket, roomId);
      return;
    }

    setGame((previous) => advanceNumberRound(previous));
    setActiveLocalPlayerIndex(0);
    setSelectedAnswer("");
    setAnswerFeedback(null);
    setTimeLeft(NUMBER_BATTLE_CONFIG.QUESTION_TIME);
    setElapsedSeconds(0);
    setError("");
  };

  const handleRematch = () => {
    if (isOnline) {
      requestNumberBattleRematch(socket, roomId);
      setRematchRequested(true);
      return;
    }

    startLocalGame();
  };

  const handleStartOnline = () => {
    socket.emit(NUMBER_BATTLE_EVENTS.START, { roomId });
  };

  const renderLeaderboard = () => (
    <div className="nb-leaderboard">
      <h3>Leaderboard</h3>

      {leaderboard.map((player) => (
        <div className="nb-leaderboard-row" key={player.id}>
          <span className="nb-rank">#{player.rank}</span>

          <span className="nb-leaderboard-name">
            {player.name}
          </span>

          <strong>{player.score} pts</strong>
        </div>
      ))}
    </div>
  );

  if (game.status === NUMBER_BATTLE_STATUS.WAITING) {
    return (
      <main className="nb-container">
        <div className="nb-welcome-card">
          <div className="nb-game-icon">🔢</div>

          <span className="nb-eyebrow">MINIVERSE MULTIPLAYER</span>

          <h1>Number Battle</h1>

          <p>
            Solve number questions, answer faster, and challenge
            your opponents to become the Number Battle champion.
          </p>

          <div className="nb-welcome-stats">
            <div>
              <strong>{totalRounds}</strong>
              <span>Rounds</span>
            </div>

            <div>
              <strong>{NUMBER_BATTLE_CONFIG.QUESTION_TIME}s</strong>
              <span>Per question</span>
            </div>

            <div>
              <strong>4</strong>
              <span>Max players</span>
            </div>
          </div>

          <div className="nb-player-preview">
            {game.players.map((player) => (
              <div className="nb-player-chip" key={player.id}>
                <span>👤</span>
                {player.name}
              </div>
            ))}
          </div>

          {error && <p className="nb-error">{error}</p>}

          <button
            className="nb-primary-button"
            type="button"
            onClick={isOnline ? handleStartOnline : startLocalGame}
          >
            Start Number Battle
          </button>

          {onExit && (
            <button
              className="nb-text-button"
              type="button"
              onClick={onExit}
            >
              Exit game
            </button>
          )}
        </div>
      </main>
    );
  }

  if (isFinished) {
    return (
      <main className="nb-container">
        <div className="nb-result-card">
          <div className="nb-result-icon">
            {game.isDraw ? "🤝" : "🏆"}
          </div>

          <span className="nb-eyebrow">GAME COMPLETED</span>

          <h1>
            {game.isDraw
              ? "It's a Draw!"
              : `${game.winner?.name || leaderboard[0]?.name || "Winner"} Wins!`}
          </h1>

          <p className="nb-muted">
            {game.isDraw
              ? "Amazing match! Everyone finished with the same score."
              : "Congratulations on winning Number Battle!"}
          </p>

          {renderLeaderboard()}

          <button
            className="nb-primary-button"
            type="button"
            onClick={handleRematch}
          >
            Play Again
          </button>

          {rematchRequested && isOnline && (
            <p className="nb-muted">
              Rematch request sent. Waiting for other players...
            </p>
          )}

          {onExit && (
            <button
              className="nb-text-button"
              type="button"
              onClick={onExit}
            >
              Exit game
            </button>
          )}
        </div>
      </main>
    );
  }

  return (
    <main className="nb-container">
      <header className="nb-game-header">
        <div>
          <span className="nb-eyebrow">MINIVERSE GAME</span>
          <h1>🔢 Number Battle</h1>
        </div>

        {onExit && (
          <button
            className="nb-exit-button"
            type="button"
            onClick={onExit}
          >
            Exit
          </button>
        )}
      </header>

      <div className="nb-game-layout">
        <section className="nb-main-column">
          <NumberQuestion
            question={currentQuestion}
            currentRound={currentRound}
            totalRounds={game.totalRounds}
            timeLeft={timeLeft}
          />

          {error && <p className="nb-error">{error}</p>}

          {isRoundResult ? (
            <div className="nb-round-result">
              <div className="nb-result-icon">🎯</div>
              <h2>Round {currentRound} completed!</h2>

              <p>
                Correct answer:{" "}
                <strong>{currentQuestion?.correctAnswer}</strong>
              </p>

              {currentQuestion?.explanation && (
                <p className="nb-explanation">
                  {currentQuestion.explanation}
                </p>
              )}

              <div className="nb-round-player-results">
                {game.players.map((player) => {
                  const answer = game.answers?.[player.id];

                  return (
                    <div
                      className="nb-round-player"
                      key={player.id}
                    >
                      <span>{player.name}</span>

                      <strong>
                        {answer
                          ? `${answer.isCorrect ? "✓" : "✕"} ${answer.points || 0} pts`
                          : "No answer"}
                      </strong>
                    </div>
                  );
                })}
              </div>

              <button
                className="nb-primary-button"
                type="button"
                onClick={handleNextRound}
              >
                {currentRound >= game.totalRounds
                  ? "View Final Results"
                  : "Next Round"}
              </button>
            </div>
          ) : (
            <>
              {!isOnline && (
                <div className="nb-active-player">
                  <span>Current player</span>
                  <strong>
                    {activeLocalPlayer?.name || "Waiting"}
                  </strong>
                </div>
              )}

              <NumberAnswer
                options={currentQuestion?.options || []}
                selectedAnswer={selectedAnswer}
                onSelect={setSelectedAnswer}
                disabled={
                  timeLeft <= 0 ||
                  waitingForOpponent ||
                  localPlayerAnswered ||
                  (isOnline && Boolean(answerFeedback))
                }
                submitted={false}
              />

              {isOnline && answerFeedback && (
                <p className="nb-success">
                  Answer submitted. Waiting for the round result...
                </p>
              )}

              {waitingForOpponent && (
                <p className="nb-muted">
                  Waiting for the other players to answer...
                </p>
              )}

              {!isOnline && answerFeedback && (
                <div className="nb-local-feedback">
                  <strong>
                    {answerFeedback.isCorrect
                      ? "Correct answer!"
                      : "Not quite!"}
                  </strong>
                  <span>
                    {answerFeedback.points} points earned
                  </span>
                </div>
              )}

              <button
                className="nb-primary-button nb-submit-button"
                type="button"
                onClick={handleSubmitAnswer}
                disabled={
                  !selectedAnswer ||
                  timeLeft <= 0 ||
                  waitingForOpponent ||
                  localPlayerAnswered ||
                  isRoundResult
                }
              >
                Submit Answer
              </button>

              {isOnline && (
                <p className="nb-muted nb-small-note">
                  Your opponent's answer will remain hidden until
                  the round ends.
                </p>
              )}
            </>
          )}
        </section>

        <aside className="nb-sidebar">
          <div className="nb-score-card">
            <h3>Players</h3>

            {leaderboard.map((player) => (
              <div className="nb-score-player" key={player.id}>
                <div className="nb-score-avatar">👤</div>

                <div className="nb-score-player-info">
                  <strong>{player.name}</strong>
                  <span>
                    {player.hasAnswered
                      ? "Answered"
                      : "Thinking..."}
                  </span>
                </div>

                <strong className="nb-score-value">
                  {player.score}
                </strong>
              </div>
            ))}
          </div>

          <div className="nb-rules-card">
            <h3>How to play</h3>
            <ul>
              <li>Answer each number question.</li>
              <li>Correct answers earn 100 points.</li>
              <li>Answer faster to earn bonus points.</li>
              <li>Each player gets one answer per round.</li>
              <li>The highest score wins.</li>
            </ul>
          </div>
        </aside>
      </div>
    </main>
  );
}

export default NumberBattle;
