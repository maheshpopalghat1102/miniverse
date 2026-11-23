import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import gameService from "../services/gameService";
import Tabs from "../components/ui/Tabs";
import SearchBar from "../components/ui/SearchBar";

const resultStyles = {
  won: "bg-emerald-500/10 text-emerald-300",
  lost: "bg-rose-500/10 text-rose-300",
  draw: "bg-amber-500/10 text-amber-300",
  played: "bg-violet-500/10 text-violet-300",
  cancelled: "bg-gray-500/10 text-gray-300",
};

export default function GameHistory() {
  const { user } = useAuth();
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    gameService.getGameHistory().then((result) => setMatches(result.matches || []))
      .catch((requestError) => setError(requestError.message || "Unable to load game history."))
      .finally(() => setLoading(false));
  }, []);

  const history = useMemo(() => matches.map((match) => {
    const selfId = String(user?.id || user?._id || "");
    const player = match.players?.find((entry) => String(entry.user?._id || entry.user) === selfId);
    const result = match.status === "cancelled" ? "cancelled" : player?.result === "win" ? "won" : player?.result === "loss" ? "lost" : player?.result === "draw" ? "draw" : "played";
    const opponentNames = (match.players || []).filter((entry) => String(entry.user?._id || entry.user) !== selfId).map((entry) => entry.user?.username || entry.username).filter(Boolean);
    return {
      id: match._id,
      game: match.game?.name || "Game",
      gameId: match.game?.gameId,
      opponent: opponentNames.join(", ") || (match.gameMode === "solo" ? "Solo game" : "No opponent"),
      result,
      score: player?.finalScore ?? "—",
      date: match.endedAt || match.startedAt || match.createdAt,
      duration: match.durationSeconds ? `${Math.floor(match.durationSeconds / 60)}m ${match.durationSeconds % 60}s` : "—",
    };
  }), [matches, user]);

  const filtered = history.filter((match) => (filter === "all" || match.result === filter) && `${match.game} ${match.opponent}`.toLowerCase().includes(search.toLowerCase()));
  const wins = history.filter((item) => item.result === "won").length;
  const losses = history.filter((item) => item.result === "lost").length;
  const tabs = [{ label: "All", value: "all" }, { label: "Won", value: "won" }, { label: "Lost", value: "lost" }, { label: "Draw", value: "draw" }];

  return (
    <main className="min-h-screen bg-gray-950 p-4 text-white sm:p-8">
      <div className="mx-auto max-w-6xl">
        <h1 className="text-3xl font-bold">Game history</h1><p className="mt-2 text-gray-400">Review your recent matches and results.</p>
        {error && <p role="alert" className="mt-5 rounded-lg bg-rose-500/10 p-3 text-sm text-rose-300">{error}</p>}
        <div className="mt-7 grid grid-cols-3 gap-3">{[["Matches", history.length], ["Wins", wins], ["Losses", losses]].map(([label, value]) => <div key={label} className="rounded-xl border border-white/10 bg-gray-900 p-4"><p className="text-2xl font-bold">{value}</p><p className="mt-1 text-xs text-gray-400">{label}</p></div>)}</div>
        <div className="mt-7"><SearchBar value={search} onChange={setSearch} placeholder="Search games or opponents..." /></div>
        <div className="mt-5"><Tabs tabs={tabs} activeTab={filter} onChange={setFilter} /></div>
        <div className="mt-5 space-y-3">
          {loading ? <p className="rounded-xl bg-gray-900 p-8 text-center text-gray-400">Loading match history...</p> : filtered.length ? filtered.map((match) => <article key={match.id} className="flex flex-wrap items-center gap-4 rounded-xl border border-white/10 bg-gray-900 p-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-violet-500/10 text-xl">🎮</div>
            <div className="min-w-0 flex-1"><h2 className="font-semibold">{match.game}</h2><p className="mt-1 text-sm text-gray-400">Opponent: {match.opponent}</p><p className="mt-1 text-xs text-gray-500">{match.date ? new Date(match.date).toLocaleString() : ""} · {match.duration}</p></div>
            <div className="text-right"><span className={`rounded-full px-3 py-1 text-xs font-semibold capitalize ${resultStyles[match.result] || resultStyles.played}`}>{match.result}</span><p className="mt-2 text-sm text-gray-300">Score: {match.score}</p></div>
            {match.gameId && <Link to={`/games/${encodeURIComponent(match.gameId)}`} className="text-sm text-violet-300 hover:underline">Play again →</Link>}
          </article>) : <div className="rounded-xl border border-white/10 bg-gray-900 p-10 text-center text-gray-400">No matching game history found.</div>}
        </div>
      </div>
    </main>
  );
}
