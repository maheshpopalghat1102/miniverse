
import { useSyncExternalStore } from "react";

let state = {
  notifications: [],
  unreadCount: 0,
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

  state.unreadCount = state.notifications.filter(
    (item) => !item.isRead
  ).length;

  notify();
}

function getId(item) {
  return String(item?.id || item?._id || "");
}

const notificationStore = {
  getState: () => state,

  subscribe(listener) {
    listeners.add(listener);
    return () => listeners.delete(listener);
  },

  setNotifications(notifications) {
    setState({ notifications });
  },

  addNotification(notification) {
    setState((current) => ({
      notifications: [
        notification,
        ...current.notifications.filter(
          (item) => getId(item) !== getId(notification)
        ),
      ],
    }));
  },

  markAsRead(notificationId) {
    setState((current) => ({
      notifications: current.notifications.map((item) =>
        getId(item) === String(notificationId)
          ? { ...item, isRead: true }
          : item
      ),
    }));
  },

  markAllAsRead() {
    setState((current) => ({
      notifications: current.notifications.map((item) => ({
        ...item,
        isRead: true,
      })),
    }));
  },

  deleteNotification(notificationId) {
    setState((current) => ({
      notifications: current.notifications.filter(
        (item) => getId(item) !== String(notificationId)
      ),
    }));
  },

  clearNotifications() {
    setState({ notifications: [] });
  },

  setLoading(loading) {
    setState({ loading });
  },

  setError(error) {
    setState({ error });
  },

  reset() {
    setState({
      notifications: [],
      unreadCount: 0,
      loading: false,
      error: null,
    });
  },
};

export function useNotificationStore() {
  return useSyncExternalStore(
    notificationStore.subscribe,
    notificationStore.getState,
    notificationStore.getState
  );
}

export default notificationStore;
