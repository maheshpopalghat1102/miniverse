
import { getSocket } from "./socketClient";
import { SOCKET_EVENTS } from "./socketEvents";
import { emitWithAck } from "./socketHandlers";

const gameSocket = {
  startGame(roomId, settings = {}) {
    return emitWithAck(
      getSocket(),
      SOCKET_EVENTS.GAME.START,
      { roomId, settings }
    );
  },

  sendAction(roomId, action) {
    return emitWithAck(
      getSocket(),
      SOCKET_EVENTS.GAME.ACTION,
      { roomId, action }
    );
  },

  requestRematch(roomId) {
    return emitWithAck(
      getSocket(),
      SOCKET_EVENTS.GAME.REMATCH,
      { roomId }
    );
  },

  onGameState(callback) {
    const socket = getSocket();
    if (!socket) return () => {};

    socket.on(SOCKET_EVENTS.GAME.STATE, callback);

    return () =>
      socket.off(SOCKET_EVENTS.GAME.STATE, callback);
  },

  onGameUpdate(callback) {
    const socket = getSocket();
    if (!socket) return () => {};

    socket.on(SOCKET_EVENTS.GAME.UPDATE, callback);

    return () =>
      socket.off(SOCKET_EVENTS.GAME.UPDATE, callback);
  },

  onGameFinished(callback) {
    const socket = getSocket();
    if (!socket) return () => {};

    socket.on(SOCKET_EVENTS.GAME.FINISHED, callback);

    return () =>
      socket.off(SOCKET_EVENTS.GAME.FINISHED, callback);
  },

  onRematchRequested(callback) {
    const socket = getSocket();
    if (!socket) return () => {};

    socket.on(SOCKET_EVENTS.GAME.REMATCH_REQUESTED, callback);

    return () =>
      socket.off(SOCKET_EVENTS.GAME.REMATCH_REQUESTED, callback);
  },

  onRematchStarted(callback) {
    const socket = getSocket();
    if (!socket) return () => {};

    socket.on(SOCKET_EVENTS.GAME.REMATCH_STARTED, callback);

    return () =>
      socket.off(SOCKET_EVENTS.GAME.REMATCH_STARTED, callback);
  },

  onGameError(callback) {
    const socket = getSocket();
    if (!socket) return () => {};

    socket.on(SOCKET_EVENTS.GAME.ERROR, callback);

    return () =>
      socket.off(SOCKET_EVENTS.GAME.ERROR, callback);
  },
};

export default gameSocket;
