
const isProduction = process.env.NODE_ENV === "production";

const formatMessage = (level, message, metadata = {}) => {
  return {
    timestamp: new Date().toISOString(),
    level,
    message:
      typeof message === "string"
        ? message
        : JSON.stringify(message),
    ...(Object.keys(metadata).length > 0 ? { metadata } : {}),
  };
};

const writeLog = (level, message, metadata = {}) => {
  const logEntry = formatMessage(level, message, metadata);

  if (isProduction) {
    const output = JSON.stringify(logEntry);

    if (level === "error" || level === "fatal") {
      console.error(output);
    } else if (level === "warn") {
      console.warn(output);
    } else {
      console.log(output);
    }

    return;
  }

  const output = `[${logEntry.timestamp}] [${level.toUpperCase()}] ${logEntry.message}`;

  if (level === "error" || level === "fatal") {
    console.error(output, metadata);
  } else if (level === "warn") {
    console.warn(output, metadata);
  } else {
    console.log(output, metadata);
  }
};

const logger = {
  info: (message, metadata) => writeLog("info", message, metadata),

  success: (message, metadata) =>
    writeLog("success", message, metadata),

  warn: (message, metadata) => writeLog("warn", message, metadata),

  error: (message, metadata) => writeLog("error", message, metadata),

  fatal: (message, metadata) => writeLog("fatal", message, metadata),

  debug: (message, metadata) => {
    if (!isProduction) {
      writeLog("debug", message, metadata);
    }
  },
};

export default logger;
