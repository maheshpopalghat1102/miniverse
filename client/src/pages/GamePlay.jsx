
import { lazy, Suspense } from "react";

import {
  Link,
  useParams,
  useSearchParams
} from "react-router-dom";

// ==========================================
// GAME COMPONENT REGISTRY
// ==========================================

const gameComponents = {
  // ========================================
  // MULTIPLAYER GAMES
  // ========================================

  "tic-tac-toe": lazy(() =>
    import("../games/multiplayer/tic-tac-toe/TicTacToe")
  ),

  "rock-paper-scissors": lazy(() =>
    import("../games/multiplayer/rock-paper-scissors/RockPaperScissors")
  ),

  "connect-four": lazy(() =>
    import("../games/multiplayer/connect-four/ConnectFour")
  ),

  "guess-number": lazy(() =>
    import("../games/multiplayer/guess-number/GuessNumber")
  ),

  "guess-the-number": lazy(() =>
    import("../games/multiplayer/guess-number/GuessNumber")
  ),

  "word-battle": lazy(() =>
    import("../games/multiplayer/word-battle/WordBattle")
  ),

  "quiz-battle": lazy(() =>
    import("../games/multiplayer/quiz-battle/QuizBattle")
  ),

  "emoji-guess": lazy(() =>
    import("../games/multiplayer/emoji-guess/EmojiGuess")
  ),

  "truth-or-dare": lazy(() =>
    import("../games/multiplayer/truth-or-dare/TruthOrDare")
  ),

  "guess-picture": lazy(() =>
    import("../games/multiplayer/guess-picture/GuessPicture")
  ),

  "guess-the-picture": lazy(() =>
    import("../games/multiplayer/guess-picture/GuessPicture")
  ),

  "draw-guess": lazy(() =>
    import("../games/multiplayer/draw-guess/DrawGuess")
  ),

  "draw-and-guess": lazy(() =>
    import("../games/multiplayer/draw-guess/DrawGuess")
  ),

  "who-am-i": lazy(() =>
    import("../games/multiplayer/who-am-i/WhoAmI")
  ),

  "number-battle": lazy(() =>
    import("../games/multiplayer/number-battle/NumberBattle")
  ),

  // ========================================
  // SINGLE-PLAYER GAMES
  // ========================================

  snake: lazy(() =>
    import("../games/single-player/snake/Snake")
  ),

  "2048": lazy(() =>
    import("../games/single-player/2048/Game2048")
  ),

  "memory-match": lazy(() =>
    import("../games/single-player/memory-match/MemoryMatch")
  ),

  "number-puzzle": lazy(() =>
    import("../games/single-player/number-puzzle/NumberPuzzle")
  ),

  // ========================================
  // TURN-BY-TURN GAMES
  // ========================================

  "couple-quiz": lazy(() =>
    import("../games/turn-by-turn/couple-quiz/CoupleQuiz")
  ),

  "guess-word": lazy(() =>
    import("../games/turn-by-turn/guess-word/GuessWord")
  ),

  "guess-the-word": lazy(() =>
    import("../games/turn-by-turn/guess-word/GuessWord")
  ),

  "emoji-challenge": lazy(() =>
    import("../games/turn-by-turn/emoji-challenge/EmojiChallenge")
  ),

  "story-builder": lazy(() =>
    import("../games/turn-by-turn/story-builder/StoryBuilder")
  )
};

// ==========================================
// GAME DISPLAY NAMES
// ==========================================

const gameNames = {
  "tic-tac-toe": "Tic Tac Toe",
  "rock-paper-scissors": "Rock Paper Scissors",
  "connect-four": "Connect Four",
  "guess-number": "Guess the Number",
  "guess-the-number": "Guess the Number",
  "word-battle": "Word Battle",
  "quiz-battle": "Quiz Battle",
  "emoji-guess": "Emoji Guess",
  "truth-or-dare": "Truth or Dare",
  "guess-picture": "Guess the Picture",
  "guess-the-picture": "Guess the Picture",
  "draw-guess": "Draw & Guess",
  "draw-and-guess": "Draw & Guess",
  "who-am-i": "Who Am I?",
  "number-battle": "Number Battle",

  snake: "Snake",
  "2048": "2048",
  "memory-match": "Memory Match",
  "number-puzzle": "Number Puzzle",

  "couple-quiz": "Couple Quiz",
  "guess-word": "Guess the Word",
  "guess-the-word": "Guess the Word",
  "emoji-challenge": "Emoji Challenge",
  "story-builder": "Story Builder"
};

// ==========================================
// LOADING COMPONENT
// ==========================================

function GameLoading() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center text-white">
      <div className="text-center">

        <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-slate-700 border-t-violet-500" />

        <p className="mt-4 text-sm text-slate-400">
          Loading your game...
        </p>

      </div>
    </div>
  );
}

// ==========================================
// GAMEPLAY PAGE
// ==========================================

export default function GamePlay() {
  const { gameId } = useParams();

  const [searchParams] = useSearchParams();

  // Read match information from the URL.
  const matchId = searchParams.get("matchId");
  const roomCode = searchParams.get("roomCode");

  const GameComponent = gameComponents[gameId];

  const gameName =
    gameNames[gameId] || "MiniVerse Game";

  // ========================================
  // GAME NOT FOUND
  // ========================================

  if (!GameComponent) {
    return (
      <main className="min-h-screen bg-gray-950 p-8 text-white">

        <h1 className="text-2xl font-bold">
          Game not found
        </h1>

        <p className="mt-2 text-gray-400">
          This game does not have a registered component.
        </p>

        <Link
          to="/games"
          className="mt-5 inline-block text-violet-300"
        >
          ← Back to games
        </Link>

      </main>
    );
  }

  // ========================================
  // CHECK MULTIPLAYER MATCH
  // ========================================

  const isRoomGame = Boolean(roomCode);

  if (isRoomGame && !matchId) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-gray-950 p-6 text-white">

        <div className="max-w-md rounded-2xl border border-white/10 bg-gray-900 p-6 text-center">

          <h1 className="text-xl font-bold text-rose-300">
            Match information missing
          </h1>

          <p className="mt-3 text-sm text-gray-400">
            The room was opened without a valid match ID.
            Please return to the room and start the game again.
          </p>

          <Link
            to={`/rooms/${encodeURIComponent(roomCode)}`}
            className="mt-6 inline-block rounded-xl bg-violet-600 px-5 py-3 font-semibold hover:bg-violet-500"
          >
            Return to room
          </Link>

        </div>

      </main>
    );
  }

  // ========================================
  // GAMEPLAY UI
  // ========================================

  return (
    <main className="min-h-screen bg-gray-950 p-3 text-white sm:p-6">

      <div className="mx-auto max-w-7xl">

        {/* GAME HEADER */}

        <div className="mb-5 flex flex-wrap items-center justify-between gap-3">

          <div>

            <Link
              to={`/games/${encodeURIComponent(gameId)}`}
              className="text-sm text-violet-300 hover:text-violet-200"
            >
              ← Game details
            </Link>

            <h1 className="mt-2 text-2xl font-bold">
              {gameName}
            </h1>

            {matchId && (
              <p className="mt-1 text-xs text-gray-500">
                Match ID: {matchId}
              </p>
            )}

            {roomCode && (
              <p className="mt-1 text-xs text-gray-500">
                Room: {roomCode}
              </p>
            )}

          </div>

          <Link
            to="/games"
            className="rounded-lg border border-white/10 px-4 py-2 text-sm hover:bg-white/10"
          >
            All games
          </Link>

        </div>

        {/* GAME COMPONENT */}

        <Suspense fallback={<GameLoading />}>

          <GameComponent
            matchId={matchId}
            roomCode={roomCode}
            gameId={gameId}
            gameMode={roomCode ? "private" : "solo"}
            isMultiplayer={Boolean(matchId)}
          />

        </Suspense>

      </div>

    </main>
  );
}
