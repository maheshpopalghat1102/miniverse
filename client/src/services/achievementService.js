
import api from "./api";

const achievementService = {
  getAllAchievements(params = {}) {
    return api.get("/achievements", params);
  },

  getMyAchievements(params = {}) {
    return api.get("/achievements/me", params);
  },

  getUnlockedAchievements(params = {}) {
    return api.get("/achievements/me/unlocked", params);
  },

};

export default achievementService;
