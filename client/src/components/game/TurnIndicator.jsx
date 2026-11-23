
import React from "react";
import Avatar from "../common/Avatar";

function TurnIndicator({
  currentPlayer,
  currentUserId,
  round,
  totalRounds,
  isMyTurn = false,
  timeRemaining,
  className = "",
}) {
  const playerName =
    currentPlayer?.username ||
    currentPlayer?.name ||
    "Waiting for player";

  return (
    <section
      aria-live="polite"
      className={`rounded-2xl border p-4 ${
        isMyTurn
          ? "border-emerald-500/30 bg-emerald-500/10"
          : "border-violet-500/20 bg-violet-500/10"
      } ${className}`}
    >
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          {currentPlayer && (
            <Avatar
              src={currentPlayer.avatar}
              name={playerName}
              size="md"
              online={Boolean(currentPlayer.online)}
              showStatus={currentPlayer.online !== undefined}
            />
          )}

          <div>
            <p className="text-xs text-slate-400">
              {isMyTurn ? "Your turn!" : "Current turn"}
            </p>

            <h3 className="mt-1 font-bold text-white">
              {isMyTurn ? "Make your move" : playerName}
            </h3>
          </div>
        </div>

        {typeof round === "number" && (
          <div className="text-right">
            <p className="text-xs text-slate-400">
              Round
            </p>

            <p className="font-bold text-white">
              {round}{totalRounds ? ` / ${totalRounds}` : ""}
            </p>
          </div>
        )}
      </div>

      {timeRemaining !== undefined && (
        <div className="mt-3 border-t border-white/10 pt-3 text-center text-xs text-slate-300">
          ⏱️ {timeRemaining} seconds remaining
        </div>
      )}
    </section>
  );
}

export default TurnIndicator;
