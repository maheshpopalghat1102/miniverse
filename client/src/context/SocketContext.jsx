
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { io } from "socket.io-client";
import { useAuth } from "./AuthContext";
import { getAccessToken } from "../services/accessToken";

const SocketContext = createContext(null);

const SOCKET_URL =
  import.meta.env.VITE_SOCKET_URL || "http://localhost:5001";

export function SocketProvider({ children }) {
  const { user, isAuthenticated, isLoading } = useAuth();

  const [socket, setSocket] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [connectionError, setConnectionError] = useState("");

  useEffect(() => {
    if (isLoading || !isAuthenticated || !user) {
      setIsConnected(false);
      setSocket(null);
      return;
    }

    const connection = io(SOCKET_URL, {
      autoConnect: true,
      withCredentials: true,
      transports: ["websocket", "polling"],
      auth: { token: getAccessToken() },
    });

    const handleConnect = () => {
      setIsConnected(true);
      setConnectionError("");
    };

    const handleDisconnect = () => {
      setIsConnected(false);
    };

    const handleConnectError = (error) => {
      setIsConnected(false);
      setConnectionError(
        error.message || "Unable to connect to game server."
      );
    };

    connection.on("connect", handleConnect);
    connection.on("disconnect", handleDisconnect);
    connection.on("connect_error", handleConnectError);

    setSocket(connection);

    return () => {
      connection.off("connect", handleConnect);
      connection.off("disconnect", handleDisconnect);
      connection.off("connect_error", handleConnectError);
      connection.disconnect();
      setSocket(null);
      setIsConnected(false);
    };
  }, [isAuthenticated, isLoading, user?._id, user?.id]);

  const emit = useCallback((event, payload, callback) => {
    if (!socket?.connected) return false;

    if (callback) {
      socket.emit(event, payload, callback);
    } else {
      socket.emit(event, payload);
    }

    return true;
  }, [socket]);

  const subscribe = useCallback((event, handler) => {
    if (!socket || typeof handler !== "function") {
      return () => {};
    }

    socket.on(event, handler);

    return () => socket.off(event, handler);
  }, [socket]);

  const value = useMemo(() => ({
    socket,
    isConnected,
    connectionError,
    emit,
    subscribe,
    connect: () => socket?.connect(),
    disconnect: () => socket?.disconnect(),
  }), [
    socket,
    isConnected,
    connectionError,
    emit,
    subscribe,
  ]);

  return (
    <SocketContext.Provider value={value}>
      {children}
    </SocketContext.Provider>
  );
}

export function useSocketContext() {
  const context = useContext(SocketContext);

  if (!context) {
    throw new Error(
      "useSocketContext must be used inside SocketProvider."
    );
  }

  return context;
}

export default SocketContext;
