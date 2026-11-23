
import { getSocket } from "./socketClient";
import { SOCKET_EVENTS } from "./socketEvents";
import { emitWithAck } from "./socketHandlers";

const chatSocket = {
  sendMessage(roomId, message, replyTo = null) {
    return emitWithAck(
      getSocket(),
      SOCKET_EVENTS.CHAT.SEND,
      { roomId, message, replyTo }
    );
  },

  startTyping(roomId) {
    const socket = getSocket();

    if (!socket?.connected) return false;

    socket.emit(SOCKET_EVENTS.CHAT.TYPING, { roomId });
    return true;
  },

  stopTyping(roomId) {
    const socket = getSocket();

    if (!socket?.connected) return false;

    socket.emit(SOCKET_EVENTS.CHAT.STOP_TYPING, { roomId });
    return true;
  },

  onMessage(callback) {
    const socket = getSocket();
    if (!socket) return () => {};

    socket.on(SOCKET_EVENTS.CHAT.MESSAGE, callback);

    return () =>
      socket.off(SOCKET_EVENTS.CHAT.MESSAGE, callback);
  },

  onChatHistory(callback) {
    const socket = getSocket();
    if (!socket) return () => {};

    socket.on(SOCKET_EVENTS.CHAT.HISTORY, callback);

    return () =>
      socket.off(SOCKET_EVENTS.CHAT.HISTORY, callback);
  },

  onUserTyping(callback) {
    const socket = getSocket();
    if (!socket) return () => {};

    socket.on(SOCKET_EVENTS.CHAT.USER_TYPING, callback);

    return () =>
      socket.off(SOCKET_EVENTS.CHAT.USER_TYPING, callback);
  },

  onMessageDeleted(callback) {
    const socket = getSocket();
    if (!socket) return () => {};

    socket.on(SOCKET_EVENTS.CHAT.MESSAGE_DELETED, callback);

    return () =>
      socket.off(SOCKET_EVENTS.CHAT.MESSAGE_DELETED, callback);
  },

  onChatError(callback) {
    const socket = getSocket();
    if (!socket) return () => {};

    socket.on(SOCKET_EVENTS.CHAT.ERROR, callback);

    return () =>
      socket.off(SOCKET_EVENTS.CHAT.ERROR, callback);
  },
};

export default chatSocket;
