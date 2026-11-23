
import React from "react";
import { Link, useLocation } from "react-router-dom";

const navigation = [
  { label: "Home", path: "/dashboard", icon: "🏠" },
  { label: "Games", path: "/games", icon: "🎮" },
  { label: "Friends", path: "/friends", icon: "👥" },
  { label: "Ranks", path: "/leaderboard", icon: "🏆" },
  { label: "Profile", path: "/profile", icon: "👤" },
];

function BottomNavigation() {
  const location = useLocation();

  function isActive(path) {
    if (path === "/games") {
      return location.pathname.startsWith("/games");
    }

    if (path === "/profile") {
      return location.pathname === "/profile";
    }

    return location.pathname === path;
  }

  return (
    <nav
      aria-label="Mobile navigation"
      className="fixed inset-x-0 bottom-0 z-40 border-t border-white/10 bg-slate-950/95 px-2 pb-[env(safe-area-inset-bottom)] pt-2 backdrop-blur-xl lg:hidden"
    >
      <div className="mx-auto flex max-w-lg items-center justify-around">
        {navigation.map((item) => {
          const active = isActive(item.path);

          return (
            <Link
              key={item.path}
              to={item.path}
              aria-current={active ? "page" : undefined}
              className={[
                "flex min-w-0 flex-1 flex-col items-center gap-1 rounded-xl px-1 py-2 transition",
                active
                  ? "text-violet-400"
                  : "text-slate-500 hover:text-white",
              ].join(" ")}
            >
              <span className="text-xl" aria-hidden="true">
                {item.icon}
              </span>

              <span className="text-[10px] font-semibold">
                {item.label}
              </span>

              {active && (
                <span className="h-1 w-1 rounded-full bg-violet-400" />
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

export default BottomNavigation;
