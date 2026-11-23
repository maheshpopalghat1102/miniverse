
import jwt from "jsonwebtoken";
import crypto from "node:crypto";

const getSecret = (type) => {
  const secret =
    type === "refresh"
      ? process.env.JWT_REFRESH_SECRET
      : process.env.JWT_ACCESS_SECRET;

  if (!secret) {
    throw new Error(`${type} JWT secret is not configured.`);
  }

  return secret;
};

export const generateAccessToken = (payload) => {
  return jwt.sign(
    {
      sub: payload.userId,
      username: payload.username,
      role: payload.role,
    },
    getSecret("access"),
    {
      expiresIn: process.env.JWT_ACCESS_TTL || "15m",
      issuer: "miniverse-api",
      audience: "miniverse-client",
    }
  );
};

export const generateRefreshToken = (payload) => {
  return jwt.sign(
    {
      sub: payload.userId,
      familyId: payload.familyId,
      tokenType: "refresh",
    },
    getSecret("refresh"),
    {
      expiresIn: process.env.JWT_REFRESH_TTL || "7d",
      issuer: "miniverse-api",
      audience: "miniverse-client",
      jwtid: crypto.randomUUID(),
    }
  );
};

export const verifyAccessToken = (token) => {
  return jwt.verify(token, getSecret("access"), {
    issuer: "miniverse-api",
    audience: "miniverse-client",
  });
};

export const verifyRefreshToken = (token) => {
  return jwt.verify(token, getSecret("refresh"), {
    issuer: "miniverse-api",
    audience: "miniverse-client",
  });
};

export const generateRandomToken = (bytes = 32) => {
  return crypto.randomBytes(bytes).toString("hex");
};

export const hashToken = (token) => {
  return crypto.createHash("sha256").update(token).digest("hex");
};

export const generateTokenExpiry = (minutes = 15) => {
  return new Date(Date.now() + minutes * 60 * 1000);
};
