
import React, { useCallback, useEffect, useState } from "react";

import EmojiQuestion from "./EmojiQuestion";
import EmojiAnswer from "./EmojiAnswer";

import {
  SAMPLE_EMOJI_QUESTIONS,
  createInitialEmojiState,
  submitEmojiAnswer,
  getCurrentEmojiQuestion,
} from "./emojiGuessLogic";

import {
  sendEmojiAnswer,
  requestEmojiRematch,
  subscribeEmojiGuess,
} from "./emojiGuessSocket";

import "./emojiGuess.css";

function EmojiGuess({
  socket = null,
  roomId = null,
  mySymbol = null,
  playerX = "Player X",
  playerO = "Player O",
  questions = SAMPLE_EMOJI_QUESTIONS,
  onExit = () => {},
  onGameOver = () => {},
}) {
  const isOnline = Boolean(socket && roomId);

  const [game, setGame] = useState(() =>
    createInitialEmojiState(questions)
  );
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [showResult, setShowResult] = useState(false);
  const [error, setError] = useState("");
  const [rematchLoading, setRematchLoading] = useState(false);
  const [rematchRequested, setRematchRequested] = useState(false);

  const playerNames = { X: playerX, O: playerO };
  const question = getCurrentEmojiQuestion(game);
  const isMyTurn = !isOnline || game.currentPlayer === mySymbol;

  const handleAnswer = (answer) => {
    if (!isMyTurn || game.status !== "playing") return;

    if (isOnline) {
      try {
        sendEmojiAnswer(socket, roomId, answer);
        setSelectedAnswer(answer);
        setError("");
      } catch (err) {
        setError(err.message);
      }
      return;
    }

    try {
      const nextState = submitEmojiAnswer(
        game,
        game.currentPlayer,
        answer
      );

      setSelectedAnswer(answer);
      setShowResult(true);
      setGame(nextState);
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
        scores: {
          X: serverState.scores.X ?? 0,
          O: serverState.scores.O ?? 0,
        },
        answers: serverState.answers ?? [],
      }));

      setSelectedAnswer(serverState.myAnswer ?? null);
      setShowResult(Boolean(serverState.showResult));
      setError("");
      setRematchLoading(false);

      if (serverState.status === "finished") {
        onGameOver(serverState);
      }
    },
    [onGameOver]
  );

  useEffect(() => {
    if (!isOnline) return undefined;

    return subscribeEmojiGuess(socket, {
      onState: handleServerState,
      onError: (serverError) => {
        setError(serverError?.message || "Unable to submit answer.");
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

  const handleLocalNextTurn = () => {
    setSelectedAnswer(null);
    setShowResult(false);
  };

  const handleRematch = () => {
    if (isOnline) {
      try {
        setRematchLoading(true);
        requestEmojiRematch(socket, roomId);
      } catch (err) {
        setRematchLoading(false);
        setError(err.message);
      }
      return;
    }

    setGame(createInitialEmojiState(questions));
    setSelectedAnswer(null);
    setShowResult(false);
    setError("");
  };

  const winnerName =
    game.winner === "draw"
      ? null
      : playerNames[game.winner];

  const currentAnswer = question?.answer ?? null;
  const localNextPlayer = game.currentPlayer;

  return (
    <section className="eg-container">
      <header className="eg-header">
        <div>
          <span className="eg-eyebrow">MINIVERSE GAME</span>
          <h1>Emoji Guess</h1>
          <p>Decode the emojis and guess the answer!</p>
        </div>

        <button
          type="button"
          className="eg-exit-button"
          onClick={onExit}
        >
          Exit
        </button>
      </header>

      <div className="eg-match-info">
        <span>{isOnline ? "Online Match" : "Local Match"}</span>
        <span>
          Question {Math.min(game.currentQuestionIndex + 1, game.questions.length)}
          {" / "}
          {game.questions.length}
        </span>
      </div>

      <div className="eg-scoreboard">
        {["X", "O"].map((symbol) => (
          <div
            key={symbol}
            className={`eg-score-player ${
              game.currentPlayer === symbol && game.status === "playing"
                ? "eg-score-active"
                : ""
            }`}
          >
            <span className={`eg-score-symbol eg-${symbol.toLowerCase()}`}>
              {symbol}
            </span>
            <strong>{playerNames[symbol]}</strong>
            <span className="eg-score-number">
              {game.scores[symbol]}
            </span>
          </div>
        ))}
      </div>

      {question && game.status === "playing" && (
        <>
          <div className="eg-turn">
            {isOnline
              ? isMyTurn
                ? "Your turn"
                : "Waiting for opponent..."
              : `${playerNames[localNextPlayer]}'s turn`}
          </div>

          {error && (
            <div className="eg-error" role="alert">{error}</div>
          )}

          <EmojiQuestion
            question={question}
            questionNumber={game.currentQuestionIndex + 1}
            totalQuestions={game.questions.length}
          />

          <EmojiAnswer
            options={question.options}
            onSubmit={handleAnswer}
            disabled={
              !isMyTurn ||
              Boolean(selectedAnswer) ||
              showResult
            }
            selectedAnswer={selectedAnswer}
            showResult={showResult}
            correctAnswer={
              showResult ? currentAnswer : null
            }
          />

          {!isOnline && showResult && (
            <button
              type="button"
              className="eg-next-button"
              onClick={handleLocalNextTurn}
            >
              {game.currentPlayer === "O"
                ? "Next Player"
                : "Continue"}
            </button>
          )}

          {isOnline && showResult && (
            <p className="eg-feedback">
              Answer received. Waiting for the next update...
            </p>
          )}
        </>
      )}

      <div className="eg-history">
        <h3>Answer History</h3>

        {game.answers.length === 0 ? (
          <p className="eg-empty">No answers submitted yet.</p>
        ) : (
          [...game.answers].reverse().map((item, index) => (
            <div className="eg-history-item" key={`${item.questionId}-${index}`}>
              <span>{playerNames[item.player]}</span>
              <strong>{item.correct ? "Correct ✓" : "Incorrect ✕"}</strong>
              <small>+{item.points} points</small>
            </div>
          ))
        )}
      </div>

      {rematchRequested && (
        <p className="eg-feedback">
          Your opponent requested a rematch.
        </p>
      )}

      {game.status === "finished" && (
        <div className="eg-result-overlay">
          <div className="eg-result-card">
            <div className="eg-result-icon">
              {game.winner === "draw" ? "🤝" : "🏆"}
            </div>

            <h2>
              {game.winner === "draw"
                ? "It's a Draw!"
                : isOnline
                  ? game.winner === mySymbol
                    ? "You Won!"
                    : "You Lost!"
                  : `${winnerName} Won!`}
            </h2>

            <p>
              Final score: {game.scores.X} – {game.scores.O}
            </p>

            <button
              type="button"
              className="eg-primary-button"
              onClick={handleRematch}
              disabled={rematchLoading}
            >
              {rematchLoading ? "Waiting..." : "Play Again"}
            </button>

            <button
              type="button"
              className="eg-secondary-button"
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

export default EmojiGuess;
