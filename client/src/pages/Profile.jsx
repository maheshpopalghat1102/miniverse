import React, { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import userService from "../services/userService";
import { useAuth } from "../context/AuthContext";

export default function Profile() {
  const { username } = useParams();
  const { user: currentUser } = useAuth();
  const [data, setData] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError("");
    const load = username
      ? userService.getUserByUsername(username)
      : userService.getMyProfile();
    load.then((result) => {
      if (active) setData({ user: result.user, profile: result.profile });
    }).catch((requestError) => {
      if (active) setError(requestError.message || "Unable to load this profile.");
    }).finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [username]);

  const profile = data?.profile;
  const profileUser = data?.user;
  const isOwnProfile = Boolean(currentUser && profileUser && String(currentUser.id || currentUser._id) === String(profileUser._id || profileUser.id));
  const stats = profile?.statistics || {};
  const favoriteGames = (profile?.favoriteGames || []).map((game) => game.name).filter(Boolean);

  return (
    <main className="min-h-screen bg-gray-950 p-4 text-white sm:p-8">
      <div className="mx-auto max-w-5xl">
        {loading && <p className="rounded-xl bg-gray-900 p-6 text-center text-gray-400">Loading profile...</p>}
        {error && <p role="alert" className="rounded-xl bg-rose-500/10 p-4 text-rose-300">{error}</p>}
        {!loading && !error && profile && <>
          <section className="overflow-hidden rounded-3xl border border-white/10 bg-gray-900">
            <div className="h-36 bg-gradient-to-r from-violet-900 via-indigo-900 to-gray-900 sm:h-48" />
            <div className="px-6 pb-7">
              <div className="-mt-14 flex flex-wrap items-end justify-between gap-4">
                <div className="flex items-end gap-4">
                  <div className="flex h-24 w-24 items-center justify-center overflow-hidden rounded-2xl border-4 border-gray-900 bg-violet-600 text-4xl font-bold">
                    {profile.avatar || profileUser.avatar ? <img src={profile.avatar || profileUser.avatar} alt="" className="h-full w-full object-cover" /> : (profile.displayName || profileUser.username || "P").charAt(0).toUpperCase()}
                  </div>
                  <div className="pb-1">
                    <h1 className="text-2xl font-bold">{profile.displayName || profileUser.username}</h1>
                    <p className="text-sm text-gray-400">@{profileUser.username}</p>
                  </div>
                </div>
                {isOwnProfile && <Link to="/profile/edit" className="rounded-xl bg-violet-600 px-4 py-2 text-sm font-semibold hover:bg-violet-500">Edit profile</Link>}
              </div>
              {profile.bio && <p className="mt-5 max-w-2xl text-sm text-gray-300">{profile.bio}</p>}
              <div className="mt-3 flex flex-wrap gap-4 text-xs text-gray-500">
                {profile.country && <span>📍 {profile.country}</span>}
                {profileUser.createdAt && <span>📅 Joined {new Date(profileUser.createdAt).toLocaleDateString(undefined, { month: "long", year: "numeric" })}</span>}
              </div>
            </div>
          </section>

          <section className="mt-6 grid grid-cols-2 gap-3 lg:grid-cols-3">
            {[["Games played", stats.gamesPlayed], ["Games won", stats.gamesWon], ["Total score", stats.totalScore]].map(([label, value]) => (
              <div key={label} className="rounded-xl border border-white/10 bg-gray-900 p-5"><p className="text-2xl font-bold">{value ?? 0}</p><p className="mt-1 text-sm capitalize text-gray-400">{label}</p></div>
            ))}
          </section>

          {favoriteGames.length > 0 && <section className="mt-6 rounded-2xl border border-white/10 bg-gray-900 p-6">
            <div className="flex items-center justify-between"><h2 className="text-xl font-bold">Favorite games</h2><Link to="/games" className="text-sm text-violet-300">Explore games →</Link></div>
            <div className="mt-4 flex flex-wrap gap-2">{favoriteGames.map((game) => <span key={game} className="rounded-full border border-violet-500/20 bg-violet-500/10 px-4 py-2 text-sm text-violet-200">{game}</span>)}</div>
          </section>}
        </>}
      </div>
    </main>
  );
}
