import { sendMail } from "../config/mail.js";

export const sendVerificationEmail = async (email, token) => {
  const frontendUrl = process.env.CLIENT_URL?.split(",")[0]?.trim();

  if (!frontendUrl) {
    throw new Error("CLIENT_URL is not configured.");
  }

  const verificationUrl =
    `${frontendUrl}/verify-email?token=${encodeURIComponent(token)}`;

  return sendMail({
    to: email,
    subject: "Verify your MiniVerse account",
    html: `
      <div style="font-family:Arial,sans-serif;max-width:600px;margin:auto">
        <h2>Welcome to MiniVerse!</h2>
        <p>Please verify your email address to activate your account.</p>
        <a href="${verificationUrl}"
           style="display:inline-block;padding:12px 20px;background:#6c5ce7;color:white;text-decoration:none;border-radius:8px">
          Verify Email
        </a>
        <p>If you did not create this account, you can ignore this email.</p>
      </div>
    `,
  });
};

export const sendPasswordResetEmail = async (email, token) => {
  const frontendUrl = process.env.CLIENT_URL?.split(",")[0]?.trim();

  if (!frontendUrl) {
    throw new Error("CLIENT_URL is not configured.");
  }

  const resetUrl =
    `${frontendUrl}/reset-password?token=${encodeURIComponent(token)}`;

  return sendMail({
    to: email,
    subject: "Reset your MiniVerse password",
    html: `
      <div style="font-family:Arial,sans-serif;max-width:600px;margin:auto">
        <h2>Password Reset</h2>
        <p>We received a request to reset your MiniVerse password.</p>
        <a href="${resetUrl}"
           style="display:inline-block;padding:12px 20px;background:#6c5ce7;color:white;text-decoration:none;border-radius:8px">
          Reset Password
        </a>
        <p>If you did not request this, ignore this email.</p>
      </div>
    `,
  });
};

export const sendWelcomeEmail = async (email, username) => {
  return sendMail({
    to: email,
    subject: "Welcome to MiniVerse",
    html: `
      <div style="font-family:Arial,sans-serif">
        <h2>Welcome, ${escapeHtml(username)}!</h2>
        <p>Your MiniVerse account is ready. Invite your friends and start playing.</p>
      </div>
    `,
  });
};

const escapeHtml = (value = "") =>
  String(value).replace(/[&<>"']/g, (char) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;",
  })[char]);