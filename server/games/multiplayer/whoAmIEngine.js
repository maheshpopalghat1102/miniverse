import { randomInt } from "node:crypto";

export const createInitialState = (players, identities) => {
  if (!Array.isArray(players) || players.length < 2 || players.length > 8) {
    throw new Error("Who Am I requires 2–8 players.");
  }

  if (!Array.isArray(identities) || identities.length < players.length) {
    throw new Error("Enough identities are required for all players.");
  }

  const available = [...identities];
  const assignments = {};

  for (const player of players) {
    const index = randomInt(available.length);
    assignments[String(player)] = available.splice(index, 1)[0];
  }

  return {
    gameId: "who-am-i",
    players: players.map(String),
    assignments,
    questions: [],
    guesses: {},
    currentTurnIndex: 0,
    maxQuestions: 20,
    status: "playing",
    winner: null,
  };
};

export const getPrivateIdentity = (state, userId) => {
  const id = String(userId);

  if (!state.players.includes(id)) throw new Error("Not a player.");

  return {
    identity: state.assignments[id],
  };
};

export const applyAction = (state, userId, action) => {
  const id = String(userId);

  if (state.status !== "playing") throw new Error("Game has ended.");
  if (!state.players.includes(id)) throw new Error("Not a player.");

  const next = structuredClone(state);

  if (action.type === "question") {
    const question = String(action.question || "").trim();

    if (!question || question.length > 200) {
      throw new Error("Enter a question of up to 200 characters.");
    }

    if (next.questions.length >= next.maxQuestions) {
      throw new Error("Question limit reached.");
    }

    next.questions.push({
      userId: id,
      question,
      answer: null,
    });

    return next;
  }

  if (action.type === "answer-question") {
    const questionIndex = Number(action.questionIndex);

    if (
      !Number.isInteger(questionIndex) ||
      !next.questions[questionIndex] ||
      typeof action.answer !== "boolean"
    ) {
      throw new Error("Invalid question answer.");
    }

    const question = next.questions[questionIndex];

    if (question.answer !== null) {
      throw new Error("Question already answered.");
    }

    if (question.userId === id) {
      throw new Error("You cannot answer your own question.");
    }

    question.answer = action.answer;
    question.answeredBy = id;

    return next;
  }

  if (action.type === "guess") {
    const guess = String(action.identity || "").trim().toLowerCase();

    if (!guess || guess.length > 100) {
      throw new Error("Enter a valid identity.");
    }

    const correct =
      guess === String(next.assignments[id]).trim().toLowerCase();

    next.guesses[id] = {
      correct,
      submittedAt: new Date().toISOString(),
    };

    if (correct) {
      next.status = "completed";
      next.winner = id;
    } else if (next.players.every((playerId) => next.guesses[playerId])) {
      next.status = "completed";
      next.winner = null;
    }

    return next;
  }

  throw new Error("Unknown Who Am I action.");
};

export const getPublicState = (state) => {
  const publicState = structuredClone(state);
  delete publicState.assignments;
  return publicState;
};

export const isFinished = (state) => state.status !== "playing";