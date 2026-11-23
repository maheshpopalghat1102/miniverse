
const EVENTS = {
  MOVE: "connect-four:move",
  STATE: "connect-four:state",
  ERROR: "connect-four:error",
  REMATCH: "connect-four:rematch",
  REMATCH_REQUESTED: "connect-four:rematch-requested",
  REMATCH_STARTED: "connect-four:rematch-started",
};

export function sendConnectFourMove(socket, roomId, column) {
  if (!socket?.connected) {
    throw new Error("Socket is not connected.");
  }

  socket.emit(EVENTS.MOVE, {
    roomId,
    column,
  });
}

export function requestConnectFourRematch(socket, roomId) {
  if (!socket?.connected) {
    throw new Error("Socket is not connected.");
  }

  socket.emit(EVENTS.REMATCH, { roomId });
}

export function subscribeConnectFour(socket, handlers = {}) {
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

export { EVENTS as CONNECT_FOUR_EVENTS };
