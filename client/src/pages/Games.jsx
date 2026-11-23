import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import SearchBar from "../components/ui/SearchBar";
import Tabs from "../components/ui/Tabs";
import gameService from "../services/gameService";

const gameIcons = {
  "tic-tac-toe": "⭕", "rock-paper-scissors": "✊", "connect-four": "🔴",
  "guess-the-number": "🔢", "word-battle": "🔤", "quiz-battle": "🧠",
  "emoji-guess": "😎", "truth-or-dare": "🎲", "guess-the-picture": "🖼️",
  "draw-and-guess": "🎨", "who-am-i": "🕵️", "number-battle": "🔟",
  snake: "🐍", "2048": "🔢", "memory-match": "🧩", "number-puzzle": "🔲",
  "couple-quiz": "💞", "guess-the-word": "💬", "emoji-challenge": "🤔", "story-builder": "📖",
};

const tabs = [
  { label: "All Games", value: "all" },
  { label: "Multiplayer", value: "multiplayer" },
  { label: "Single Player", value: "single-player" },
  { label: "Turn by Turn", value: "turn-by-turn" },
];

export default function Games() {
  const [category, setCategory] = useState("all");
  const [search, setSearch] = useState("");
  const [games, setGames] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    gameService.getAllGames().then((result) => setGames(result.games || []))
      .catch((requestError) => setError(requestError.message || "Unable to load games."))
      .finally(() => setLoading(false));
  }, []);

  const filteredGames = useMemo(() => games.filter((game) => {
    const matchesCategory = category === "all" || game.category === category;
    return matchesCategory && game.name.toLowerCase().includes(search.toLowerCase());
  }), [games, category, search]);

  return (
    <main className="min-h-screen bg-gray-950 p-4 text-white sm:p-6 lg:p-8">
      <div className="mx-auto max-w-7xl">
        <h1 className="text-3xl font-bold">Explore games</h1>
        <p className="mt-2 text-gray-400">Choose a game from the MiniVerse catalogue.</p>
        <div className="mt-6 max-w-xl"><SearchBar value={search} onChange={setSearch} placeholder="Search games..." /></div>
        <div className="mt-6"><Tabs tabs={tabs} activeTab={category} onChange={setCategory} /></div>
        {error && <p role="alert" className="mt-5 rounded-lg bg-rose-500/10 p-3 text-sm text-rose-300">{error}</p>}
        {!loading && !error && <p className="mt-5 text-sm text-gray-400">Showing {filteredGames.length} of {games.length} games</p>}
        {loading ? <p className="mt-8 rounded-xl bg-gray-900 p-8 text-center text-gray-400">Loading games...</p>
          : filteredGames.length ? <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filteredGames.map((game) => <Link key={game._id || game.gameId} to={`/games/${encodeURIComponent(game.gameId)}`} className="rounded-2xl border border-white/10 bg-gray-900 p-5 transition hover:-translate-y-1 hover:border-violet-500/50">
              <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-violet-500/10 text-3xl">{gameIcons[game.gameId] || "🎮"}</div>
              <h2 className="mt-4 font-semibold">{game.name}</h2>
              <div className="mt-2 flex items-center justify-between text-xs text-gray-400"><span className="capitalize">{game.category.replaceAll("-", " ")}</span><span>{game.minPlayers === game.maxPlayers ? game.maxPlayers : `${game.minPlayers}–${game.maxPlayers}`} players</span></div>
            </Link>)}
          </div> : <div className="mt-8 rounded-2xl border border-white/10 bg-gray-900 p-10 text-center"><p className="text-lg font-semibold">No games found</p><p className="mt-2 text-sm text-gray-400">Try a different search or category.</p></div>}
      </div>
    </main>
  );
}
