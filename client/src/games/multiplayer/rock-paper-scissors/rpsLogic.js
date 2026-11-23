
export const RPS_CHOICES = ["rock", "paper", "scissors"];

export const RPS_RULES = {
  rock: "scissors",
  paper: "rock",
  scissors: "paper",
};

export const RPS_LABELS = {
  rock: "Rock",
  paper: "Paper",
  scissors: "Scissors",
};

export const RPS_ICONS = {
  rock: "✊",
  paper: "✋",
  scissors: "✌️",
};

export function isValidChoice(choice) {
  return RPS_CHOICES.includes(choice);
}

export function getRoundWinner(choiceX, choiceO) {
  if (!isValidChoice(choiceX) || !isValidChoice(choiceO)) {
    throw new Error("Both players must make a valid choice.");
  }

  if (choiceX === choiceO) {
    return "draw";
  }

  return RPS_RULES[choiceX] === choiceO ? "X" : "O";
}

export function getTargetWins(bestOf = 3) {
  if (![3, 5, 7].includes(bestOf)) {
    throw new Error("Match format must be best of 3, 5, or 7.");
  }

  return Math.ceil(bestOf / 2);
}

export function createInitialRPSState(bestOf = 3) {
  getTargetWins(bestOf);

  return {
    choices: {
      X: null,
      O: null,
    },
    scores: {
      X: 0,
      O: 0,
      draws: 0,
    },
    round: 1,
    bestOf,
    targetWins: getTargetWins(bestOf),
    roundWinner: null,
    matchWinner: null,
    status: "playing",
  };
}

export function resolveRound(state, choiceX, choiceO) {
  if (!state || state.status !== "playing") {
    throw new Error("The match is not active.");
  }

  const winner = getRoundWinner(choiceX, choiceO);

  const scores = { ...state.scores };

  if (winner === "X") scores.X += 1;
  if (winner === "O") scores.O += 1;
  if (winner === "draw") scores.draws += 1;

  let matchWinner = null;

  if (scores.X >= state.targetWins) matchWinner = "X";
  if (scores.O >= state.targetWins) matchWinner = "O";

  return {
    ...state,
    choices: {
      X: choiceX,
      O: choiceO,
    },
    scores,
    roundWinner: winner,
    matchWinner,
    status: matchWinner ? "finished" : "round-finished",
  };
}

export function startNextRound(state) {
  if (!state || state.status !== "round-finished") {
    throw new Error("The current round has not finished.");
  }

  return {
    ...state,
    choices: {
      X: null,
      O: null,
    },
    round: state.round + 1,
    roundWinner: null,
    status: "playing",
  };
}

export function getRoundMessage(winner) {
  if (winner === "draw") return "It's a draw!";
  if (winner === "X") return "Player X wins this round!";
  if (winner === "O") return "Player O wins this round!";

  return "Make your choice!";
}
