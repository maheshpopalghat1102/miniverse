
import { useSyncExternalStore } from "react";

let state = {
  profile: null,
  onlineUsers: [],
  loading: false,
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

const userStore = {
  getState: () => state,

  subscribe(listener) {
    listeners.add(listener);
    return () => listeners.delete(listener);
  },

  setProfile(profile) {
    setState({ profile });
  },

  updateProfile(updates) {
    setState((current) => ({
      profile: current.profile
        ? { ...current.profile, ...updates }
        : null,
    }));
  },

  setOnlineUsers(users) {
    setState({ onlineUsers: users });
  },

  addOnlineUser(user) {
    setState((current) => ({
      onlineUsers: current.onlineUsers.some(
        (item) => String(item.id || item._id) ===
          String(user.id || user._id)
      )
        ? current.onlineUsers
        : [...current.onlineUsers, user],
    }));
  },

  removeOnlineUser(userId) {
    setState((current) => ({
      onlineUsers: current.onlineUsers.filter(
        (user) =>
          String(user.id || user._id) !== String(userId)
      ),
    }));
  },

  setLoading(loading) {
    setState({ loading });
  },

  setError(error) {
    setState({ error });
  },

  reset() {
    setState({
      profile: null,
      onlineUsers: [],
      loading: false,
      error: null,
    });
  },
};

export function useUserStore() {
  return useSyncExternalStore(
    userStore.subscribe,
    userStore.getState,
    userStore.getState
  );
}

export default userStore;
