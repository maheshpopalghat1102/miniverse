const queues = new Map();
const userQueue = new Map();

const removeFromQueue = (socketId) => {
  const gameId = userQueue.get(socketId);

  if (!gameId) return;

  const queue = queues.get(gameId);

  if (queue) {
    const updatedQueue = queue.filter(
      (entry) => entry.socketId !== socketId
    );

    if (updatedQueue.length) {
      queues.set(gameId, updatedQueue);
    } else {
      queues.delete(gameId);
    }
  }

  userQueue.delete(socketId);
};

export const registerMatchmakingHandlers = (io, socket) => {
  socket.on("matchmaking:join", ({ gameId } = {}, callback) => {
    try {
      if (
        typeof gameId !== "string" ||
        !/^[a-z0-9-]{2,60}$/i.test(gameId)
      ) {
        throw new Error("A valid game ID is required.");
      }

      removeFromQueue(socket.id);

      const queue = queues.get(gameId) || [];

      const opponentIndex = queue.findIndex(
        (entry) => entry.userId !== socket.user.id
      );

      if (opponentIndex === -1) {
        queue.push({
          socketId: socket.id,
          userId: socket.user.id,
          username: socket.user.username,
        });

        queues.set(gameId, queue);
        userQueue.set(socket.id, gameId);

        socket.emit("matchmaking:queued", {
          success: true,
          gameId,
          position: queue.length,
        });

        if (typeof callback === "function") {
          callback({ success: true, status: "queued" });
        }

        return;
      }

      const [opponent] = queue.splice(opponentIndex, 1);

      if (queue.length) {
        queues.set(gameId, queue);
      } else {
        queues.delete(gameId);
      }

      userQueue.delete(opponent.socketId);

      const matchInfo = {
        gameId,
        players: [
          {
            userId: opponent.userId,
            username: opponent.username,
          },
          {
            userId: socket.user.id,
            username: socket.user.username,
          },
        ],
        matchedAt: new Date().toISOString(),
      };

      io.to(opponent.socketId).emit("matchmaking:found", matchInfo);
      socket.emit("matchmaking:found", matchInfo);

      if (typeof callback === "function") {
        callback({ success: true, status: "matched", matchInfo });
      }
    } catch (error) {
      socket.emit("socket:error", {
        success: false,
        message: error.message,
      });

      if (typeof callback === "function") {
        callback({ success: false, message: error.message });
      }
    }
  });

  socket.on("matchmaking:cancel", (callback) => {
    removeFromQueue(socket.id);

    socket.emit("matchmaking:cancelled", {
      success: true,
    });

    if (typeof callback === "function") {
      callback({ success: true });
    }
  });

  socket.on("disconnect", () => {
    removeFromQueue(socket.id);
  });
};