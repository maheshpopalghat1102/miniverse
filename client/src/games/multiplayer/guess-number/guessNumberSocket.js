
const EVENTS = {
  GUESS: "guess-number:guess",
  STATE: "guess-number:state",
  ERROR: "guess-number:error",
  REMATCH: "guess-number:rematch",
  REMATCH_REQUESTED: "guess-number:rematch-requested",
  REMATCH_STARTED: "guess-number:rematch-started",
};

export function sendNumberGuess(socket, roomId, guess) {
  if (!socket?.connected) {
    throw new Error("Socket is not connected.");
  }

  socket.emit(EVENTS.GUESS, {
    roomId,
    guess,
  });
}

export function requestGuessNumberRematch(socket, roomId) {
  if (!socket?.connected) {
    throw new Error("Socket is not connected.");
  }

  socket.emit(EVENTS.REMATCH, { roomId });
}

export function subscribeGuessNumber(socket, handlers = {}) {
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

export { EVENTS as GUESS_NUMBER_EVENTS };
