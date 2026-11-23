
import { useCallback, useEffect, useRef, useState } from "react";

export default function useTimer(initialSeconds = 60, options = {}) {
  const { onComplete, autoStart = false, countUp = false } = options;

  const [time, setTime] = useState(initialSeconds);
  const [isRunning, setIsRunning] = useState(autoStart);
  const [isCompleted, setIsCompleted] = useState(false);

  const callbackRef = useRef(onComplete);
  const completedRef = useRef(false);

  useEffect(() => {
    callbackRef.current = onComplete;
  }, [onComplete]);

  useEffect(() => {
    if (!isRunning || isCompleted) return;

    const interval = setInterval(() => {
      setTime((previous) => {
        if (countUp) {
          return previous + 1;
        }

        if (previous <= 1) {
          clearInterval(interval);
          setIsRunning(false);
          setIsCompleted(true);

          if (!completedRef.current) {
            completedRef.current = true;
            callbackRef.current?.();
          }

          return 0;
        }

        return previous - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isRunning, isCompleted, countUp]);

  const start = useCallback(() => {
    if (!countUp && time <= 0) return;

    setIsCompleted(false);
    completedRef.current = false;
    setIsRunning(true);
  }, [countUp, time]);

  const pause = useCallback(() => {
    setIsRunning(false);
  }, []);

  const reset = useCallback((newTime = initialSeconds) => {
    setIsRunning(false);
    setIsCompleted(false);
    completedRef.current = false;
    setTime(newTime);
  }, [initialSeconds]);

  const restart = useCallback((newTime = initialSeconds) => {
    setIsCompleted(false);
    completedRef.current = false;
    setTime(newTime);
    setIsRunning(true);
  }, [initialSeconds]);

  const formattedTime = `${Math.floor(time / 60)
    .toString()
    .padStart(2, "0")}:${(time % 60)
    .toString()
    .padStart(2, "0")}`;

  return {
    time,
    formattedTime,
    isRunning,
    isCompleted,
    start,
    pause,
    reset,
    restart,
  };
}
