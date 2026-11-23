

import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import userService from "../services/userService";
import { useAuth } from "../context/AuthContext";

const initialProfile = {
  displayName: "",
  username: "",
  bio: "",
  country: "",
  language: "en",
};

export default function EditProfile() {
  const navigate = useNavigate();
  const { updateUser } = useAuth();
  const [form, setForm] = useState(initialProfile);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    userService.getMyProfile().then((result) => {
      const profile = result.profile || result.data?.profile || {};
      const user = result.user || result.data?.user || {};
      setForm({
        displayName: profile.displayName || "",
        username: user.username || "",
        bio: profile.bio || "",
        country: profile.country || "",
        language: profile.language || "en",
      });
    }).catch((requestError) => setError(requestError.message || "Unable to load your profile."));
  }, []);

  const update = (event) => {
    setForm((current) => ({ ...current, [event.target.name]: event.target.value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");

    if (!form.displayName.trim() || !form.username.trim()) {
      setError("Display name and username are required.");
      return;
    }

    if (!/^[a-zA-Z0-9_]{3,20}$/.test(form.username)) {
      setError("Username must be 3–20 characters using letters, numbers, or underscores.");
      return;
    }

    setLoading(true);
    try {
      const result = await userService.updateMyProfile({
        displayName: form.displayName.trim(),
        username: form.username.trim(),
        bio: form.bio.trim(),
        country: form.country.trim(),
        language: form.language,
      });
      if (result.user) updateUser(result.user);
      navigate("/profile", { replace: true, state: { profileUpdated: true } });
    } catch (requestError) {
      setError(requestError.message || "Unable to save your profile.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-gray-950 p-4 text-white sm:p-8">
      <div className="mx-auto max-w-2xl">
        <Link to="/profile" className="text-sm text-violet-300">← Back to profile</Link>
        <section className="mt-5 rounded-2xl border border-white/10 bg-gray-900 p-6 sm:p-8">
          <h1 className="text-2xl font-bold">Edit profile</h1>
          <p className="mt-2 text-sm text-gray-400">Update your public player information.</p>

          <form onSubmit={handleSubmit} className="mt-7 space-y-5">
            <div>
              <label htmlFor="displayName" className="mb-2 block text-sm font-medium">Display name</label>
              <input id="displayName" name="displayName" value={form.displayName} onChange={update} maxLength={40} className="w-full rounded-xl border border-white/10 bg-gray-800 p-3 text-white outline-none focus:border-violet-500" />
            </div>

            <div>
              <label htmlFor="username" className="mb-2 block text-sm font-medium">Username</label>
              <input id="username" name="username" value={form.username} onChange={update} maxLength={20} className="w-full rounded-xl border border-white/10 bg-gray-800 p-3 text-white outline-none focus:border-violet-500" />
              <p className="mt-1 text-xs text-gray-500">3–20 letters, numbers, or underscores.</p>
            </div>

            <div>
              <label htmlFor="bio" className="mb-2 block text-sm font-medium">Bio</label>
              <textarea id="bio" name="bio" value={form.bio} onChange={update} rows={4} maxLength={250} className="w-full resize-y rounded-xl border border-white/10 bg-gray-800 p-3 text-white outline-none focus:border-violet-500" />
              <p className="mt-1 text-right text-xs text-gray-500">{form.bio.length}/250</p>
            </div>

            <div>
              <label htmlFor="country" className="mb-2 block text-sm font-medium">Country</label>
              <input id="country" name="country" value={form.country} onChange={update} maxLength={60} className="w-full rounded-xl border border-white/10 bg-gray-800 p-3 text-white outline-none focus:border-violet-500" />
            </div>

            <div>
              <label htmlFor="language" className="mb-2 block text-sm font-medium">Language</label>
              <select id="language" name="language" value={form.language} onChange={update} className="w-full rounded-xl border border-white/10 bg-gray-800 p-3 text-white">
                <option value="en">English</option>
                <option value="hi">Hindi</option>
                <option value="mr">Marathi</option>
              </select>
            </div>

            {error && <p role="alert" className="rounded-lg bg-amber-500/10 p-3 text-sm text-amber-300">{error}</p>}

            <div className="flex flex-wrap gap-3">
              <button type="submit" disabled={loading} className="rounded-xl bg-violet-600 px-6 py-3 font-semibold hover:bg-violet-500 disabled:opacity-50">{loading ? "Saving..." : "Save changes"}</button>
              <button type="button" onClick={() => navigate("/profile")} className="rounded-xl border border-white/10 px-6 py-3 text-gray-300 hover:bg-white/10">Cancel</button>
            </div>
          </form>
        </section>
      </div>
    </main>
  );
}
