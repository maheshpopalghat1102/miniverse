
import nodemailer from "nodemailer";

let transporter = null;

function getMailConfiguration() {
  const host = process.env.SMTP_HOST?.trim();
  const user = process.env.SMTP_USER?.trim();
  const pass = process.env.SMTP_PASS;
  const port = Number(process.env.SMTP_PORT || 587);

  const hasAnySetting = Boolean(host || user || pass);

  if (!hasAnySetting) {
    return null;
  }

  if (!host || !user || !pass) {
    throw new Error(
      "SMTP_HOST, SMTP_USER and SMTP_PASS must all be configured."
    );
  }

  if (!Number.isInteger(port) || port < 1 || port > 65535) {
    throw new Error("SMTP_PORT is invalid.");
  }

  return {
    host,
    port,
    secure: port === 465,
    auth: {
      user,
      pass
    }
  };
}

export function initializeMail() {
  const configuration = getMailConfiguration();

  if (!configuration) {
    console.warn(
      "SMTP is not configured. Email features are unavailable."
    );

    transporter = null;
    return null;
  }

  transporter = nodemailer.createTransport(configuration);

  console.log("Email transporter initialized.");

  return transporter;
}

export function getMailTransporter() {
  if (!transporter) {
    throw new Error(
      "Email transporter is not initialized. Configure SMTP first."
    );
  }

  return transporter;
}

export async function verifyMailConnection() {
  if (!transporter) {
    return false;
  }

  try {
    await transporter.verify();
    console.log("SMTP connection verified.");
    return true;
  } catch (error) {
    console.error("SMTP verification failed:", error.message);
    throw error;
  }
}

export async function sendMail({
  to,
  subject,
  text,
  html
}) {
  if (!transporter) {
    throw new Error(
      "Email service is unavailable. Configure SMTP settings."
    );
  }

  const from = process.env.EMAIL_FROM?.trim();

  if (!from) {
    throw new Error("EMAIL_FROM is missing from environment settings.");
  }

  if (!to || !subject || (!text && !html)) {
    throw new Error(
      "Email requires a recipient, subject and text or HTML content."
    );
  }

  return transporter.sendMail({
    from,
    to,
    subject,
    text,
    html
  });
}
