
import React from "react";

const variants = {
  default: "bg-slate-700/60 text-slate-300",
  primary: "bg-violet-500/15 text-violet-300",
  success: "bg-emerald-500/15 text-emerald-300",
  danger: "bg-red-500/15 text-red-300",
  warning: "bg-amber-500/15 text-amber-300",
  info: "bg-blue-500/15 text-blue-300",
  pink: "bg-pink-500/15 text-pink-300",
};

function Badge({
  children,
  variant = "default",
  size = "md",
  dot = false,
  className = "",
}) {
  const sizes = {
    sm: "px-2 py-0.5 text-[10px]",
    md: "px-2.5 py-1 text-xs",
    lg: "px-3 py-1.5 text-sm",
  };

  return (
    <span
      className={[
        "inline-flex items-center gap-1.5 rounded-full font-semibold",
        variants[variant] || variants.default,
        sizes[size] || sizes.md,
        className,
      ].join(" ")}
    >
      {dot && (
        <span className="h-1.5 w-1.5 rounded-full bg-current" />
      )}

      {children}
    </span>
  );
}

export default Badge;
