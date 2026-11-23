
import React, {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import SituationSelector from "./SituationSelector";
import PlayerTurn from "./PlayerTurn";
import PromptPicker from "./PromptPicker";
import TruthDareCard from "./TruthDareCard";

import {
  createInitialTruthDareState,
  getCurrentPlayer,
} from "./truthOrDareLogic";

import {
  subscribeTruthDareEvents,
  startTruthDareGame,
  chooseTruthOrDare,
  completeTruthDareTurn,
  skipTruthDarePrompt,
} from "./truthOrDareSocket";

import "./truthOrDare.css";

const TruthOrDare = ({
  socket = null,
  roomId = null,
  players: suppliedPlayers = [],
  ageVerified = false,
  onExit,
  onResetHistory,
}) => {
  const [game, setGame] = useState(() =>
    createInitialTruthDareState(suppliedPlayers)
  );

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [isExhausted, setIsExhausted] = useState(false);
  const [onlinePrompt, setOnlinePrompt] = useState(null);

  const isOnline = Boolean(socket && roomId);

  const currentPlayer = useMemo(
    () => getCurrentPlayer(game),
    [game]
  );

  const isMyTurn = useMemo(() => {
    if (!isOnline) return false;

    const me = suppliedPlayers.find(
      (player) => player.isMe
    );

    return Boolean(
      me &&
      String(me.id || me._id) ===
        String(game.currentPlayerId)
    );
  }, [
    isOnline,
    suppliedPlayers,
    game.currentPlayerId,
  ]);

  const activePrompt = onlinePrompt || game.currentPrompt;

  const updateError = useCallback((message) => {
    const safeMessage =
      message || "Something went wrong.";

    setError(safeMessage);

    setIsExhausted(
      /no unused prompts remain|all available prompts|seen all available prompts|prompt bank is exhausted/i.test(
        safeMessage
      )
    );
  }, []);

  useEffect(() => {
    if (!isOnline) return undefined;

    const unsubscribe = subscribeTruthDareEvents(socket, {
      onState: (newState) => {
        setGame((previous) => ({
          ...previous,
          ...newState,
        }));

        if (newState.currentPrompt !== undefined) {
          setOnlinePrompt(newState.currentPrompt);
        }
      },

      onPrompt: (prompt) => {
        setOnlinePrompt(prompt);
        setError("");
        setIsExhausted(false);
      },

      onError: (payload) => {
        updateError(
          payload?.message || "Game error."
        );
      },

      onPlayerTurn: (payload) => {
        setGame((previous) => ({
          ...previous,
          currentPlayerId: payload.currentPlayerId,
          currentPlayerIndex:
            payload.currentPlayerIndex ??
            previous.currentPlayerIndex,
          currentPrompt: null,
        }));

        setOnlinePrompt(null);
      },
    });

    return unsubscribe;
  }, [isOnline, socket, updateError]);

  const handleSelectCategory = async (category) => {
    setError("");
    setIsExhausted(false);

    if (!isOnline) {
      updateError(
        "Join an authenticated multiplayer room to play Truth or Dare."
      );
      return;
    }

    if (
      category === "adult-18-plus" &&
      !ageVerified
    ) {
      updateError(
        "Age verification is required for this category."
      );
      return;
    }

    try {
      setLoading(true);

      const state = await startTruthDareGame(
        socket,
        {
          roomId,
          category,
        }
      );

      if (state) {
        setGame((previous) => ({
          ...previous,
          ...state,
        }));

        setOnlinePrompt(state.currentPrompt || null);
      }
    } catch (err) {
      updateError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleChoose = async (type) => {
    setError("");
    setIsExhausted(false);

    if (!isMyTurn) {
      updateError("Wait for your turn.");
      return;
    }

    try {
      setLoading(true);

      const result = await chooseTruthOrDare(
        socket,
        {
          roomId,
          type,
        }
      );

      if (result?.prompt) {
        setOnlinePrompt(result.prompt);
      }

      if (result?.state) {
        setGame((previous) => ({
          ...previous,
          ...result.state,
        }));
      }
    } catch (err) {
      updateError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleComplete = async () => {
    setError("");

    if (!isMyTurn) {
      updateError("Wait for your turn.");
      return;
    }

    try {
      setLoading(true);

      const state = await completeTruthDareTurn(
        socket,
        { roomId }
      );

      if (state) {
        setGame((previous) => ({
          ...previous,
          ...state,
        }));
      }

      setOnlinePrompt(null);
    } catch (err) {
      updateError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSkip = async () => {
    setError("");

    if (!isMyTurn) {
      updateError("Wait for your turn.");
      return;
    }

    try {
      setLoading(true);

      const state = await skipTruthDarePrompt(
        socket,
        { roomId }
      );

      if (state) {
        setGame((previous) => ({
          ...previous,
          ...state,
        }));
      }

      setOnlinePrompt(null);
    } catch (err) {
      updateError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleResetHistory = async () => {
    if (typeof onResetHistory !== "function") {
      updateError(
        "History reset is not connected to the authenticated API client yet."
      );
      return;
    }

    const confirmed = window.confirm(
      "Reset your Truth or Dare question history? You may see previously used prompts again. Other players must reset their own history separately."
    );

    if (!confirmed) return;

    try {
      setLoading(true);

      await onResetHistory();

      setError("");
      setIsExhausted(false);
      setOnlinePrompt(null);

      setError(
        "Your question history has been reset. Other players' histories have not changed."
      );
    } catch (err) {
      updateError(
        err.message || "Could not reset question history."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleExit = () => {
    onExit?.();
  };

  const canChoose =
    game.status === "playing" && !activePrompt;

  return (
    <main className="truth-dare-game">
      <header className="td-game-header">
        <div className="td-game-title">
          <span className="td-game-logo">🎭</span>

          <div>
            <h1>Truth or Dare</h1>
            <p>How brave are you today?</p>
          </div>
        </div>

        <button
          type="button"
          className="td-exit-button"
          onClick={handleExit}
        >
          ✕ Exit Game
        </button>
      </header>

      {error && (
        <div
          className="td-error-message"
          role="alert"
        >
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

      <div className="td-game-content">
        {!game.category && (
          <SituationSelector
            selectedCategory={game.category}
            onSelect={handleSelectCategory}
            ageVerified={ageVerified}
            disabled={loading || !isOnline}
          />
        )}

        {game.category && (
          <>
            <div className="td-selected-situation">
              <span>Selected situation:</span>

              <strong>
                {game.category
                  .split("-")
                  .map(
                    (word) =>
                      word.charAt(0).toUpperCase() +
                      word.slice(1)
                  )
                  .join(" ")}
              </strong>
            </div>

            <PlayerTurn
              players={game.players}
              currentPlayerId={game.currentPlayerId}
              round={game.round}
              completedTurns={game.completedTurns}
            />

            {activePrompt ? (
              <TruthDareCard
                prompt={activePrompt}
                playerName={
                  currentPlayer?.name ||
                  "Current player"
                }
                onComplete={handleComplete}
                onSkip={handleSkip}
                disabled={loading || !isMyTurn}
              />
            ) : (
              canChoose && (
                <PromptPicker
                  onChoose={handleChoose}
                  disabled={loading || !isMyTurn}
                  currentPlayerName={
                    currentPlayer?.name ||
                    "Current player"
                  }
                />
              )
            )}

            {!isMyTurn && !activePrompt && (
              <div className="td-waiting-message">
                ⏳ Waiting for{" "}
                {currentPlayer?.name ||
                  "the current player"}
                ...
              </div>
            )}

            <div className="td-history-summary">
              <span>Completed turns</span>
              <strong>{game.completedTurns}</strong>
            </div>

            {isExhausted && (
              <div className="td-exhausted-message">
                <p>
                  You or another player has used all
                  currently available prompts for this
                  selection. No previous prompt will be
                  repeated automatically.
                </p>

                {typeof onResetHistory === "function" && (
                  <button
                    type="button"
                    className="td-reset-history-button"
                    onClick={handleResetHistory}
                    disabled={loading}
                  >
                    Reset My Question History
                  </button>
                )}
              </div>
            )}
          </>
        )}

        {!isOnline && (
          <p className="td-waiting-message">
            Join an authenticated room to use permanent
            question history.
          </p>
        )}
      </div>

      {loading && (
        <div className="td-loading-overlay">
          <div className="td-spinner" />
          <span>Updating game...</span>
        </div>
      )}
    </main>
  );
};

export default TruthOrDare;
