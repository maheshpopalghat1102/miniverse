const WIN_LINES = [
  [0, 1, 2], [3, 4, 5], [6, 7, 8],
  [0, 3, 6], [1, 4, 7], [2, 5, 8],
  [0, 4, 8], [2, 4, 6],
];

export const createInitialState = (players) => {
  if (!Array.isArray(players) || players.length !== 2) {
    throw new Error("Tic Tac Toe requires exactly 2 players.");
  }

  return {
    gameId: "tic-tac-toe",
    players: players.map((id) => String(id)),
    symbols: {
      [players[0]]: "X",
      [players[1]]: "O",
    },
    board: Array(9).fill(null),
    currentTurn: String(players[0]),
    status: "playing",
    winner: null,
    moves: 0,
  };
};

export const applyAction = (state, userId, action) => {
  if (state.status !== "playing") throw new Error("Game has ended.");
  if (String(userId) !== state.currentTurn) throw new Error("Not your turn.");

  const index = Number(action.index);

  if (!Number.isInteger(index) || index < 0 || index > 8) {
    throw new Error("Invalid board position.");
  }

  if (state.board[index] !== null) {
    throw new Error("That position is already occupied.");
  }

  const next = structuredClone(state);
  next.board[index] = next.symbols[String(userId)];
  next.moves += 1;

  const winningLine = WIN_LINES.find(([a, b, c]) =>
    next.board[a] &&
    next.board[a] === next.board[b] &&
    next.board[b] === next.board[c]
  );

  if (winningLine) {
    next.status = "completed";
    next.winner = String(userId);
  } else if (next.moves === 9) {
    next.status = "draw";
  } else {
    next.currentTurn = next.players.find((id) => id !== String(userId));
  }

  return next;
};

export const getPublicState = (state) => structuredClone(state);

export const isFinished = (state) => state.status !== "playing";