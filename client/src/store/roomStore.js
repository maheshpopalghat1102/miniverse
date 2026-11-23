
import { useSyncExternalStore } from "react";

const initialState = {
  room: null,
  players: [],
  isHost: false,
  isReady: false,
  status: "idle",
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

function getPlayerId(player) {
  return String(player?.id || player?._id || "");
}

const roomStore = {
  getState: () => state,

  subscribe(listener) {
    listeners.add(listener);
    return () => listeners.delete(listener);
  },

  setRoom(room) {
    setState({
      room,
      players: room?.members || room?.players || [],
      status: room?.status || "waiting",
    });
  },

  setPlayers(players) {
    setState({ players });
  },

  addPlayer(player) {
    setState((current) => {
      const exists = current.players.some(
        (item) => getPlayerId(item) === getPlayerId(player)
      );

      return {
        players: exists
          ? current.players
          : [...current.players, player],
      };
    });
  },

  removePlayer(playerId) {
    setState((current) => ({
      players: current.players.filter(
        (player) => getPlayerId(player) !== String(playerId)
      ),
    }));
  },

  setHost(isHost) {
    setState({ isHost });
  },

  setReady(isReady) {
    setState({ isReady });
  },

  setStatus(status) {
    setState({ status });
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

export function useRoomStore() {
  return useSyncExternalStore(
    roomStore.subscribe,
    roomStore.getState,
    roomStore.getState
  );
}

export default roomStore;
