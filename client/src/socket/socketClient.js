
import { io } from "socket.io-client";
import { getAccessToken } from "../services/accessToken";

const SOCKET_URL =
  import.meta.env.VITE_SOCKET_URL || "http://localhost:5001";

let socket = null;

export function getSocket() {
  return socket;
}

export function connectSocket() {
  if (socket) {
    if (!socket.connected && !socket.active) {
      socket.connect();
    }

    return socket;
  }

  socket = io(SOCKET_URL, {
    autoConnect: false,
    withCredentials: true,
    auth: { token: getAccessToken() },
    transports: ["websocket", "polling"],
    reconnection: true,
    reconnectionAttempts: Infinity,
    reconnectionDelay: 1000,
    reconnectionDelayMax: 5000,
    timeout: 20000,
  });

  socket.connect();

  return socket;
}

export function disconnectSocket() {
  if (!socket) return;

  socket.removeAllListeners();
  socket.disconnect();
  socket = null;
}

export function isSocketConnected() {
  return Boolean(socket?.connected);
}

export function emitSocket(event, payload, callback) {
  if (!socket?.connected) {
    return false;
  }

  if (typeof callback === "function") {
    socket.emit(event, payload, callback);
  } else {
    socket.emit(event, payload);
  }

  return true;
}

export function onSocket(event, handler) {
  if (!socket || typeof handler !== "function") {
    return () => {};
  }

  socket.on(event, handler);

  return () => {
    socket.off(event, handler);
  };
}

export function onceSocket(event, handler) {
  if (!socket || typeof handler !== "function") {
    return;
  }

  socket.once(event, handler);
}

export default {
  getSocket,
  connectSocket,
  disconnectSocket,
  isSocketConnected,
  emitSocket,
  onSocket,
  onceSocket,
};
