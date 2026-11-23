
export const WHO_AM_I_EVENTS = {
  START: "who-am-i:start",
  IDENTITY: "who-am-i:identity",
  CLUE: "who-am-i:clue",
  REVEAL_CLUE: "who-am-i:reveal-clue",
  GUESS: "who-am-i:guess",
  RESULT: "who-am-i:result",
  STATE: "who-am-i:state",
  NEXT_ROUND: "who-am-i:next-round",
  ROUND_END: "who-am-i:round-end",
  GAME_OVER: "who-am-i:game-over",
  ERROR: "who-am-i:error",
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

export const startWhoAmIGame = (socket, payload) =>
  emitWithAck(socket, WHO_AM_I_EVENTS.START, payload);

export const revealWhoAmIClue = (socket, payload) =>
  emitWithAck(socket, WHO_AM_I_EVENTS.REVEAL_CLUE, payload);

export const submitWhoAmIGuess = (socket, payload) =>
  emitWithAck(socket, WHO_AM_I_EVENTS.GUESS, payload);

export const requestNextWhoAmIRound = (socket, payload) =>
  emitWithAck(socket, WHO_AM_I_EVENTS.NEXT_ROUND, payload);

export const subscribeWhoAmIEvents = (
  socket,
  handlers = {}
) => {
  if (!socket) return () => {};

  const events = [
    [WHO_AM_I_EVENTS.STATE, handlers.onState],
    [WHO_AM_I_EVENTS.IDENTITY, handlers.onIdentity],
    [WHO_AM_I_EVENTS.CLUE, handlers.onClue],
    [WHO_AM_I_EVENTS.RESULT, handlers.onResult],
    [WHO_AM_I_EVENTS.ROUND_END, handlers.onRoundEnd],
    [WHO_AM_I_EVENTS.GAME_OVER, handlers.onGameOver],
    [WHO_AM_I_EVENTS.ERROR, handlers.onError],
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
