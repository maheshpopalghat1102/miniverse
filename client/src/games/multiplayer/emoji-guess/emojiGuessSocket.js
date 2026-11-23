
const EVENTS = {
  ANSWER: "emoji-guess:answer",
  STATE: "emoji-guess:state",
  ERROR: "emoji-guess:error",
  REMATCH: "emoji-guess:rematch",
  REMATCH_REQUESTED: "emoji-guess:rematch-requested",
  REMATCH_STARTED: "emoji-guess:rematch-started",
};

export function sendEmojiAnswer(socket, roomId, answer) {
  if (!socket?.connected) {
    throw new Error("Socket is not connected.");
  }

  socket.emit(EVENTS.ANSWER, { roomId, answer });
}

export function requestEmojiRematch(socket, roomId) {
  if (!socket?.connected) {
    throw new Error("Socket is not connected.");
  }

  socket.emit(EVENTS.REMATCH, { roomId });
}

export function subscribeEmojiGuess(socket, handlers = {}) {
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

export { EVENTS as EMOJI_GUESS_EVENTS };
