
import api from "./api";

const friendService = {
  getFriends(params = {}) {
    return api.get("/friends", params);
  },

  getFriendRequests(params = {}) {
    return api.get("/friends/requests", params);
  },

  getSentRequests(params = {}) {
    return api.get("/friends/requests/sent", params);
  },

  sendFriendRequest(userId) {
    return api.post(`/friends/${encodeURIComponent(userId)}/request`, {});
  },

  acceptFriendRequest(requestId) {
    return api.patch(
      `/friends/requests/${encodeURIComponent(requestId)}/accept`,
      {}
    );
  },

  rejectFriendRequest(requestId) {
    return api.patch(
      `/friends/requests/${encodeURIComponent(requestId)}/reject`,
      {}
    );
  },

  cancelFriendRequest(requestId) {
    return api.delete(
      `/friends/requests/${encodeURIComponent(requestId)}`
    );
  },

  removeFriend(userId) {
    return api.delete(
      `/friends/${encodeURIComponent(userId)}`
    );
  },

};

export default friendService;
