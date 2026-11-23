
export const EMOJI_CHALLENGE_EVENTS = {
  START: "emoji-challenge:start",
  ANSWER: "emoji-challenge:answer",
  HINT: "emoji-challenge:hint",
  STATE: "emoji-challenge:state",
  QUESTION: "emoji-challenge:question",
  ANSWER_RESULT: "emoji-challenge:answer-result",
  ROUND_RESULT: "emoji-challenge:round-result",
  NEXT_ROUND: "emoji-challenge:next-round",
  GAME_OVER: "emoji-challenge:game-over",
  REMATCH: "emoji-challenge:rematch",
  REMATCH_REQUESTED: "emoji-challenge:rematch-requested",
  REMATCH_STARTED: "emoji-challenge:rematch-started",
  ERROR: "emoji-challenge:error",
};

export function startEmojiChallengeSocket(socket, roomId) {
  if (socket && roomId) {
    socket.emit(EMOJI_CHALLENGE_EVENTS.START, { roomId });
  }
}

export function submitEmojiChallengeSocketAnswer(
  socket,
  { roomId, answer }
) {
  if (!socket || !roomId) return;

  socket.emit(EMOJI_CHALLENGE_EVENTS.ANSWER, {
    roomId,
    answer,
  });
}

export function requestEmojiChallengeHint(socket, roomId) {
  if (socket && roomId) {
    socket.emit(EMOJI_CHALLENGE_EVENTS.HINT, { roomId });
  }
}

export function requestNextEmojiChallengeRound(socket, roomId) {
  if (socket && roomId) {
    socket.emit(EMOJI_CHALLENGE_EVENTS.NEXT_ROUND, { roomId });
  }
}

export function requestEmojiChallengeRematch(socket, roomId) {
  if (socket && roomId) {
    socket.emit(EMOJI_CHALLENGE_EVENTS.REMATCH, { roomId });
  }
}

export function subscribeEmojiChallenge(socket, handlers = {}) {
  if (!socket) return () => {};

  const events = [
    [EMOJI_CHALLENGE_EVENTS.STATE, handlers.onState],
    [EMOJI_CHALLENGE_EVENTS.QUESTION, handlers.onQuestion],
    [EMOJI_CHALLENGE_EVENTS.ANSWER_RESULT, handlers.onAnswerResult],
    [EMOJI_CHALLENGE_EVENTS.ROUND_RESULT, handlers.onRoundResult],
    [EMOJI_CHALLENGE_EVENTS.GAME_OVER, handlers.onGameOver],
    [EMOJI_CHALLENGE_EVENTS.REMATCH_REQUESTED, handlers.onRematchRequested],
    [EMOJI_CHALLENGE_EVENTS.REMATCH_STARTED, handlers.onRematchStarted],
    [EMOJI_CHALLENGE_EVENTS.ERROR, handlers.onError],
  ];

  events.forEach(([event, handler]) => {
    if (typeof handler === "function") socket.on(event, handler);
  });

  return () => {
    events.forEach(([event, handler]) => {
      if (typeof handler === "function") socket.off(event, handler);
    });
  };
}
