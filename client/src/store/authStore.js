
import { useSyncExternalStore } from "react";

let state = {
  user: null,
  isAuthenticated: false,
  isLoading: true,
  error: null,
};

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

const authStore = {
  getState: () => state,

  subscribe(listener) {
    listeners.add(listener);
    return () => listeners.delete(listener);
  },

  setUser(user) {
    setState({
      user,
      isAuthenticated: Boolean(user),
      error: null,
    });
  },

  setLoading(isLoading) {
    setState({ isLoading });
  },

  setError(error) {
    setState({ error });
  },

  logout() {
    setState({
      user: null,
      isAuthenticated: false,
      error: null,
    });
  },

  reset() {
    setState({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,
    });
  },
};

export function useAuthStore() {
  return useSyncExternalStore(
    authStore.subscribe,
    authStore.getState,
    authStore.getState
  );
}

export default authStore;
