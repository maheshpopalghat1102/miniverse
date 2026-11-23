
export const GAME_IDS = Object.freeze({
  // Multiplayer
  TIC_TAC_TOE: "tic-tac-toe",
  ROCK_PAPER_SCISSORS: "rock-paper-scissors",
  CONNECT_FOUR: "connect-four",
  GUESS_THE_NUMBER: "guess-the-number",
  WORD_BATTLE: "word-battle",
  QUIZ_BATTLE: "quiz-battle",
  EMOJI_GUESS: "emoji-guess",
  TRUTH_OR_DARE: "truth-or-dare",
  GUESS_THE_PICTURE: "guess-the-picture",
  DRAW_AND_GUESS: "draw-and-guess",
  WHO_AM_I: "who-am-i",
  NUMBER_BATTLE: "number-battle",

  // Single-player
  SNAKE: "snake",
  GAME_2048: "2048",
  MEMORY_MATCH: "memory-match",
  NUMBER_PUZZLE: "number-puzzle",

  // Turn-by-turn
  COUPLE_QUIZ: "couple-quiz",
  GUESS_THE_WORD: "guess-the-word",
  EMOJI_CHALLENGE: "emoji-challenge",
  STORY_BUILDER: "story-builder",
});

export const MULTIPLAYER_GAME_IDS = Object.freeze([
  GAME_IDS.TIC_TAC_TOE,
  GAME_IDS.ROCK_PAPER_SCISSORS,
  GAME_IDS.CONNECT_FOUR,
  GAME_IDS.GUESS_THE_NUMBER,
  GAME_IDS.WORD_BATTLE,
  GAME_IDS.QUIZ_BATTLE,
  GAME_IDS.EMOJI_GUESS,
  GAME_IDS.TRUTH_OR_DARE,
  GAME_IDS.GUESS_THE_PICTURE,
  GAME_IDS.DRAW_AND_GUESS,
  GAME_IDS.WHO_AM_I,
  GAME_IDS.NUMBER_BATTLE,
]);

export const SINGLE_PLAYER_GAME_IDS = Object.freeze([
  GAME_IDS.SNAKE,
  GAME_IDS.GAME_2048,
  GAME_IDS.MEMORY_MATCH,
  GAME_IDS.NUMBER_PUZZLE,
]);

export const TURN_BY_TURN_GAME_IDS = Object.freeze([
  GAME_IDS.COUPLE_QUIZ,
  GAME_IDS.GUESS_THE_WORD,
  GAME_IDS.EMOJI_CHALLENGE,
  GAME_IDS.STORY_BUILDER,
]);

export const ALL_GAME_IDS = Object.freeze([
  ...MULTIPLAYER_GAME_IDS,
  ...SINGLE_PLAYER_GAME_IDS,
  ...TURN_BY_TURN_GAME_IDS,
]);

export const isValidGameId = (gameId) => {
  return ALL_GAME_IDS.includes(gameId);
};

export const getGameCategory = (gameId) => {
  if (MULTIPLAYER_GAME_IDS.includes(gameId)) {
    return "multiplayer";
  }

  if (SINGLE_PLAYER_GAME_IDS.includes(gameId)) {
    return "single-player";
  }

  if (TURN_BY_TURN_GAME_IDS.includes(gameId)) {
    return "turn-by-turn";
  }

  return null;
};
