
import React, { useEffect, useMemo, useState } from "react";

import CoupleQuestion from "./CoupleQuestion";
import CoupleAnswer from "./CoupleAnswer";

import {
  COUPLE_QUIZ_STATUS,
  COUPLE_QUIZ_CONFIG,
  SAMPLE_COUPLE_QUESTIONS,
  createInitialCoupleQuizState,
  startCoupleQuiz,
  submitCoupleAnswer,
  advanceCoupleQuestion,
  getCurrentCouplePlayer,
  getCoupleQuizLeaderboard,
} from "./coupleQuizLogic";

import {
  COUPLE_QUIZ_EVENTS,
  startCoupleQuizSocket,
  submitCoupleQuizSocketAnswer,
  requestNextCoupleQuestion,
  requestCoupleQuizRematch,
  subscribeCoupleQuiz,
} from "./coupleQuizSocket";

import "./coupleQuiz.css";

function CoupleQuiz({
  socket = null,
  roomId = null,
  players: suppliedPlayers = [],
  questions = SAMPLE_COUPLE_QUESTIONS,
  totalQuestions = COUPLE_QUIZ_CONFIG.TOTAL_QUESTIONS,
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
    createInitialCoupleQuizState({
      players: initialPlayers,
      questions,
      totalQuestions,
    })
  );

  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [error, setError] = useState("");
  const [waitingForOpponent, setWaitingForOpponent] = useState(false);
  const [rematchRequested, setRematchRequested] = useState(false);

  const currentPlayer = getCurrentCouplePlayer(game);
  const leaderboard = getCoupleQuizLeaderboard(game.players);

  const isFinished =
    game.status === COUPLE_QUIZ_STATUS.FINISHED;

  const isQuestionResult =
    game.status === COUPLE_QUIZ_STATUS.QUESTION_RESULT;

  const currentQuestionNumber = game.currentQuestionIndex + 1;

  const myPlayer = game.players.find((player) => player.isMe);

  const hasAnswered =
    myPlayer && game.answers[myPlayer.id] !== undefined;

  const localCurrentAnswer = currentPlayer
    ? game.answers[currentPlayer.id]
    : null;

  const startLocalGame = () => {
    const fresh = createInitialCoupleQuizState({
      players: initialPlayers,
      questions,
      totalQuestions,
    });

    setGame(startCoupleQuiz(fresh));
    setSelectedAnswer(null);
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

    setSelectedAnswer(null);
    setError("");
  };

  const handleOnlineQuestion = (payload) => {
    if (!payload) return;

    setGame((previous) => ({
      ...previous,
      status: COUPLE_QUIZ_STATUS.PLAYING,
      currentQuestionIndex:
        payload.currentQuestionIndex ?? previous.currentQuestionIndex,
      currentQuestion: payload.question || payload.currentQuestion,
      totalQuestions: payload.totalQuestions ?? previous.totalQuestions,
      answers: {},
      currentTurnIndex: payload.currentTurnIndex ?? 0,
    }));

    setSelectedAnswer(null);
    setWaitingForOpponent(false);
  };

  const handleOnlineQuestionResult = (payload) => {
    if (!payload) return;

    setGame((previous) => ({
      ...previous,
      ...payload,
      status: COUPLE_QUIZ_STATUS.QUESTION_RESULT,
      players: payload.players || previous.players,
      answers: payload.answers || previous.answers,
      currentQuestion: payload.question || previous.currentQuestion,
    }));

    setWaitingForOpponent(false);
    setSelectedAnswer(null);
  };

  const handleOnlineGameOver = (payload) => {
    if (!payload) return;

    setGame((previous) => ({
      ...previous,
      ...payload,
      status: COUPLE_QUIZ_STATUS.FINISHED,
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

    const unsubscribe = subscribeCoupleQuiz(socket, {
      onState: handleOnlineState,
      onQuestion: handleOnlineQuestion,
      onAnswerResult: (payload) => {
        if (payload?.message) setError(payload.message);
        setWaitingForOpponent(true);
      },
      onQuestionResult: handleOnlineQuestionResult,
      onGameOver: handleOnlineGameOver,
      onRematchRequested: () => setRematchRequested(true),
      onRematchStarted: handleOnlineRematchStarted,
      onError: (payload) =>
        setError(payload?.message || "Something went wrong."),
    });

    startCoupleQuizSocket(socket, roomId);

    return unsubscribe;
  }, [socket, roomId, isOnline]);

  const handleSubmitAnswer = () => {
    if (selectedAnswer === null) {
      setError("Please choose an answer first.");
      return;
    }

    setError("");

    if (isOnline) {
      submitCoupleQuizSocketAnswer(socket, {
        roomId,
        answerIndex: selectedAnswer,
      });

      setWaitingForOpponent(true);
      setSelectedAnswer(null);
      return;
    }

    if (!currentPlayer) return;

    const result = submitCoupleAnswer(
      game,
      currentPlayer.id,
      selectedAnswer
    );

    if (result.error) {
      setError(result.error);
      return;
    }

    setGame(result.state);
    setSelectedAnswer(null);
  };

  const handleNextQuestion = () => {
    if (isOnline) {
      requestNextCoupleQuestion(socket, roomId);
      return;
    }

    setGame((previous) => advanceCoupleQuestion(previous));
    setSelectedAnswer(null);
    setError("");
  };

  const handleRematch = () => {
    if (isOnline) {
      requestCoupleQuizRematch(socket, roomId);
      setRematchRequested(true);
      return;
    }

    startLocalGame();
  };

  const handleStartOnline = () => {
    socket.emit(COUPLE_QUIZ_EVENTS.START, { roomId });
  };

  const renderLeaderboard = () => (
    <div className="cq-leaderboard">
      <h3>Final Scores</h3>

      {leaderboard.map((player) => (
        <div className="cq-leaderboard-row" key={player.id}>
          <span className="cq-rank">#{player.rank}</span>
          <span className="cq-player-name">{player.name}</span>
          <strong>{player.score} pts</strong>
        </div>
      ))}
    </div>
  );

  if (game.status === COUPLE_QUIZ_STATUS.WAITING) {
    return (
      <main className="cq-container">
        <section className="cq-welcome-card">
          <div className="cq-game-icon">💞</div>
          <span className="cq-eyebrow">MINIVERSE TURN-BY-TURN</span>
          <h1>Couple Quiz</h1>

          <p>
            Take turns answering questions, discover fun facts,
            and see who earns the highest score.
          </p>

          <div className="cq-player-preview">
            {game.players.map((player) => (
              <div className="cq-player-chip" key={player.id}>
                <span>👤</span>
                {player.name}
              </div>
            ))}
          </div>

          {error && <p className="cq-error">{error}</p>}

          <button
            type="button"
            className="cq-primary-button"
            onClick={isOnline ? handleStartOnline : startLocalGame}
          >
            Start Quiz
          </button>

          {onExit && (
            <button
              type="button"
              className="cq-text-button"
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
      <main className="cq-container">
        <section className="cq-result-card">
          <div className="cq-result-icon">
            {game.isDraw ? "🤝" : "🏆"}
          </div>

          <span className="cq-eyebrow">QUIZ COMPLETED</span>

          <h1>
            {game.isDraw
              ? "It's a Tie!"
              : `${game.winner?.name || "Winner"} Wins!`}
          </h1>

          <p>
            {game.isDraw
              ? "Both players finished with the same score."
              : "Congratulations on your quiz victory!"}
          </p>

          {renderLeaderboard()}

          <button
            type="button"
            className="cq-primary-button"
            onClick={handleRematch}
          >
            Play Again
          </button>

          {rematchRequested && isOnline && (
            <p className="cq-muted">
              Waiting for the other player to accept the rematch...
            </p>
          )}

          {onExit && (
            <button
              type="button"
              className="cq-text-button"
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
    <main className="cq-container">
      <header className="cq-header">
        <div>
          <span className="cq-eyebrow">MINIVERSE GAME</span>
          <h1>💞 Couple Quiz</h1>
        </div>

        {onExit && (
          <button
            type="button"
            className="cq-exit-button"
            onClick={onExit}
          >
            Exit
          </button>
        )}
      </header>

      <div className="cq-layout">
        <section className="cq-main">
          <CoupleQuestion
            question={game.currentQuestion}
            currentQuestion={currentQuestionNumber}
            totalQuestions={game.totalQuestions}
          />

          {isQuestionResult ? (
            <div className="cq-question-result">
              <div className="cq-result-icon">🎯</div>
              <h2>Both players have answered!</h2>

              <p>
                Correct answer:{" "}
                <strong>
                  {game.currentQuestion?.options[
                    game.currentQuestion?.correctAnswer
                  ]}
                </strong>
              </p>

              {game.currentQuestion?.explanation && (
                <p className="cq-explanation">
                  {game.currentQuestion.explanation}
                </p>
              )}

              <div className="cq-answer-summary">
                {game.players.map((player) => {
                  const answer = game.answers[player.id];

                  return (
                    <div key={player.id}>
                      <span>{player.name}</span>
                      <strong>
                        {answer?.isCorrect ? "✓ Correct" : "✕ Incorrect"}
                      </strong>
                      <span>{answer?.points || 0} pts</span>
                    </div>
                  );
                })}
              </div>

              <button
                type="button"
                className="cq-primary-button"
                onClick={handleNextQuestion}
              >
                {currentQuestionNumber >= game.totalQuestions
                  ? "See Final Results"
                  : "Next Question"}
              </button>
            </div>
          ) : (
            <>
              <div className="cq-turn-indicator">
                <span>Current turn</span>
                <strong>
                  {currentPlayer?.name || "Waiting for player"}
                </strong>
              </div>

              <CoupleAnswer
                options={game.currentQuestion?.options || []}
                selectedAnswer={selectedAnswer}
                onSelect={setSelectedAnswer}
                disabled={
                  isOnline
                    ? Boolean(hasAnswered || waitingForOpponent)
                    : false
                }
              />

              {waitingForOpponent && (
                <p className="cq-muted">
                  Answer submitted. Waiting for the other player...
                </p>
              )}

              {error && <p className="cq-error">{error}</p>}

              <button
                type="button"
                className="cq-primary-button cq-submit-button"
                onClick={handleSubmitAnswer}
                disabled={selectedAnswer === null || waitingForOpponent}
              >
                Submit Answer
              </button>
            </>
          )}
        </section>

        <aside className="cq-sidebar">
          <div className="cq-score-card">
            <h3>Player Scores</h3>

            {leaderboard.map((player) => (
              <div className="cq-score-row" key={player.id}>
                <div className="cq-avatar">👤</div>
                <div className="cq-score-player">
                  <strong>{player.name}</strong>
                  <span>{player.score} points</span>
                </div>
              </div>
            ))}
          </div>

          <div className="cq-rules-card">
            <h3>How to Play</h3>
            <ul>
              <li>Players take turns answering.</li>
              <li>Each player answers once per question.</li>
              <li>Correct answers earn 100 points.</li>
              <li>Both answers are revealed after the round.</li>
              <li>The highest score wins.</li>
            </ul>
          </div>
        </aside>
      </div>
    </main>
  );
}

export default CoupleQuiz;
