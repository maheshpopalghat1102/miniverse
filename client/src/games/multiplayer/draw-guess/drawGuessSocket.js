
export const DRAW_GUESS_EVENTS = {
  START: "draw-guess:start",
  WORD: "draw-guess:word",
  STROKE: "draw-guess:stroke",
  CLEAR: "draw-guess:clear",
  GUESS: "draw-guess:guess",
  TIMER: "draw-guess:timer",
  STATE: "draw-guess:state",
  CORRECT: "draw-guess:correct",
  ROUND_END: "draw-guess:round-end",
  NEXT_ROUND: "draw-guess:next-round",
  GAME_OVER: "draw-guess:game-over",
  ERROR: "draw-guess:error",
};

const emitWithAck = (socket, event, payload) =>
  new Promise((resolve, reject) => {
    if (!socket?.connected) {
      reject(new Error("Socket is not connected."));
      return;
    }

    socket.timeout(10000).emit(
      event,
      payload,
      (timeoutError, response) => {
        if (timeoutError) {
          reject(new Error("Server did not respond in time."));
          return;
        }

        if (!response?.success) {
          reject(
            new Error(response?.message || "Game action failed.")
          );
          return;
        }

        resolve(response.data);
      }
    );
  });

export const startDrawGuessGame = (socket, payload) =>
  emitWithAck(socket, DRAW_GUESS_EVENTS.START, payload);

export const sendDrawGuessStroke = (socket, payload) =>
  emitWithAck(socket, DRAW_GUESS_EVENTS.STROKE, payload);

export const clearDrawGuessCanvas = (socket, payload) =>
  emitWithAck(socket, DRAW_GUESS_EVENTS.CLEAR, payload);

export const submitDrawGuess = (socket, payload) =>
  emitWithAck(socket, DRAW_GUESS_EVENTS.GUESS, payload);

export const requestNextDrawGuessRound = (socket, payload) =>
  emitWithAck(socket, DRAW_GUESS_EVENTS.NEXT_ROUND, payload);

export const subscribeDrawGuessEvents = (
  socket,
  handlers = {}
) => {
  if (!socket) return () => {};

  const events = [
    [DRAW_GUESS_EVENTS.STATE, handlers.onState],
    [DRAW_GUESS_EVENTS.WORD, handlers.onWord],
    [DRAW_GUESS_EVENTS.STROKE, handlers.onStroke],
    [DRAW_GUESS_EVENTS.CLEAR, handlers.onClear],
    [DRAW_GUESS_EVENTS.TIMER, handlers.onTimer],
    [DRAW_GUESS_EVENTS.CORRECT, handlers.onCorrect],
    [DRAW_GUESS_EVENTS.ROUND_END, handlers.onRoundEnd],
    [DRAW_GUESS_EVENTS.GAME_OVER, handlers.onGameOver],
    [DRAW_GUESS_EVENTS.ERROR, handlers.onError],
  ];

  events.forEach(([event, handler]) => {
    if (typeof handler === "function") {
      socket.on(event, handler);
    }
  });

  return () => {
    events.forEach(([event, handler]) => {
      if (typeof handler === "function") {
        socket.off(event, handler);
      }
    });
  };
};
