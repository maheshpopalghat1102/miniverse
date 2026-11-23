
import React from "react";
import { Link, useLocation } from "react-router-dom";

const sections = [
  {
    title: "MAIN MENU",
    items: [
      { label: "Dashboard", path: "/dashboard", icon: "🏠" },
      { label: "Explore Games", path: "/games", icon: "🎮" },
      { label: "Multiplayer", path: "/games/multiplayer", icon: "👥" },
      { label: "Single Player", path: "/games/single-player", icon: "🕹️" },
      { label: "Turn by Turn", path: "/games/turn-by-turn", icon: "🔄" },
    ],
  },
  {
    title: "SOCIAL",
    items: [
      { label: "Friends", path: "/friends", icon: "🤝" },
      { label: "Notifications", path: "/notifications", icon: "🔔" },
    ],
  },
  {
    title: "PROGRESSION",
    items: [
      { label: "Leaderboard", path: "/leaderboard", icon: "🏆" },
      { label: "Achievements", path: "/achievements", icon: "🏅" },
      { label: "Game History", path: "/game-history", icon: "📊" },
    ],
  },
  {
    title: "ACCOUNT",
    items: [
      { label: "My Profile", path: "/profile", icon: "👤" },
      { label: "Settings", path: "/settings", icon: "⚙️" },
    ],
  },
];

function Sidebar({
  collapsed = false,
  mobile = false,
  onToggleCollapse,
  onNavigate,
}) {
  const location = useLocation();

  function isActive(path) {
    if (path === "/games") {
      return (
        location.pathname === "/games" ||
        location.pathname.startsWith("/games/")
      );
    }

    if (path === "/profile") {
      return location.pathname === "/profile";
    }

    return location.pathname === path;
  }

  return (
    <div className="flex min-h-full flex-col">

      {/* Sidebar header */}
      <div className="flex h-16 items-center justify-between border-b border-white/10 px-4">
        {!collapsed && (
          <span className="text-xs font-bold tracking-widest text-slate-500">
            MENU
          </span>
        )}

        {!mobile && (
          <button
            type="button"
            onClick={onToggleCollapse}
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            className="rounded-lg p-2 text-slate-400 hover:bg-white/10 hover:text-white"
          >
            {collapsed ? "→" : "←"}
          </button>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-6 overflow-y-auto p-3">
        {sections.map((section) => (
          <div key={section.title}>
            {!collapsed && (
              <h3 className="mb-2 px-3 text-[10px] font-bold tracking-[0.15em] text-slate-500">
                {section.title}
              </h3>
            )}

            <div className="space-y-1">
              {section.items.map((item) => {
                const active = isActive(item.path);

                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    title={collapsed ? item.label : undefined}
                    onClick={onNavigate}
                    aria-current={active ? "page" : undefined}
                    className={[
                      "flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium transition",
                      collapsed ? "justify-center" : "",
                      active
                        ? "bg-violet-600/20 text-violet-300"
                        : "text-slate-400 hover:bg-white/5 hover:text-white",
                    ].join(" ")}
                  >
                    <span className="text-lg" aria-hidden="true">
                      {item.icon}
                    </span>

                    {!collapsed && (
                      <span className="truncate">
                        {item.label}
                      </span>
                    )}

                    {active && !collapsed && (
                      <span className="ml-auto h-1.5 w-1.5 rounded-full bg-violet-400" />
                    )}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* Bottom promotion */}
      {!collapsed && (
        <div className="m-3 rounded-2xl border border-violet-500/20 bg-gradient-to-br from-violet-600/20 to-fuchsia-600/10 p-4">
          <div className="text-2xl">🚀</div>

          <p className="mt-2 text-sm font-bold text-white">
            Ready to play?
          </p>

          <p className="mt-1 text-xs leading-5 text-slate-400">
            Invite friends and start a new game.
          </p>

          <Link
            to="/rooms/create"
            onClick={onNavigate}
            className="mt-3 block rounded-lg bg-violet-600 px-3 py-2 text-center text-xs font-semibold text-white hover:bg-violet-500"
          >
            Create Room
          </Link>
        </div>
      )}
    </div>
  );
}

export default Sidebar;
