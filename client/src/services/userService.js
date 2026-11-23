
import api from "./api";

const userService = {
  getMyProfile() {
    return api.get("/users/me/profile");
  },

  updateMyProfile(profileData) {
    return api.patch("/users/me/profile", profileData);
  },

  getUserById(userId) {
    return api.get(`/users/${encodeURIComponent(userId)}`);
  },

  getUserByUsername(username) {
    return api.get(`/users/username/${encodeURIComponent(username)}`);
  },

  searchUsers(search, params = {}) {
    return api.get("/users/search", {
      ...params,
      search,
    });
  },

  updatePreferences(preferences) {
    return api.patch("/users/me/settings", preferences);
  },

  deleteMyAccount(password) {
    return api.delete("/users/me", {
      body: { password },
    });
  },
};

export default userService;
