
import api from "./api";

const gameService = {
  getAllGames(params = {}) {
    return api.get("/games", params);
  },

  getGameById(gameId) {
    return api.get(`/games/${encodeURIComponent(gameId)}`);
  },

  getGamesByCategory(category, params = {}) {
    return api.get("/games", {
      ...params,
      category,
    });
  },

  getFeaturedGames(params = {}) {
    return api.get("/games/featured", params);
  },

  getGameCategories() {
    return api.get("/games/categories");
  },

  searchGames(search, params = {}) {
    return api.get("/games", {
      ...params,
      search,
    });
  },

  getGameHistory(params = {}) {
    return api.get("/users/me/history", params);
  },

  getMatchDetails(matchId) {
    return api.get(`/matches/${encodeURIComponent(matchId)}`);
  },

};

export default gameService;
