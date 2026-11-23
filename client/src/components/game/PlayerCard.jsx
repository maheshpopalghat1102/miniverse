
import React from "react";
import Avatar from "../common/Avatar";
import Badge from "../common/Badge";

function PlayerCard({
  player,
  isCurrentPlayer = false,
  isHost = false,
  isWinner = false,
  showScore = true,
  onClick,
  className = "",
}) {
  if (!player) return null;

  const name = player.username || player.name || "Player";

  return (
    <div
      onClick={onClick}
      onKeyDown={(event) => {
        if (onClick && (event.key === "Enter" || event.key === " ")) {
          event.preventDefault();
          onClick(player);
        }
      }}
      role={onClick ? "button" : undefined}
      tabIndex={onClick ? 0 : undefined}
      className={[
        "flex items-center gap-3 rounded-xl border p-3 transition",
        isCurrentPlayer
          ? "border-violet-500/50 bg-violet-500/10"
          : "border-white/10 bg-slate-900",
        onClick ? "cursor-pointer hover:border-violet-500/40" : "",
        className,
      ].join(" ")}
    >
      <Avatar
        src={player.avatar}
        name={name}
        size="md"
        online={Boolean(player.online)}
        showStatus={player.online !== undefined}
      />

      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <p className="truncate text-sm font-semibold text-white">
            {name}
          </p>

          {isHost && (
            <Badge variant="warning" size="sm">
              Host
            </Badge>
          )}

          {isWinner && (
            <Badge variant="success" size="sm">
              Winner
            </Badge>
          )}
        </div>

        <p className="mt-1 text-xs text-slate-400">
          {isCurrentPlayer ? "Current turn" : player.online ? "Online" : "Offline"}
        </p>
      </div>

      {showScore && (
        <div className="text-right">
          <p className="text-lg font-bold tabular-nums text-white">
            {Number(player.score) || 0}
          </p>
          <p className="text-[10px] uppercase tracking-wider text-slate-500">
            Score
          </p>
        </div>
      )}
    </div>
  );
}

export default PlayerCard;
