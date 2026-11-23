
export const APP_INFO = Object.freeze({
  NAME: "MiniVerse",
  VERSION: "1.0.0",
  DESCRIPTION: "Play. Connect. Compete.",
  DEFAULT_LANGUAGE: "en",
});

export const LANGUAGES = Object.freeze({
  ENGLISH: "en",
  HINDI: "hi",
  MARATHI: "mr",
});

export const USER_ROLES = Object.freeze({
  USER: "user",
  ADMIN: "admin",
  MODERATOR: "moderator",
});

export const USER_STATUS = Object.freeze({
  ACTIVE: "active",
  INACTIVE: "inactive",
  SUSPENDED: "suspended",
  BANNED: "banned",
});

export const GAME_STATUS = Object.freeze({
  IDLE: "idle",
  WAITING: "waiting",
  READY: "ready",
  PLAYING: "playing",
  PAUSED: "paused",
  ROUND_RESULT: "roundResult",
  FINISHED: "finished",
  CANCELLED: "cancelled",
  ABANDONED: "abandoned",
});

export const ROOM_STATUS = Object.freeze({
  WAITING: "waiting",
  PLAYING: "playing",
  CLOSED: "closed",
});

export const ROOM_TYPES = Object.freeze({
  PUBLIC: "public",
  PRIVATE: "private",
});

export const FRIENDSHIP_STATUS = Object.freeze({
  PENDING: "pending",
  ACCEPTED: "accepted",
  REJECTED: "rejected",
  BLOCKED: "blocked",
});

export const NOTIFICATION_TYPES = Object.freeze({
  FRIEND_REQUEST: "friend_request",
  FRIEND_ACCEPTED: "friend_accepted",
  ROOM_INVITE: "room_invite",
  GAME_INVITE: "game_invite",
  ACHIEVEMENT: "achievement",
  SYSTEM: "system",
});

export const TRUTH_DARE_CATEGORIES = Object.freeze([
  "normal",
  "adult-18-plus",
  "private",
  "couples",
  "friends-party",
  "funny-crazy",
  "long-distance-couples",
]);

export const PAGINATION = Object.freeze({
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 20,
  MAX_LIMIT: 100,
});

export const LIMITS = Object.freeze({
  USERNAME_MIN: 3,
  USERNAME_MAX: 20,
  PASSWORD_MIN: 8,
  PASSWORD_MAX: 128,
  ROOM_CODE_MIN: 4,
  ROOM_CODE_MAX: 12,
  CHAT_MESSAGE_MAX: 2000,
  BIO_MAX: 250,
  IMAGE_MAX_SIZE: 5 * 1024 * 1024,
});

export const STORAGE_KEYS = Object.freeze({
  THEME: "miniverse-theme",
  SOUND_SETTINGS: "miniverse-sound-settings",
  LANGUAGE: "miniverse-language",
});

export const DEFAULT_SETTINGS = Object.freeze({
  theme: "midnight",
  language: "en",
  soundEnabled: true,
  soundVolume: 0.5,
  notificationsEnabled: true,
});

export const API_MESSAGES = Object.freeze({
  NETWORK_ERROR: "Unable to connect. Check your internet connection.",
  SERVER_ERROR: "Something went wrong. Please try again.",
  UNAUTHORIZED: "Please log in to continue.",
  FORBIDDEN: "You do not have permission to perform this action.",
  NOT_FOUND: "The requested resource was not found.",
  SESSION_EXPIRED: "Your session has expired. Please log in again.",
});

export const BREAKPOINTS = Object.freeze({
  MOBILE: 640,
  TABLET: 768,
  DESKTOP: 1024,
  LARGE_DESKTOP: 1280,
});

export const TIMERS = Object.freeze({
  SOCKET_ACK: 10000,
  ROOM_WAITING: 60000,
  DEFAULT_GAME_ROUND: 60,
  TOAST_DURATION: 3000,
  DEBOUNCE: 500,
});

export default {
  APP_INFO,
  LANGUAGES,
  USER_ROLES,
  USER_STATUS,
  GAME_STATUS,
  ROOM_STATUS,
  ROOM_TYPES,
  FRIENDSHIP_STATUS,
  NOTIFICATION_TYPES,
  TRUTH_DARE_CATEGORIES,
  PAGINATION,
  LIMITS,
  STORAGE_KEYS,
  DEFAULT_SETTINGS,
  API_MESSAGES,
  BREAKPOINTS,
  TIMERS,
};
