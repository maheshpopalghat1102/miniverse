
import { registerPresenceHandlers } from "./presenceHandlers.js";
import { registerRoomHandlers } from "./roomHandlers.js";
import { registerGameHandlers } from "./gameHandlers.js";
import { registerChatHandlers } from "./chatHandlers.js";
import { registerMatchmakingHandlers } from "./matchmakingHandlers.js";
import { registerTruthDareHandlers } from "./truthDareHandlers.js";

export const registerSocketEvents = (io, socket) => {
  console.log(
    `Socket connected: ${socket.user.username} (${socket.id})`
  );

  registerPresenceHandlers(io, socket);
  registerRoomHandlers(io, socket);
  registerGameHandlers(io, socket);
  registerChatHandlers(io, socket);
  registerMatchmakingHandlers(io, socket);

  // Truth or Dare server-side events.
  registerTruthDareHandlers(io, socket);

  socket.on("disconnect", (reason) => {
    console.log(
      `Socket disconnected: ${socket.user.username} (${reason})`
    );
  });
};
