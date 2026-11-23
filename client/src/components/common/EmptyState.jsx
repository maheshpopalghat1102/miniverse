
import React from "react";
import Button from "./Button";

function EmptyState({
  icon = "🎮",
  title = "Nothing here yet",
  description = "There is no data to display right now.",
  actionLabel,
  onAction,
  className = "",
}) {
  return (
    <div
      className={[
        "flex flex-col items-center justify-center rounded-2xl border border-dashed border-white/10 bg-slate-900/50 px-6 py-12 text-center",
        className,
      ].join(" ")}
    >
      <div className="mb-5 flex h-20 w-20 items-center justify-center rounded-full bg-violet-500/10 text-4xl">
        {icon}
      </div>

      <h3 className="text-lg font-bold text-white">
        {title}
      </h3>

      <p className="mt-2 max-w-sm text-sm leading-6 text-slate-400">
        {description}
      </p>

      {actionLabel && onAction && (
        <Button
          onClick={onAction}
          className="mt-6"
        >
          {actionLabel}
        </Button>
      )}
    </div>
  );
}

export default EmptyState;
