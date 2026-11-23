
export const STORY_BUILDER_EVENTS = {
  START: "story-builder:start",
  ADD_ENTRY: "story-builder:add-entry",
  STATE: "story-builder:state",
  PROMPT: "story-builder:prompt",
  ENTRY_ADDED: "story-builder:entry-added",
  TURN_CHANGED: "story-builder:turn-changed",
  GAME_OVER: "story-builder:game-over",
  REMATCH: "story-builder:rematch",
  REMATCH_REQUESTED: "story-builder:rematch-requested",
  REMATCH_STARTED: "story-builder:rematch-started",
  ERROR: "story-builder:error",
};

export function startStoryBuilderSocket(socket, roomId) {
  if (socket && roomId) {
    socket.emit(STORY_BUILDER_EVENTS.START, { roomId });
  }
}

export function submitStoryEntrySocket(
  socket,
  { roomId, sentence }
) {
  if (!socket || !roomId) return;

  socket.emit(STORY_BUILDER_EVENTS.ADD_ENTRY, {
    roomId,
    sentence,
  });
}

export function requestStoryBuilderRematch(socket, roomId) {
  if (socket && roomId) {
    socket.emit(STORY_BUILDER_EVENTS.REMATCH, { roomId });
  }
}

export function subscribeStoryBuilder(socket, handlers = {}) {
  if (!socket) return () => {};

  const subscriptions = [
    [STORY_BUILDER_EVENTS.STATE, handlers.onState],
    [STORY_BUILDER_EVENTS.PROMPT, handlers.onPrompt],
    [STORY_BUILDER_EVENTS.ENTRY_ADDED, handlers.onEntryAdded],
    [STORY_BUILDER_EVENTS.TURN_CHANGED, handlers.onTurnChanged],
    [STORY_BUILDER_EVENTS.GAME_OVER, handlers.onGameOver],
    [STORY_BUILDER_EVENTS.REMATCH_REQUESTED, handlers.onRematchRequested],
    [STORY_BUILDER_EVENTS.REMATCH_STARTED, handlers.onRematchStarted],
    [STORY_BUILDER_EVENTS.ERROR, handlers.onError],
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
