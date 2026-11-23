
import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import Avatar from "../common/Avatar";

function Header({ onMenuClick }) {
  const { user } = useAuth();
  const navigate = useNavigate();

  const username = user?.username || user?.displayName || "Player";

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-white/10 bg-slate-950/95 px-4 backdrop-blur-xl sm:px-6">

      {/* Left section */}
      <div className="flex items-center gap-3">

        <button
          type="button"
          onClick={onMenuClick}
          aria-label="Open navigation menu"
          className="rounded-lg p-2 text-slate-300 hover:bg-white/10 lg:hidden"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-6 w-6">
            <path d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>

        <Link to="/dashboard" className="flex items-center gap-2">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-violet-600 to-fuchsia-600 text-lg">
            🎮
          </span>

          <span className="hidden text-xl font-black sm:block">
            Mini<span className="text-violet-400">Verse</span>
          </span>
        </Link>
      </div>

      {/* Search */}
      <div className="mx-4 hidden max-w-md flex-1 md:block">
        <label className="relative block">
          <span className="absolute inset-y-0 left-3 flex items-center text-slate-500">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4">
              <circle cx="11" cy="11" r="7" />
              <path d="m20 20-4-4" />
            </svg>
          </span>

          <input
            type="search"
            placeholder="Search games, players..."
            onKeyDown={(event) => {
              if (event.key === "Enter" && event.currentTarget.value.trim()) {
                navigate(`/games?search=${encodeURIComponent(event.currentTarget.value.trim())}`);
              }
            }}
            className="w-full rounded-xl border border-white/10 bg-slate-900 py-2.5 pl-10 pr-4 text-sm text-white outline-none placeholder:text-slate-500 focus:border-violet-500"
          />
        </label>
      </div>

      {/* Right section */}
      <div className="flex items-center gap-2 sm:gap-4">

        <Link
          to="/notifications"
          aria-label="Notifications"
          className="relative rounded-xl p-2 text-slate-300 hover:bg-white/10 hover:text-white"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-5 w-5">
            <path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9M10 21h4" />
          </svg>
        </Link>

        <Link
          to="/profile"
          className="flex items-center gap-2 rounded-xl p-1.5 hover:bg-white/5"
        >
          <Avatar
            src={user?.avatar}
            name={username}
            size="sm"
          />

          <span className="hidden max-w-28 truncate text-sm font-medium text-slate-200 lg:block">
            {username}
          </span>
        </Link>

      </div>
    </header>
  );
}

export default Header;
