
import crypto from "node:crypto";

export const randomInteger = (min, max) => {
  if (
    !Number.isSafeInteger(min) ||
    !Number.isSafeInteger(max) ||
    min > max
  ) {
    throw new Error("Invalid integer range.");
  }

  return crypto.randomInt(min, max + 1);
};

export const randomFloat = (min = 0, max = 1) => {
  if (
    !Number.isFinite(min) ||
    !Number.isFinite(max) ||
    min >= max
  ) {
    throw new Error("Invalid float range.");
  }

  const randomBytes = crypto.randomBytes(4);
  const randomValue = randomBytes.readUInt32BE(0) / 0x100000000;

  return min + randomValue * (max - min);
};

export const randomItem = (array) => {
  if (!Array.isArray(array) || array.length === 0) {
    throw new Error("A non-empty array is required.");
  }

  return array[randomInteger(0, array.length - 1)];
};

export const shuffleArray = (array) => {
  if (!Array.isArray(array)) {
    throw new Error("An array is required.");
  }

  const result = [...array];

  for (let i = result.length - 1; i > 0; i -= 1) {
    const j = randomInteger(0, i);

    [result[i], result[j]] = [result[j], result[i]];
  }

  return result;
};

export const generateNumericOTP = (length = 6) => {
  if (!Number.isInteger(length) || length < 4 || length > 10) {
    throw new Error("OTP length must be between 4 and 10.");
  }

  const min = 10 ** (length - 1);
  const max = 10 ** length - 1;

  return String(randomInteger(min, max));
};

export const generateRandomId = (bytes = 16) => {
  if (!Number.isInteger(bytes) || bytes < 8 || bytes > 64) {
    throw new Error("Random ID byte length must be between 8 and 64.");
  }

  return crypto.randomBytes(bytes).toString("hex");
};

export const generateRandomString = (length = 12) => {
  const characters =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

  if (!Number.isInteger(length) || length < 1 || length > 256) {
    throw new Error("Random string length must be between 1 and 256.");
  }

  let result = "";

  for (let i = 0; i < length; i += 1) {
    result += characters[randomInteger(0, characters.length - 1)];
  }

  return result;
};
