import jwt from "jsonwebtoken";
import User from "../models/User.js";

const socketAuth = async (socket, next) => {
  try {
    const token =
      socket.handshake.auth?.token ||
      socket.handshake.headers?.authorization?.replace(/^Bearer\s+/i, "");

    if (!token) {
      return next(new Error("Authentication required."));
    }

    if (!process.env.JWT_ACCESS_SECRET) {
      return next(new Error("Socket authentication is not configured."));
    }

    const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET);

    const user = await User.findById(decoded.id).select(
      "+passwordChangedAt"
    );

    if (!user || user.status !== "active") {
      return next(new Error("Account not found or inactive."));
    }

    if (
      user.passwordChangedAt &&
      decoded.iat * 1000 < user.passwordChangedAt.getTime()
    ) {
      return next(new Error("Session expired. Please log in again."));
    }

    socket.user = {
      id: user._id.toString(),
      username: user.username,
      avatar: user.avatar || null,
      role: user.role,
    };

    next();
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      return next(new Error("Access token expired."));
    }

    if (error.name === "JsonWebTokenError") {
      return next(new Error("Invalid access token."));
    }

    next(new Error("Socket authentication failed."));
  }
};

export default socketAuth;