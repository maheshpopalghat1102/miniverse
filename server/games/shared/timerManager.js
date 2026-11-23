const timers = new Map();

const makeTimerKey = (roomId, timerType) =>
  `${String(roomId)}:${String(timerType)}`;

export const startTimer = ({
  roomId,
  timerType = "turn",
  durationSeconds,
  onTimeout,
}) => {
  if (!roomId) throw new Error("Room ID is required.");

  const duration = Number(durationSeconds);

  if (!Number.isFinite(duration) || duration <= 0) {
    throw new Error("Timer duration must be greater than zero.");
  }

  if (typeof onTimeout !== "function") {
    throw new Error("A timeout callback is required.");
  }

  const key = makeTimerKey(roomId, timerType);

  stopTimer(roomId, timerType);

  const startedAt = Date.now();
  const durationMs = duration * 1000;

  const timeout = setTimeout(async () => {
    timers.delete(key);

    try {
      await onTimeout();
    } catch (error) {
      console.error(`Timer callback failed (${key}):`, error);
    }
  }, durationMs);

  const timer = {
    key,
    roomId: String(roomId),
    timerType,
    startedAt,
    expiresAt: startedAt + durationMs,
    timeout,
  };

  timers.set(key, timer);

  return {
    roomId: timer.roomId,
    timerType,
    expiresAt: timer.expiresAt,
    durationSeconds: duration,
  };
};

export const stopTimer = (roomId, timerType = "turn") => {
  const key = makeTimerKey(roomId, timerType);
  const timer = timers.get(key);

  if (!timer) return false;

  clearTimeout(timer.timeout);
  timers.delete(key);

  return true;
};

export const getTimer = (roomId, timerType = "turn") => {
  const key = makeTimerKey(roomId, timerType);
  const timer = timers.get(key);

  if (!timer) return null;

  const remainingMs = Math.max(0, timer.expiresAt - Date.now());

  return {
    roomId: timer.roomId,
    timerType: timer.timerType,
    startedAt: timer.startedAt,
    expiresAt: timer.expiresAt,
    remainingSeconds: Math.ceil(remainingMs / 1000),
  };
};

export const hasActiveTimer = (roomId, timerType = "turn") => {
  return timers.has(makeTimerKey(roomId, timerType));
};

export const stopAllRoomTimers = (roomId) => {
  const prefix = `${String(roomId)}:`;
  let stopped = 0;

  for (const [key, timer] of timers.entries()) {
    if (key.startsWith(prefix)) {
      clearTimeout(timer.timeout);
      timers.delete(key);
      stopped += 1;
    }
  }

  return stopped;
};

export const stopAllTimers = () => {
  for (const timer of timers.values()) {
    clearTimeout(timer.timeout);
  }

  const count = timers.size;
  timers.clear();

  return count;
};