
const EVENTS = {
  WORD: "word-battle:word",
  STATE: "word-battle:state",
  ERROR: "word-battle:error",
  REMATCH: "word-battle:rematch",
  REMATCH_REQUESTED: "word-battle:rematch-requested",
  REMATCH_STARTED: "word-battle:rematch-started",
};

export function sendBattleWord(socket, roomId, word) {
  if (!socket?.connected) {
    throw new Error("Socket is not connected.");
  }

  socket.emit(EVENTS.WORD, {
    roomId,
    word,
  });
}

export function requestWordBattleRematch(socket, roomId) {
  if (!socket?.connected) {
    throw new Error("Socket is not connected.");
  }

  socket.emit(EVENTS.REMATCH, { roomId });
}

export function subscribeWordBattle(socket, handlers = {}) {
  if (!socket) return () => {};

  const handleState = (data) => handlers.onState?.(data);
  const handleError = (data) => handlers.onError?.(data);
  const handleRematchRequested = (data) =>
    handlers.onRematchRequested?.(data);
  const handleRematchStarted = (data) =>
    handlers.onRematchStarted?.(data);

  socket.on(EVENTS.STATE, handleState);
  socket.on(EVENTS.ERROR, handleError);
  socket.on(EVENTS.REMATCH_REQUESTED, handleRematchRequested);
  socket.on(EVENTS.REMATCH_STARTED, handleRematchStarted);

  return () => {
    socket.off(EVENTS.STATE, handleState);
    socket.off(EVENTS.ERROR, handleError);
    socket.off(EVENTS.REMATCH_REQUESTED, handleRematchRequested);
    socket.off(EVENTS.REMATCH_STARTED, handleRematchStarted);
  };
}

export { EVENTS as WORD_BATTLE_EVENTS };
