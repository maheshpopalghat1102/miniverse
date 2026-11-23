
export const SOCKET_EVENTS = {
  CONNECTION: {
    CONNECT: "connect",
    DISCONNECT: "disconnect",
    CONNECT_ERROR: "connect_error",
    ERROR: "error",
  },

  ROOM: {
    CREATE: "room:create",
    JOIN: "room:join",
    LEAVE: "room:leave",
    UPDATE: "room:update",
    UPDATED: "room:updated",
    PLAYER_JOINED: "room:player-joined",
    PLAYER_LEFT: "room:player-left",
    READY: "room:ready",
    START: "room:start",
    STARTED: "room:started",
    CLOSE: "room:close",
    CLOSED: "room:closed",
    KICK: "room:kick",
    ERROR: "room:error",
  },

  GAME: {
    START: "game:start",
    ACTION: "game:action",
    STATE: "game:state",
    UPDATE: "game:update",
    FINISHED: "game:finished",
    REMATCH: "game:rematch",
    REMATCH_REQUESTED: "game:rematch-requested",
    REMATCH_STARTED: "game:rematch-started",
    ERROR: "game:error",
  },

  CHAT: {
    SEND: "chat:send",
    MESSAGE: "chat:message",
    HISTORY: "chat:history",
    TYPING: "chat:typing",
    STOP_TYPING: "chat:stop-typing",
    USER_TYPING: "chat:user-typing",
    MESSAGE_DELETED: "chat:message-deleted",
    ERROR: "chat:error",
  },

  PRESENCE: {
    ONLINE: "presence:online",
    OFFLINE: "presence:offline",
    UPDATE: "presence:update",
    USERS: "presence:users",
  },

  MATCHMAKING: {
    JOIN: "matchmaking:join",
    LEAVE: "matchmaking:leave",
    FOUND: "matchmaking:found",
    CANCELLED: "matchmaking:cancelled",
    ERROR: "matchmaking:error",
  },

  NOTIFICATION: {
    NEW: "notification:new",
    READ: "notification:read",
    DELETED: "notification:deleted",
  },
};

export default SOCKET_EVENTS;
