
import React from "react";

export default function FriendRequest({
  request,
  direction = "incoming",
  onAccept,
  onReject,
  onCancel,
  onViewProfile,
  loading = false,
}) {
  if (!request) return null;

  const user =
    direction === "incoming"
      ? request.requester || request.user || {}
      : request.recipient || request.user || {};

  const name = user.displayName || user.username || "Player";

  return (
    <article className="flex flex-col gap-3 rounded-xl border border-white/10 bg-gray-900/70 p-4 sm:flex-row sm:items-center">
      <button
        type="button"
        onClick={() => onViewProfile?.(user)}
        className="flex min-w-0 flex-1 items-center gap-3 text-left"
      >
        <img
          src={user.avatar || "/images/default-avatar.png"}
          alt={`${name}'s avatar`}
          className="h-11 w-11 rounded-full bg-gray-800 object-cover"
        />

        <div className="min-w-0">
          <p className="truncate font-semibold text-white">{name}</p>
          <p className="truncate text-sm text-gray-400">
            @{user.username || "player"}
          </p>
          <p className="mt-1 text-xs text-gray-500">
            {direction === "incoming"
              ? "Wants to be your friend"
              : "Friend request sent"}
          </p>
        </div>
      </button>

      <div className="flex gap-2">
        {direction === "incoming" ? (
          <>
            <button
              type="button"
              disabled={loading}
              onClick={() => onAccept?.(request._id || request.id)}
              className="rounded-lg bg-emerald-600 px-3 py-2 text-sm font-medium text-white hover:bg-emerald-500 disabled:opacity-50"
            >
              Accept
            </button>
            <button
              type="button"
              disabled={loading}
              onClick={() => onReject?.(request._id || request.id)}
              className="rounded-lg border border-white/10 px-3 py-2 text-sm text-gray-300 hover:bg-white/10 disabled:opacity-50"
            >
              Decline
            </button>
          </>
        ) : (
          <button
            type="button"
            disabled={loading}
            onClick={() => onCancel?.(request._id || request.id)}
            className="rounded-lg border border-rose-500/20 px-3 py-2 text-sm text-rose-300 hover:bg-rose-500/10 disabled:opacity-50"
          >
            Cancel request
          </button>
        )}
      </div>
    </article>
  );
}
