
export const SOCKET_CONFIG = Object.freeze({
  URL:
    import.meta.env.VITE_SOCKET_URL ||
    "http://localhost:5001",

  OPTIONS: {
    autoConnect: false,
    withCredentials: true,
    transports: ["websocket", "polling"],

    reconnection: true,
    reconnectionAttempts: Infinity,
    reconnectionDelay: 1000,
    reconnectionDelayMax: 5000,
    randomizationFactor: 0.5,

    timeout: 20000,
  },

  ACK_TIMEOUT: 10000,

  EVENTS: {
    ROOM: {
      JOIN: "room:join",
      LEAVE: "room:leave",
      UPDATE: "room:updated",
    },

    GAME: {
      START: "game:start",
      ACTION: "game:action",
      STATE: "game:state",
      FINISHED: "game:finished",
    },

    CHAT: {
      SEND: "chat:send",
      MESSAGE: "chat:message",
      TYPING: "chat:typing",
    },
  },

  LIMITS: {
    MAX_RECONNECT_ATTEMPTS: 10,
    MAX_MESSAGE_LENGTH: 2000,
    MAX_TYPING_INTERVAL: 3000,
  },
});

export const SOCKET_TRANSPORTS = [
  "websocket",
  "polling",
];

export default SOCKET_CONFIG;
