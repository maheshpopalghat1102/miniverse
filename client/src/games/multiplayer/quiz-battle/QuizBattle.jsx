
import React, { useCallback, useEffect, useState } from "react";

import QuizQuestion from "./QuizQuestion";
import QuizResult from "./QuizResult";

import {
  SAMPLE_QUESTIONS,
  createInitialQuizState,
  submitQuizAnswer,
  advanceQuizQuestion,
  getCurrentQuestion,
} from "./quizBattleLogic";

import {
  sendQuizAnswer,
  requestNextQuizQuestion,
  requestQuizBattleRematch,
  subscribeQuizBattle,
} from "./quizBattleSocket";

import "./quizBattle.css";

const QUESTION_TIME = 20;

function QuizBattle({
  socket = null,
  roomId = null,
  mySymbol = null,
  playerX = "Player X",
  playerO = "Player O",
  questions = SAMPLE_QUESTIONS,
  onExit = () => {},
  onGameOver = () => {},
}) {
  const isOnline = Boolean(socket && roomId);

  const [game, setGame] = useState(() =>
    createInitialQuizState(questions)
  );

  const [selectedIndex, setSelectedIndex] = useState(null);
  const [localAnswerTurn, setLocalAnswerTurn] = useState("X");
  const [remainingTime, setRemainingTime] = useState(QUESTION_TIME);
  const [showCorrectAnswer, setShowCorrectAnswer] = useState(false);
  const [waitingForOpponent, setWaitingForOpponent] = useState(false);
  const [error, setError] = useState("");
  const [rematchLoading, setRematchLoading] = useState(false);
  const [rematchRequested, setRematchRequested] = useState(false);

  const playerNames = {
    X: playerX,
    O: playerO,
  };

  const question = getCurrentQuestion(game);

  const myAnswer = isOnline
    ? game.answers[mySymbol]?.find(
        (answer) =>
          answer.questionIndex === game.currentQuestionIndex
      )
    : game.answers[localAnswerTurn]?.find(
        (answer) =>
          answer.questionIndex === game.currentQuestionIndex
      );

  const isLocalQuestionComplete =
    game.answers.X.some(
      (answer) => answer.questionIndex === game.currentQuestionIndex
    ) &&
    game.answers.O.some(
      (answer) => answer.questionIndex === game.currentQuestionIndex
    );

  const isMyTurn = isOnline
    ? ["X", "O"].includes(mySymbol) &&
      !myAnswer &&
      game.status === "playing"
    : game.status === "playing" &&
      !myAnswer &&
      !isLocalQuestionComplete;

  const handleLocalAnswer = (answerIndex) => {
    try {
      const nextState = submitQuizAnswer(
        game,
        localAnswerTurn,
        answerIndex
      );

      setGame(nextState);
      setSelectedIndex(answerIndex);
      setError("");

      if (localAnswerTurn === "X") {
        setLocalAnswerTurn("O");
        setSelectedIndex(null);
      } else {
        setShowCorrectAnswer(true);
      }
    } catch (err) {
      setError(err.message);
    }
  };

  const handleAnswer = (answerIndex) => {
    if (!isMyTurn || game.status !== "playing") return;

    if (isOnline) {
      try {
        sendQuizAnswer(socket, roomId, answerIndex);
        setSelectedIndex(answerIndex);
        setWaitingForOpponent(true);
        setError("");
      } catch (err) {
        setError(err.message);
      }

      return;
    }

    handleLocalAnswer(answerIndex);
  };

  const handleNextQuestion = () => {
    if (isOnline) {
      try {
        requestNextQuizQuestion(socket, roomId);
        setWaitingForOpponent(true);
        setError("");
      } catch (err) {
        setError(err.message);
      }

      return;
    }

    try {
      const nextState = advanceQuizQuestion(game);

      setGame(nextState);
      setLocalAnswerTurn("X");
      setSelectedIndex(null);
      setShowCorrectAnswer(false);
      setRemainingTime(QUESTION_TIME);
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
      if (!serverState || !serverState.scores) return;

      setGame((previous) => ({
        ...previous,
        ...serverState,
        answers: {
          X: serverState.answers?.X ?? [],
          O: serverState.answers?.O ?? [],
        },
        scores: {
          X: serverState.scores.X ?? 0,
          O: serverState.scores.O ?? 0,
        },
      }));

      setSelectedIndex(serverState.myAnswer?.answerIndex ?? null);
      setWaitingForOpponent(false);
      setShowCorrectAnswer(Boolean(serverState.showCorrectAnswer));
      setRemainingTime(
        Number.isFinite(serverState.remainingTime)
          ? serverState.remainingTime
          : QUESTION_TIME
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

    return subscribeQuizBattle(socket, {
      onState: handleServerState,

      onError: (serverError) => {
        setError(serverError?.message || "Unable to process answer.");
        setWaitingForOpponent(false);
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

  // Local timer only. Online time must be controlled by the server.
  useEffect(() => {
    if (
      isOnline ||
      game.status !== "playing" ||
      showCorrectAnswer
    ) {
      return undefined;
    }

    if (remainingTime <= 0) {
      setShowCorrectAnswer(true);
      return undefined;
    }

    const timer = setTimeout(() => {
      setRemainingTime((previous) => Math.max(0, previous - 1));
    }, 1000);

    return () => clearTimeout(timer);
  }, [
    isOnline,
    game.status,
    remainingTime,
    showCorrectAnswer,
  ]);

  const handleRematch = () => {
    if (isOnline) {
      try {
        setRematchLoading(true);
        requestQuizBattleRematch(socket, roomId);
      } catch (err) {
        setRematchLoading(false);
        setError(err.message);
      }

      return;
    }

    setGame(createInitialQuizState(questions));
    setSelectedIndex(null);
    setLocalAnswerTurn("X");
    setRemainingTime(QUESTION_TIME);
    setShowCorrectAnswer(false);
    setError("");
  };

  const correctAnswer = question?.correctIndex ?? null;

  const currentLocalPlayer = playerNames[localAnswerTurn];

  const progress = question
    ? Math.round(
        ((game.currentQuestionIndex + 1) / game.questions.length) * 100
      )
    : 0;

  if (!question && game.status === "playing") {
    return (
      <section className="qb-container">
        <p>Loading quiz question...</p>
      </section>
    );
  }

  return (
    <section className="qb-container">
      <header className="qb-header">
        <div>
          <span className="qb-eyebrow">MINIVERSE GAME</span>
          <h1>Quiz Battle</h1>
          <p>Test your knowledge and beat your opponent.</p>
        </div>

        <button
          type="button"
          className="qb-exit-button"
          onClick={onExit}
        >
          Exit
        </button>
      </header>

      <div className="qb-match-info">
        <span>{isOnline ? "Online Match" : "Local Match"}</span>
        <span>
          {game.currentQuestionIndex + 1} / {game.questions.length} Questions
        </span>
      </div>

      <div className="qb-scoreboard">
        <div className="qb-score-player">
          <span className="qb-score-symbol qb-x">X</span>
          <strong>{playerX}</strong>
          <span className="qb-score-number">{game.scores.X}</span>
        </div>

        <span className="qb-vs">VS</span>

        <div className="qb-score-player">
          <span className="qb-score-symbol qb-o">O</span>
          <strong>{playerO}</strong>
          <span className="qb-score-number">{game.scores.O}</span>
        </div>
      </div>

      <div className="qb-overall-progress">
        <div
          className="qb-overall-progress-fill"
          style={{ width: `${progress}%` }}
        />
      </div>

      {error && (
        <div className="qb-error" role="alert">
          {error}
        </div>
      )}

      {game.status === "playing" && question && (
        <>
          {!isOnline && (
            <div className="qb-local-turn">
              {showCorrectAnswer
                ? "Both players have answered."
                : `${currentLocalPlayer}'s turn`}
            </div>
          )}

          {isOnline && waitingForOpponent && (
            <div className="qb-waiting">
              Waiting for the server and opponent...
            </div>
          )}

          <QuizQuestion
            question={question}
            questionNumber={game.currentQuestionIndex + 1}
            totalQuestions={game.questions.length}
            selectedIndex={selectedIndex}
            onSelect={handleAnswer}
            disabled={
              !isMyTurn ||
              waitingForOpponent ||
              showCorrectAnswer
            }
            remainingTime={remainingTime}
            correctIndex={
              isOnline && !showCorrectAnswer
                ? null
                : correctAnswer
            }
            showCorrectAnswer={showCorrectAnswer}
            explanation={
              showCorrectAnswer ? question.explanation : ""
            }
          />

          {!isOnline && showCorrectAnswer && (
            <button
              type="button"
              className="qb-primary-button qb-next-button"
              onClick={handleNextQuestion}
            >
              {game.currentQuestionIndex === game.questions.length - 1
                ? "View Final Result"
                : "Next Question"}
            </button>
          )}

          {isOnline && showCorrectAnswer && (
            <button
              type="button"
              className="qb-primary-button qb-next-button"
              onClick={handleNextQuestion}
            >
              Next Question
            </button>
          )}
        </>
      )}

      {rematchRequested && (
        <p className="qb-rematch-notice">
          Your opponent has requested a rematch.
        </p>
      )}

      {game.status === "finished" && (
        <QuizResult
          scores={game.scores}
          winner={game.winner}
          mySymbol={isOnline ? mySymbol : null}
          playerX={playerX}
          playerO={playerO}
          onRematch={handleRematch}
          onExit={onExit}
          loading={rematchLoading}
        />
      )}
    </section>
  );
}

export default QuizBattle;
