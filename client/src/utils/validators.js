
export const VALIDATION_LIMITS = {
  USERNAME_MIN: 3,
  USERNAME_MAX: 20,
  PASSWORD_MIN: 8,
  PASSWORD_MAX: 128,
  BIO_MAX: 250,
  MESSAGE_MAX: 2000,
  ROOM_CODE_MIN: 4,
  ROOM_CODE_MAX: 12,
};

export function isRequired(value) {
  return (
    value !== null &&
    value !== undefined &&
    String(value).trim().length > 0
  );
}

export function isValidEmail(email) {
  if (typeof email !== "string") return false;

  const normalized = email.trim();

  if (normalized.length > 254) return false;

  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalized);
}

export function isValidUsername(username) {
  if (typeof username !== "string") return false;

  const value = username.trim();

  return (
    value.length >= VALIDATION_LIMITS.USERNAME_MIN &&
    value.length <= VALIDATION_LIMITS.USERNAME_MAX &&
    /^[a-zA-Z0-9_]+$/.test(value)
  );
}

export function validatePassword(password) {
  if (typeof password !== "string") {
    return {
      isValid: false,
      errors: ["Password is required."],
    };
  }

  const errors = [];

  if (password.length < VALIDATION_LIMITS.PASSWORD_MIN) {
    errors.push("Password must contain at least 8 characters.");
  }

  if (password.length > VALIDATION_LIMITS.PASSWORD_MAX) {
    errors.push("Password must not exceed 128 characters.");
  }

  if (!/[a-z]/.test(password)) {
    errors.push("Password must contain a lowercase letter.");
  }

  if (!/[A-Z]/.test(password)) {
    errors.push("Password must contain an uppercase letter.");
  }

  if (!/[0-9]/.test(password)) {
    errors.push("Password must contain a number.");
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

export function passwordsMatch(password, confirmPassword) {
  return (
    typeof password === "string" &&
    password === confirmPassword
  );
}

export function isValidRoomCode(code) {
  if (typeof code !== "string") return false;

  const value = code.trim().toUpperCase();

  return (
    value.length >= VALIDATION_LIMITS.ROOM_CODE_MIN &&
    value.length <= VALIDATION_LIMITS.ROOM_CODE_MAX &&
    /^[A-Z0-9]+$/.test(value)
  );
}

export function isValidBio(bio) {
  return (
    typeof bio === "string" &&
    bio.length <= VALIDATION_LIMITS.BIO_MAX
  );
}

export function isValidChatMessage(message) {
  return (
    typeof message === "string" &&
    message.trim().length > 0 &&
    message.length <= VALIDATION_LIMITS.MESSAGE_MAX
  );
}

export function isValidAge(age, minimumAge = 13) {
  const numericAge = Number(age);

  return (
    Number.isInteger(numericAge) &&
    numericAge >= minimumAge &&
    numericAge <= 120
  );
}

export function isValidUrl(value) {
  if (typeof value !== "string") return false;

  try {
    const url = new URL(value);
    return ["http:", "https:"].includes(url.protocol);
  } catch {
    return false;
  }
}

export function isValidPhone(phone) {
  if (typeof phone !== "string") return false;

  const normalized = phone.replace(/[\s()-]/g, "");

  return /^\+?[0-9]{7,15}$/.test(normalized);
}

export function validateRegistration(data = {}) {
  const errors = {};

  if (!isValidUsername(data.username)) {
    errors.username = "Enter a valid username (3–20 letters, numbers or underscores).";
  }

  if (!isValidEmail(data.email)) {
    errors.email = "Enter a valid email address.";
  }

  const passwordResult = validatePassword(data.password);

  if (!passwordResult.isValid) {
    errors.password = passwordResult.errors;
  }

  if (!passwordsMatch(data.password, data.confirmPassword)) {
    errors.confirmPassword = "Passwords do not match.";
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
}

export default {
  isRequired,
  isValidEmail,
  isValidUsername,
  validatePassword,
  passwordsMatch,
  isValidRoomCode,
  isValidBio,
  isValidChatMessage,
  isValidAge,
  isValidUrl,
  isValidPhone,
  validateRegistration,
};
