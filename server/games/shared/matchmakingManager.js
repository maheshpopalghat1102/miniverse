import { randomUUID } from "node:crypto";

const queues = new Map();
const userQueues = new Map();

const getQueue = (gameId) => {
  if (!queues.has(gameId)) {
    queues.set(gameId, []);
  }

  return queues.get(gameId);
};

export const joinMatchmaking = ({
  gameId,
  userId,
  socketId,
  username,
}) => {
  if (!gameId || !userId || !socketId) {
    throw new Error("Game ID, user ID and socket ID are required.");
  }

  const id = String(userId);
  const game = String(gameId);

  const existingQueue = userQueues.get(id);

  if (existingQueue) {
    if (existingQueue.gameId === game) {
      return {
        status: "already-queued",
        gameId: game,
      };
    }

    leaveMatchmaking(id);
  }

  const queue = getQueue(game);

  // Remove stale entries and avoid pairing the same account with itself.
  const opponentIndex = queue.findIndex(
    (player) => player.userId !== id
  );

  if (opponentIndex === -1) {
    const entry = {
      userId: id,
      socketId: String(socketId),
      username: String(username || "Player"),
      joinedAt: Date.now(),
    };

    queue.push(entry);
    userQueues.set(id, { gameId: game, socketId: entry.socketId });

    return {
      status: "queued",
      gameId: game,
      position: queue.length,
    };
  }

  const [opponent] = queue.splice(opponentIndex, 1);

  userQueues.delete(opponent.userId);

  if (queue.length === 0) {
    queues.delete(game);
  }

  const currentPlayer = {
    userId: id,
    socketId: String(socketId),
    username: String(username || "Player"),
  };

  const match = {
    matchId: randomUUID(),
    gameId: game,
    players: [opponent, currentPlayer],
    createdAt: new Date().toISOString(),
  };

  return {
    status: "matched",
    match,
  };
};

export const leaveMatchmaking = (userId) => {
  const id = String(userId);
  const entry = userQueues.get(id);

  if (!entry) return false;

  const queue = queues.get(entry.gameId);

  if (queue) {
    const updatedQueue = queue.filter(
      (player) => player.userId !== id
    );

    if (updatedQueue.length) {
      queues.set(entry.gameId, updatedQueue);
    } else {
      queues.delete(entry.gameId);
    }
  }

  userQueues.delete(id);

  return true;
};

export const removeSocketFromMatchmaking = (socketId) => {
  const id = [...userQueues.entries()].find(
    ([, entry]) => entry.socketId === String(socketId)
  )?.[0];

  if (!id) return false;

  return leaveMatchmaking(id);
};

export const getQueueSize = (gameId) => {
  return queues.get(String(gameId))?.length || 0;
};

export const getUserQueue = (userId) => {
  const entry = userQueues.get(String(userId));

  return entry ? { ...entry } : null;
};

export const clearMatchmakingQueues = () => {
  const count = userQueues.size;

  queues.clear();
  userQueues.clear();

  return count;
};