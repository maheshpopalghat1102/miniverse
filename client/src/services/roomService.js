
import api from "./api";

const roomService = {
  createRoom(roomData) {
    return api.post("/rooms", roomData);
  },

  getRoom(roomId) {
    return api.get(`/rooms/code/${encodeURIComponent(roomId)}`);
  },

  getRoomByCode(roomCode) {
    return api.get(`/rooms/code/${encodeURIComponent(roomCode)}`);
  },

  joinRoom(roomCode, password = "") {
    return api.post(`/rooms/code/${encodeURIComponent(roomCode)}/join`, {
      ...(password ? { password } : {}),
    });
  },

  leaveRoom(roomId) {
    return api.post(`/rooms/code/${encodeURIComponent(roomId)}/leave`, {});
  },

  closeRoom(roomId) {
    return api.patch(`/rooms/code/${encodeURIComponent(roomId)}/close`, {});
  },

  setReady(roomId, isReady) {
    return api.patch(
      `/rooms/code/${encodeURIComponent(roomId)}/ready`,
      { isReady }
    );
  },

};

export default roomService;
