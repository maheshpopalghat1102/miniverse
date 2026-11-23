import * as ticTacToe from "./ticTacToeEngine.js";
import * as rockPaperScissors from "./rockPaperScissorsEngine.js";
import * as connectFour from "./connectFourEngine.js";
import * as guessNumber from "./guessNumberEngine.js";
import * as wordBattle from "./wordBattleEngine.js";
import * as quizBattle from "./quizBattleEngine.js";
import * as emojiGuess from "./emojiGuessEngine.js";
import * as truthOrDare from "./truthOrDareEngine.js";
import * as guessPicture from "./guessPictureEngine.js";
import * as drawGuess from "./drawGuessEngine.js";
import * as whoAmI from "./whoAmIEngine.js";
import * as numberBattle from "./numberBattleEngine.js";

export const multiplayerEngines = {
  "tic-tac-toe": ticTacToe,
  "rock-paper-scissors": rockPaperScissors,
  "connect-four": connectFour,
  "guess-number": guessNumber,
  "word-battle": wordBattle,
  "quiz-battle": quizBattle,
  "emoji-guess": emojiGuess,
  "truth-or-dare": truthOrDare,
  "guess-picture": guessPicture,
  "draw-guess": drawGuess,
  "who-am-i": whoAmI,
  "number-battle": numberBattle,
};

export const getMultiplayerEngine = (gameId) => {
  const engine = multiplayerEngines[gameId];

  if (!engine) {
    throw new Error(`Unsupported multiplayer game: ${gameId}`);
  }

  return engine;
};