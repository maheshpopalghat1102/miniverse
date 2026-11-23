
import React from "react";
import { Link } from "react-router-dom";

const featuredGames = [
  { id: "tic-tac-toe", name: "Tic Tac Toe", category: "Multiplayer", emoji: "⭕", players: "2 Players" },
  { id: "snake", name: "Snake", category: "Single Player", emoji: "🐍", players: "1 Player" },
  { id: "connect-four", name: "Connect Four", category: "Multiplayer", emoji: "🔴", players: "2 Players" },
  { id: "2048", name: "2048", category: "Single Player", emoji: "🔢", players: "1 Player" },
];

function GameTile({ game }) {
  return (
    <Link
      to={`/games/${game.id}`}
      className="rounded-2xl border border-white/10 bg-gray-900 p-5 transition hover:-translate-y-1 hover:border-violet-500/50"
    >
      <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-violet-500/10 text-4xl">
        {game.emoji}
      </div>
      <h3 className="font-semibold text-white">{game.name}</h3>
      <p className="mt-1 text-sm text-gray-400">{game.category} · {game.players}</p>
    </Link>
  );
}

export default function Home() {
  return (
    <main className="min-h-screen bg-gray-950 px-4 py-10 text-white sm:px-6 lg:px-8">
      <section className="mx-auto grid max-w-7xl items-center gap-10 rounded-3xl border border-violet-500/20 bg-gradient-to-br from-violet-950 via-gray-900 to-gray-950 p-8 sm:p-12 lg:grid-cols-2">
        <div>
          <span className="rounded-full border border-violet-400/30 bg-violet-400/10 px-3 py-1 text-xs font-semibold text-violet-300">
            YOUR WORLD OF MINI GAMES
          </span>
          <h1 className="mt-6 text-4xl font-black leading-tight sm:text-6xl">
            Play more.
            <span className="block text-violet-400">Connect more.</span>
          </h1>
          <p className="mt-5 max-w-xl text-gray-300">
            Challenge friends, discover quick games, and build your MiniVerse
            gaming journey.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link to="/games" className="rounded-xl bg-violet-600 px-6 py-3 font-semibold hover:bg-violet-500">
              Explore games
            </Link>
            <Link to="/dashboard" className="rounded-xl border border-white/15 px-6 py-3 font-semibold hover:bg-white/10">
              My dashboard
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          {["🎮", "🏆", "👥", "⚡"].map((emoji, index) => (
            <div key={emoji} className="flex aspect-square items-center justify-center rounded-3xl border border-white/10 bg-white/5 text-6xl">
              {emoji}
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto mt-14 max-w-7xl">
        <div className="mb-6 flex items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold">Featured games</h2>
            <p className="mt-1 text-sm text-gray-400">A few games to get you started</p>
          </div>
          <Link to="/games" className="text-sm font-semibold text-violet-300 hover:text-violet-200">
            View all games →
          </Link>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {featuredGames.map((game) => <GameTile key={game.id} game={game} />)}
        </div>
      </section>

      <section className="mx-auto mt-14 grid max-w-7xl gap-4 md:grid-cols-3">
        {[
          { title: "Multiplayer", text: "Challenge friends and other players.", emoji: "👥", link: "/games/multiplayer" },
          { title: "Single Player", text: "Practice, improve, and beat your best score.", emoji: "🎯", link: "/games/single-player" },
          { title: "Turn by Turn", text: "Take turns and enjoy games together.", emoji: "🔄", link: "/games/turn-by-turn" },
        ].map((item) => (
          <Link key={item.title} to={item.link} className="rounded-2xl border border-white/10 bg-gray-900 p-6 hover:border-violet-500/40">
            <span className="text-3xl">{item.emoji}</span>
            <h3 className="mt-4 text-lg font-bold">{item.title}</h3>
            <p className="mt-2 text-sm text-gray-400">{item.text}</p>
          </Link>
        ))}
      </section>
    </main>
  );
}
