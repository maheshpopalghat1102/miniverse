
import express from "express";
import cookieParser from "cookie-parser";

import {
  createSecurityMiddleware,
  apiLimiter,
} from "./config/security.js";

import {
  createCorsMiddleware,
} from "./config/cors.js";

// ==========================================
// ROUTE IMPORTS
// ==========================================

import authRoutes from "./routes/authRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import gameRoutes from "./routes/gameRoutes.js";
import roomRoutes from "./routes/roomRoutes.js";
import matchRoutes from "./routes/matchRoutes.js";
import scoreRoutes from "./routes/scoreRoutes.js";
import leaderboardRoutes from "./routes/leaderboardRoutes.js";
import achievementRoutes from "./routes/achievementRoutes.js";
import friendRoutes from "./routes/friendRoutes.js";
import notificationRoutes from "./routes/notificationRoutes.js";
import truthDareRoutes from "./routes/truthDareRoutes.js";
import uploadRoutes from "./routes/uploadRoutes.js";
import reportRoutes from "./routes/reportRoutes.js";
import contactRoutes from "./routes/contactRoutes.js";

// ==========================================
// ERROR MIDDLEWARE
// ==========================================

import notFoundMiddleware from "./middleware/notFoundMiddleware.js";
import errorMiddleware from "./middleware/errorMiddleware.js";

// ==========================================
// APP INITIALIZATION
// ==========================================

const app = express();

const API_PREFIX = process.env.API_PREFIX || "/api/v1";

// ==========================================
// TRUST PROXY CONFIGURATION
// ==========================================

if (process.env.TRUST_PROXY === "true") {
  app.set("trust proxy", 1);
}

// ==========================================
// SECURITY MIDDLEWARE
// ==========================================

app.use(createSecurityMiddleware());

// ==========================================
// CORS CONFIGURATION
// ==========================================

const clientUrls = (
  process.env.CLIENT_URL || "http://localhost:5173"
)
  .split(",")
  .map((url) => url.trim())
  .filter(Boolean);

app.use(createCorsMiddleware(clientUrls));

// ==========================================
// BODY PARSING
// ==========================================

app.use(
  express.json({
    limit: "1mb",
  })
);

app.use(
  express.urlencoded({
    extended: true,
    limit: "1mb",
  })
);

app.use(cookieParser());

// ==========================================
// API RATE LIMITING
// ==========================================

app.use(API_PREFIX, apiLimiter);

// ==========================================
// HEALTH CHECK
// ==========================================

app.get("/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "MiniVerse API is running",
    environment: process.env.NODE_ENV || "development",
    timestamp: new Date().toISOString(),
  });
});
// ==========================================
// ROOT ROUTE - RENDER
// ==========================================

app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    name: "MiniVerse",
    message: "MiniVerse Backend is running successfully 🚀",
    status: "OK",
    environment: process.env.NODE_ENV || "development",
    timestamp: new Date().toISOString(),
  });
});

// Explicit HEAD request support
app.head("/", (req, res) => {
  res.status(200).end();
});
// ==========================================
// API ROOT
// ==========================================

app.get(API_PREFIX, (req, res) => {
  res.status(200).json({
    success: true,
    name: "MiniVerse API",
    version: "1.0.0",
    message: "Welcome to MiniVerse",
    endpoints: {
      auth: `${API_PREFIX}/auth`,
      users: `${API_PREFIX}/users`,
      games: `${API_PREFIX}/games`,
      rooms: `${API_PREFIX}/rooms`,
      matches: `${API_PREFIX}/matches`,
      scores: `${API_PREFIX}/scores`,
      leaderboards: `${API_PREFIX}/leaderboards`,
      achievements: `${API_PREFIX}/achievements`,
      friends: `${API_PREFIX}/friends`,
      notifications: `${API_PREFIX}/notifications`,
      truthDare: `${API_PREFIX}/truth-dare`,
      uploads: `${API_PREFIX}/uploads`,
      reports: `${API_PREFIX}/reports`,
      contact: `${API_PREFIX}/contact`,
    },
  });
});

// ==========================================
// AUTHENTICATION ROUTES
// ==========================================

app.use(`${API_PREFIX}/auth`, authRoutes);

// ==========================================
// USER ROUTES
// ==========================================

app.use(`${API_PREFIX}/users`, userRoutes);

// ==========================================
// GAME ROUTES
// ==========================================

app.use(`${API_PREFIX}/games`, gameRoutes);

// ==========================================
// ROOM ROUTES
// ==========================================

app.use(`${API_PREFIX}/rooms`, roomRoutes);

// ==========================================
// MATCH ROUTES
// ==========================================

app.use(`${API_PREFIX}/matches`, matchRoutes);

// ==========================================
// SCORE ROUTES
// ==========================================

app.use(`${API_PREFIX}/scores`, scoreRoutes);

// ==========================================
// LEADERBOARD ROUTES
// ==========================================

app.use(`${API_PREFIX}/leaderboards`, leaderboardRoutes);

// ==========================================
// ACHIEVEMENT ROUTES
// ==========================================

app.use(`${API_PREFIX}/achievements`, achievementRoutes);

// ==========================================
// FRIEND ROUTES
// ==========================================

app.use(`${API_PREFIX}/friends`, friendRoutes);

// ==========================================
// NOTIFICATION ROUTES
// ==========================================

app.use(`${API_PREFIX}/notifications`, notificationRoutes);

// ==========================================
// TRUTH OR DARE ROUTES
// ==========================================

app.use(`${API_PREFIX}/truth-dare`, truthDareRoutes);

// ==========================================
// UPLOAD ROUTES
// ==========================================

app.use(`${API_PREFIX}/uploads`, uploadRoutes);

// ==========================================
// REPORT ROUTES
// ==========================================

app.use(`${API_PREFIX}/reports`, reportRoutes);
app.use(`${API_PREFIX}/contact`, contactRoutes);

// ==========================================
// 404 HANDLER
// Must come after all routes.
// ==========================================

app.use(notFoundMiddleware);

// ==========================================
// GLOBAL ERROR HANDLER
// Must be the final middleware.
// ==========================================

app.use(errorMiddleware);

export default app;
