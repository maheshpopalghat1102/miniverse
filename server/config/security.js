
import helmet from "helmet";
import rateLimit from "express-rate-limit";

export function createSecurityMiddleware() {
  return helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        baseUri: ["'self'"],
        objectSrc: ["'none'"],
        frameAncestors: ["'none'"],
        imgSrc: ["'self'", "data:", "https:"],
        scriptSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        connectSrc: ["'self'", "https:", "wss:"]
      }
    },

    crossOriginEmbedderPolicy: false,

    crossOriginResourcePolicy: {
      policy: "cross-origin"
    }
  });
}

export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,

  limit: 300,

  standardHeaders: "draft-7",

  legacyHeaders: false,

  message: {
    success: false,
    message: "Too many requests. Please try again later."
  },

  handler(req, res) {
    res.status(429).json({
      success: false,
      message: "Too many requests. Please try again later."
    });
  }
});

export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,

  limit: 10,

  standardHeaders: "draft-7",

  legacyHeaders: false,

  message: {
    success: false,
    message: "Too many authentication attempts. Try again later."
  },

  handler(req, res) {
    res.status(429).json({
      success: false,
      message: "Too many authentication attempts. Try again later."
    });
  }
});
