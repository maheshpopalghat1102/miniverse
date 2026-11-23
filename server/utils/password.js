
import bcrypt from "bcryptjs";

const SALT_ROUNDS = 12;

export const validatePasswordStrength = (password) => {
  if (typeof password !== "string") {
    return {
      valid: false,
      message: "Password must be a string.",
    };
  }

  if (password.length < 8 || password.length > 128) {
    return {
      valid: false,
      message: "Password must contain 8–128 characters.",
    };
  }

  if (!/[a-z]/.test(password)) {
    return {
      valid: false,
      message: "Password must contain a lowercase letter.",
    };
  }

  if (!/[A-Z]/.test(password)) {
    return {
      valid: false,
      message: "Password must contain an uppercase letter.",
    };
  }

  if (!/[0-9]/.test(password)) {
    return {
      valid: false,
      message: "Password must contain a number.",
    };
  }

  return {
    valid: true,
    message: "Password is strong.",
  };
};

export const hashPassword = async (password) => {
  if (typeof password !== "string" || password.length < 8 || password.length > 128) {
    throw new Error("Password must contain 8–128 characters.");
  }

  return bcrypt.hash(password, SALT_ROUNDS);
};

export const comparePassword = async (password, hashedPassword) => {
  if (
    typeof password !== "string" ||
    typeof hashedPassword !== "string"
  ) {
    return false;
  }

  return bcrypt.compare(password, hashedPassword);
};

export const needsPasswordRehash = async (hashedPassword) => {
  if (typeof hashedPassword !== "string") {
    return true;
  }

  const rounds = bcrypt.getRounds(hashedPassword);

  return rounds < SALT_ROUNDS;
};
