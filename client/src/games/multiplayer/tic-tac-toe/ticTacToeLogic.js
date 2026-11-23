
export const EMPTY_BOARD = Array(9).fill(null);

export const WINNING_COMBINATIONS = [
  [0, 1, 2],
  [3, 4, 5],
  [6, 7, 8],
  [0, 3, 6],
  [1, 4, 7],
  [2, 5, 8],
  [0, 4, 8],
  [2, 4, 6],
];

export function getWinner(board) {
  if (!Array.isArray(board) || board.length !== 9) return null;

  for (const combination of WINNING_COMBINATIONS) {
    const [a, b, c] = combination;

    if (
      board[a] &&
      board[a] === board[b] &&
      board[a] === board[c]
    ) {
      return {
        player: board[a],
        combination,
      };
    }
  }

  return null;
}

export function isDraw(board) {
  return (
    Array.isArray(board) &&
    board.length === 9 &&
    board.every((cell) => cell !== null) &&
    !getWinner(board)
  );
}

export function isValidMove(board, index, gameOver = false) {
  return (
    Array.isArray(board) &&
    board.length === 9 &&
    Number.isInteger(index) &&
    index >= 0 &&
    index < 9 &&
    board[index] === null &&
    !gameOver
  );
}

export function makeMove(board, index, player) {
  if (!["X", "O"].includes(player)) {
    throw new Error("Player must be X or O.");
  }

  if (!isValidMove(board, index)) {
    throw new Error("Invalid move.");
  }

  const updatedBoard = [...board];
  updatedBoard[index] = player;

  return updatedBoard;
}

export function getGameStatus(board) {
  const winner = getWinner(board);

  if (winner) {
    return {
      status: "won",
      winner: winner.player,
      winningCombination: winner.combination,
    };
  }

  if (isDraw(board)) {
    return {
      status: "draw",
      winner: null,
      winningCombination: [],
    };
  }

  return {
    status: "playing",
    winner: null,
    winningCombination: [],
  };
}

export function getNextPlayer(currentPlayer) {
  return currentPlayer === "X" ? "O" : "X";
}

export function createInitialGameState() {
  return {
    board: [...EMPTY_BOARD],
    currentPlayer: "X",
    status: "playing",
    winner: null,
    winningCombination: [],
    moveCount: 0,
  };
}

export function applyMove(gameState, index) {
  if (!gameState || gameState.status !== "playing") {
    throw new Error("The game is not currently active.");
  }

  const board = makeMove(
    gameState.board,
    index,
    gameState.currentPlayer
  );

  const result = getGameStatus(board);

  return {
    board,
    currentPlayer:
      result.status === "playing"
        ? getNextPlayer(gameState.currentPlayer)
        : gameState.currentPlayer,
    status: result.status,
    winner: result.winner,
    winningCombination: result.winningCombination,
    moveCount: gameState.moveCount + 1,
  };
}
