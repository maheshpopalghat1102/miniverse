
const DEFAULT_API_URL = "http://localhost:5001/api/v1";
const DEFAULT_SOCKET_URL = "http://localhost:5001";

function normalizeUrl(value, fallback) {
  try {
    return new URL(value || fallback).origin +
      (value || fallback).replace(/^https?:\/\/[^/]+/, "").replace(/\/$/, "");
  } catch {
    return fallback;
  }
}

const API_URL = normalizeUrl(
  import.meta.env.VITE_API_URL,
  DEFAULT_API_URL
);

const SOCKET_URL = normalizeUrl(
  import.meta.env.VITE_SOCKET_URL,
  DEFAULT_SOCKET_URL
);

const APP_ENV = import.meta.env.MODE || "development";

export const ENV = Object.freeze({
  APP_NAME: "MiniVerse",
  APP_VERSION: "1.0.0",

  MODE: APP_ENV,
  IS_DEVELOPMENT: APP_ENV === "development",
  IS_PRODUCTION: APP_ENV === "production",

  API_URL,
  SOCKET_URL,

  API_TIMEOUT: 15000,

  ENABLE_DEBUG_LOGS: APP_ENV === "development",

  DEFAULT_LANGUAGE: "en",

  SUPPORTED_LANGUAGES: ["en", "hi", "mr"],

  MAX_UPLOAD_SIZE: 5 * 1024 * 1024,

  MAX_IMAGE_SIZE: 5 * 1024 * 1024,

  DEFAULT_PAGE_SIZE: 20,

  MAX_PAGE_SIZE: 100,
});

export function validateEnvironment() {
  const errors = [];

  if (!ENV.API_URL) {
    errors.push("VITE_API_URL is missing.");
  }

  if (!ENV.SOCKET_URL) {
    errors.push("VITE_SOCKET_URL is missing.");
  }

  if (errors.length > 0) {
    throw new Error(errors.join("\n"));
  }

  return true;
}

export default ENV;
