
import React, { useEffect } from "react";

const styles = {
  success: {
    container: "border-emerald-500/30 bg-emerald-500/10",
    icon: "✓",
    iconColor: "text-emerald-400",
  },
  error: {
    container: "border-red-500/30 bg-red-500/10",
    icon: "!",
    iconColor: "text-red-400",
  },
  warning: {
    container: "border-amber-500/30 bg-amber-500/10",
    icon: "⚠",
    iconColor: "text-amber-400",
  },
  info: {
    container: "border-blue-500/30 bg-blue-500/10",
    icon: "i",
    iconColor: "text-blue-400",
  },
};

function Toast({
  isOpen = false,
  type = "info",
  title,
  message,
  duration = 3000,
  onClose,
}) {
  useEffect(() => {
    if (!isOpen || duration <= 0) return;

    const timeout = setTimeout(() => {
      onClose?.();
    }, duration);

    return () => clearTimeout(timeout);
  }, [isOpen, duration, onClose]);

  if (!isOpen) return null;

  const style = styles[type] || styles.info;

  return (
    <div
      role={type === "error" ? "alert" : "status"}
      aria-live={type === "error" ? "assertive" : "polite"}
      className={[
        "fixed right-4 top-4 z-[100] flex w-[calc(100%-2rem)] max-w-sm items-start gap-3 rounded-xl border p-4 shadow-xl backdrop-blur-xl",
        style.container,
      ].join(" ")}
    >
      <span
        className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-black/20 font-bold ${style.iconColor}`}
      >
        {style.icon}
      </span>

      <div className="min-w-0 flex-1">
        {title && (
          <h3 className="text-sm font-semibold text-white">
            {title}
          </h3>
        )}

        {message && (
          <p className="mt-1 break-words text-xs leading-5 text-slate-300">
            {message}
          </p>
        )}
      </div>

      <button
        type="button"
        onClick={onClose}
        aria-label="Dismiss notification"
        className="text-slate-400 hover:text-white"
      >
        ✕
      </button>
    </div>
  );
}

export default Toast;
