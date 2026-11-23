
import { useCallback, useState } from "react";

export default function useGameState(initialState = {}) {
  const [gameState, setGameState] = useState(initialState);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const updateGameState = useCallback((updates) => {
    setGameState((current) => {
      const changes =
        typeof updates === "function"
          ? updates(current)
          : updates;

      return {
        ...current,
        ...changes,
      };
    });
  }, []);

  const replaceGameState = useCallback((newState) => {
    setGameState(newState);
    setError("");
  }, []);

  const resetGameState = useCallback((newState = initialState) => {
    setGameState(newState);
    setLoading(false);
    setError("");
  }, [initialState]);

  const setGameError = useCallback((message) => {
    setError(message || "Something went wrong.");
  }, []);

  const clearGameError = useCallback(() => {
    setError("");
  }, []);

  return {
    gameState,
    setGameState,
    updateGameState,
    replaceGameState,
    resetGameState,
    loading,
    setLoading,
    error,
    setGameError,
    clearGameError,
  };
}
