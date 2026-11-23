import { Server } from "socket.io";
import socketAuth from "./socketAuth.js";
import { registerSocketEvents } from "./socketEvents.js";

let ioInstance = null;

export const initializeSocketServer = (httpServer) => {
  if (ioInstance) {
    throw new Error("Socket.IO server has already been initialized.");
  }

  const allowedOrigins = (process.env.CLIENT_URL || "http://localhost:5173")
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean);

  ioInstance = new Server(httpServer, {
    cors: {
      origin(origin, callback) {
        // Allow non-browser clients without an Origin header.
        if (!origin || allowedOrigins.includes(origin)) {
          return callback(null, true);
        }

        return callback(new Error("Origin not allowed by Socket.IO CORS."));
      },
      methods: ["GET", "POST"],
      credentials: true,
    },
    transports: ["websocket", "polling"],
    maxHttpBufferSize: 1e6,
    pingInterval: 25000,
    pingTimeout: 20000,
  });

  ioInstance.use(socketAuth);

  ioInstance.on("connection", (socket) => {
    registerSocketEvents(ioInstance, socket);
  });

  console.log("Socket.IO server initialized.");

  return ioInstance;
};

export const getIO = () => {
  if (!ioInstance) {
    throw new Error("Socket.IO server has not been initialized.");
  }

  return ioInstance;
};

export const closeSocketServer = async () => {
  if (!ioInstance) return;

  const currentInstance = ioInstance;
  ioInstance = null;

  await new Promise((resolve) => {
    currentInstance.close(resolve);
  });
};