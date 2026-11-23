
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { useSocketContext } from "./SocketContext";
import { useAuth } from "./AuthContext";
import notificationService from "../services/notificationService";

const NotificationContext = createContext(null);

function normalizeNotification(item) {
  return {
    ...item,
    id: String(item.id || item._id),
    isRead: Boolean(item.isRead),
  };
}

export function NotificationProvider({ children }) {
  const { user, isAuthenticated, isLoading } = useAuth();
  const { socket } = useSocketContext();

  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const unreadCount = useMemo(
    () => notifications.filter((item) => !item.isRead).length,
    [notifications]
  );

  const fetchNotifications = useCallback(async () => {
    if (!isAuthenticated) {
      setNotifications([]);
      return;
    }

    setLoading(true);
    setError("");

    try {
      const data = await notificationService.getNotifications();
      const items =
        data.notifications ||
        data.data?.notifications ||
        [];

      setNotifications(items.map(normalizeNotification));
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    if (isLoading) return;

    if (!isAuthenticated) {
      setNotifications([]);
      return;
    }

    fetchNotifications();
  }, [isLoading, isAuthenticated, user?._id, user?.id, fetchNotifications]);

  useEffect(() => {
    if (!socket || !isAuthenticated) return;

    const handleNewNotification = (payload) => {
      const notification = normalizeNotification(
        payload.notification || payload
      );

      setNotifications((current) => {
        const exists = current.some(
          (item) => item.id === notification.id
        );

        return exists
          ? current
          : [notification, ...current];
      });
    };

    socket.on("notification:new", handleNewNotification);

    return () => {
      socket.off("notification:new", handleNewNotification);
    };
  }, [socket, isAuthenticated]);

  const markAsRead = useCallback(async (notificationId) => {
    try {
      await notificationService.markAsRead(notificationId);

      setNotifications((current) =>
        current.map((item) =>
          item.id === String(notificationId)
            ? { ...item, isRead: true }
            : item
        )
      );
    } catch (requestError) {
      setError(requestError.message);
      throw requestError;
    }
  }, []);

  const markAllAsRead = useCallback(async () => {
    try {
      await notificationService.markAllAsRead();

      setNotifications((current) =>
        current.map((item) => ({ ...item, isRead: true }))
      );
    } catch (requestError) {
      setError(requestError.message);
      throw requestError;
    }
  }, []);

  const deleteNotification = useCallback(async (notificationId) => {
    try {
      await notificationService.deleteNotification(notificationId);

      setNotifications((current) =>
        current.filter(
          (item) => item.id !== String(notificationId)
        )
      );
    } catch (requestError) {
      setError(requestError.message);
      throw requestError;
    }
  }, []);

  const clearNotifications = useCallback(() => {
    setNotifications([]);
  }, []);

  const value = useMemo(() => ({
    notifications,
    unreadCount,
    loading,
    error,
    fetchNotifications,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    clearNotifications,
  }), [
    notifications,
    unreadCount,
    loading,
    error,
    fetchNotifications,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    clearNotifications,
  ]);

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  const context = useContext(NotificationContext);

  if (!context) {
    throw new Error(
      "useNotifications must be used inside NotificationProvider."
    );
  }

  return context;
}

export default NotificationContext;
