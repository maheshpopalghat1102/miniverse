
import { getSocket } from "./socketClient";
import { SOCKET_EVENTS } from "./socketEvents";
import { emitWithAck } from "./socketHandlers";

const roomSocket = {
  createRoom(roomData) {
    return emitWithAck(
      getSocket(),
      SOCKET_EVENTS.ROOM.CREATE,
      roomData
    );
  },

  joinRoom(roomCode, password = "") {
    return emitWithAck(
      getSocket(),
      SOCKET_EVENTS.ROOM.JOIN,
      { roomCode, password }
    );
  },

  leaveRoom(roomId) {
    return emitWithAck(
      getSocket(),
      SOCKET_EVENTS.ROOM.LEAVE,
      { roomId }
    );
  },

  updateRoom(roomId, updates) {
    return emitWithAck(
      getSocket(),
      SOCKET_EVENTS.ROOM.UPDATE,
      { roomId, updates }
    );
  },

  setReady(roomId, isReady) {
    return emitWithAck(
      getSocket(),
      SOCKET_EVENTS.ROOM.READY,
      { roomId, isReady }
    );
  },

  startGame(roomId) {
    return emitWithAck(
      getSocket(),
      SOCKET_EVENTS.ROOM.START,
      { roomId }
    );
  },

  closeRoom(roomId) {
    return emitWithAck(
      getSocket(),
      SOCKET_EVENTS.ROOM.CLOSE,
      { roomId }
    );
  },

  kickPlayer(roomId, playerId) {
    return emitWithAck(
      getSocket(),
      SOCKET_EVENTS.ROOM.KICK,
      { roomId, playerId }
    );
  },

  onRoomUpdated(callback) {
    const socket = getSocket();
    if (!socket) return () => {};

    socket.on(SOCKET_EVENTS.ROOM.UPDATED, callback);

    return () =>
      socket.off(SOCKET_EVENTS.ROOM.UPDATED, callback);
  },

  onPlayerJoined(callback) {
    const socket = getSocket();
    if (!socket) return () => {};

    socket.on(SOCKET_EVENTS.ROOM.PLAYER_JOINED, callback);

    return () =>
      socket.off(SOCKET_EVENTS.ROOM.PLAYER_JOINED, callback);
  },

  onPlayerLeft(callback) {
    const socket = getSocket();
    if (!socket) return () => {};

    socket.on(SOCKET_EVENTS.ROOM.PLAYER_LEFT, callback);

    return () =>
      socket.off(SOCKET_EVENTS.ROOM.PLAYER_LEFT, callback);
  },

  onRoomError(callback) {
    const socket = getSocket();
    if (!socket) return () => {};

    socket.on(SOCKET_EVENTS.ROOM.ERROR, callback);

    return () =>
      socket.off(SOCKET_EVENTS.ROOM.ERROR, callback);
  },
};

export default roomSocket;
