
import React from "react";
import { Link } from "react-router-dom";

const games = [
  { id: "snake", name: "Snake", emoji: "🐍", description: "Eat, grow, and beat your high score." },
  { id: "2048", name: "2048", emoji: "🔢", description: "Merge matching tiles to reach 2048." },
  { id: "memory-match", name: "Memory Match", emoji: "🧩", description: "Test your memory by finding pairs." },
  { id: "number-puzzle", name: "Number Puzzle", emoji: "🔲", description: "Arrange numbers in the correct order." },
];

export default function SinglePlayer() {
  return (
    <main className="min-h-screen bg-gray-950 p-4 text-white sm:p-8">
      <div className="mx-auto max-w-7xl">
        <p className="text-sm text-violet-300">PLAY SOLO</p>
        <h1 className="mt-1 text-3xl font-bold">Single-player games</h1>
        <p className="mt-2 text-gray-400">Four games to practice and improve your personal best.</p>

        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {games.map((game) => (
            <Link key={game.id} to={`/games/${game.id}`} className="rounded-2xl border border-white/10 bg-gray-900 p-5 transition hover:-translate-y-1 hover:border-violet-500/50">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-violet-500/10 text-4xl">{game.emoji}</div>
              <h2 className="mt-5 font-semibold">{game.name}</h2>
              <p className="mt-2 min-h-10 text-sm text-gray-400">{game.description}</p>
              <span className="mt-5 inline-block text-sm font-semibold text-violet-300">View game →</span>
            </Link>
          ))}
        </div>
      </div>
    </main>
  );
}
