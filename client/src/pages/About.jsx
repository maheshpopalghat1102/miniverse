
import React from "react";
import { Link } from "react-router-dom";

const categories = [
  { name: "Multiplayer", count: 12, icon: "👥", description: "Challenge friends and other players." },
  { name: "Single Player", count: 4, icon: "🎯", description: "Play solo and beat your personal records." },
  { name: "Turn by Turn", count: 4, icon: "🔄", description: "Take turns and enjoy games together." },
];

const features = [
  ["🎮", "Quick games", "Enjoy a variety of short and engaging games."],
  ["👥", "Social gaming", "Connect with friends and play together."],
  ["🏆", "Achievements", "Track progress and celebrate milestones."],
  ["🎨", "Personalization", "Choose themes and customize your profile."],
];

export default function About() {
  return (
    <main className="min-h-screen bg-gray-950 p-4 text-white sm:p-8">
      <div className="mx-auto max-w-6xl">
        <section className="rounded-3xl border border-violet-500/20 bg-gradient-to-br from-violet-950 to-gray-900 p-8 text-center sm:p-14">
          <div className="text-6xl">🌌</div>
          <h1 className="mt-5 text-4xl font-black sm:text-5xl">
            Welcome to <span className="text-violet-400">MiniVerse</span>
          </h1>
          <p className="mx-auto mt-5 max-w-2xl leading-7 text-gray-300">
            A place for mini games, friendly competition, shared moments, and
            new challenges. Discover games and build your own gaming journey.
          </p>
          <Link to="/games" className="mt-8 inline-block rounded-xl bg-violet-600 px-6 py-3 font-semibold hover:bg-violet-500">
            Explore games
          </Link>
        </section>

        <section className="mt-12">
          <h2 className="text-center text-2xl font-bold">20 games. Three ways to play.</h2>
          <div className="mt-7 grid gap-4 md:grid-cols-3">
            {categories.map((category) => (
              <div key={category.name} className="rounded-2xl border border-white/10 bg-gray-900 p-6 text-center">
                <span className="text-4xl">{category.icon}</span>
                <p className="mt-4 text-3xl font-bold text-violet-300">{category.count}</p>
                <h3 className="mt-2 font-semibold">{category.name}</h3>
                <p className="mt-2 text-sm text-gray-400">{category.description}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="mt-12">
          <h2 className="text-center text-2xl font-bold">What makes MiniVerse special?</h2>
          <div className="mt-7 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {features.map(([icon, title, description]) => (
              <div key={title} className="rounded-2xl border border-white/10 bg-gray-900 p-5">
                <span className="text-3xl">{icon}</span>
                <h3 className="mt-4 font-semibold">{title}</h3>
                <p className="mt-2 text-sm leading-6 text-gray-400">{description}</p>
              </div>
            ))}
          </div>
        </section>

        <p className="mt-12 text-center text-xs text-gray-500">
          MiniVerse · Version 1.0.0 · Replace this with your actual release information.
        </p>
      </div>
    </main>
  );
}
