
const EVENTS = {
  MOVE: "tic-tac-toe:move",
  STATE: "tic-tac-toe:state",
  ERROR: "tic-tac-toe:error",
  REMATCH: "tic-tac-toe:rematch",
  REMATCH_REQUESTED: "tic-tac-toe:rematch-requested",
  REMATCH_STARTED: "tic-tac-toe:rematch-started",
};

export function sendTicTacToeMove(socket, roomId, index) {
  if (!socket?.connected) {
    throw new Error("Socket is not connected.");
  }

  socket.emit(EVENTS.MOVE, {
    roomId,
    index,
  });
}

export function requestTicTacToeRematch(socket, roomId) {
  if (!socket?.connected) {
    throw new Error("Socket is not connected.");
  }

  socket.emit(EVENTS.REMATCH, {
    roomId,
  });
}

export function subscribeTicTacToe(socket, handlers = {}) {
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

export { EVENTS as TIC_TAC_TOE_EVENTS };
