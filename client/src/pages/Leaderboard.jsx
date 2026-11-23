import { useEffect, useState } from "react";
import leaderboardService from "../services/leaderboardService";

export default function Leaderboard() {
  const [players, setPlayers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    leaderboardService.getGlobalLeaderboard().then((result) => setPlayers(result.leaderboard || []))
      .catch((requestError) => setError(requestError.message || "Unable to load the leaderboard."))
      .finally(() => setLoading(false));
  }, []);

  return (
    <main className="min-h-screen bg-gray-950 p-4 text-white sm:p-8">
      <div className="mx-auto max-w-5xl">
        <span className="text-sm text-violet-300">TOP PLAYERS</span>
        <h1 className="mt-1 text-3xl font-bold">Leaderboard</h1>
        <p className="mt-2 text-gray-400">Players ranked by total score.</p>
        {error && <p role="alert" className="mt-5 rounded-lg bg-rose-500/10 p-3 text-sm text-rose-300">{error}</p>}
        <section className="mt-7 rounded-2xl border border-white/10 bg-gray-900 p-5">
          <div className="mb-5 grid grid-cols-[50px_1fr_90px_70px] gap-2 px-3 text-xs uppercase tracking-wide text-gray-500"><span>Rank</span><span>Player</span><span className="text-right">Points</span><span className="text-right">Wins</span></div>
          {loading ? <p className="p-6 text-center text-gray-400">Loading leaderboard...</p> : players.length ? <div className="space-y-2">
            {players.map((player, index) => <div key={player._id || player.username} className="grid grid-cols-[50px_1fr_90px_70px] items-center gap-2 rounded-xl bg-gray-800/70 p-3">
              <span className={`font-bold ${index < 3 ? "text-amber-300" : "text-gray-400"}`}>#{index + 1}</span>
              <div className="flex min-w-0 items-center gap-2">
                {player.avatar ? <img src={player.avatar} alt="" className="h-9 w-9 rounded-full object-cover" /> : <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-violet-500/20">🎮</span>}
                <span className="truncate text-sm font-medium">{player.username}</span>
              </div>
              <span className="text-right text-sm font-semibold text-violet-300">{Number(player.totalScore || 0).toLocaleString()}</span>
              <span className="text-right text-sm text-gray-300">{player.gamesWon || 0}</span>
            </div>)}
          </div> : <p className="p-8 text-center text-gray-400">No leaderboard scores yet.</p>}
        </section>
      </div>
    </main>
  );
}
