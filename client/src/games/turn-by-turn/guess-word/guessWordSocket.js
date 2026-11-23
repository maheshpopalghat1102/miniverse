
export const GUESS_WORD_EVENTS = {
  START: "guess-word:start",
  GUESS: "guess-word:guess",
  HINT: "guess-word:hint",
  STATE: "guess-word:state",
  WORD: "guess-word:word",
  GUESS_RESULT: "guess-word:guess-result",
  ROUND_RESULT: "guess-word:round-result",
  NEXT_ROUND: "guess-word:next-round",
  GAME_OVER: "guess-word:game-over",
  REMATCH: "guess-word:rematch",
  REMATCH_REQUESTED: "guess-word:rematch-requested",
  REMATCH_STARTED: "guess-word:rematch-started",
  ERROR: "guess-word:error",
};

export function startGuessWordSocket(socket, roomId) {
  if (!socket || !roomId) return;

  socket.emit(GUESS_WORD_EVENTS.START, { roomId });
}

export function submitGuessWordSocket(
  socket,
  { roomId, guess }
) {
  if (!socket || !roomId) return;

  socket.emit(GUESS_WORD_EVENTS.GUESS, {
    roomId,
    guess,
  });
}

export function requestGuessWordHint(socket, roomId) {
  if (!socket || !roomId) return;

  socket.emit(GUESS_WORD_EVENTS.HINT, { roomId });
}

export function requestNextGuessWordRound(socket, roomId) {
  if (!socket || !roomId) return;

  socket.emit(GUESS_WORD_EVENTS.NEXT_ROUND, { roomId });
}

export function requestGuessWordRematch(socket, roomId) {
  if (!socket || !roomId) return;

  socket.emit(GUESS_WORD_EVENTS.REMATCH, { roomId });
}

export function subscribeGuessWord(socket, handlers = {}) {
  if (!socket) return () => {};

  const subscriptions = [
    [GUESS_WORD_EVENTS.STATE, handlers.onState],
    [GUESS_WORD_EVENTS.WORD, handlers.onWord],
    [GUESS_WORD_EVENTS.GUESS_RESULT, handlers.onGuessResult],
    [GUESS_WORD_EVENTS.ROUND_RESULT, handlers.onRoundResult],
    [GUESS_WORD_EVENTS.GAME_OVER, handlers.onGameOver],
    [GUESS_WORD_EVENTS.REMATCH_REQUESTED, handlers.onRematchRequested],
    [GUESS_WORD_EVENTS.REMATCH_STARTED, handlers.onRematchStarted],
    [GUESS_WORD_EVENTS.ERROR, handlers.onError],
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
