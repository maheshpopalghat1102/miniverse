
const EVENTS = {
  ANSWER: "quiz-battle:answer",
  NEXT_QUESTION: "quiz-battle:next-question",
  STATE: "quiz-battle:state",
  ERROR: "quiz-battle:error",
  REMATCH: "quiz-battle:rematch",
  REMATCH_REQUESTED: "quiz-battle:rematch-requested",
  REMATCH_STARTED: "quiz-battle:rematch-started",
};

export function sendQuizAnswer(socket, roomId, answerIndex) {
  if (!socket?.connected) {
    throw new Error("Socket is not connected.");
  }

  socket.emit(EVENTS.ANSWER, {
    roomId,
    answerIndex,
  });
}

export function requestNextQuizQuestion(socket, roomId) {
  if (!socket?.connected) {
    throw new Error("Socket is not connected.");
  }

  socket.emit(EVENTS.NEXT_QUESTION, { roomId });
}

export function requestQuizBattleRematch(socket, roomId) {
  if (!socket?.connected) {
    throw new Error("Socket is not connected.");
  }

  socket.emit(EVENTS.REMATCH, { roomId });
}

export function subscribeQuizBattle(socket, handlers = {}) {
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

export { EVENTS as QUIZ_BATTLE_EVENTS };
