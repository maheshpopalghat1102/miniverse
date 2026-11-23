import * as ticTacToe from "../games/multiplayer/ticTacToeEngine.js";
import * as rockPaperScissors from "../games/multiplayer/rockPaperScissorsEngine.js";
import * as connectFour from "../games/multiplayer/connectFourEngine.js";
import * as guessNumber from "../games/multiplayer/guessNumberEngine.js";
import * as wordBattle from "../games/multiplayer/wordBattleEngine.js";
import * as quizBattle from "../games/multiplayer/quizBattleEngine.js";
import * as emojiGuess from "../games/multiplayer/emojiGuessEngine.js";
import * as truthOrDare from "../games/multiplayer/truthOrDareEngine.js";
import * as guessPicture from "../games/multiplayer/guessPictureEngine.js";
import * as drawGuess from "../games/multiplayer/drawGuessEngine.js";
import * as whoAmI from "../games/multiplayer/whoAmIEngine.js";
import * as numberBattle from "../games/multiplayer/numberBattleEngine.js";

import * as coupleQuiz from "../games/turn-by-turn/coupleQuizEngine.js";
import * as guessWord from "../games/turn-by-turn/guessWordEngine.js";
import * as emojiChallenge from "../games/turn-by-turn/emojiChallengeEngine.js";
import * as storyBuilder from "../games/turn-by-turn/storyBuilderEngine.js";

export const gameRegistry = {
  "tic-tac-toe": {
    id: "tic-tac-toe",
    name: "Tic Tac Toe",
    category: "multiplayer",
    minPlayers: 2,
    maxPlayers: 2,
    engine: ticTacToe,
  },
  "rock-paper-scissors": {
    id: "rock-paper-scissors",
    name: "Rock Paper Scissors",
    category: "multiplayer",
    minPlayers: 2,
    maxPlayers: 2,
    engine: rockPaperScissors,
  },
  "connect-four": {
    id: "connect-four",
    name: "Connect Four",
    category: "multiplayer",
    minPlayers: 2,
    maxPlayers: 2,
    engine: connectFour,
  },
  "guess-number": {
    id: "guess-number",
    name: "Guess the Number",
    category: "multiplayer",
    minPlayers: 2,
    maxPlayers: 6,
    engine: guessNumber,
  },
  "word-battle": {
    id: "word-battle",
    name: "Word Battle",
    category: "multiplayer",
    minPlayers: 2,
    maxPlayers: 6,
    engine: wordBattle,
  },
  "quiz-battle": {
    id: "quiz-battle",
    name: "Quiz Battle",
    category: "multiplayer",
    minPlayers: 2,
    maxPlayers: 6,
    engine: quizBattle,
  },
  "emoji-guess": {
    id: "emoji-guess",
    name: "Emoji Guess",
    category: "multiplayer",
    minPlayers: 2,
    maxPlayers: 6,
    engine: emojiGuess,
  },
  "truth-or-dare": {
    id: "truth-or-dare",
    name: "Truth or Dare",
    category: "multiplayer",
    minPlayers: 2,
    maxPlayers: 10,
    engine: truthOrDare,
  },
  "guess-picture": {
    id: "guess-picture",
    name: "Guess the Picture",
    category: "multiplayer",
    minPlayers: 2,
    maxPlayers: 6,
    engine: guessPicture,
  },
  "draw-guess": {
    id: "draw-guess",
    name: "Draw & Guess",
    category: "multiplayer",
    minPlayers: 2,
    maxPlayers: 8,
    engine: drawGuess,
  },
  "who-am-i": {
    id: "who-am-i",
    name: "Who Am I?",
    category: "multiplayer",
    minPlayers: 2,
    maxPlayers: 8,
    engine: whoAmI,
  },
  "number-battle": {
    id: "number-battle",
    name: "Number Battle",
    category: "multiplayer",
    minPlayers: 2,
    maxPlayers: 6,
    engine: numberBattle,
  },

  "couple-quiz": {
    id: "couple-quiz",
    name: "Couple Quiz",
    category: "turn-by-turn",
    minPlayers: 2,
    maxPlayers: 2,
    engine: coupleQuiz,
  },
  "guess-the-word": {
    id: "guess-the-word",
    name: "Guess the Word",
    category: "turn-by-turn",
    minPlayers: 2,
    maxPlayers: 6,
    engine: guessWord,
  },
  "emoji-challenge": {
    id: "emoji-challenge",
    name: "Emoji Challenge",
    category: "turn-by-turn",
    minPlayers: 2,
    maxPlayers: 6,
    engine: emojiChallenge,
  },
  "story-builder": {
    id: "story-builder",
    name: "Story Builder",
    category: "turn-by-turn",
    minPlayers: 2,
    maxPlayers: 6,
    engine: storyBuilder,
  },
};

export const getGame = (gameId) => {
  const game = gameRegistry[gameId];

  if (!game) {
    throw new Error(`Game "${gameId}" is not registered.`);
  }

  return game;
};

export const getGameEngine = (gameId) => getGame(gameId).engine;

export const getGamesByCategory = (category) => {
  return Object.values(gameRegistry).filter(
    (game) => game.category === category
  );
};

export const getAllRegisteredGames = () => Object.values(gameRegistry);

export const isGameRegistered = (gameId) => {
  return Object.hasOwn(gameRegistry, gameId);
};