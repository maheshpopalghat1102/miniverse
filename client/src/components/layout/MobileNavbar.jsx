
import React from "react";
import { Link, useLocation } from "react-router-dom";

const links = [
  { label: "Discover", path: "/games", icon: "🎮" },
  { label: "Multiplayer", path: "/games/multiplayer", icon: "👥" },
  { label: "Single Player", path: "/games/single-player", icon: "🕹️" },
  { label: "Turn by Turn", path: "/games/turn-by-turn", icon: "🔄" },
];

function MobileNavbar() {
  const location = useLocation();

  function isActive(path) {
    if (path === "/games") {
      return location.pathname === "/games";
    }

    return location.pathname === path;
  }

  return (
    <nav className="sticky top-16 z-20 border-b border-white/10 bg-slate-950/95 px-3 py-2 backdrop-blur-xl lg:hidden">
      <div className="flex gap-2 overflow-x-auto scrollbar-hide">
        {links.map((item) => {
          const active = isActive(item.path);

          return (
            <Link
              key={item.path}
              to={item.path}
              aria-current={active ? "page" : undefined}
              className={[
                "flex shrink-0 items-center gap-2 rounded-xl px-3 py-2 text-xs font-semibold transition",
                active
                  ? "bg-violet-600 text-white"
                  : "bg-slate-900 text-slate-400 hover:text-white",
              ].join(" ")}
            >
              <span>{item.icon}</span>
              {item.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

export default MobileNavbar;
