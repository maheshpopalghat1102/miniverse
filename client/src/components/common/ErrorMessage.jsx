
import React from "react";
import Button from "./Button";

function ErrorMessage({
  title = "Something went wrong",
  message = "We couldn't complete your request. Please try again.",
  onRetry,
  retryLabel = "Try Again",
  variant = "error",
  className = "",
}) {
  const styles = {
    error: "border-red-500/20 bg-red-500/10 text-red-300",
    warning: "border-amber-500/20 bg-amber-500/10 text-amber-300",
    info: "border-blue-500/20 bg-blue-500/10 text-blue-300",
  };

  return (
    <div
      role="alert"
      className={[
        "rounded-xl border p-4",
        styles[variant] || styles.error,
        className,
      ].join(" ")}
    >
      <div className="flex items-start gap-3">
        <span className="text-xl" aria-hidden="true">
          {variant === "warning"
            ? "⚠️"
            : variant === "info"
              ? "ℹ️"
              : "⚠️"}
        </span>

        <div className="min-w-0 flex-1">
          <h3 className="text-sm font-bold">
            {title}
          </h3>

          <p className="mt-1 text-sm leading-5 opacity-90">
            {message}
          </p>

          {onRetry && (
            <Button
              size="sm"
              variant="outline"
              onClick={onRetry}
              className="mt-3"
            >
              {retryLabel}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

export default ErrorMessage;
