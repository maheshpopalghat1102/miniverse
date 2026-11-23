
import React from "react";
import { Link } from "react-router-dom";

const games = [
  { id: "couple-quiz", name: "Couple Quiz", emoji: "💞", description: "Discover how well you know each other." },
  { id: "guess-the-word", name: "Guess the Word", emoji: "💬", description: "Take turns giving clues and guessing words." },
  { id: "emoji-challenge", name: "Emoji Challenge", emoji: "🤔", description: "Interpret emoji clues and challenge each other." },
  { id: "story-builder", name: "Story Builder", emoji: "📖", description: "Build a creative story one turn at a time." },
];

export default function TurnByTurn() {
  return (
    <main className="min-h-screen bg-gray-950 p-4 text-white sm:p-8">
      <div className="mx-auto max-w-7xl">
        <p className="text-sm text-violet-300">TAKE YOUR TURN</p>
        <h1 className="mt-1 text-3xl font-bold">Turn-by-turn games</h1>
        <p className="mt-2 text-gray-400">Play together at your own pace.</p>

        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {games.map((game) => (
            <Link key={game.id} to={`/games/${game.id}`} className="rounded-2xl border border-white/10 bg-gray-900 p-5 hover:border-violet-500/50">
              <span className="flex h-16 w-16 items-center justify-center rounded-2xl bg-violet-500/10 text-4xl">{game.emoji}</span>
              <h2 className="mt-5 font-semibold">{game.name}</h2>
              <p className="mt-2 min-h-12 text-sm text-gray-400">{game.description}</p>
              <span className="mt-4 inline-block text-sm font-semibold text-violet-300">View game →</span>
            </Link>
          ))}
        </div>
      </div>
    </main>
  );
}
