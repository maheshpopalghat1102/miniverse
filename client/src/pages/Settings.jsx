
import { useEffect, useState } from "react";
import ThemeSelector from "../components/ui/ThemeSelector";
import userService from "../services/userService";
import { useTheme } from "../themes/ThemeProvider";

function SettingToggle({ label, description, checked, onChange }) {
  return (
    <label className="flex cursor-pointer items-center justify-between gap-4 py-4">
      <span>
        <span className="block text-sm font-medium text-white">{label}</span>
        <span className="mt-1 block text-xs text-gray-400">{description}</span>
      </span>
      <input
        type="checkbox"
        checked={checked}
        onChange={(event) => onChange(event.target.checked)}
        className="h-5 w-5 shrink-0 accent-violet-500"
      />
    </label>
  );
}

export default function Settings() {
  const { theme, setTheme } = useTheme();
  const [settings, setSettings] = useState({
    gameInvites: true,
    friendRequests: true,
    achievements: true,
    emailNotifications: false,
    showOnlineStatus: true,
    showGameActivity: true,
    privateProfile: false,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    userService.getMyProfile().then((result) => {
      const profile = result.profile || result.data?.profile || {};
      setTheme(profile.theme || "midnight");
      setSettings((current) => ({
        ...current,
        ...(profile.notifications || {}),
        showOnlineStatus: profile.privacy?.showOnlineStatus ?? current.showOnlineStatus,
        showGameActivity: profile.privacy?.showGameHistory ?? current.showGameActivity,
        privateProfile: profile.privacy?.profileVisibility === "private",
      }));
    }).catch((requestError) => setError(requestError.message || "Unable to load your settings."));
  }, [setTheme]);

  const updateSetting = (key, value) => {
    setSettings((current) => ({ ...current, [key]: value }));
  };

  const saveSettings = async (nextTheme = theme, nextSettings = settings) => {
    setError("");
    setMessage("");
    setLoading(true);
    try {
      await userService.updatePreferences({
        theme: nextTheme,
        notifications: {
          gameInvites: nextSettings.gameInvites,
          friendRequests: nextSettings.friendRequests,
          achievements: nextSettings.achievements,
          emailNotifications: nextSettings.emailNotifications,
        },
        privacy: {
          showOnlineStatus: nextSettings.showOnlineStatus,
          showGameHistory: nextSettings.showGameActivity,
          profileVisibility: nextSettings.privateProfile ? "private" : "public",
          allowFriendRequests: true,
        },
      });
      setMessage("Settings saved.");
    } catch (requestError) {
      setError(requestError.message || "Unable to save your settings.");
    } finally {
      setLoading(false);
    }
  };

  const resetSettings = () => {
    const defaults = {
      gameInvites: true,
      friendRequests: true,
      achievements: true,
      emailNotifications: false,
      showOnlineStatus: true,
      showGameActivity: true,
      privateProfile: false,
    };
    setTheme("midnight");
    setSettings(defaults);
    saveSettings("midnight", defaults);
  };

  return (
    <main className="min-h-screen bg-gray-950 p-4 text-white sm:p-8">
      <div className="mx-auto max-w-4xl">
        <h1 className="text-3xl font-bold">Settings</h1>
        <p className="mt-2 text-gray-400">Manage your MiniVerse experience.</p>
        {error && <p role="alert" className="mt-5 rounded-lg bg-rose-500/10 p-3 text-sm text-rose-300">{error}</p>}
        {message && <p role="status" className="mt-5 rounded-lg bg-emerald-500/10 p-3 text-sm text-emerald-300">{message}</p>}

        <section className="mt-7 rounded-2xl border border-white/10 bg-gray-900 p-6">
          <h2 className="text-lg font-bold">Appearance</h2>
          <p className="mt-1 text-sm text-gray-400">Choose your preferred theme.</p>
          <div className="mt-5">
            <ThemeSelector value={theme} onChange={setTheme} />
          </div>
        </section>

        <section className="mt-5 rounded-2xl border border-white/10 bg-gray-900 p-6">
          <h2 className="text-lg font-bold">Notifications</h2>
          <div className="mt-3 divide-y divide-white/5">
            <SettingToggle label="Game invitations" description="Receive invitations to join games." checked={settings.gameInvites} onChange={(v) => updateSetting("gameInvites", v)} />
            <SettingToggle label="Friend requests" description="Get notified when someone sends a friend request." checked={settings.friendRequests} onChange={(v) => updateSetting("friendRequests", v)} />
            <SettingToggle label="Achievements" description="Get notified when you unlock achievements." checked={settings.achievements} onChange={(v) => updateSetting("achievements", v)} />
            <SettingToggle label="Email notifications" description="Receive selected notifications by email." checked={settings.emailNotifications} onChange={(v) => updateSetting("emailNotifications", v)} />
          </div>
        </section>

        <section className="mt-5 rounded-2xl border border-white/10 bg-gray-900 p-6">
          <h2 className="text-lg font-bold">Privacy</h2>
          <div className="mt-3 divide-y divide-white/5">
            <SettingToggle label="Show online status" description="Let friends see when you're online." checked={settings.showOnlineStatus} onChange={(v) => updateSetting("showOnlineStatus", v)} />
            <SettingToggle label="Show game activity" description="Let friends see which game you're playing." checked={settings.showGameActivity} onChange={(v) => updateSetting("showGameActivity", v)} />
            <SettingToggle label="Private profile" description="Restrict visibility of your profile information." checked={settings.privateProfile} onChange={(v) => updateSetting("privateProfile", v)} />
          </div>
        </section>

        <div className="mt-6 flex flex-wrap gap-3">
          <button type="button" onClick={() => saveSettings()} disabled={loading} className="rounded-xl bg-violet-600 px-6 py-3 font-semibold hover:bg-violet-500 disabled:opacity-50">{loading ? "Saving..." : "Save settings"}</button>
          <button type="button" onClick={resetSettings} disabled={loading} className="rounded-xl border border-white/10 px-6 py-3 text-gray-300 hover:bg-white/10 disabled:opacity-50">
            Reset preferences
          </button>
        </div>
      </div>
    </main>
  );
}
