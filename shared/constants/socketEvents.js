
export const SOCKET_EVENTS = Object.freeze({
  // Connection
  CONNECTION: "connection",
  DISCONNECT: "disconnect",
  CONNECT_ERROR: "connect_error",

  // Presence
  PRESENCE_ONLINE: "presence:online",
  PRESENCE_OFFLINE: "presence:offline",
  PRESENCE_CHECK: "presence:check",
  PRESENCE_UPDATE: "presence:update",

  // Rooms
  ROOM_JOIN: "room:join",
  ROOM_LEAVE: "room:leave",
  ROOM_UPDATE: "room:update",
  ROOM_ERROR: "room:error",
  ROOM_MEMBER_JOINED: "room:member-joined",
  ROOM_MEMBER_LEFT: "room:member-left",
  ROOM_READY: "room:ready",
  ROOM_START: "room:start",
  ROOM_CLOSED: "room:closed",

  // Matchmaking
  MATCHMAKING_JOIN: "matchmaking:join",
  MATCHMAKING_LEAVE: "matchmaking:leave",
  MATCHMAKING_FOUND: "matchmaking:found",
  MATCHMAKING_WAITING: "matchmaking:waiting",
  MATCHMAKING_CANCELLED: "matchmaking:cancelled",

  // Games
  GAME_START: "game:start",
  GAME_ACTION: "game:action",
  GAME_STATE: "game:state",
  GAME_UPDATE: "game:update",
  GAME_FINISHED: "game:finished",
  GAME_ERROR: "game:error",
  GAME_TIMER: "game:timer",

  // Chat
  CHAT_SEND: "chat:send",
  CHAT_MESSAGE: "chat:message",
  CHAT_ERROR: "chat:error",

  // Drawing
  DRAW_START: "draw:start",
  DRAW_STROKE: "draw:stroke",
  DRAW_CLEAR: "draw:clear",
  DRAW_UNDO: "draw:undo",

  // Notifications
  NOTIFICATION_NEW: "notification:new",
  NOTIFICATION_READ: "notification:read",
});
