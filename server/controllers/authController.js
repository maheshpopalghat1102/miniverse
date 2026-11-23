
import crypto from "node:crypto";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

import User from "../models/User.js";
import Profile from "../models/Profile.js";
import RefreshSession from "../models/RefreshSession.js";
import EmailVerification from "../models/EmailVerification.js";

import { sendMail } from "../config/mail.js";

const ACCESS_TTL = process.env.JWT_ACCESS_TTL || "15m";
const REFRESH_TTL = process.env.JWT_REFRESH_TTL || "7d";

const REFRESH_COOKIE = "miniverse_refresh";
const getCookieOptions = () => ({
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax",
  path: `${process.env.API_PREFIX || "/api/v1"}/auth`
});

const hashToken = (token) =>
  crypto.createHash("sha256").update(token).digest("hex");

const createAccessToken = (user) => {
  if (!process.env.JWT_ACCESS_SECRET) {
    throw new Error("JWT_ACCESS_SECRET is not configured.");
  }

  return jwt.sign(
    {
      id: user._id.toString(),
      role: user.role
    },
    process.env.JWT_ACCESS_SECRET,
    {
      expiresIn: ACCESS_TTL
    }
  );
};

const createRefreshToken = () => crypto.randomBytes(48).toString("hex");

const getRefreshExpiry = () => {
  const match = REFRESH_TTL.match(/^(\d+)([dhm])$/);

  if (!match) {
    throw new Error("JWT_REFRESH_TTL must use formats like 15m, 7d or 12h.");
  }

  const amount = Number(match[1]);
  const unit = match[2];

  const milliseconds = {
    m: 60 * 1000,
    h: 60 * 60 * 1000,
    d: 24 * 60 * 60 * 1000
  }[unit];

  return new Date(Date.now() + amount * milliseconds);
};

const setRefreshCookie = (res, token, expiresAt) => {
  res.cookie(REFRESH_COOKIE, token, {
    ...getCookieOptions(),
    expires: expiresAt
  });
};

const clearRefreshCookie = (res) => {
  res.clearCookie(REFRESH_COOKIE, getCookieOptions());
};

const createSession = async (user, req, res, familyId) => {
  const refreshToken = createRefreshToken();
  const expiresAt = getRefreshExpiry();

  const session = await RefreshSession.create({
    user: user._id,
    tokenHash: hashToken(refreshToken),
    familyId: familyId || crypto.randomUUID(),
    userAgent: req.get("user-agent") || "",
    ipAddress: req.ip || "",
    expiresAt
  });

  setRefreshCookie(res, refreshToken, expiresAt);

  return session;
};

const safeUser = (user) => ({
  id: user._id,
  username: user.username,
  email: user.email,
  role: user.role,
  status: user.status,
  isEmailVerified: user.isEmailVerified,
  avatar: user.avatar,
  createdAt: user.createdAt
});

// REGISTER
export const register = async (req, res, next) => {
  try {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "Username, email and password are required."
      });
    }

    if (typeof password !== "string" || password.length < 8) {
      return res.status(400).json({
        success: false,
        message: "Password must contain at least 8 characters."
      });
    }

    const normalizedUsername = username.trim().toLowerCase();
    const normalizedEmail = email.trim().toLowerCase();

    const existingUser = await User.findOne({
      $or: [
        { username: normalizedUsername },
        { email: normalizedEmail }
      ]
    });

    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: "Username or email is already registered."
      });
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const user = await User.create({
      username: normalizedUsername,
      email: normalizedEmail,
      password: hashedPassword
    });

    try {
      await Profile.create({
        user: user._id,
        displayName: normalizedUsername
      });
    } catch (error) {
      await User.findByIdAndDelete(user._id);
      throw error;
    }

    const verificationToken = crypto.randomBytes(32).toString("hex");

    await EmailVerification.create({
      user: user._id,
      tokenHash: hashToken(verificationToken),
      purpose: "email_verification",
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000)
    });

    let emailSent = false;

    try {
      const verificationUrl =
        `${process.env.CLIENT_URL || "http://localhost:5173"}` +
        `/verify-email?token=${encodeURIComponent(verificationToken)}`;

      await sendMail({
        to: user.email,
        subject: "Verify your MiniVerse account",
        text: `Verify your email using this link: ${verificationUrl}`,
        html: `<p>Welcome to MiniVerse!</p><p><a href="${verificationUrl}">Verify your email</a></p>`
      });

      emailSent = true;
    } catch (mailError) {
      console.error("Verification email could not be sent:", mailError.message);
    }

    return res.status(201).json({
      success: true,
      message: emailSent
        ? "Registration successful. Check your email to verify your account."
        : "Registration successful. Email delivery is currently unavailable.",
      emailVerificationSent: emailSent,
      user: safeUser(user)
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: "Username or email is already registered."
      });
    }

    next(error);
  }
};

// LOGIN
export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required."
      });
    }

    const user = await User.findOne({
      email: email.trim().toLowerCase()
    }).select("+password");

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password."
      });
    }

    if (user.status !== "active") {
      return res.status(403).json({
        success: false,
        message: "This account is not active."
      });
    }

    if (user.lockUntil && user.lockUntil > new Date()) {
      return res.status(423).json({
        success: false,
        message: "Account temporarily locked. Try again later."
      });
    }

    const passwordMatches = await bcrypt.compare(
      password,
      user.password
    );

    if (!passwordMatches) {
      user.loginAttempts += 1;

      if (user.loginAttempts >= 5) {
        user.lockUntil = new Date(Date.now() + 15 * 60 * 1000);
        user.loginAttempts = 0;
      }

      await user.save();

      return res.status(401).json({
        success: false,
        message: "Invalid email or password."
      });
    }

    user.loginAttempts = 0;
    user.lockUntil = null;
    user.lastLoginAt = new Date();
    user.lastActiveAt = new Date();

    await user.save();

    const accessToken = createAccessToken(user);

    await createSession(user, req, res);

    return res.status(200).json({
      success: true,
      message: "Login successful.",
      accessToken,
      user: safeUser(user)
    });
  } catch (error) {
    next(error);
  }
};

// LOGOUT
export const logout = async (req, res, next) => {
  try {
    const refreshToken = req.cookies?.[REFRESH_COOKIE];

    if (refreshToken) {
      await RefreshSession.updateOne(
        {
          tokenHash: hashToken(refreshToken),
          revokedAt: null
        },
        {
          $set: {
            revokedAt: new Date(),
            revokedReason: "logout"
          }
        }
      );
    }

    clearRefreshCookie(res);

    return res.status(200).json({
      success: true,
      message: "Logged out successfully."
    });
  } catch (error) {
    next(error);
  }
};

// REFRESH ACCESS TOKEN
export const refreshToken = async (req, res, next) => {
  try {
    const oldToken = req.cookies?.[REFRESH_COOKIE];

    if (!oldToken) {
      clearRefreshCookie(res);

      return res.status(200).json({
        success: true,
        authenticated: false,
        message: "No active session."
      });
    }

    const tokenHash = hashToken(oldToken);

    const session = await RefreshSession.findOne({
      tokenHash
    }).select("+tokenHash");

    if (!session) {
      clearRefreshCookie(res);

      return res.status(401).json({
        success: false,
        message: "Invalid refresh session."
      });
    }

    if (session.revokedAt) {
      // A previously rotated token was reused.
      await RefreshSession.updateMany(
        {
          familyId: session.familyId,
          revokedAt: null
        },
        {
          $set: {
            revokedAt: new Date(),
            revokedReason: "reuse_detected"
          }
        }
      );

      clearRefreshCookie(res);

      return res.status(401).json({
        success: false,
        message: "Session expired. Please log in again."
      });
    }

    if (session.expiresAt <= new Date()) {
      session.revokedAt = new Date();
      session.revokedReason = "expired";
      await session.save();

      clearRefreshCookie(res);

      return res.status(401).json({
        success: false,
        message: "Refresh session has expired."
      });
    }

    const user = await User.findById(session.user);

    if (!user || user.status !== "active") {
      session.revokedAt = new Date();
      session.revokedReason = "admin_action";
      await session.save();

      clearRefreshCookie(res);

      return res.status(401).json({
        success: false,
        message: "Account is unavailable."
      });
    }

    const newToken = createRefreshToken();
    const newExpiry = getRefreshExpiry();

    const newSession = await RefreshSession.create({
      user: user._id,
      tokenHash: hashToken(newToken),
      familyId: session.familyId,
      userAgent: req.get("user-agent") || "",
      ipAddress: req.ip || "",
      expiresAt: newExpiry
    });

    session.revokedAt = new Date();
    session.revokedReason = "token_rotation";
    session.replacedBy = newSession._id;

    await session.save();

    setRefreshCookie(res, newToken, newExpiry);

    return res.status(200).json({
      success: true,
      accessToken: createAccessToken(user)
    });
  } catch (error) {
    next(error);
  }
};

// VERIFY EMAIL
export const verifyEmail = async (req, res, next) => {
  try {
    const { token } = req.body;

    if (!token || typeof token !== "string") {
      return res.status(400).json({
        success: false,
        message: "Verification token is required."
      });
    }

    const verification = await EmailVerification.findOne({
      tokenHash: hashToken(token),
      purpose: "email_verification",
      usedAt: null,
      expiresAt: { $gt: new Date() }
    });

    if (!verification) {
      return res.status(400).json({
        success: false,
        message: "Verification token is invalid or expired."
      });
    }

    const user = await User.findById(verification.user);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User account not found."
      });
    }

    user.isEmailVerified = true;
    user.emailVerifiedAt = new Date();

    verification.usedAt = new Date();

    await Promise.all([
      user.save(),
      verification.save()
    ]);

    return res.status(200).json({
      success: true,
      message: "Email verified successfully."
    });
  } catch (error) {
    next(error);
  }
};

// FORGOT PASSWORD
export const forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Email is required."
      });
    }

    const user = await User.findOne({
      email: email.trim().toLowerCase(),
      status: "active"
    });

    // Always return the same response to avoid email enumeration.
    if (!user) {
      return res.status(200).json({
        success: true,
        message: "If the account exists, password reset instructions will be sent."
      });
    }

    const token = crypto.randomBytes(32).toString("hex");

    await EmailVerification.deleteMany({
      user: user._id,
      purpose: "password_reset",
      usedAt: null
    });

    await EmailVerification.create({
      user: user._id,
      tokenHash: hashToken(token),
      purpose: "password_reset",
      expiresAt: new Date(Date.now() + 15 * 60 * 1000)
    });

    const resetUrl =
      `${process.env.CLIENT_URL || "http://localhost:5173"}` +
      `/reset-password?token=${encodeURIComponent(token)}`;

    try {
      await sendMail({
        to: user.email,
        subject: "Reset your MiniVerse password",
        text: `Reset your password using this link: ${resetUrl}`,
        html: `<p>Reset your MiniVerse password:</p><p><a href="${resetUrl}">Reset password</a></p>`
      });
    } catch (mailError) {
      console.error("Password reset email failed:", mailError.message);
    }

    return res.status(200).json({
      success: true,
      message: "If the account exists, password reset instructions will be sent."
    });
  } catch (error) {
    next(error);
  }
};

// RESET PASSWORD
export const resetPassword = async (req, res, next) => {
  try {
    const { token, newPassword } = req.body;

    if (!token || !newPassword || newPassword.length < 8) {
      return res.status(400).json({
        success: false,
        message: "A valid token and password of at least 8 characters are required."
      });
    }

    const verification = await EmailVerification.findOne({
      tokenHash: hashToken(token),
      purpose: "password_reset",
      usedAt: null,
      expiresAt: { $gt: new Date() }
    });

    if (!verification) {
      return res.status(400).json({
        success: false,
        message: "Reset token is invalid or expired."
      });
    }

    const user = await User.findById(verification.user);

    if (!user || user.status !== "active") {
      return res.status(400).json({
        success: false,
        message: "Unable to reset this account password."
      });
    }

    user.password = await bcrypt.hash(newPassword, 12);
    user.passwordChangedAt = new Date();

    verification.usedAt = new Date();

    await Promise.all([
      user.save(),
      verification.save(),
      RefreshSession.updateMany(
        {
          user: user._id,
          revokedAt: null
        },
        {
          $set: {
            revokedAt: new Date(),
            revokedReason: "password_change"
          }
        }
      )
    ]);

    clearRefreshCookie(res);

    return res.status(200).json({
      success: true,
      message: "Password reset successfully. Please log in again."
    });
  } catch (error) {
    next(error);
  }
};

// CURRENT USER
export const getCurrentUser = async (req, res, next) => {
  try {
    const userId = req.user?.id || req.user?._id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Authentication required."
      });
    }

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found."
      });
    }

    const profile = await Profile.findOne({
      user: user._id
    });

    return res.status(200).json({
      success: true,
      user: safeUser(user),
      profile
    });
  } catch (error) {
    next(error);
  }
};
