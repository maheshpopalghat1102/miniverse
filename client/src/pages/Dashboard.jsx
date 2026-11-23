import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import userService from "../services/userService";
import friendService from "../services/friendService";
import achievementService from "../services/achievementService";
import gameService from "../services/gameService";

const quickLinks = [
  ["🎮", "Browse games", "/games"], ["👥", "Friends", "/friends"],
  ["🏆", "Achievements", "/achievements"], ["🥇", "Leaderboard", "/leaderboard"],
  ["➕", "Create a room", "/rooms/create"], ["🔑", "Join a room", "/rooms/join"],
];

export default function Dashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState({ gamesPlayed: 0, gamesWon: 0, friends: 0, achievements: 0 });
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    Promise.allSettled([
      userService.getMyProfile(),
      friendService.getFriends(),
      achievementService.getUnlockedAchievements(),
      gameService.getGameHistory({ limit: 5 }),
    ]).then(([profileResult, friendResult, achievementResult, historyResult]) => {
      if (profileResult.status === "fulfilled") {
        const profile = profileResult.value.profile || {};
        setStats((current) => ({ ...current, gamesPlayed: profile.statistics?.gamesPlayed || 0, gamesWon: profile.statistics?.gamesWon || 0 }));
      }
      if (friendResult.status === "fulfilled") setStats((current) => ({ ...current, friends: friendResult.value.count ?? friendResult.value.friends?.length ?? 0 }));
      if (achievementResult.status === "fulfilled") setStats((current) => ({ ...current, achievements: achievementResult.value.achievements?.length || 0 }));
      if (historyResult.status === "fulfilled") {
        const matches = historyResult.value.matches || [];
        setActivities(matches.slice(0, 5).map((match) => ({
          id: match._id,
          title: match.game?.name || "Game",
          detail: match.status === "cancelled" ? "Match cancelled" : "Match completed",
          time: match.endedAt || match.createdAt,
        })));
      }
      const failed = [profileResult, friendResult, achievementResult, historyResult].some((result) => result.status === "rejected");
      if (failed) setError("Some dashboard details could not be loaded.");
    }).finally(() => setLoading(false));
  }, []);

  const cards = [
    { label: "Games played", value: stats.gamesPlayed, icon: "🎮" },
    { label: "Wins", value: stats.gamesWon, icon: "🏆" },
    { label: "Friends", value: stats.friends, icon: "👥" },
    { label: "Achievements", value: stats.achievements, icon: "⭐" },
  ];

  return (
    <main className="min-h-screen bg-gray-950 p-4 text-white sm:p-6 lg:p-8">
      <div className="mx-auto max-w-7xl">
        <div className="flex flex-wrap items-center justify-between gap-4"><div><p className="text-sm text-violet-300">PLAYER OVERVIEW</p><h1 className="mt-1 text-3xl font-bold">Welcome back{user?.username ? `, ${user.username}` : ""}!</h1><p className="mt-2 text-gray-400">Ready for another round?</p></div><Link to="/games" className="rounded-xl bg-violet-600 px-5 py-3 font-semibold hover:bg-violet-500">Play a game</Link></div>
        {error && <p role="status" className="mt-5 rounded-lg bg-amber-500/10 p-3 text-sm text-amber-300">{error}</p>}
        <section className="mt-8 grid grid-cols-2 gap-4 lg:grid-cols-4">{cards.map((stat) => <div key={stat.label} className="rounded-2xl border border-white/10 bg-gray-900 p-5"><span className="text-2xl">{stat.icon}</span><p className="mt-4 text-2xl font-bold">{loading ? "—" : stat.value}</p><p className="mt-1 text-sm text-gray-400">{stat.label}</p></div>)}</section>
        <section className="mt-8 grid gap-6 lg:grid-cols-3">
          <div className="rounded-2xl border border-white/10 bg-gray-900 p-5 lg:col-span-2"><div className="flex items-center justify-between"><h2 className="text-xl font-bold">Recent activity</h2><Link to="/game-history" className="text-sm text-violet-300">Game history →</Link></div>
            <div className="mt-5 space-y-3">{activities.length ? activities.map((activity) => <div key={activity.id} className="flex items-center gap-4 rounded-xl bg-gray-800/70 p-4"><span className="text-2xl">🎮</span><div className="min-w-0 flex-1"><p className="font-semibold">{activity.title}</p><p className="text-sm text-gray-400">{activity.detail}</p></div><time className="text-xs text-gray-500">{activity.time ? new Date(activity.time).toLocaleDateString() : ""}</time></div>) : <p className="rounded-xl bg-gray-800/50 p-5 text-sm text-gray-400">{loading ? "Loading activity..." : "Your completed games will appear here."}</p>}</div>
          </div>
          <div className="rounded-2xl border border-white/10 bg-gray-900 p-5"><h2 className="text-xl font-bold">Quick links</h2><div className="mt-5 space-y-3">{quickLinks.map(([icon, label, path]) => <Link key={path} to={path} className="flex items-center gap-3 rounded-xl bg-gray-800/70 p-3 text-sm hover:bg-gray-800"><span>{icon}</span>{label}<span className="ml-auto text-gray-500">→</span></Link>)}</div></div>
        </section>
      </div>
    </main>
  );
}
