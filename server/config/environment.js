
const DEFAULT_PORT = 5001;

function getRequiredValue(name) {
  const value = process.env[name]?.trim();

  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }

  return value;
}

function getPort() {
  const rawPort = process.env.PORT || String(DEFAULT_PORT);
  const port = Number(rawPort);

  if (!Number.isInteger(port) || port < 1 || port > 65535) {
    throw new Error("PORT must be a valid port between 1 and 65535.");
  }

  return port;
}

function getClientUrls() {
  const urls = (
    process.env.CLIENT_URL || "http://localhost:5173"
  )
    .split(",")
    .map((url) => url.trim())
    .filter(Boolean);

  if (urls.length === 0) {
    throw new Error("At least one CLIENT_URL must be configured.");
  }

  return urls;
}

export function validateEnvironment() {
  const nodeEnv = process.env.NODE_ENV || "development";

  if (!["development", "production", "test"].includes(nodeEnv)) {
    throw new Error(
      "NODE_ENV must be development, production, or test."
    );
  }

  const config = {
    nodeEnv,
    port: getPort(),
    clientUrls: getClientUrls(),
    mongodbUri: getRequiredValue("MONGODB_URI"),
    jwtAccessSecret: process.env.JWT_ACCESS_SECRET || "",
    jwtRefreshSecret: process.env.JWT_REFRESH_SECRET || ""
  };

  if (nodeEnv === "production") {
    if (
      config.jwtAccessSecret.length < 32 ||
      config.jwtRefreshSecret.length < 32
    ) {
      throw new Error(
        "Production requires separate JWT secrets of at least 32 characters."
      );
    }

    if (config.jwtAccessSecret === config.jwtRefreshSecret) {
      throw new Error(
        "JWT_ACCESS_SECRET and JWT_REFRESH_SECRET must be different."
      );
    }

    for (const url of config.clientUrls) {
      if (!url.startsWith("https://")) {
        throw new Error(
          "Production CLIENT_URL values must use HTTPS."
        );
      }
    }
  }

  return Object.freeze(config);
}
