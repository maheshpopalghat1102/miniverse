
import React from "react";
import { Link, useLocation } from "react-router-dom";

const games = [
  ["tic-tac-toe", "Tic Tac Toe", "⭕"],
  ["rock-paper-scissors", "Rock Paper Scissors", "✊"],
  ["connect-four", "Connect Four", "🔴"],
  ["guess-the-number", "Guess the Number", "🔢"],
  ["word-battle", "Word Battle", "🔤"],
  ["quiz-battle", "Quiz Battle", "🧠"],
  ["emoji-guess", "Emoji Guess", "😎"],
  ["truth-or-dare", "Truth or Dare", "🎲"],
  ["guess-the-picture", "Guess the Picture", "🖼️"],
  ["draw-and-guess", "Draw & Guess", "🎨"],
  ["who-am-i", "Who Am I?", "🕵️"],
  ["number-battle", "Number Battle", "🔟"],
];

export default function Multiplayer() {
  const location = useLocation();
  return (
    <main className="min-h-screen bg-gray-950 p-4 text-white sm:p-8">
      <div className="mx-auto max-w-7xl">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-sm text-violet-300">PLAY TOGETHER</p>
            <h1 className="mt-1 text-3xl font-bold">Multiplayer games</h1>
            <p className="mt-2 text-gray-400">12 games to challenge friends and other players.</p>
          </div>
          <div className="flex gap-2">
            <Link to="/rooms/create" className="rounded-xl bg-violet-600 px-4 py-3 text-sm font-semibold hover:bg-violet-500">Create room</Link>
            <Link to="/rooms/join" className="rounded-xl border border-white/10 px-4 py-3 text-sm font-semibold hover:bg-white/10">Join room</Link>
          </div>
        </div>

        {location.state?.notice && <p role="status" className="mt-5 rounded-lg bg-amber-500/10 p-3 text-sm text-amber-300">{location.state.notice}</p>}

        <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {games.map(([id, name, emoji]) => (
            <Link key={id} to={`/games/${id}`} className="rounded-2xl border border-white/10 bg-gray-900 p-5 hover:border-violet-500/50">
              <span className="flex h-14 w-14 items-center justify-center rounded-xl bg-violet-500/10 text-3xl">{emoji}</span>
              <h2 className="mt-4 font-semibold">{name}</h2>
              <p className="mt-2 text-xs text-gray-400">Multiplayer · Play with others</p>
            </Link>
          ))}
        </div>
      </div>
    </main>
  );
}
