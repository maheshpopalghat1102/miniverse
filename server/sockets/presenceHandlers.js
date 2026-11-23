const onlineUsers = new Map();

const getUserSockets = (userId) => onlineUsers.get(userId) || new Set();

export const registerPresenceHandlers = (io, socket) => {
  const user = socket.user;

  if (!user?.id) return;

  const wasOffline = !onlineUsers.has(user.id);

  if (wasOffline) {
    onlineUsers.set(user.id, new Set());
  }

  onlineUsers.get(user.id).add(socket.id);

  socket.join(`user:${user.id}`);

  if (wasOffline) {
    socket.broadcast.emit("presence:online", {
      userId: user.id,
      username: user.username,
    });
  }

  socket.emit("presence:connected", {
    userId: user.id,
    online: true,
  });

  socket.on("presence:check", (userIds, callback) => {
    if (!Array.isArray(userIds)) return;

    const result = userIds.slice(0, 100).map((userId) => ({
      userId: String(userId),
      online: onlineUsers.has(String(userId)),
    }));

    if (typeof callback === "function") {
      callback({ success: true, users: result });
    }
  });

  socket.on("disconnect", () => {
    const sockets = getUserSockets(user.id);

    sockets.delete(socket.id);

    if (sockets.size === 0) {
      onlineUsers.delete(user.id);

      socket.broadcast.emit("presence:offline", {
        userId: user.id,
        username: user.username,
      });
    }
  });
};

export const getOnlineUserIds = () => [...onlineUsers.keys()];

export const isUserOnline = (userId) => onlineUsers.has(String(userId));