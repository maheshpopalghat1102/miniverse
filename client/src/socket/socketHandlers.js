
import { SOCKET_EVENTS } from "./socketEvents";

export function registerConnectionHandlers(socket, callbacks = {}) {
  if (!socket) return () => {};

  const {
    onConnect,
    onDisconnect,
    onConnectError,
    onError,
  } = callbacks;

  const handleConnect = (...args) => onConnect?.(...args);
  const handleDisconnect = (...args) => onDisconnect?.(...args);
  const handleConnectError = (...args) => onConnectError?.(...args);
  const handleError = (...args) => onError?.(...args);

  socket.on(SOCKET_EVENTS.CONNECTION.CONNECT, handleConnect);
  socket.on(SOCKET_EVENTS.CONNECTION.DISCONNECT, handleDisconnect);
  socket.on(SOCKET_EVENTS.CONNECTION.CONNECT_ERROR, handleConnectError);
  socket.on(SOCKET_EVENTS.CONNECTION.ERROR, handleError);

  return () => {
    socket.off(SOCKET_EVENTS.CONNECTION.CONNECT, handleConnect);
    socket.off(SOCKET_EVENTS.CONNECTION.DISCONNECT, handleDisconnect);
    socket.off(SOCKET_EVENTS.CONNECTION.CONNECT_ERROR, handleConnectError);
    socket.off(SOCKET_EVENTS.CONNECTION.ERROR, handleError);
  };
}

export function registerSocketHandlers(socket, handlers = {}) {
  if (!socket) return () => {};

  const cleanupFunctions = [];

  Object.entries(handlers).forEach(([event, handler]) => {
    if (typeof handler !== "function") return;

    socket.on(event, handler);

    cleanupFunctions.push(() => {
      socket.off(event, handler);
    });
  });

  return () => {
    cleanupFunctions.forEach((cleanup) => cleanup());
  };
}

export function emitWithAck(
  socket,
  event,
  payload = {},
  timeout = 10000
) {
  return new Promise((resolve, reject) => {
    if (!socket?.connected) {
      reject(new Error("Socket is not connected."));
      return;
    }

    socket.timeout(timeout).emit(event, payload, (error, response) => {
      if (error) {
        reject(new Error("Socket request timed out."));
        return;
      }

      if (response?.error) {
        reject(new Error(response.error));
        return;
      }

      resolve(response);
    });
  });
}
