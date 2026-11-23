
import React from "react";
import Avatar from "../common/Avatar";
import Button from "../common/Button";
import Badge from "../common/Badge";

function GameResult({
  status = "completed",
  winner,
  players = [],
  duration,
  message,
  onRematch,
  onExit,
  rematchLoading = false,
}) {
  const isDraw = status === "draw";

  return (
    <section className="mx-auto w-full max-w-xl overflow-hidden rounded-3xl border border-white/10 bg-slate-900 shadow-2xl">
      <div className="bg-gradient-to-br from-violet-700/30 to-fuchsia-700/10 px-6 py-8 text-center">
        <div className="mb-4 text-6xl">
          {isDraw ? "🤝" : "🏆"}
        </div>

        <Badge variant={isDraw ? "warning" : "success"}>
          {isDraw ? "Match Draw" : "Match Completed"}
        </Badge>

        <h2 className="mt-4 text-3xl font-black text-white">
          {isDraw ? "It's a Draw!" : "Victory!"}
        </h2>

        {winner && !isDraw && (
          <div className="mt-5 flex flex-col items-center gap-2">
            <Avatar
              src={winner.avatar}
              name={winner.username || winner.name}
              size="xl"
            />

            <p className="text-lg font-bold text-white">
              {winner.username || winner.name}
            </p>

            <p className="text-sm text-violet-300">
              Winner
            </p>
          </div>
        )}

        {message && (
          <p className="mt-3 text-sm text-slate-300">
            {message}
          </p>
        )}
      </div>

      <div className="p-5">
        {duration !== undefined && (
          <p className="mb-4 text-center text-xs text-slate-400">
            Match duration: {duration}
          </p>
        )}

        <div className="space-y-3">
          {players.map((player, index) => {
            const isWinner =
              winner &&
              (winner.id || winner._id) ===
                (player.id || player._id);

            return (
              <div
                key={player.id || player._id || index}
                className="flex items-center gap-3 rounded-xl bg-slate-800/70 p-3"
              >
                <Avatar
                  src={player.avatar}
                  name={player.username || player.name}
                  size="sm"
                />

                <span className="min-w-0 flex-1 truncate text-sm font-semibold text-white">
                  {player.username || player.name}
                </span>

                {isWinner && (
                  <Badge variant="success" size="sm">
                    Winner
                  </Badge>
                )}

                <span className="font-bold tabular-nums text-white">
                  {Number(player.score) || 0}
                </span>
              </div>
            );
          })}
        </div>

        <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2">
          {onRematch && (
            <Button
              onClick={onRematch}
              loading={rematchLoading}
              fullWidth
            >
              🔄 Play Again
            </Button>
          )}

          {onExit && (
            <Button
              variant="outline"
              onClick={onExit}
              fullWidth
            >
              Exit Game
            </Button>
          )}
        </div>
      </div>
    </section>
  );
}

export default GameResult;
