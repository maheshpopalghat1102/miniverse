
const DEFAULT_CHARACTERS = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

function getRandomIndex(max) {
  if (!Number.isInteger(max) || max <= 0 || max > 256) {
    throw new RangeError("Maximum must be between 1 and 256.");
  }

  if (!globalThis.crypto?.getRandomValues) {
    throw new Error("Secure random generation is unavailable.");
  }

  const range = 256;
  const limit = range - (range % max);
  const bytes = new Uint8Array(1);

  do {
    crypto.getRandomValues(bytes);
  } while (bytes[0] >= limit);

  return bytes[0] % max;
}

export function generateCode(
  length = 6,
  characters = DEFAULT_CHARACTERS
) {
  if (!Number.isInteger(length) || length < 1 || length > 64) {
    throw new RangeError("Code length must be between 1 and 64.");
  }

  if (typeof characters !== "string" || characters.length < 2) {
    throw new TypeError("Provide at least two unique characters.");
  }

  const uniqueCharacters = [...new Set(characters)];

  if (uniqueCharacters.length < 2 || uniqueCharacters.length > 256) {
    throw new RangeError("Character set must contain 2–256 unique characters.");
  }

  return Array.from(
    { length },
    () => uniqueCharacters[getRandomIndex(uniqueCharacters.length)]
  ).join("");
}

export function generateRoomCode(length = 6) {
  return generateCode(length, DEFAULT_CHARACTERS);
}

export function generateInviteCode(length = 10) {
  return generateCode(length);
}

export function generateNumericCode(length = 6) {
  return generateCode(length, "0123456789");
}

export function generateAlphanumericCode(length = 8) {
  return generateCode(
    length,
    "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"
  );
}

export default {
  generateCode,
  generateRoomCode,
  generateInviteCode,
  generateNumericCode,
  generateAlphanumericCode,
};
