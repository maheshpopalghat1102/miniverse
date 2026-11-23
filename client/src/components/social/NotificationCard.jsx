
import React from "react";

const notificationIcons = {
  friend_request: "👥",
  friend_accepted: "🤝",
  game_invite: "🎮",
  achievement: "🏆",
  match_result: "🎯",
  system: "🔔",
};

export default function NotificationCard({
  notification,
  onClick,
  onMarkRead,
  onDelete,
}) {
  if (!notification) return null;

  const {
    _id,
    id,
    type = "system",
    title = "Notification",
    message = "",
    isRead = false,
    createdAt,
  } = notification;

  const notificationId = _id || id;
  const icon = notificationIcons[type] || "🔔";

  const formattedDate = createdAt
    ? new Date(createdAt).toLocaleString()
    : "";

  return (
    <article
      className={`flex gap-3 rounded-xl border p-4 transition ${
        isRead
          ? "border-white/5 bg-gray-900/50"
          : "border-violet-500/20 bg-violet-500/5"
      }`}
    >
      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gray-800 text-xl">
        {icon}
      </div>

      <button
        type="button"
        onClick={() => {
          if (!isRead) onMarkRead?.(notificationId);
          onClick?.(notification);
        }}
        className="min-w-0 flex-1 text-left"
      >
        <div className="flex items-center gap-2">
          <h3 className="font-semibold text-white">{title}</h3>
          {!isRead && (
            <span className="h-2 w-2 rounded-full bg-violet-400" />
          )}
        </div>

        <p className="mt-1 text-sm text-gray-400">{message}</p>

        {formattedDate && (
          <time className="mt-2 block text-xs text-gray-500">
            {formattedDate}
          </time>
        )}
      </button>

      <button
        type="button"
        onClick={() => onDelete?.(notificationId)}
        aria-label="Delete notification"
        className="h-8 shrink-0 rounded-lg px-2 text-gray-500 hover:bg-white/10 hover:text-white"
      >
        ×
      </button>
    </article>
  );
}
