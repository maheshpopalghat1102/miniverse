
import React from "react";

const widths = {
  sm: "max-w-2xl",
  md: "max-w-4xl",
  lg: "max-w-6xl",
  xl: "max-w-7xl",
  full: "max-w-none",
};

function PageContainer({
  children,
  title,
  subtitle,
  action,
  width = "xl",
  padding = true,
  className = "",
}) {
  return (
    <div
      className={[
        "mx-auto w-full",
        widths[width] || widths.xl,
        padding ? "px-0" : "",
        className,
      ].join(" ")}
    >
      {(title || subtitle || action) && (
        <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            {title && (
              <h1 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
                {title}
              </h1>
            )}

            {subtitle && (
              <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-400">
                {subtitle}
              </p>
            )}
          </div>

          {action && (
            <div className="shrink-0">
              {action}
            </div>
          )}
        </div>
      )}

      <div>{children}</div>
    </div>
  );
}

export default PageContainer;
