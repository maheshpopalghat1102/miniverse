
import React from "react";
import Button from "../common/Button";
import Badge from "../common/Badge";
import Avatar from "../common/Avatar";
import RoomCode from "./RoomCode";

function RoomWaiting({
  room,
  players = [],
  currentUserId,
  isHost = false,
  isReady = false,
  onReady,
  onStart,
  onShare,
  starting = false,
  minPlayers = 2,
}) {
  const maxPlayers = room?.maxPlayers || 4;
  const readyCount = players.filter((player) => player.isReady).length;

  const canStart =
    isHost &&
    players.length >= minPlayers &&
    players.every((player) => player.isReady || player.isHost);

  return (
    <section className="mx-auto w-full max-w-3xl space-y-6 rounded-2xl border border-white/10 bg-slate-900 p-5 sm:p-7">
      <div className="text-center">
        <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-3xl bg-violet-500/15 text-4xl">
          🎮
        </div>

        <Badge variant="warning" dot>
          Waiting for players
        </Badge>

        <h2 className="mt-4 text-2xl font-black text-white">
          Your game room is ready!
        </h2>

        <p className="mt-2 text-sm text-slate-400">
          Invite friends and get ready to play.
        </p>
      </div>

      <RoomCode
        code={room?.roomCode}
        onShare={onShare}
      />

      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-xl bg-slate-800 p-4 text-center">
          <p className="text-2xl font-black text-white">
            {players.length}/{maxPlayers}
          </p>
          <p className="mt-1 text-xs text-slate-400">
            Players
          </p>
        </div>

        <div className="rounded-xl bg-slate-800 p-4 text-center">
          <p className="text-2xl font-black text-emerald-400">
            {readyCount}
          </p>
          <p className="mt-1 text-xs text-slate-400">
            Ready players
          </p>
        </div>
      </div>

      <div>
        <h3 className="mb-3 font-semibold text-white">
          Players in Room
        </h3>

        <div className="grid gap-3 sm:grid-cols-2">
          {players.map((player, index) => {
            const user = player.user || player;
            const id = user._id || user.id;
            const name = user.username || user.name || "Player";

            return (
              <div
                key={id || index}
                className="flex items-center gap-3 rounded-xl bg-slate-800 p-3"
              >
                <Avatar
                  src={user.avatar}
                  name={name}
                  size="sm"
                />

                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-white">
                    {name}
                    {id === currentUserId ? " (You)" : ""}
                  </p>

                  <p className="text-xs text-slate-400">
                    {player.isReady ? "Ready" : "Not ready"}
                  </p>
                </div>

                <Badge
                  variant={player.isReady ? "success" : "warning"}
                  size="sm"
                >
                  {player.isReady ? "✓ Ready" : "Waiting"}
                </Badge>
              </div>
            );
          })}
        </div>
      </div>

      <div className="border-t border-white/10 pt-5">
        {isHost ? (
          <Button
            fullWidth
            onClick={onStart}
            loading={starting}
            disabled={!canStart}
          >
            🚀 Start Game
          </Button>
        ) : (
          <Button
            fullWidth
            variant={isReady ? "success" : "primary"}
            onClick={onReady}
          >
            {isReady ? "✓ You're Ready" : "I'm Ready"}
          </Button>
        )}

        {!canStart && isHost && (
          <p className="mt-3 text-center text-xs text-slate-400">
            Waiting for enough players to be ready.
          </p>
        )}
      </div>
    </section>
  );
}

export default RoomWaiting;
