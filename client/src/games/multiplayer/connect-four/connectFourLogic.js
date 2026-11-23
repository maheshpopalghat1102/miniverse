
export const ROWS = 6;
export const COLUMNS = 7;

export const PLAYERS = {
  RED: "red",
  YELLOW: "yellow",
};

export function createEmptyBoard() {
  return Array.from(
    { length: ROWS },
    () => Array(COLUMNS).fill(null)
  );
}

export function createInitialConnectFourState() {
  return {
    board: createEmptyBoard(),
    currentPlayer: PLAYERS.RED,
    status: "playing",
    winner: null,
    winningCells: [],
    moveCount: 0,
  };
}

export function isValidColumn(board, column) {
  return (
    Array.isArray(board) &&
    board.length === ROWS &&
    Number.isInteger(column) &&
    column >= 0 &&
    column < COLUMNS &&
    board[0][column] === null
  );
}

export function getAvailableRow(board, column) {
  if (!isValidColumn(board, column)) return -1;

  for (let row = ROWS - 1; row >= 0; row--) {
    if (board[row][column] === null) {
      return row;
    }
  }

  return -1;
}

export function checkWinningCells(board, row, column, player) {
  const directions = [
    [0, 1],  // Horizontal
    [1, 0],  // Vertical
    [1, 1],  // Diagonal down
    [1, -1], // Diagonal up
  ];

  for (const [rowDirection, columnDirection] of directions) {
    const cells = [[row, column]];

    for (const direction of [-1, 1]) {
      let nextRow = row + rowDirection * direction;
      let nextColumn = column + columnDirection * direction;

      while (
        nextRow >= 0 &&
        nextRow < ROWS &&
        nextColumn >= 0 &&
        nextColumn < COLUMNS &&
        board[nextRow][nextColumn] === player
      ) {
        cells.push([nextRow, nextColumn]);

        nextRow += rowDirection * direction;
        nextColumn += columnDirection * direction;
      }
    }

    if (cells.length >= 4) {
      return cells;
    }
  }

  return [];
}

export function isBoardFull(board) {
  return board.every((row) =>
    row.every((cell) => cell !== null)
  );
}

export function getNextPlayer(player) {
  return player === PLAYERS.RED
    ? PLAYERS.YELLOW
    : PLAYERS.RED;
}

export function dropDisc(state, column) {
  if (!state || state.status !== "playing") {
    throw new Error("The game is not active.");
  }

  if (!isValidColumn(state.board, column)) {
    throw new Error("This column is full or invalid.");
  }

  const board = state.board.map((row) => [...row]);
  const row = getAvailableRow(board, column);

  board[row][column] = state.currentPlayer;

  const winningCells = checkWinningCells(
    board,
    row,
    column,
    state.currentPlayer
  );

  if (winningCells.length > 0) {
    return {
      ...state,
      board,
      status: "won",
      winner: state.currentPlayer,
      winningCells,
      moveCount: state.moveCount + 1,
    };
  }

  if (isBoardFull(board)) {
    return {
      ...state,
      board,
      status: "draw",
      winner: null,
      winningCells: [],
      moveCount: state.moveCount + 1,
    };
  }

  return {
    ...state,
    board,
    currentPlayer: getNextPlayer(state.currentPlayer),
    moveCount: state.moveCount + 1,
  };
}
