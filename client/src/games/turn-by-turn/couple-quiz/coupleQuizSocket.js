
export const COUPLE_QUIZ_EVENTS = {
  START: "couple-quiz:start",
  ANSWER: "couple-quiz:answer",
  STATE: "couple-quiz:state",
  QUESTION: "couple-quiz:question",
  ANSWER_RESULT: "couple-quiz:answer-result",
  QUESTION_RESULT: "couple-quiz:question-result",
  NEXT_QUESTION: "couple-quiz:next-question",
  GAME_OVER: "couple-quiz:game-over",
  REMATCH: "couple-quiz:rematch",
  REMATCH_REQUESTED: "couple-quiz:rematch-requested",
  REMATCH_STARTED: "couple-quiz:rematch-started",
  ERROR: "couple-quiz:error",
};

export function startCoupleQuizSocket(socket, roomId) {
  if (!socket || !roomId) return;

  socket.emit(COUPLE_QUIZ_EVENTS.START, { roomId });
}

export function submitCoupleQuizSocketAnswer(
  socket,
  { roomId, answerIndex }
) {
  if (!socket || !roomId) return;

  socket.emit(COUPLE_QUIZ_EVENTS.ANSWER, {
    roomId,
    answerIndex,
  });
}

export function requestNextCoupleQuestion(socket, roomId) {
  if (!socket || !roomId) return;

  socket.emit(COUPLE_QUIZ_EVENTS.NEXT_QUESTION, { roomId });
}

export function requestCoupleQuizRematch(socket, roomId) {
  if (!socket || !roomId) return;

  socket.emit(COUPLE_QUIZ_EVENTS.REMATCH, { roomId });
}

export function subscribeCoupleQuiz(socket, handlers = {}) {
  if (!socket) return () => {};

  const subscriptions = [
    [COUPLE_QUIZ_EVENTS.STATE, handlers.onState],
    [COUPLE_QUIZ_EVENTS.QUESTION, handlers.onQuestion],
    [COUPLE_QUIZ_EVENTS.ANSWER_RESULT, handlers.onAnswerResult],
    [COUPLE_QUIZ_EVENTS.QUESTION_RESULT, handlers.onQuestionResult],
    [COUPLE_QUIZ_EVENTS.GAME_OVER, handlers.onGameOver],
    [COUPLE_QUIZ_EVENTS.REMATCH_REQUESTED, handlers.onRematchRequested],
    [COUPLE_QUIZ_EVENTS.REMATCH_STARTED, handlers.onRematchStarted],
    [COUPLE_QUIZ_EVENTS.ERROR, handlers.onError],
  ];

  subscriptions.forEach(([event, handler]) => {
    if (typeof handler === "function") {
      socket.on(event, handler);
    }
  });

  return () => {
    subscriptions.forEach(([event, handler]) => {
      if (typeof handler === "function") {
        socket.off(event, handler);
      }
    });
  };
}
