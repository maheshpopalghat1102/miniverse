
export const ROUTES = Object.freeze({
  HOME: "/",

  AUTH: {
    LOGIN: "/login",
    REGISTER: "/register",
    VERIFY_EMAIL: "/verify-email",
    FORGOT_PASSWORD: "/forgot-password",
    RESET_PASSWORD: "/reset-password",
    VERIFY_SUCCESS: "/verify-success",
  },

  DASHBOARD: "/dashboard",

  GAMES: {
    ALL: "/games",
    DETAILS: (gameId) => `/games/${encodeURIComponent(gameId)}`,
    MULTIPLAYER: "/games/multiplayer",
    SINGLE_PLAYER: "/games/single-player",
    TURN_BY_TURN: "/games/turn-by-turn",
  },

  ROOMS: {
    CREATE: "/rooms/create",
    JOIN: "/rooms/join",
    DETAILS: (roomId) => `/rooms/${encodeURIComponent(roomId)}`,
    BY_CODE: (roomCode) => `/rooms/code/${encodeURIComponent(roomCode)}`,
  },

  SOCIAL: {
    FRIENDS: "/friends",
    PROFILE: (userId) => `/profile/${encodeURIComponent(userId)}`,
    MY_PROFILE: "/profile",
    EDIT_PROFILE: "/profile/edit",
  },

  LEADERBOARD: "/leaderboard",

  ACHIEVEMENTS: "/achievements",

  HISTORY: "/game-history",

  NOTIFICATIONS: "/notifications",

  SETTINGS: "/settings",

  HELP: "/help",

  ABOUT: "/about",

  CONTACT: "/contact",

  PRIVACY: "/privacy-policy",

  TERMS: "/terms",
});

export const PUBLIC_ROUTES = [
  ROUTES.HOME,
  ROUTES.AUTH.LOGIN,
  ROUTES.AUTH.REGISTER,
  ROUTES.AUTH.VERIFY_EMAIL,
  ROUTES.AUTH.FORGOT_PASSWORD,
  ROUTES.AUTH.RESET_PASSWORD,
  ROUTES.AUTH.VERIFY_SUCCESS,
  ROUTES.HELP,
  ROUTES.ABOUT,
  ROUTES.CONTACT,
  ROUTES.PRIVACY,
  ROUTES.TERMS,
];

export const PROTECTED_ROUTES = [
  ROUTES.DASHBOARD,
  ROUTES.GAMES.ALL,
  ROUTES.GAMES.MULTIPLAYER,
  ROUTES.GAMES.SINGLE_PLAYER,
  ROUTES.GAMES.TURN_BY_TURN,
  ROUTES.ROOMS.CREATE,
  ROUTES.ROOMS.JOIN,
  ROUTES.SOCIAL.FRIENDS,
  ROUTES.LEADERBOARD,
  ROUTES.ACHIEVEMENTS,
  ROUTES.HISTORY,
  ROUTES.NOTIFICATIONS,
  ROUTES.SETTINGS,
];

export const getRedirectRoute = (isAuthenticated) =>
  isAuthenticated ? ROUTES.DASHBOARD : ROUTES.AUTH.LOGIN;

export default ROUTES;
