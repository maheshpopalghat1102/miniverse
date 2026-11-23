
import React from "react";
import Badge from "../common/Badge";

function GameHeader({
  title = "Game",
  subtitle,
  gameIcon = "🎮",
  category,
  roomCode,
  status = "waiting",
  onBack,
  actions,
}) {
  const statusVariants = {
    waiting: "warning",
    playing: "success",
    completed: "info",
    cancelled: "danger",
  };

  return (
    <header className="flex flex-wrap items-center justify-between gap-4 border-b border-white/10 pb-5">
      <div className="flex min-w-0 items-center gap-3">
        {onBack && (
          <button
            type="button"
            onClick={onBack}
            aria-label="Go back"
            className="rounded-xl bg-slate-800 p-2 text-slate-300 hover:bg-slate-700 hover:text-white"
          >
            ←
          </button>
        )}

        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-violet-500/15 text-2xl">
          {gameIcon}
        </div>

        <div className="min-w-0">
          <h1 className="truncate text-xl font-bold text-white sm:text-2xl">
            {title}
          </h1>

          {subtitle && (
            <p className="mt-1 truncate text-xs text-slate-400">
              {subtitle}
            </p>
          )}
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        {category && (
          <Badge variant="primary">
            {category}
          </Badge>
        )}

        <Badge variant={statusVariants[status] || "default"} dot>
          {status}
        </Badge>

        {roomCode && (
          <div className="rounded-lg border border-white/10 bg-slate-900 px-3 py-2 text-xs text-slate-300">
            Room: <span className="font-bold text-white">{roomCode}</span>
          </div>
        )}

        {actions}
      </div>
    </header>
  );
}

export default GameHeader;
