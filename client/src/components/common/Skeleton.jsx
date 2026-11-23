
import React from "react";

function Skeleton({
  variant = "text",
  width,
  height,
  lines = 1,
  rounded = "lg",
  className = "",
}) {
  const variants = {
    text: "h-4 w-full",
    title: "h-7 w-3/4",
    avatar: "h-12 w-12 rounded-full",
    card: "h-40 w-full",
    button: "h-10 w-28 rounded-xl",
    image: "aspect-video w-full",
    circle: "rounded-full",
  };

  const roundings = {
    none: "rounded-none",
    sm: "rounded-sm",
    md: "rounded-md",
    lg: "rounded-lg",
    xl: "rounded-xl",
    full: "rounded-full",
  };

  const style = {
    ...(width ? { width } : {}),
    ...(height ? { height } : {}),
  };

  const baseClass = [
    "animate-pulse bg-slate-700/60",
    variants[variant] || variants.text,
    roundings[rounded] || "",
    className,
  ].join(" ");

  if (variant === "text" && lines > 1) {
    return (
      <div
        className="flex flex-col gap-3"
        role="status"
        aria-label="Loading content"
      >
        {Array.from({ length: lines }).map((_, index) => (
          <div
            key={index}
            className={[
              baseClass,
              index === lines - 1 ? "w-2/3" : "",
            ].join(" ")}
            style={style}
          />
        ))}

        <span className="sr-only">Loading content...</span>
      </div>
    );
  }

  return (
    <div
      className={baseClass}
      style={style}
      role="status"
      aria-label="Loading"
    >
      <span className="sr-only">Loading...</span>
    </div>
  );
}

export default Skeleton;
