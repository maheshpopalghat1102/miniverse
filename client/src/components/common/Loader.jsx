
import React from "react";

function Loader({
  size = "md",
  text = "Loading...",
  fullScreen = false,
  className = "",
}) {
  const sizes = {
    sm: "h-5 w-5 border-2",
    md: "h-8 w-8 border-[3px]",
    lg: "h-12 w-12 border-4",
    xl: "h-16 w-16 border-4",
  };

  return (
    <div
      role="status"
      aria-live="polite"
      className={[
        "flex flex-col items-center justify-center gap-3",
        fullScreen ? "min-h-screen bg-slate-950" : "py-6",
        className,
      ].join(" ")}
    >
      <div
        className={[
          "animate-spin rounded-full border-slate-700 border-t-violet-500",
          sizes[size] || sizes.md,
        ].join(" ")}
      />

      {text && (
        <p className="text-sm text-slate-400">
          {text}
        </p>
      )}

      <span className="sr-only">{text || "Loading"}</span>
    </div>
  );
}

export default Loader;
