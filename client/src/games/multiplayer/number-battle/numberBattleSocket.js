
export const NUMBER_BATTLE_EVENTS = {
  START: "number-battle:start",
  ANSWER: "number-battle:answer",
  STATE: "number-battle:state",
  QUESTION: "number-battle:question",
  ANSWER_RESULT: "number-battle:answer-result",
  ROUND_RESULT: "number-battle:round-result",
  NEXT_ROUND: "number-battle:next-round",
  TIMER: "number-battle:timer",
  GAME_OVER: "number-battle:game-over",
  REMATCH: "number-battle:rematch",
  REMATCH_REQUESTED: "number-battle:rematch-requested",
  REMATCH_STARTED: "number-battle:rematch-started",
  ERROR: "number-battle:error",
};

export function startNumberBattleSocket(socket, roomId) {
  if (!socket || !roomId) return;

  socket.emit(NUMBER_BATTLE_EVENTS.START, { roomId });
}

export function submitNumberBattleSocketAnswer(
  socket,
  { roomId, answer, elapsedSeconds }
) {
  if (!socket || !roomId) return;

  socket.emit(NUMBER_BATTLE_EVENTS.ANSWER, {
    roomId,
    answer,
    elapsedSeconds,
  });
}

export function requestNumberBattleNextRound(socket, roomId) {
  if (!socket || !roomId) return;

  socket.emit(NUMBER_BATTLE_EVENTS.NEXT_ROUND, { roomId });
}

export function requestNumberBattleRematch(socket, roomId) {
  if (!socket || !roomId) return;

  socket.emit(NUMBER_BATTLE_EVENTS.REMATCH, { roomId });
}

export function subscribeNumberBattle(socket, handlers = {}) {
  if (!socket) return () => {};

  const subscriptions = [
    [NUMBER_BATTLE_EVENTS.STATE, handlers.onState],
    [NUMBER_BATTLE_EVENTS.QUESTION, handlers.onQuestion],
    [NUMBER_BATTLE_EVENTS.ANSWER_RESULT, handlers.onAnswerResult],
    [NUMBER_BATTLE_EVENTS.ROUND_RESULT, handlers.onRoundResult],
    [NUMBER_BATTLE_EVENTS.TIMER, handlers.onTimer],
    [NUMBER_BATTLE_EVENTS.GAME_OVER, handlers.onGameOver],
    [NUMBER_BATTLE_EVENTS.REMATCH_REQUESTED, handlers.onRematchRequested],
    [NUMBER_BATTLE_EVENTS.REMATCH_STARTED, handlers.onRematchStarted],
    [NUMBER_BATTLE_EVENTS.ERROR, handlers.onError],
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
