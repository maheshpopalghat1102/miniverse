import * as coupleQuiz from "./coupleQuizEngine.js";
import * as guessWord from "./guessWordEngine.js";
import * as emojiChallenge from "./emojiChallengeEngine.js";
import * as storyBuilder from "./storyBuilderEngine.js";

export const turnByTurnEngines = {
  "couple-quiz": coupleQuiz,
  "guess-the-word": guessWord,
  "emoji-challenge": emojiChallenge,
  "story-builder": storyBuilder,
};

export const getTurnByTurnEngine = (gameId) => {
  const engine = turnByTurnEngines[gameId];

  if (!engine) {
    throw new Error(`Unsupported turn-by-turn game: ${gameId}`);
  }

  return engine;
};