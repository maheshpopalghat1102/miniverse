
import { useSyncExternalStore } from "react";

const initialState = {
  activeGame: null,
  gameState: null,
  status: "idle",
  score: 0,
  round: 1,
  winner: null,
  error: null,
};

let state = { ...initialState };
const listeners = new Set();

function notify() {
  listeners.forEach((listener) => listener());
}

function setState(updates) {
  state = {
    ...state,
    ...(typeof updates === "function" ? updates(state) : updates),
  };

  notify();
}

const gameStore = {
  getState: () => state,

  subscribe(listener) {
    listeners.add(listener);
    return () => listeners.delete(listener);
  },

  setActiveGame(game) {
    setState({ activeGame: game });
  },

  setGameState(gameState) {
    setState({ gameState });
  },

  updateGameState(updates) {
    setState((current) => ({
      gameState: {
        ...(current.gameState || {}),
        ...updates,
      },
    }));
  },

  setStatus(status) {
    setState({ status });
  },

  setScore(score) {
    setState({ score });
  },

  addScore(points) {
    setState((current) => ({
      score: current.score + points,
    }));
  },

  setRound(round) {
    setState({ round });
  },

  setWinner(winner) {
    setState({ winner, status: "finished" });
  },

  setError(error) {
    setState({ error });
  },

  clearError() {
    setState({ error: null });
  },

  reset() {
    state = { ...initialState };
    notify();
  },
};

export function useGameStore() {
  return useSyncExternalStore(
    gameStore.subscribe,
    gameStore.getState,
    gameStore.getState
  );
}

export default gameStore;
