
import React, { useState } from "react";

function Avatar({
  src,
  name = "Player",
  size = "md",
  online = false,
  showStatus = false,
  className = "",
}) {
  const [imageError, setImageError] = useState(false);

  const sizes = {
    xs: "h-7 w-7 text-[10px]",
    sm: "h-9 w-9 text-xs",
    md: "h-12 w-12 text-sm",
    lg: "h-16 w-16 text-lg",
    xl: "h-24 w-24 text-2xl",
    "2xl": "h-32 w-32 text-3xl",
  };

  const initials = name
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase() || "?";

  return (
    <div className={`relative inline-flex shrink-0 ${className}`}>
      {src && !imageError ? (
        <img
          src={src}
          alt={`${name}'s avatar`}
          onError={() => setImageError(true)}
          className={[
            "rounded-full border-2 border-white/10 object-cover",
            sizes[size] || sizes.md,
          ].join(" ")}
        />
      ) : (
        <div
          role="img"
          aria-label={`${name}'s avatar`}
          className={[
            "flex items-center justify-center rounded-full border-2 border-violet-400/20 bg-gradient-to-br from-violet-600 to-fuchsia-600 font-bold text-white",
            sizes[size] || sizes.md,
          ].join(" ")}
        >
          {initials}
        </div>
      )}

      {showStatus && (
        <span
          className={[
            "absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-slate-950",
            online ? "bg-emerald-400" : "bg-slate-500",
          ].join(" ")}
          aria-label={online ? "Online" : "Offline"}
          title={online ? "Online" : "Offline"}
        />
      )}
    </div>
  );
}

export default Avatar;
