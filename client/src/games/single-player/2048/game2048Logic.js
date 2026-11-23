
export const GAME_2048_CONFIG = {
  SIZE: 4,
  TARGET_TILE: 2048,
  NEW_TILE_CHANCE: 0.9,
};

export function createEmptyBoard() {
  return Array.from(
    { length: GAME_2048_CONFIG.SIZE },
    () => Array(GAME_2048_CONFIG.SIZE).fill(0)
  );
}

export function cloneBoard(board) {
  return board.map((row) => [...row]);
}

export function getEmptyCells(board) {
  const emptyCells = [];

  board.forEach((row, rowIndex) => {
    row.forEach((value, colIndex) => {
      if (value === 0) {
        emptyCells.push({
          row: rowIndex,
          col: colIndex,
        });
      }
    });
  });

  return emptyCells;
}

export function addRandomTile(board) {
  const emptyCells = getEmptyCells(board);

  if (!emptyCells.length) return board;

  const randomIndex = Math.floor(
    Math.random() * emptyCells.length
  );

  const { row, col } = emptyCells[randomIndex];

  const nextBoard = cloneBoard(board);

  nextBoard[row][col] =
    Math.random() < GAME_2048_CONFIG.NEW_TILE_CHANCE ? 2 : 4;

  return nextBoard;
}

export function createInitial2048State() {
  let board = createEmptyBoard();

  board = addRandomTile(board);
  board = addRandomTile(board);

  return {
    board,
    score: 0,
    bestScore: 0,
    status: "playing",
    hasWon: false,
    keepPlaying: false,
    moves: 0,
  };
}

function slideAndMergeLine(line) {
  const filtered = line.filter((value) => value !== 0);
  const merged = [];
  let points = 0;

  for (let index = 0; index < filtered.length; index += 1) {
    if (filtered[index] === filtered[index + 1]) {
      const combined = filtered[index] * 2;

      merged.push(combined);
      points += combined;
      index += 1;
    } else {
      merged.push(filtered[index]);
    }
  }

  while (merged.length < GAME_2048_CONFIG.SIZE) {
    merged.push(0);
  }

  return {
    line: merged,
    points,
  };
}

export function moveLeft(board) {
  let totalPoints = 0;

  const nextBoard = board.map((row) => {
    const result = slideAndMergeLine(row);
    totalPoints += result.points;

    return result.line;
  });

  return {
    board: nextBoard,
    points: totalPoints,
  };
}

export function moveRight(board) {
  let totalPoints = 0;

  const nextBoard = board.map((row) => {
    const result = slideAndMergeLine([...row].reverse());
    totalPoints += result.points;

    return result.line.reverse();
  });

  return {
    board: nextBoard,
    points: totalPoints,
  };
}

export function moveUp(board) {
  const nextBoard = createEmptyBoard();
  let totalPoints = 0;

  for (let col = 0; col < GAME_2048_CONFIG.SIZE; col += 1) {
    const column = board.map((row) => row[col]);
    const result = slideAndMergeLine(column);

    totalPoints += result.points;

    result.line.forEach((value, row) => {
      nextBoard[row][col] = value;
    });
  }

  return {
    board: nextBoard,
    points: totalPoints,
  };
}

export function moveDown(board) {
  const nextBoard = createEmptyBoard();
  let totalPoints = 0;

  for (let col = 0; col < GAME_2048_CONFIG.SIZE; col += 1) {
    const column = board
      .map((row) => row[col])
      .reverse();

    const result = slideAndMergeLine(column);

    totalPoints += result.points;

    result.line.reverse().forEach((value, row) => {
      nextBoard[row][col] = value;
    });
  }

  return {
    board: nextBoard,
    points: totalPoints,
  };
}

export function boardsAreEqual(first, second) {
  return first.every((row, rowIndex) =>
    row.every(
      (value, colIndex) =>
        value === second[rowIndex][colIndex]
    )
  );
}

export function canMove2048(board) {
  if (getEmptyCells(board).length > 0) return true;

  for (let row = 0; row < GAME_2048_CONFIG.SIZE; row += 1) {
    for (let col = 0; col < GAME_2048_CONFIG.SIZE; col += 1) {
      const current = board[row][col];

      if (
        col < GAME_2048_CONFIG.SIZE - 1 &&
        current === board[row][col + 1]
      ) {
        return true;
      }

      if (
        row < GAME_2048_CONFIG.SIZE - 1 &&
        current === board[row + 1][col]
      ) {
        return true;
      }
    }
  }

  return false;
}

export function hasReached2048(board) {
  return board.some((row) =>
    row.some((value) => value >= GAME_2048_CONFIG.TARGET_TILE)
  );
}

export function make2048Move(state, direction) {
  if (
    state.status === "game-over" ||
    state.status === "won" ||
    state.status === "paused"
  ) {
    return state;
  }

  const movementFunctions = {
    left: moveLeft,
    right: moveRight,
    up: moveUp,
    down: moveDown,
  };

  const movement = movementFunctions[direction];

  if (!movement) return state;

  const result = movement(state.board);

  if (boardsAreEqual(state.board, result.board)) {
    return state;
  }

  const nextBoard = addRandomTile(result.board);
  const nextScore = state.score + result.points;
  const reachedTarget = hasReached2048(nextBoard);

  const nextState = {
    ...state,
    board: nextBoard,
    score: nextScore,
    bestScore: Math.max(state.bestScore || 0, nextScore),
    moves: state.moves + 1,
    hasWon: state.hasWon || reachedTarget,
  };

  if (reachedTarget && !state.keepPlaying) {
    return {
      ...nextState,
      status: "won",
    };
  }

  if (!canMove2048(nextBoard)) {
    return {
      ...nextState,
      status: "game-over",
    };
  }

  return nextState;
}

export function continue2048AfterWin(state) {
  if (state.status !== "won") return state;

  return {
    ...state,
    status: "playing",
    keepPlaying: true,
  };
}

export function pause2048Game(state) {
  if (state.status !== "playing") return state;

  return {
    ...state,
    status: "paused",
  };
}

export function resume2048Game(state) {
  if (state.status !== "paused") return state;

  return {
    ...state,
    status: "playing",
  };
}

export function reset2048Game(bestScore = 0) {
  return {
    ...createInitial2048State(),
    bestScore,
  };
}
