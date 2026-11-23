
import { useCallback, useEffect, useState } from "react";

export default function useGameRoom(socket, initialRoom = null) {
  const [room, setRoom] = useState(initialRoom);
  const [players, setPlayers] = useState(
    initialRoom?.members || initialRoom?.players || []
  );
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setRoom(initialRoom);
    setPlayers(
      initialRoom?.members || initialRoom?.players || []
    );
  }, [initialRoom]);

  useEffect(() => {
    if (!socket) return;

    const handleRoomUpdate = (updatedRoom) => {
      setRoom(updatedRoom);
      setPlayers(
        updatedRoom.members || updatedRoom.players || []
      );
      setError("");
    };

    const handlePlayerJoined = (payload) => {
      if (payload.room) {
        handleRoomUpdate(payload.room);
      } else if (payload.player) {
        setPlayers((current) => {
          const exists = current.some(
            (player) =>
              String(player.id || player._id) ===
              String(payload.player.id || payload.player._id)
          );

          return exists
            ? current
            : [...current, payload.player];
        });
      }
    };

    const handlePlayerLeft = (payload) => {
      if (payload.room) {
        handleRoomUpdate(payload.room);
      } else if (payload.playerId) {
        setPlayers((current) =>
          current.filter(
            (player) =>
              String(player.id || player._id) !==
              String(payload.playerId)
          )
        );
      }
    };

    const handleRoomError = (payload) => {
      setError(payload?.message || "Room operation failed.");
    };

    socket.on("room:updated", handleRoomUpdate);
    socket.on("room:player-joined", handlePlayerJoined);
    socket.on("room:player-left", handlePlayerLeft);
    socket.on("room:error", handleRoomError);

    return () => {
      socket.off("room:updated", handleRoomUpdate);
      socket.off("room:player-joined", handlePlayerJoined);
      socket.off("room:player-left", handlePlayerLeft);
      socket.off("room:error", handleRoomError);
    };
  }, [socket]);

  const updateRoom = useCallback((updatedRoom) => {
    setRoom(updatedRoom);
    setPlayers(updatedRoom?.members || updatedRoom?.players || []);
  }, []);

  const emitRoomEvent = useCallback(
    (event, payload = {}) => {
      if (!socket?.connected) {
        setError("Not connected to the game server.");
        return false;
      }

      socket.emit(event, payload);
      return true;
    },
    [socket]
  );

  const clearError = useCallback(() => {
    setError("");
  }, []);

  return {
    room,
    players,
    error,
    loading,
    setLoading,
    updateRoom,
    emitRoomEvent,
    clearError,
    setRoom,
    setPlayers,
  };
}
