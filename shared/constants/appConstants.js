
export const APP_CONFIG = Object.freeze({
  NAME: "MiniVerse",
  VERSION: "1.0.0",
  DESCRIPTION: "Play. Connect. Compete.",
  DEFAULT_LANGUAGE: "en",
  DEFAULT_THEME: "midnight",
});

export const SUPPORTED_LANGUAGES = Object.freeze([
  "en",
  "hi",
  "mr",
]);

export const THEMES = Object.freeze([
  "midnight",
  "amoled",
  "ocean",
  "sunset",
  "sakura",
  "emerald",
  "light",
  "cyberpunk",
]);

export const TRUTH_DARE_CATEGORIES = Object.freeze([
  "normal",
  "adult-18-plus",
  "private",
  "couples",
  "friends-party",
  "funny-crazy",
  "long-distance-couples",
]);

export const TRUTH_DARE_TYPES = Object.freeze([
  "truth",
  "dare",
]);

export const TRUTH_DARE_CONFIG = Object.freeze({
  TARGET_TRUTHS_PER_CATEGORY: 500,
  TARGET_DARES_PER_CATEGORY: 500,
  TOTAL_CATEGORIES: 7,
  MAX_PROMPT_LENGTH: 500,
});

export const PAGINATION = Object.freeze({
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 20,
  MAX_LIMIT: 100,
});

export const ROOM_CONFIG = Object.freeze({
  CODE_LENGTH: 6,
  MIN_PASSWORD_LENGTH: 4,
  MAX_PASSWORD_LENGTH: 64,
  DEFAULT_EXPIRY_MINUTES: 60,
});

export const SECURITY_CONFIG = Object.freeze({
  MIN_PASSWORD_LENGTH: 8,
  MAX_PASSWORD_LENGTH: 128,
  MAX_LOGIN_ATTEMPTS: 5,
});

export const API_MESSAGES = Object.freeze({
  SUCCESS: "Operation completed successfully.",
  VALIDATION_ERROR: "Validation failed.",
  UNAUTHORIZED: "Authentication required.",
  FORBIDDEN: "You do not have permission to perform this action.",
  NOT_FOUND: "Resource not found.",
  SERVER_ERROR: "Internal server error.",
});
