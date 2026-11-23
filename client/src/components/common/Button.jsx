
import React from "react";

const variants = {
  primary: "bg-violet-600 text-white hover:bg-violet-500 focus:ring-violet-400",
  secondary: "bg-slate-700 text-white hover:bg-slate-600 focus:ring-slate-400",
  outline: "border border-violet-500 text-violet-300 hover:bg-violet-500/10 focus:ring-violet-400",
  danger: "bg-red-600 text-white hover:bg-red-500 focus:ring-red-400",
  success: "bg-emerald-600 text-white hover:bg-emerald-500 focus:ring-emerald-400",
  ghost: "text-slate-300 hover:bg-white/10 focus:ring-slate-400",
};

const sizes = {
  sm: "px-3 py-2 text-xs",
  md: "px-4 py-2.5 text-sm",
  lg: "px-6 py-3 text-base",
  xl: "px-8 py-3.5 text-lg",
};

function Button({
  children,
  type = "button",
  variant = "primary",
  size = "md",
  loading = false,
  disabled = false,
  fullWidth = false,
  className = "",
  onClick,
  ...props
}) {
  const isDisabled = disabled || loading;

  return (
    <button
      type={type}
      disabled={isDisabled}
      onClick={onClick}
      className={[
        "inline-flex items-center justify-center gap-2 rounded-xl font-semibold",
        "transition duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-950",
        "disabled:cursor-not-allowed disabled:opacity-50",
        variants[variant] || variants.primary,
        sizes[size] || sizes.md,
        fullWidth ? "w-full" : "",
        className,
      ].join(" ")}
      {...props}
    >
      {loading && (
        <span
          className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"
          aria-hidden="true"
        />
      )}

      {children}
    </button>
  );
}

export default Button;
