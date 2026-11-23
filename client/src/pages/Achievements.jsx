import { useEffect, useState } from "react";
import achievementService from "../services/achievementService";

export default function Achievements() {
  const [achievements, setAchievements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    Promise.all([achievementService.getAllAchievements(), achievementService.getMyAchievements()])
      .then(([definitions, progress]) => {
        const records = progress.achievements || [];
        const progressById = new Map(records.map((record) => [String(record.achievement?._id || record.achievement), record]));
        setAchievements((definitions.achievements || []).map((achievement) => {
          const record = progressById.get(String(achievement._id));
          return {
            ...achievement,
            progress: record?.progress || 0,
            target: record?.target || achievement.requirement?.target || 1,
            unlocked: Boolean(record?.isUnlocked),
          };
        }));
      })
      .catch((requestError) => setError(requestError.message || "Unable to load achievements."))
      .finally(() => setLoading(false));
  }, []);

  const unlockedCount = achievements.filter((item) => item.unlocked).length;
  const percent = achievements.length ? (unlockedCount / achievements.length) * 100 : 0;

  return (
    <main className="min-h-screen bg-gray-950 p-4 text-white sm:p-8">
      <div className="mx-auto max-w-7xl">
        <span className="text-sm text-violet-300">REWARDS &amp; MILESTONES</span>
        <h1 className="mt-1 text-3xl font-bold">Achievements</h1>
        <p className="mt-2 text-gray-400">Complete challenges and collect rewards.</p>
        {error && <p role="alert" className="mt-5 rounded-lg bg-rose-500/10 p-3 text-sm text-rose-300">{error}</p>}
        <section className="mt-7 rounded-2xl border border-white/10 bg-gray-900 p-5">
          <div className="flex flex-wrap items-center justify-between gap-3"><div><p className="text-sm text-gray-400">Achievements unlocked</p><p className="mt-1 text-3xl font-bold">{unlockedCount} <span className="text-lg text-gray-500">/ {achievements.length}</span></p></div><span className="text-4xl">🏅</span></div>
          <div className="mt-4 h-2 overflow-hidden rounded-full bg-gray-800"><div className="h-full rounded-full bg-violet-500" style={{ width: `${percent}%` }} /></div>
        </section>
        {loading ? <p className="mt-7 rounded-xl bg-gray-900 p-8 text-center text-gray-400">Loading achievements...</p>
          : achievements.length ? <section className="mt-7 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {achievements.map((achievement) => {
              const progressPercent = Math.min(100, (achievement.progress / achievement.target) * 100);
              return <article key={achievement._id} className={`rounded-2xl border p-5 ${achievement.unlocked ? "border-amber-400/30 bg-amber-400/5" : "border-white/10 bg-gray-900"}`}>
                <div className="flex items-start justify-between"><span className="text-4xl">{achievement.icon || "🏆"}</span>{achievement.unlocked && <span className="rounded-full bg-amber-400/10 px-2 py-1 text-xs text-amber-300">Unlocked</span>}</div>
                <h2 className="mt-5 font-bold">{achievement.name}</h2><p className="mt-2 min-h-10 text-sm text-gray-400">{achievement.description}</p>
                <div className="mt-5 flex justify-between text-xs text-gray-400"><span>Progress</span><span>{Math.min(achievement.progress, achievement.target)}/{achievement.target}</span></div>
                <div className="mt-2 h-2 overflow-hidden rounded-full bg-gray-800"><div className="h-full rounded-full bg-violet-500" style={{ width: `${progressPercent}%` }} /></div>
              </article>;
            })}
          </section> : <p className="mt-7 rounded-xl bg-gray-900 p-8 text-center text-gray-400">No achievements have been added yet.</p>}
      </div>
    </main>
  );
}
