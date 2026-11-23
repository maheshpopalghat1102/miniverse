
import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import gameService from "../services/gameService";

export default function GameDetails() {
  const { gameId } = useParams();

  const [game, setGame] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    async function loadGame() {
      setLoading(true);
      setError("");
      setGame(null);

      try {
        const result = await gameService.getGameById(gameId);

        if (active) {
          setGame(result?.game || null);
        }
      } catch (err) {
        if (active) {
          setError(err.message || "Unable to load game.");
        }
      } finally {
        if (active) setLoading(false);
      }
    }

    loadGame();

    return () => {
      active = false;
    };
  }, [gameId]);

  if (loading) {
    return (
      <main className="min-h-screen bg-gray-950 p-8 text-center text-white">
        Loading game...
      </main>
    );
  }

  if (error || !game) {
    return (
      <main className="min-h-screen bg-gray-950 p-8 text-white">
        <h1 className="text-2xl font-bold">Game unavailable</h1>
        <p className="mt-3 text-gray-400">{error || "Game not found."}</p>
        <Link to="/games" className="mt-5 inline-block text-violet-400">
          ← All games
        </Link>
      </main>
    );
  }

  const id = game.gameId || gameId;
  const category = game.category || "single-player";

  const categoryPath =
    category === "multiplayer"
      ? "/games/multiplayer"
      : category === "single-player"
        ? "/games/single-player"
        : "/games/turn-by-turn";

  return (
    <main className="min-h-screen bg-gray-950 p-4 text-white sm:p-8">
      <div className="mx-auto max-w-4xl">
        <Link to="/games" className="text-sm text-violet-300">
          ← All games
        </Link>

        <section className="mt-6 rounded-3xl border border-white/10 bg-gray-900 p-6 sm:p-10">
          {game.banner && (
            <img
              src={game.banner}
              alt={game.name}
              className="mb-7 max-h-64 w-full rounded-2xl object-cover"
            />
          )}

          <p className="text-xs font-semibold uppercase tracking-wider text-violet-300">
            {category.replaceAll("-", " ")}
          </p>

          <h1 className="mt-2 text-3xl font-bold">{game.name}</h1>

          <p className="mt-3 text-gray-400">{game.description}</p>

          <p className="mt-3 text-sm text-gray-500">
            Players: {game.minPlayers === game.maxPlayers
              ? game.maxPlayers
              : `${game.minPlayers}–${game.maxPlayers}`}
          </p>

          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              to={`/play/${encodeURIComponent(id)}`}
              className="rounded-xl bg-violet-600 px-6 py-3 font-semibold text-white hover:bg-violet-500"
            >
              Play Now →
            </Link>

            {category === "multiplayer" && (
              <Link
                to={`/rooms/create?gameId=${encodeURIComponent(id)}`}
                className="rounded-xl border border-white/10 px-6 py-3 font-semibold hover:bg-white/10"
              >
                Create a Room
              </Link>
            )}

            <Link
              to={categoryPath}
              className="rounded-xl border border-white/10 px-6 py-3 font-semibold hover:bg-white/10"
            >
              Explore Category
            </Link>
          </div>
        </section>
      </div>
    </main>
  );
}
