
import React from "react";
import OnlineStatus from "./OnlineStatus";

export default function FriendCard({
  friend,
  onMessage,
  onRemove,
  onViewProfile,
  onInvite,
  showInvite = false,
}) {
  if (!friend) return null;

  const {
    _id,
    id,
    username = "Player",
    displayName,
    avatar,
    status = "offline",
    currentGame,
    level,
  } = friend;

  const friendId = _id || id;
  const name = displayName || username;

  return (
    <article className="flex flex-col gap-4 rounded-2xl border border-white/10 bg-gray-900/70 p-4 transition hover:border-violet-500/40 sm:flex-row sm:items-center">
      <button
        type="button"
        onClick={() => onViewProfile?.(friend)}
        className="flex min-w-0 flex-1 items-center gap-3 text-left"
      >
        <div className="relative shrink-0">
          <img
            src={avatar || "/images/default-avatar.png"}
            alt={`${name}'s avatar`}
            className="h-12 w-12 rounded-full bg-gray-800 object-cover"
          />
          <span className="absolute bottom-0 right-0">
            <OnlineStatus status={status} size="md" />
          </span>
        </div>

        <div className="min-w-0">
          <h3 className="truncate font-semibold text-white">{name}</h3>
          <p className="truncate text-sm text-gray-400">@{username}</p>
          {currentGame && (
            <p className="mt-1 truncate text-xs text-violet-300">
              Playing {currentGame}
            </p>
          )}
          {level != null && (
            <p className="mt-1 text-xs text-gray-500">Level {level}</p>
          )}
        </div>
      </button>

      <div className="flex flex-wrap gap-2">
        {showInvite && (
          <button
            type="button"
            onClick={() => onInvite?.(friend)}
            className="rounded-lg bg-violet-600 px-3 py-2 text-sm font-medium text-white hover:bg-violet-500"
          >
            Invite
          </button>
        )}

        {onMessage && <button
          type="button"
          onClick={() => onMessage?.(friend)}
          className="rounded-lg border border-white/10 px-3 py-2 text-sm text-gray-200 hover:bg-white/10"
        >
          Message
        </button>}

        {onRemove && <button
          type="button"
          onClick={() => onRemove?.(friendId)}
          className="rounded-lg border border-rose-500/20 px-3 py-2 text-sm text-rose-300 hover:bg-rose-500/10"
        >
          Remove
        </button>}
      </div>
    </article>
  );
}
