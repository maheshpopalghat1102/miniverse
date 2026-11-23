
export const NUMBER_PUZZLE_CONFIG = {
  DEFAULT_SIZE: 4,
  SHUFFLE_MOVES: 150,
};

export function createSolvedPuzzle(size = NUMBER_PUZZLE_CONFIG.DEFAULT_SIZE) {
  const total = size * size;

  return Array.from({ length: total }, (_, index) =>
    index === total - 1 ? 0 : index + 1
  );
}

export function getPuzzleNeighbors(blankIndex, size) {
  const row = Math.floor(blankIndex / size);
  const col = blankIndex % size;

  const neighbors = [];

  if (row > 0) neighbors.push(blankIndex - size);
  if (row < size - 1) neighbors.push(blankIndex + size);
  if (col > 0) neighbors.push(blankIndex - 1);
  if (col < size - 1) neighbors.push(blankIndex + 1);

  return neighbors;
}

export function shufflePuzzleBoard(
  size = NUMBER_PUZZLE_CONFIG.DEFAULT_SIZE,
  steps = NUMBER_PUZZLE_CONFIG.SHUFFLE_MOVES
) {
  const board = createSolvedPuzzle(size);

  let blankIndex = board.length - 1;
  let previousBlankIndex = -1;

  for (let step = 0; step < steps; step += 1) {
    let neighbors = getPuzzleNeighbors(blankIndex, size);

    const available = neighbors.filter(
      (index) => index !== previousBlankIndex
    );

    if (available.length > 0) {
      neighbors = available;
    }

    const nextIndex =
      neighbors[Math.floor(Math.random() * neighbors.length)];

    [board[blankIndex], board[nextIndex]] = [
      board[nextIndex],
      board[blankIndex],
    ];

    previousBlankIndex = blankIndex;
    blankIndex = nextIndex;
  }

  return board;
}

export function createInitialPuzzleState(size = NUMBER_PUZZLE_CONFIG.DEFAULT_SIZE) {
  return {
    size,
    board: shufflePuzzleBoard(size),
    moves: 0,
    status: "playing",
    startedAt: Date.now(),
    completedAt: null,
  };
}

export function isPuzzleSolved(board, size) {
  const solved = createSolvedPuzzle(size);

  return board.every(
    (value, index) => value === solved[index]
  );
}

export function movePuzzleTile(state, tileIndex) {
  if (state.status !== "playing") return state;

  const blankIndex = state.board.indexOf(0);

  if (blankIndex === -1) return state;

  const neighbors = getPuzzleNeighbors(blankIndex, state.size);

  if (!neighbors.includes(tileIndex)) {
    return state;
  }

  const nextBoard = [...state.board];

  [nextBoard[blankIndex], nextBoard[tileIndex]] = [
    nextBoard[tileIndex],
    nextBoard[blankIndex],
  ];

  const solved = isPuzzleSolved(nextBoard, state.size);

  return {
    ...state,
    board: nextBoard,
    moves: state.moves + 1,
    status: solved ? "won" : "playing",
    completedAt: solved ? Date.now() : null,
  };
}

export function movePuzzleDirection(state, direction) {
  if (state.status !== "playing") return state;

  const blankIndex = state.board.indexOf(0);
  const row = Math.floor(blankIndex / state.size);
  const col = blankIndex % state.size;

  let targetIndex = -1;

  switch (direction) {
    case "up":
      if (row > 0) targetIndex = blankIndex - state.size;
      break;

    case "down":
      if (row < state.size - 1) {
        targetIndex = blankIndex + state.size;
      }
      break;

    case "left":
      if (col > 0) targetIndex = blankIndex - 1;
      break;

    case "right":
      if (col < state.size - 1) {
        targetIndex = blankIndex + 1;
      }
      break;

    default:
      return state;
  }

  if (targetIndex === -1) return state;

  return movePuzzleTile(state, targetIndex);
}

export function resetNumberPuzzle(size = NUMBER_PUZZLE_CONFIG.DEFAULT_SIZE) {
  return createInitialPuzzleState(size);
}

export function getPuzzleElapsedSeconds(startedAt, completedAt) {
  if (!startedAt) return 0;

  return Math.max(
    0,
    Math.floor(
      ((completedAt || Date.now()) - startedAt) / 1000
    )
  );
}

export function formatPuzzleTime(seconds) {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;

  return `${String(minutes).padStart(2, "0")}:${String(
    remainingSeconds
  ).padStart(2, "0")}`;
}
