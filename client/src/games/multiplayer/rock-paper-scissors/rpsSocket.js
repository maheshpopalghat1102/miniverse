
const EVENTS = {
  CHOICE: "rock-paper-scissors:choice",
  STATE: "rock-paper-scissors:state",
  ERROR: "rock-paper-scissors:error",
  NEXT_ROUND: "rock-paper-scissors:next-round",
  REMATCH: "rock-paper-scissors:rematch",
  REMATCH_REQUESTED: "rock-paper-scissors:rematch-requested",
  REMATCH_STARTED: "rock-paper-scissors:rematch-started",
};

export function sendRPSChoice(socket, roomId, choice) {
  if (!socket?.connected) {
    throw new Error("Socket is not connected.");
  }

  socket.emit(EVENTS.CHOICE, {
    roomId,
    choice,
  });
}

export function requestRPSNextRound(socket, roomId) {
  if (!socket?.connected) {
    throw new Error("Socket is not connected.");
  }

  socket.emit(EVENTS.NEXT_ROUND, {
    roomId,
  });
}

export function requestRPSRematch(socket, roomId) {
  if (!socket?.connected) {
    throw new Error("Socket is not connected.");
  }

  socket.emit(EVENTS.REMATCH, {
    roomId,
  });
}

export function subscribeRPS(socket, handlers = {}) {
  if (!socket) return () => {};

  const {
    onState,
    onError,
    onRematchRequested,
    onRematchStarted,
  } = handlers;

  const handleState = (data) => onState?.(data);
  const handleError = (error) => onError?.(error);
  const handleRematchRequested = (data) =>
    onRematchRequested?.(data);
  const handleRematchStarted = (data) =>
    onRematchStarted?.(data);

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

export { EVENTS as RPS_EVENTS };
