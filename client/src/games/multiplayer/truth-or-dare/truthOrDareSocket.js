
export const TRUTH_DARE_EVENTS = {
  START: "truth-or-dare:start",
  CHOOSE: "truth-or-dare:choose",
  PROMPT: "truth-or-dare:prompt",
  COMPLETE: "truth-or-dare:complete",
  SKIP: "truth-or-dare:skip",
  STATE: "truth-or-dare:state",
  ERROR: "truth-or-dare:error",
  PLAYER_TURN: "truth-or-dare:player-turn",
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
            new Error(
              response?.message || "Something went wrong."
            )
          );
          return;
        }

        resolve(response.data);
      }
    );
  });

export const startTruthDareGame = (socket, payload) =>
  emitWithAck(socket, TRUTH_DARE_EVENTS.START, payload);

export const chooseTruthOrDare = (socket, payload) =>
  emitWithAck(socket, TRUTH_DARE_EVENTS.CHOOSE, payload);

export const completeTruthDareTurn = (socket, payload) =>
  emitWithAck(socket, TRUTH_DARE_EVENTS.COMPLETE, payload);

export const skipTruthDarePrompt = (socket, payload) =>
  emitWithAck(socket, TRUTH_DARE_EVENTS.SKIP, payload);

export const subscribeTruthDareEvents = (
  socket,
  handlers = {}
) => {
  if (!socket) return () => {};

  const eventMap = [
    [TRUTH_DARE_EVENTS.STATE, handlers.onState],
    [TRUTH_DARE_EVENTS.PROMPT, handlers.onPrompt],
    [TRUTH_DARE_EVENTS.ERROR, handlers.onError],
    [TRUTH_DARE_EVENTS.PLAYER_TURN, handlers.onPlayerTurn],
  ];

  eventMap.forEach(([event, handler]) => {
    if (typeof handler === "function") {
      socket.on(event, handler);
    }
  });

  return () => {
    eventMap.forEach(([event, handler]) => {
      if (typeof handler === "function") {
        socket.off(event, handler);
      }
    });
  };
};
