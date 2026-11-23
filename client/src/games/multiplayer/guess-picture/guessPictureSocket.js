
export const GUESS_PICTURE_EVENTS = {
  START: "guess-picture:start",
  ANSWER: "guess-picture:answer",
  HINT: "guess-picture:hint",
  NEXT: "guess-picture:next",
  STATE: "guess-picture:state",
  QUESTION: "guess-picture:question",
  RESULT: "guess-picture:result",
  ERROR: "guess-picture:error",
  GAME_OVER: "guess-picture:game-over",
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

export const startGuessPictureGame = (socket, payload) =>
  emitWithAck(socket, GUESS_PICTURE_EVENTS.START, payload);

export const submitGuessPictureAnswer = (socket, payload) =>
  emitWithAck(socket, GUESS_PICTURE_EVENTS.ANSWER, payload);

export const requestGuessPictureHint = (socket, payload) =>
  emitWithAck(socket, GUESS_PICTURE_EVENTS.HINT, payload);

export const requestNextPictureQuestion = (socket, payload) =>
  emitWithAck(socket, GUESS_PICTURE_EVENTS.NEXT, payload);

export const subscribeGuessPictureEvents = (
  socket,
  handlers = {}
) => {
  if (!socket) return () => {};

  const events = [
    [GUESS_PICTURE_EVENTS.STATE, handlers.onState],
    [GUESS_PICTURE_EVENTS.QUESTION, handlers.onQuestion],
    [GUESS_PICTURE_EVENTS.RESULT, handlers.onResult],
    [GUESS_PICTURE_EVENTS.ERROR, handlers.onError],
    [GUESS_PICTURE_EVENTS.GAME_OVER, handlers.onGameOver],
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
