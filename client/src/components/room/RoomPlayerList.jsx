
import React from "react";
import Avatar from "../common/Avatar";
import Badge from "../common/Badge";
import EmptyState from "../common/EmptyState";

function RoomPlayerList({
  players = [],
  hostId,
  currentUserId,
  maxPlayers,
  isHost = false,
  onKick,
  onMakeHost,
  loadingPlayerId,
}) {
  const getId = (player) => player.user?._id || player.user?.id || player._id || player.id;

  return (
    <section className="rounded-2xl border border-white/10 bg-slate-900 p-4">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="font-bold text-white">
          Room Members
        </h3>

        <Badge variant="primary">
          {players.length}{maxPlayers ? ` / ${maxPlayers}` : ""}
        </Badge>
      </div>

      {players.length === 0 ? (
        <EmptyState
          icon="👥"
          title="No players yet"
          description="Invite friends to join your room."
        />
      ) : (
        <div className="space-y-3">
          {players.map((member, index) => {
            const user = member.user || member;
            const id = getId(member);
            const username = user.username || user.name || "Player";

            const isRoomHost =
              member.role === "host" ||
              (hostId != null && id === hostId);

            const isMe =
              currentUserId != null && id === currentUserId;

            const isOnline = member.isOnline ?? user.online ?? false;

            return (
              <div
                key={id || index}
                className="flex flex-wrap items-center gap-3 rounded-xl border border-white/5 bg-slate-800/60 p-3"
              >
                <Avatar
                  src={user.avatar}
                  name={username}
                  size="md"
                  online={isOnline}
                  showStatus
                />

                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="truncate text-sm font-semibold text-white">
                      {username}
                      {isMe && (
                        <span className="ml-1 text-xs font-normal text-violet-400">
                          (You)
                        </span>
                      )}
                    </p>

                    {isRoomHost && (
                      <Badge variant="warning" size="sm">
                        Host
                      </Badge>
                    )}
                  </div>

                  <p className="mt-1 text-xs text-slate-400">
                    {isOnline ? "Online" : "Offline"}
                  </p>
                </div>

                {isHost && !isMe && !isRoomHost && (
                  <div className="flex gap-2">
                    {onMakeHost && (
                      <button
                        type="button"
                        disabled={Boolean(loadingPlayerId)}
                        onClick={() => onMakeHost(id)}
                        className="rounded-lg px-2 py-1.5 text-xs text-violet-300 hover:bg-violet-500/10 disabled:opacity-50"
                      >
                        Make Host
                      </button>
                    )}

                    {onKick && (
                      <button
                        type="button"
                        disabled={loadingPlayerId === id}
                        onClick={() => onKick(id)}
                        className="rounded-lg px-2 py-1.5 text-xs text-red-400 hover:bg-red-500/10 disabled:opacity-50"
                      >
                        {loadingPlayerId === id ? "..." : "Remove"}
                      </button>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}

export default RoomPlayerList;
