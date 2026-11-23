
import { useCallback, useEffect, useRef, useState } from "react";

export default function useSocket(socketInstance = null) {
  const socketRef = useRef(socketInstance);
  const [connected, setConnected] = useState(
    Boolean(socketInstance?.connected)
  );
  const [socketId, setSocketId] = useState(
    socketInstance?.id || null
  );

  useEffect(() => {
    socketRef.current = socketInstance;

    if (!socketInstance) {
      setConnected(false);
      setSocketId(null);
      return;
    }

    const handleConnect = () => {
      setConnected(true);
      setSocketId(socketInstance.id || null);
    };

    const handleDisconnect = () => {
      setConnected(false);
      setSocketId(null);
    };

    socketInstance.on("connect", handleConnect);
    socketInstance.on("disconnect", handleDisconnect);

    setConnected(Boolean(socketInstance.connected));
    setSocketId(socketInstance.id || null);

    return () => {
      socketInstance.off("connect", handleConnect);
      socketInstance.off("disconnect", handleDisconnect);
    };
  }, [socketInstance]);

  const emit = useCallback((event, payload, callback) => {
    if (!socketRef.current?.connected) {
      return false;
    }

    if (callback) {
      socketRef.current.emit(event, payload, callback);
    } else {
      socketRef.current.emit(event, payload);
    }

    return true;
  }, []);

  const on = useCallback((event, handler) => {
    const currentSocket = socketRef.current;

    if (!currentSocket || typeof handler !== "function") {
      return () => {};
    }

    currentSocket.on(event, handler);

    return () => {
      currentSocket.off(event, handler);
    };
  }, []);

  const once = useCallback((event, handler) => {
    const currentSocket = socketRef.current;

    if (!currentSocket || typeof handler !== "function") {
      return;
    }

    currentSocket.once(event, handler);
  }, []);

  const connect = useCallback(() => {
    socketRef.current?.connect();
  }, []);

  const disconnect = useCallback(() => {
    socketRef.current?.disconnect();
  }, []);

  return {
    socket: socketRef.current,
    connected,
    socketId,
    emit,
    on,
    once,
    connect,
    disconnect,
  };
}
