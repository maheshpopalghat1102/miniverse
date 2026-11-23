export const getCurrentPlayer = (state) => {
  if (!state || !Array.isArray(state.players) || !state.players.length) {
    throw new Error("Invalid player state.");
  }

  if (state.currentTurn) {
    return String(state.currentTurn);
  }

  if (Number.isInteger(state.currentTurnIndex)) {
    const player = state.players[state.currentTurnIndex];

    if (player === undefined) {
      throw new Error("Invalid turn index.");
    }

    return String(player);
  }

  throw new Error("This game does not use a standard turn system.");
};

export const isPlayersTurn = (state, userId) => {
  return getCurrentPlayer(state) === String(userId);
};

export const validateTurn = (state, userId) => {
  if (!isPlayersTurn(state, userId)) {
    throw new Error("It is not your turn.");
  }

  return true;
};

export const getNextPlayer = (state) => {
  if (!Array.isArray(state.players) || state.players.length < 2) {
    throw new Error("At least two players are required.");
  }

  if (Number.isInteger(state.currentTurnIndex)) {
    const nextIndex = (state.currentTurnIndex + 1) % state.players.length;
    return String(state.players[nextIndex]);
  }

  if (state.currentTurn) {
    const currentIndex = state.players.findIndex(
      (player) => String(player) === String(state.currentTurn)
    );

    if (currentIndex === -1) {
      throw new Error("Current player not found.");
    }

    return String(
      state.players[(currentIndex + 1) % state.players.length]
    );
  }

  throw new Error("This game does not use a standard turn system.");
};

export const advanceTurn = (state) => {
  if (!Array.isArray(state.players) || state.players.length < 2) {
    throw new Error("At least two players are required.");
  }

  const next = structuredClone(state);

  if (Number.isInteger(next.currentTurnIndex)) {
    next.currentTurnIndex =
      (next.currentTurnIndex + 1) % next.players.length;

    return next;
  }

  if (next.currentTurn) {
    next.currentTurn = getNextPlayer(next);
    return next;
  }

  throw new Error("This game does not use a standard turn system.");
};

export const setCurrentPlayer = (state, userId) => {
  const id = String(userId);

  if (!state.players.some((player) => String(player) === id)) {
    throw new Error("Player is not part of this game.");
  }

  const next = structuredClone(state);

  if (Number.isInteger(next.currentTurnIndex)) {
    next.currentTurnIndex = next.players.findIndex(
      (player) => String(player) === id
    );
  } else {
    next.currentTurn = id;
  }

  return next;
};