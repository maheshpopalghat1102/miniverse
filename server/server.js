
import http from "node:http";
import "dotenv/config";

import app from "./app.js";

import { validateEnvironment } from "./config/environment.js";

import {
  connectDatabase,
  disconnectDatabase,
} from "./config/database.js";

import { initializeMail } from "./config/mail.js";

import { initializeCloudinary } from "./config/cloudinary.js";

import {
  initializeSocketServer,
  closeSocketServer,
} from "./sockets/socketServer.js";

const PORT = Number(process.env.PORT) || 5001;
const NODE_ENV = process.env.NODE_ENV || "development";

const httpServer = http.createServer(app);

let isShuttingDown = false;

async function shutdown(signal) {
  if (isShuttingDown) return;

  isShuttingDown = true;

  console.log(`\n${signal} received. Shutting down MiniVerse...`);

  const forceExitTimer = setTimeout(() => {
    console.error("Forced shutdown after timeout.");
    process.exit(1);
  }, 10000);

  forceExitTimer.unref();

  try {
    await closeSocketServer();

    if (httpServer.listening) {
      await new Promise((resolve, reject) => {
        httpServer.close((error) => {
          if (error) reject(error);
          else resolve();
        });
      });
    }

    await disconnectDatabase();

    console.log("MiniVerse server shut down successfully.");

    clearTimeout(forceExitTimer);
    process.exit(0);
  } catch (error) {
    console.error("Error during shutdown:", error);

    clearTimeout(forceExitTimer);
    process.exit(1);
  }
}

process.on("SIGINT", () => shutdown("SIGINT"));
process.on("SIGTERM", () => shutdown("SIGTERM"));

process.on("unhandledRejection", (reason) => {
  console.error("Unhandled Promise Rejection:", reason);
  shutdown("UNHANDLED_REJECTION");
});

process.on("uncaughtException", (error) => {
  console.error("Uncaught Exception:", error);
  shutdown("UNCAUGHT_EXCEPTION");
});

async function startServer() {
  try {
    console.log("--------------------------------------");
    console.log("Starting MiniVerse Backend...");
    console.log("--------------------------------------");

    validateEnvironment();
    console.log("Environment validation successful.");

    await connectDatabase(process.env.MONGODB_URI);
    console.log("MongoDB connected successfully.");

    initializeMail();
    console.log("Email service initialized.");

    initializeCloudinary();
    console.log("Cloudinary initialized.");

    const io = initializeSocketServer(httpServer);

    app.set("io", io);
    console.log("Socket.IO initialized.");

    httpServer.listen(PORT, () => {
      console.log("--------------------------------------");
      console.log("MiniVerse Backend Started");
      console.log("--------------------------------------");
      console.log(`Environment: ${NODE_ENV}`);
      console.log(`Port: ${PORT}`);
      console.log(`API: http://localhost:${PORT}/api/v1`);
      console.log(`Health: http://localhost:${PORT}/health`);
      console.log("Socket.IO: Enabled");
      console.log("--------------------------------------");
    });

    httpServer.on("error", (error) => {
      console.error("HTTP Server Error:", error);
      shutdown("HTTP_SERVER_ERROR");
    });
  } catch (error) {
    console.error("--------------------------------------");
    console.error("MiniVerse Startup Failed");
    console.error("--------------------------------------");
    console.error(error);

    try {
      await closeSocketServer();
    } catch (socketError) {
      console.error("Socket shutdown error:", socketError);
    }

    try {
      await disconnectDatabase();
    } catch (databaseError) {
      console.error("Database shutdown error:", databaseError);
    }

    process.exit(1);
  }
}

startServer();
