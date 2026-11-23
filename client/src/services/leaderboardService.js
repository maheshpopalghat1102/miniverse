
import api from "./api";

const leaderboardService = {
  getGlobalLeaderboard(params = {}) {
    return api.get("/leaderboards", params);
  },

  getGameLeaderboard(gameId, params = {}) {
    return api.get(
      `/leaderboards/game/${encodeURIComponent(gameId)}`,
      params
    );
  },

};

export default leaderboardService;
