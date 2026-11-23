const VALID_CHOICES = ["rock", "paper", "scissors"];

const getWinner = (first, second) => {
  if (first === second) return "draw";

  const wins = {
    rock: "scissors",
    paper: "rock",
    scissors: "paper",
  };

  return wins[first] === second ? "first" : "second";
};

export const createInitialState = (players, rounds = 3) => {
  if (!Array.isArray(players) || players.length !== 2) {
    throw new Error("Rock Paper Scissors requires 2 players.");
  }

  return {
    gameId: "rock-paper-scissors",
    players: players.map(String),
    totalRounds: Math.max(1, Math.min(Number(rounds) || 3, 10)),
    currentRound: 1,
    choices: {},
    scores: Object.fromEntries(players.map((id) => [String(id), 0])),
    history: [],
    status: "playing",
    winner: null,
  };
};

export const applyAction = (state, userId, action) => {
  const id = String(userId);

  if (state.status !== "playing") throw new Error("Game has ended.");
  if (!state.players.includes(id)) throw new Error("Not a player.");
  if (!VALID_CHOICES.includes(action.choice)) throw new Error("Invalid choice.");
  if (state.choices[id]) throw new Error("You have already chosen this round.");

  const next = structuredClone(state);
  next.choices[id] = action.choice;

  if (Object.keys(next.choices).length === 2) {
    const [first, second] = next.players;
    const result = getWinner(next.choices[first], next.choices[second]);

    if (result === "first") next.scores[first] += 1;
    if (result === "second") next.scores[second] += 1;

    next.history.push({
      round: next.currentRound,
      choices: { ...next.choices },
      result,
    });

    if (next.currentRound >= next.totalRounds) {
      next.status = "completed";

      if (next.scores[first] > next.scores[second]) next.winner = first;
      else if (next.scores[second] > next.scores[first]) next.winner = second;
      else next.winner = null;
    } else {
      next.currentRound += 1;
      next.choices = {};
    }
  }

  return next;
};

export const getPublicState = (state) => {
  const publicState = structuredClone(state);

  if (Object.keys(state.choices).length < 2) {
    publicState.choices = Object.fromEntries(
      Object.keys(state.choices).map((id) => [id, "submitted"])
    );
  }

  return publicState;
};

export const isFinished = (state) => state.status !== "playing";