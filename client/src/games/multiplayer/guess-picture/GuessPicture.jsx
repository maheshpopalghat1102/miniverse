
import React, { useCallback, useEffect, useMemo, useState } from "react";

import PictureDisplay from "./PictureDisplay";
import PictureOptions from "./PictureOptions";

import {
  SAMPLE_PICTURE_QUESTIONS,
  createInitialPictureGameState,
  startPictureGame,
  setPictureQuestion,
  usePictureHint,
  submitPictureAnswer,
  advancePictureGame,
  getRandomPictureQuestion,
  getPictureGameWinner,
} from "./guessPictureLogic";

import {
  GUESS_PICTURE_EVENTS,
  subscribeGuessPictureEvents,
  startGuessPictureGame,
  submitGuessPictureAnswer,
  requestGuessPictureHint,
  requestNextPictureQuestion,
} from "./guessPictureSocket";

import "./guessPicture.css";

const GuessPicture = ({
  socket = null,
  roomId = null,
  players: suppliedPlayers = [],
  questions = SAMPLE_PICTURE_QUESTIONS,
  totalQuestions = 5,
  onExit,
}) => {
  const [game, setGame] = useState(() =>
    createInitialPictureGameState(suppliedPlayers)
  );

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [serverResult, setServerResult] = useState(null);

  const isOnline = Boolean(socket && roomId);

  const currentPlayer = useMemo(
    () =>
      game.players.find(
        (player) => player.id === game.currentPlayerId
      ) || null,
    [game.players, game.currentPlayerId]
  );

  const isMyTurn = useMemo(() => {
    if (!isOnline) return true;

    const me = suppliedPlayers.find((player) => player.isMe);

    return Boolean(
      me &&
      String(me.id || me._id) === String(game.currentPlayerId)
    );
  }, [isOnline, suppliedPlayers, game.currentPlayerId]);

  const updateError = useCallback((message) => {
    setError(message || "Something went wrong.");
  }, []);

  useEffect(() => {
    if (!isOnline) return undefined;

    const unsubscribe = subscribeGuessPictureEvents(socket, {
      onState: (newState) => {
        setGame((previous) => ({
          ...previous,
          ...newState,
        }));
      },

      onQuestion: (question) => {
        setGame((previous) => ({
          ...previous,
          currentQuestion: question,
          selectedAnswer: null,
          isCorrect: null,
          hintUsed: false,
          status: "playing",
        }));
      },

      onResult: (result) => {
        setServerResult(result);

        setGame((previous) => ({
          ...previous,
          selectedAnswer: result.selectedAnswer,
          isCorrect: result.isCorrect,
          pointsEarned: result.pointsEarned || 0,
          status: "answered",
          players: result.players || previous.players,
        }));
      },

      onError: (payload) => {
        updateError(payload?.message || "Game error.");
      },

      onGameOver: (result) => {
        setServerResult(result);
        setGame((previous) => ({
          ...previous,
          status: "completed",
        }));
      },
    });

    return unsubscribe;
  }, [isOnline, socket, updateError]);

  const handleStart = async () => {
    setError("");
    setServerResult(null);

    if (isOnline) {
      try {
        setLoading(true);

        await startGuessPictureGame(socket, {
          roomId,
          totalQuestions,
        });
      } catch (err) {
        updateError(err.message);
      } finally {
        setLoading(false);
      }

      return;
    }

    const validQuestions = questions.filter((question) =>
      question?.questionId
    );

    if (!validQuestions.length) {
      updateError("No picture questions are available.");
      return;
    }

    const questionCount = Math.min(
      totalQuestions,
      validQuestions.length
    );

    let nextState = startPictureGame(game, questionCount);

    const firstQuestion = getRandomPictureQuestion(
      validQuestions,
      nextState.usedQuestionIds
    );

    if (!firstQuestion) {
      updateError("Unable to load a picture question.");
      return;
    }

    nextState = setPictureQuestion(nextState, firstQuestion);

    setGame(nextState);
  };

  const handleUseHint = async () => {
    setError("");

    if (!isMyTurn) {
      updateError("Wait for your turn.");
      return;
    }

    if (isOnline) {
      try {
        setLoading(true);

        await requestGuessPictureHint(socket, {
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
      setGame((previous) => usePictureHint(previous));
    } catch (err) {
      updateError(err.message);
    }
  };

  const handleAnswer = async (answer) => {
    setError("");

    if (!isMyTurn) {
      updateError("Wait for your turn.");
      return;
    }

    if (isOnline) {
      try {
        setLoading(true);

        await submitGuessPictureAnswer(socket, {
          roomId,
          answer,
        });
      } catch (err) {
        updateError(err.message);
      } finally {
        setLoading(false);
      }

      return;
    }

    try {
      setGame((previous) =>
        submitPictureAnswer(previous, answer)
      );
    } catch (err) {
      updateError(err.message);
    }
  };

  const handleNext = async () => {
    setError("");

    if (isOnline) {
      try {
        setLoading(true);

        await requestNextPictureQuestion(socket, {
          roomId,
        });
      } catch (err) {
        updateError(err.message);
      } finally {
        setLoading(false);
      }

      return;
    }

    const nextQuestion = getRandomPictureQuestion(
      questions,
      game.usedQuestionIds
    );

    try {
      setGame((previous) =>
        advancePictureGame(previous, nextQuestion)
      );
    } catch (err) {
      updateError(err.message);
    }
  };

  const handleExit = () => {
    onExit?.();
  };

  const isCompleted = game.status === "completed";
  const hasAnswered = game.status === "answered";
  const hasStarted = game.status === "playing" || hasAnswered || isCompleted;

  const winner = useMemo(
    () => getPictureGameWinner(game.players),
    [game.players]
  );

  const isLocalGame = !isOnline;

  return (
    <main className="guess-picture-game">
      <header className="gp-header">
        <div className="gp-header-title">
          <span className="gp-header-icon">🖼️</span>

          <div>
            <h1>Guess the Picture</h1>
            <p>Look carefully. Choose wisely. Score points!</p>
          </div>
        </div>

        <button
          type="button"
          className="gp-exit-button"
          onClick={handleExit}
        >
          ✕ Exit
        </button>
      </header>

      {error && (
        <div className="gp-error" role="alert">
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

      {!hasStarted && (
        <section className="gp-start-screen">
          <div className="gp-start-icon">🔍</div>
          <h2>Can You Guess the Picture?</h2>
          <p>
            Identify objects, animals, places, and more from pictures.
            Answer correctly to earn points.
          </p>

          <div className="gp-start-details">
            <div>
              <strong>{totalQuestions}</strong>
              <span>Questions</span>
            </div>

            <div>
              <strong>10+</strong>
              <span>Points</span>
            </div>

            <div>
              <strong>💡</strong>
              <span>Hints available</span>
            </div>
          </div>

          <button
            type="button"
            className="gp-primary-button"
            onClick={handleStart}
            disabled={loading}
          >
            {loading ? "Starting..." : "Start Game →"}
          </button>
        </section>
      )}

      {hasStarted && !isCompleted && (
        <>
          <section className="gp-game-info">
            <div>
              <span>QUESTION</span>
              <strong>
                {game.questionIndex + 1} / {game.totalQuestions}
              </strong>
            </div>

            <div>
              <span>YOUR TURN</span>
              <strong>
                {currentPlayer?.name || "Player"}
              </strong>
            </div>

            <div>
              <span>YOUR SCORE</span>
              <strong>
                {currentPlayer?.score || 0} pts
              </strong>
            </div>
          </section>

          {!isMyTurn && (
            <div className="gp-waiting">
              ⏳ Waiting for {currentPlayer?.name || "the current player"}...
            </div>
          )}

          {game.currentQuestion && (
            <>
              <PictureDisplay
                question={game.currentQuestion}
                hintUsed={game.hintUsed}
                onUseHint={handleUseHint}
                disabled={loading || hasAnswered || !isMyTurn}
              />

              <PictureOptions
                options={game.currentQuestion.options}
                selectedAnswer={game.selectedAnswer}
                correctAnswer={
                  hasAnswered
                    ? game.currentQuestion.correctAnswer
                    : null
                }
                answered={hasAnswered}
                onSelect={handleAnswer}
                disabled={loading || hasAnswered || !isMyTurn}
              />
            </>
          )}

          {hasAnswered && (
            <section
              className={`gp-answer-feedback ${
                game.isCorrect ? "gp-feedback-correct" : "gp-feedback-wrong"
              }`}
            >
              <span>{game.isCorrect ? "🎉" : "❌"}</span>

              <div>
                <h3>
                  {game.isCorrect ? "Correct Answer!" : "Not quite!"}
                </h3>

                <p>
                  Correct answer:{" "}
                  <strong>
                    {game.currentQuestion?.correctAnswer}
                  </strong>
                </p>

                <strong className="gp-earned-points">
                  +{game.pointsEarned} points
                </strong>
              </div>
            </section>
          )}

          {hasAnswered && (
            <div className="gp-next-area">
              <button
                type="button"
                className="gp-primary-button"
                onClick={handleNext}
                disabled={loading || (isOnline && !isMyTurn)}
              >
                {loading
                  ? "Loading..."
                  : game.questionIndex + 1 >= game.totalQuestions
                    ? "Finish Game"
                    : "Next Question →"}
              </button>
            </div>
          )}
        </>
      )}

      {isCompleted && (
        <section className="gp-completed-screen">
          <div className="gp-completed-icon">🏆</div>
          <h2>Game Completed!</h2>
          <p>
            {winner?.isDraw
              ? "It's a tie! Great game!"
              : `${winner?.players?.[0]?.name || "Player"} wins!`}
          </p>

          <div className="gp-final-scoreboard">
            {[...game.players]
              .sort((a, b) => b.score - a.score)
              .map((player, index) => (
                <div className="gp-final-player" key={player.id}>
                  <span className="gp-final-rank">
                    {index === 0 ? "🥇" : index === 1 ? "🥈" : "🥉"}
                  </span>

                  <strong>{player.name}</strong>
                  <span>{player.score} points</span>
                </div>
              ))}
          </div>

          <div className="gp-completed-actions">
            <button
              type="button"
              className="gp-primary-button"
              onClick={handleStart}
              disabled={loading}
            >
              Play Again
            </button>

            <button
              type="button"
              className="gp-secondary-button"
              onClick={handleExit}
            >
              Exit Game
            </button>
          </div>
        </section>
      )}

      {hasStarted && !isCompleted && (
        <section className="gp-scoreboard">
          <h3>🏅 Scoreboard</h3>

          <div className="gp-scoreboard-list">
            {[...game.players]
              .sort((a, b) => b.score - a.score)
              .map((player, index) => (
                <div className="gp-score-player" key={player.id}>
                  <span>{index + 1}.</span>
                  <strong>{player.name}</strong>
                  <span>{player.score} pts</span>
                </div>
              ))}
          </div>
        </section>
      )}

      {loading && (
        <div className="gp-loading">
          <div className="gp-spinner" />
          <span>Updating game...</span>
        </div>
      )}

      {isLocalGame && (
        <p className="gp-local-notice">
          Local testing mode — answers and scores are calculated in this browser.
        </p>
      )}
    </main>
  );
};

export default GuessPicture;
