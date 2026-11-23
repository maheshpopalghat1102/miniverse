
import React from "react";
import Avatar from "./Avatar";
import Badge from "./Badge";

function ScoreBoard({
  players = [],
  currentPlayerId,
  winnerId,
  title = "Scoreboard",
  showRank = true,
  className = "",
}) {
  const sortedPlayers = [...players].sort(
    (a, b) => (b.score || 0) - (a.score || 0)
  );

  if (players.length === 0) {
    return (
      <div className="rounded-xl border border-white/10 bg-slate-900 p-5 text-center text-sm text-slate-400">
        No players available.
      </div>
    );
  }

  return (
    <section
      className={`overflow-hidden rounded-2xl border border-white/10 bg-slate-900 ${className}`}
    >
      <header className="border-b border-white/10 px-4 py-3">
        <h3 className="font-semibold text-white">
          {title}
        </h3>
      </header>

      <div className="divide-y divide-white/5">
        {sortedPlayers.map((player, index) => {
          const id = player._id || player.id;
          const isWinner = winnerId != null && id === winnerId;
          const isCurrentPlayer =
            currentPlayerId != null && id === currentPlayerId;

          return (
            <div
              key={id || player.username || index}
              className={[
                "flex items-center gap-3 px-4 py-3",
                isWinner ? "bg-emerald-500/10" : "",
                isCurrentPlayer ? "bg-violet-500/5" : "",
              ].join(" ")}
            >
              {showRank && (
                <span className="w-6 text-center text-sm font-bold text-slate-400">
                  #{index + 1}
                </span>
              )}

              <Avatar
                src={player.avatar}
                name={player.username || player.name || "Player"}
                size="sm"
                online={player.online}
                showStatus={player.online !== undefined}
              />

              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-white">
                  {player.username || player.name || "Player"}
                  {isCurrentPlayer && (
                    <span className="ml-2 text-xs font-normal text-violet-400">
                      You
                    </span>
                  )}
                </p>

                {player.status && (
                  <p className="text-xs text-slate-400">
                    {player.status}
                  </p>
                )}
              </div>

              {isWinner && (
                <Badge variant="success" size="sm">
                  Winner
                </Badge>
              )}

              <span className="min-w-10 text-right text-lg font-bold tabular-nums text-white">
                {Number(player.score) || 0}
              </span>
            </div>
          );
        })}
      </div>
    </section>
  );
}

export default ScoreBoard;
