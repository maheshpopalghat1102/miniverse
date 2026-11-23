
import React, { useEffect, useRef, useState } from "react";

function formatTime(totalSeconds) {
  const safeSeconds = Math.max(0, totalSeconds);

  const hours = Math.floor(safeSeconds / 3600);
  const minutes = Math.floor((safeSeconds % 3600) / 60);
  const seconds = safeSeconds % 60;

  if (hours > 0) {
    return [
      hours,
      String(minutes).padStart(2, "0"),
      String(seconds).padStart(2, "0"),
    ].join(":");
  }

  return [
    String(minutes).padStart(2, "0"),
    String(seconds).padStart(2, "0"),
  ].join(":");
}

function Timer({
  duration = 60,
  mode = "countdown",
  autoStart = true,
  onComplete,
  className = "",
  showControls = false,
}) {
  const initialDuration = Math.max(0, Number(duration) || 0);

  const [time, setTime] = useState(
    mode === "countdown" ? initialDuration : 0
  );

  const [isRunning, setIsRunning] = useState(autoStart);
  const completedRef = useRef(false);
  const onCompleteRef = useRef(onComplete);

  useEffect(() => {
    onCompleteRef.current = onComplete;
  }, [onComplete]);

  useEffect(() => {
    setTime(mode === "countdown" ? initialDuration : 0);
    setIsRunning(autoStart);
    completedRef.current = false;
  }, [initialDuration, mode, autoStart]);

  useEffect(() => {
    if (!isRunning) return;

    if (mode === "countdown" && time <= 0) {
      if (!completedRef.current) {
        completedRef.current = true;
        setIsRunning(false);
        onCompleteRef.current?.();
      }

      return;
    }

    const interval = setInterval(() => {
      setTime((previous) => {
        if (mode === "countdown") {
          return Math.max(0, previous - 1);
        }

        return previous + 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isRunning, mode, time]);

  function reset() {
    setTime(mode === "countdown" ? initialDuration : 0);
    setIsRunning(false);
    completedRef.current = false;
  }

  return (
    <div className={`inline-flex flex-col items-center gap-2 ${className}`}>
      <time
        className="font-mono text-2xl font-bold tabular-nums text-white"
        aria-label={`Timer: ${formatTime(time)}`}
      >
        {formatTime(time)}
      </time>

      {showControls && (
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setIsRunning((value) => !value)}
            disabled={mode === "countdown" && time === 0}
            className="rounded-lg bg-violet-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-violet-500 disabled:opacity-50"
          >
            {isRunning ? "Pause" : "Start"}
          </button>

          <button
            type="button"
            onClick={reset}
            className="rounded-lg bg-slate-700 px-3 py-1.5 text-xs font-semibold text-white hover:bg-slate-600"
          >
            Reset
          </button>
        </div>
      )}
    </div>
  );
}

export default Timer;
