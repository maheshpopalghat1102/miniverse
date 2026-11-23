
import React, { useEffect, useRef, useState } from "react";

function GameTimer({
  duration = 60,
  deadline,
  autoStart = true,
  onComplete,
  warningAt = 10,
  showProgress = true,
  showControls = false,
  className = "",
}) {
  const initialDuration = Math.max(0, Number(duration) || 0);

  const [remaining, setRemaining] = useState(initialDuration);
  const [isRunning, setIsRunning] = useState(autoStart);
  const [startedAt, setStartedAt] = useState(null);

  const completedRef = useRef(false);
  const onCompleteRef = useRef(onComplete);

  useEffect(() => {
    onCompleteRef.current = onComplete;
  }, [onComplete]);

  useEffect(() => {
    setRemaining(initialDuration);
    setIsRunning(autoStart);
    setStartedAt(Date.now());
    completedRef.current = false;
  }, [initialDuration, autoStart]);

  useEffect(() => {
    if (!isRunning) return;

    const updateTimer = () => {
      const nextRemaining = deadline
        ? Math.max(0, Math.ceil((new Date(deadline).getTime() - Date.now()) / 1000))
        : Math.max(0, remaining - Math.floor((Date.now() - startedAt) / 1000));

      setRemaining(nextRemaining);

      if (nextRemaining <= 0 && !completedRef.current) {
        completedRef.current = true;
        setIsRunning(false);
        onCompleteRef.current?.();
      }
    };

    const interval = setInterval(updateTimer, 250);

    return () => clearInterval(interval);
  }, [isRunning, deadline, remaining, startedAt]);

  const percentage = initialDuration > 0
    ? Math.max(0, Math.min(100, (remaining / initialDuration) * 100))
    : 0;

  const isWarning = remaining <= warningAt;

  function reset() {
    setRemaining(initialDuration);
    setIsRunning(false);
    setStartedAt(null);
    completedRef.current = false;
  }

  function resume() {
    if (remaining <= 0) return;

    setStartedAt(Date.now());
    setIsRunning(true);
  }

  return (
    <div className={`rounded-xl border border-white/10 bg-slate-900 p-4 ${className}`}>
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
          Time Remaining
        </span>

        <span
          className={[
            "font-mono text-2xl font-bold tabular-nums",
            isWarning ? "text-red-400" : "text-white",
          ].join(" ")}
        >
          {Math.floor(remaining / 60)}:
          {String(remaining % 60).padStart(2, "0")}
        </span>
      </div>

      {showProgress && (
        <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-700">
          <div
            className={[
              "h-full rounded-full transition-all duration-300",
              isWarning ? "bg-red-500" : "bg-violet-500",
            ].join(" ")}
            style={{ width: `${percentage}%` }}
          />
        </div>
      )}

      {showControls && (
        <div className="mt-3 flex gap-2">
          <button
            type="button"
            onClick={() => isRunning ? setIsRunning(false) : resume()}
            disabled={remaining <= 0}
            className="rounded-lg bg-violet-600 px-3 py-2 text-xs font-semibold text-white disabled:opacity-50"
          >
            {isRunning ? "Pause" : "Resume"}
          </button>

          <button
            type="button"
            onClick={reset}
            className="rounded-lg bg-slate-700 px-3 py-2 text-xs font-semibold text-white"
          >
            Reset
          </button>
        </div>
      )}
    </div>
  );
}

export default GameTimer;
