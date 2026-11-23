
import React, {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import DrawingCanvas from "./DrawingCanvas";
import DrawingToolbar from "./DrawingToolbar";
import GuessInput from "./GuessInput";

import {
  DRAW_GUESS_WORDS,
  DRAW_GUESS_STATUS,
  DRAW_GUESS_CONFIG,
  createInitialDrawGuessState,
  startDrawGuessRound,
  submitDrawGuess as submitLocalGuess,
  advanceDrawGuessRound,
  getDrawGuessWinner,
  getRandomWord,
  getWordHint,
} from "./drawGuessLogic";

import {
  DRAW_GUESS_EVENTS,
  subscribeDrawGuessEvents,
  startDrawGuessGame,
  sendDrawGuessStroke,
  clearDrawGuessCanvas,
  submitDrawGuess as submitOnlineGuess,
  requestNextDrawGuessRound,
} from "./drawGuessSocket";

import "./drawGuess.css";

const DrawGuess = ({
  socket = null,
  roomId = null,
  players: suppliedPlayers = [],
  totalRounds,
  difficulty = "easy",
  onExit,
}) => {
  const [game, setGame] = useState(() =>
    createInitialDrawGuessState(suppliedPlayers)
  );

  const [color, setColor] = useState("#000000");
  const [brushSize, setBrushSize] = useState(7);
  const [isEraser, setIsEraser] = useState(false);
  const [clearSignal, setClearSignal] = useState(0);
  const [incomingStrokes, setIncomingStrokes] = useState([]);
  const [guessList, setGuessList] = useState([]);
  const [timeLeft, setTimeLeft] = useState(
    DRAW_GUESS_CONFIG.ROUND_DURATION
  );
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const isOnline = Boolean(socket && roomId);

  const currentDrawer = useMemo(
    () =>
      game.players.find(
        (player) => player.id === game.currentDrawerId
      ) || null,
    [game.players, game.currentDrawerId]
  );

  const me = suppliedPlayers.find((player) => player.isMe);

  const myId = String(me?.id || me?._id || "");

  const isDrawer = Boolean(
    myId && myId === String(game.currentDrawerId)
  );

  const activeTime = isOnline ? game.timeLeft : timeLeft;

  const updateError = useCallback((message) => {
    setError(message || "Something went wrong.");
  }, []);

  const addIncomingStroke = useCallback((stroke) => {
    setIncomingStrokes((previous) => [...previous, stroke]);
  }, []);

  useEffect(() => {
    if (!isOnline) return undefined;

    const unsubscribe = subscribeDrawGuessEvents(socket, {
      onState: (newState) => {
        setGame((previous) => ({
          ...previous,
          ...newState,
        }));

        if (Array.isArray(newState.strokes)) {
          setIncomingStrokes(newState.strokes);
        }

        if (Array.isArray(newState.guesses)) {
          setGuessList(newState.guesses);
        }

        if (typeof newState.timeLeft === "number") {
          setTimeLeft(newState.timeLeft);
        }
      },

      onWord: (payload) => {
        // Server should send this event to the drawer only.
        setGame((previous) => ({
          ...previous,
          secretWord: payload.word,
        }));
      },

      onStroke: (stroke) => {
        addIncomingStroke(stroke);
      },

      onClear: () => {
        setIncomingStrokes([]);
        setClearSignal((value) => value + 1);
      },

      onTimer: (payload) => {
        setTimeLeft(payload.timeLeft);
        setGame((previous) => ({
          ...previous,
          timeLeft: payload.timeLeft,
        }));
      },

      onCorrect: (payload) => {
        setGame((previous) => ({
          ...previous,
          players: payload.players || previous.players,
          correctGuessers: payload.correctGuessers || previous.correctGuessers,
        }));

        setGuessList((previous) => [
          ...previous,
          {
            playerId: payload.playerId,
            playerName: payload.playerName,
            guess: payload.guess,
            isCorrect: true,
          },
        ]);
      },

      onRoundEnd: (payload) => {
        setGame((previous) => ({
          ...previous,
          ...payload,
          status: DRAW_GUESS_STATUS.ROUND_COMPLETED,
        }));
      },

      onGameOver: (payload) => {
        setGame((previous) => ({
          ...previous,
          ...payload,
          status: DRAW_GUESS_STATUS.GAME_COMPLETED,
        }));
      },

      onError: (payload) => {
        updateError(payload?.message || "Game error.");
      },
    });

    return unsubscribe;
  }, [isOnline, socket, updateError, addIncomingStroke]);

  // Local timer. The server must own the timer in online games.
  useEffect(() => {
    if (
      isOnline ||
      game.status !== DRAW_GUESS_STATUS.PLAYING
    ) {
      return undefined;
    }

    if (timeLeft <= 0) {
      setGame((previous) => ({
        ...previous,
        status: DRAW_GUESS_STATUS.ROUND_COMPLETED,
      }));

      return undefined;
    }

    const timer = window.setTimeout(() => {
      setTimeLeft((previous) => Math.max(0, previous - 1));
    }, 1000);

    return () => window.clearTimeout(timer);
  }, [isOnline, game.status, timeLeft]);

  const handleStart = async () => {
    setError("");
    setGuessList([]);
    setIncomingStrokes([]);
    setTimeLeft(DRAW_GUESS_CONFIG.ROUND_DURATION);

    const rounds =
      totalRounds || Math.max(1, suppliedPlayers.length);

    if (isOnline) {
      try {
        setLoading(true);

        await startDrawGuessGame(socket, {
          roomId,
          totalRounds: rounds,
          difficulty,
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

    const word = getRandomWord(difficulty, game.usedWords);

    if (!word) {
      updateError("No unused words remain for this difficulty.");
      return;
    }

    const nextGame = {
      ...game,
      totalRounds: rounds,
    };

    setGame(startDrawGuessRound(nextGame, word, difficulty));
  };

  const handleStroke = async (stroke) => {
    if (isOnline) {
      try {
        await sendDrawGuessStroke(socket, {
          roomId,
          stroke,
        });
      } catch (err) {
        updateError(err.message);
      }

      return;
    }

    setGame((previous) => ({
      ...previous,
      strokes: [...previous.strokes, stroke],
    }));
  };

  const handleCanvasChange = (strokes) => {
    if (!isOnline) {
      setGame((previous) => ({
        ...previous,
        strokes,
      }));
    }
  };

  const handleClear = async () => {
    if (isOnline) {
      try {
        setLoading(true);

        await clearDrawGuessCanvas(socket, {
          roomId,
        });

        setIncomingStrokes([]);
        setClearSignal((value) => value + 1);
      } catch (err) {
        updateError(err.message);
      } finally {
        setLoading(false);
      }

      return;
    }

    setIncomingStrokes([]);
    setClearSignal((value) => value + 1);

    setGame((previous) => ({
      ...previous,
      strokes: [],
    }));
  };

  const handleGuess = async (guess) => {
    setError("");

    if (isDrawer) {
      updateError("The drawer cannot guess their own word.");
      return;
    }

    if (isOnline) {
      try {
        setLoading(true);

        await submitOnlineGuess(socket, {
          roomId,
          guess,
        });
      } catch (err) {
        updateError(err.message);
      } finally {
        setLoading(false);
      }

      return;
    }

    try {
      const playerId = myId || game.players[1]?.id;

      const nextState = submitLocalGuess(
        game,
        playerId,
        guess
      );

      setGame(nextState);

      setGuessList(nextState.guesses.map((item) => ({
        ...item,
        playerName:
          nextState.players.find(
            (player) => player.id === item.playerId
          )?.name || "Player",
      })));

      if (
        nextState.correctGuessers.length >=
        nextState.players.length - 1
      ) {
        setGame({
          ...nextState,
          status: DRAW_GUESS_STATUS.ROUND_COMPLETED,
        });
      }
    } catch (err) {
      updateError(err.message);
    }
  };

  const handleNextRound = async () => {
    setError("");
    setGuessList([]);
    setIncomingStrokes([]);

    if (isOnline) {
      try {
        setLoading(true);

        await requestNextDrawGuessRound(socket, {
          roomId,
        });
      } catch (err) {
        updateError(err.message);
      } finally {
        setLoading(false);
      }

      return;
    }

    const nextState = advanceDrawGuessRound(game);

    if (nextState.status === DRAW_GUESS_STATUS.GAME_COMPLETED) {
      setGame(nextState);
      return;
    }

    const word = getRandomWord(
      difficulty,
      nextState.usedWords
    );

    if (!word) {
      setGame({
        ...nextState,
        status: DRAW_GUESS_STATUS.GAME_COMPLETED,
      });
      return;
    }

    setTimeLeft(DRAW_GUESS_CONFIG.ROUND_DURATION);
    setGame(startDrawGuessRound(nextState, word, difficulty));
  };

  const handleExit = () => {
    onExit?.();
  };

  const isWaiting = game.status === DRAW_GUESS_STATUS.WAITING;
  const isPlaying = game.status === DRAW_GUESS_STATUS.PLAYING;
  const isRoundCompleted =
    game.status === DRAW_GUESS_STATUS.ROUND_COMPLETED;
  const isGameCompleted =
    game.status === DRAW_GUESS_STATUS.GAME_COMPLETED;

  const winner = useMemo(
    () => getDrawGuessWinner(game.players),
    [game.players]
  );

  const formattedTime = `${Math.floor(activeTime / 60)
    .toString()
    .padStart(2, "0")}:${(activeTime % 60)
    .toString()
    .padStart(2, "0")}`;

  const drawerWord = isDrawer ? game.secretWord : null;

  return (
    <main className="draw-guess-game">
      <header className="dg-header">
        <div className="dg-header-title">
          <span className="dg-header-icon">🎨</span>

          <div>
            <h1>Draw & Guess</h1>
            <p>Draw it. Guess it. Win together!</p>
          </div>
        </div>

        <button
          type="button"
          className="dg-exit-button"
          onClick={handleExit}
        >
          ✕ Exit
        </button>
      </header>

      {error && (
        <div className="dg-error" role="alert">
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

      {isWaiting && (
        <section className="dg-start-screen">
          <div className="dg-start-icon">🖌️</div>
          <h2>Ready to Draw & Guess?</h2>
          <p>
            One player draws a secret word while everyone else tries
            to guess it before time runs out.
          </p>

          <div className="dg-start-details">
            <div>
              <strong>{DRAW_GUESS_CONFIG.ROUND_DURATION}s</strong>
              <span>Per round</span>
            </div>
            <div>
              <strong>100+</strong>
              <span>Guess points</span>
            </div>
            <div>
              <strong>{game.players.length}</strong>
              <span>Players</span>
            </div>
          </div>

          <button
            type="button"
            className="dg-primary-button"
            onClick={handleStart}
            disabled={loading}
          >
            {loading ? "Starting..." : "Start Game →"}
          </button>
        </section>
      )}

      {(isPlaying || isRoundCompleted) && (
        <>
          <section className="dg-game-info">
            <div>
              <span>ROUND</span>
              <strong>
                {game.round} / {game.totalRounds}
              </strong>
            </div>

            <div>
              <span>DRAWER</span>
              <strong>{currentDrawer?.name || "Player"}</strong>
            </div>

            <div className={activeTime <= 15 ? "dg-time-warning" : ""}>
              <span>TIME LEFT</span>
              <strong>{formattedTime}</strong>
            </div>
          </section>

          <section className="dg-word-area">
            {isDrawer && isPlaying ? (
              <>
                <span>Your secret word is</span>
                <strong>{drawerWord}</strong>
                <small>Draw this word without writing letters or numbers.</small>
              </>
            ) : isRoundCompleted ? (
              <>
                <span>Round finished</span>
                <strong>{game.secretWord}</strong>
                <small>Get ready for the next drawer.</small>
              </>
            ) : (
              <>
                <span>Guess the secret word</span>
                <strong className="dg-masked-word">
                  {getWordHint(game.secretWord)}
                </strong>
                <small>Watch the drawing carefully!</small>
              </>
            )}
          </section>

          <div className="dg-main-layout">
            <section className="dg-drawing-area">
              {isDrawer && isPlaying && (
                <DrawingToolbar
                  color={color}
                  onColorChange={setColor}
                  brushSize={brushSize}
                  onBrushSizeChange={setBrushSize}
                  isEraser={isEraser}
                  onEraserToggle={() =>
                    setIsEraser((previous) => !previous)
                  }
                  onUndo={() => {}}
                  onRedo={() => {}}
                  onClear={handleClear}
                  disabled={loading}
                />
              )}

              <DrawingCanvas
                color={color}
                brushSize={brushSize}
                isEraser={isEraser}
                disabled={!isDrawer || !isPlaying || loading}
                onStroke={handleStroke}
                onCanvasChange={handleCanvasChange}
                incomingStrokes={
                  isOnline ? incomingStrokes : game.strokes
                }
                clearSignal={clearSignal}
              />

              {isDrawer && isPlaying && (
                <p className="dg-drawing-note">
                  🎨 Draw clearly. Do not write the word or use letters.
                </p>
              )}
            </section>

            <aside className="dg-side-panel">
              {!isDrawer && isPlaying && (
                <GuessInput
                  onSubmit={handleGuess}
                  disabled={loading || isRoundCompleted}
                  guesses={guessList}
                  currentPlayerId={myId || game.players[1]?.id}
                  correctGuessers={game.correctGuessers}
                />
              )}

              {isDrawer && isPlaying && (
                <div className="dg-drawer-message">
                  <span>✏️</span>
                  <h3>You're the artist!</h3>
                  <p>
                    Help everyone guess your word by drawing it.
                  </p>
                </div>
              )}

              {isRoundCompleted && (
                <div className="dg-round-result">
                  <span>🏁</span>
                  <h3>Round completed!</h3>
                  <p>The word was:</p>
                  <strong>{game.secretWord}</strong>

                  <button
                    type="button"
                    className="dg-primary-button"
                    onClick={handleNextRound}
                    disabled={loading}
                  >
                    {loading ? "Loading..." : "Next Round →"}
                  </button>
                </div>
              )}

              <div className="dg-player-scores">
                <h3>🏆 Scoreboard</h3>

                {[...game.players]
                  .sort((a, b) => b.score - a.score)
                  .map((player, index) => (
                    <div className="dg-player-score" key={player.id}>
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
            </aside>
          </div>
        </>
      )}

      {isGameCompleted && (
        <section className="dg-completed-screen">
          <div className="dg-completed-icon">🏆</div>
          <h2>Game Completed!</h2>

          <p>
            {winner?.isDraw
              ? "It's a tie! Well played!"
              : `${winner?.players?.[0]?.name || "Player"} wins!`}
          </p>

          <div className="dg-final-scoreboard">
            {[...game.players]
              .sort((a, b) => b.score - a.score)
              .map((player, index) => (
                <div className="dg-final-player" key={player.id}>
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
            className="dg-primary-button"
            onClick={() => {
              setGame(createInitialDrawGuessState(suppliedPlayers));
              setIncomingStrokes([]);
              setGuessList([]);
              setTimeLeft(DRAW_GUESS_CONFIG.ROUND_DURATION);
            }}
          >
            Back to Start
          </button>
        </section>
      )}

      {loading && (
        <div className="dg-loading">
          <div className="dg-spinner" />
          <span>Updating game...</span>
        </div>
      )}
    </main>
  );
};

export default DrawGuess;
