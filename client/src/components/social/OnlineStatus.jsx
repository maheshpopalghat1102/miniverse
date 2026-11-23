
import React from "react";

const statusStyles = {
  online: "bg-emerald-500",
  offline: "bg-gray-500",
  away: "bg-amber-400",
  busy: "bg-rose-500",
};

export default function OnlineStatus({
  status = "offline",
  showLabel = false,
  size = "md",
  className = "",
}) {
  const normalizedStatus = statusStyles[status] ? status : "offline";

  const sizes = {
    sm: "h-2 w-2",
    md: "h-2.5 w-2.5",
    lg: "h-3.5 w-3.5",
  };

  return (
    <span className={`inline-flex items-center gap-2 ${className}`}>
      <span
        className={`${sizes[size] || sizes.md} rounded-full ${
          statusStyles[normalizedStatus]
        } ring-2 ring-gray-900`}
        aria-label={normalizedStatus}
        title={normalizedStatus}
      />
      {showLabel && (
        <span className="text-sm capitalize text-gray-400">
          {normalizedStatus}
        </span>
      )}
    </span>
  );
}
