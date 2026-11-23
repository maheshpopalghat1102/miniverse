const ROWS = 6;
const COLS = 7;

const hasFour = (board, row, col, player) => {
  const directions = [[0, 1], [1, 0], [1, 1], [1, -1]];

  return directions.some(([dr, dc]) => {
    let count = 1;

    for (const direction of [-1, 1]) {
      let r = row + dr * direction;
      let c = col + dc * direction;

      while (
        r >= 0 && r < ROWS &&
        c >= 0 && c < COLS &&
        board[r][c] === player
      ) {
        count++;
        r += dr * direction;
        c += dc * direction;
      }
    }

    return count >= 4;
  });
};

export const createInitialState = (players) => {
  if (!Array.isArray(players) || players.length !== 2) {
    throw new Error("Connect Four requires exactly 2 players.");
  }

  return {
    gameId: "connect-four",
    players: players.map(String),
    board: Array.from({ length: ROWS }, () => Array(COLS).fill(null)),
    currentTurn: String(players[0]),
    status: "playing",
    winner: null,
    moves: 0,
  };
};

export const applyAction = (state, userId, action) => {
  const id = String(userId);

  if (state.status !== "playing") throw new Error("Game has ended.");
  if (state.currentTurn !== id) throw new Error("Not your turn.");

  const col = Number(action.column);

  if (!Number.isInteger(col) || col < 0 || col >= COLS) {
    throw new Error("Invalid column.");
  }

  const next = structuredClone(state);
  let row = -1;

  for (let r = ROWS - 1; r >= 0; r--) {
    if (next.board[r][col] === null) {
      row = r;
      break;
    }
  }

  if (row === -1) throw new Error("That column is full.");

  next.board[row][col] = id;
  next.moves += 1;

  if (hasFour(next.board, row, col, id)) {
    next.status = "completed";
    next.winner = id;
  } else if (next.moves === ROWS * COLS) {
    next.status = "draw";
  } else {
    next.currentTurn = next.players.find((player) => player !== id);
  }

  return next;
};

export const getPublicState = (state) => structuredClone(state);

export const isFinished = (state) => state.status !== "playing";