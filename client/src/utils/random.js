
function secureRandomIndex(max) {
  if (!Number.isInteger(max) || max <= 0) {
    throw new RangeError("Maximum must be a positive integer.");
  }

  if (!globalThis.crypto?.getRandomValues) {
    throw new Error("Secure random generation is unavailable.");
  }

  const range = 0x100000000;
  const limit = range - (range % max);
  const values = new Uint32Array(1);

  do {
    crypto.getRandomValues(values);
  } while (values[0] >= limit);

  return values[0] % max;
}

export function randomInteger(min, max) {
  if (
    !Number.isInteger(min) ||
    !Number.isInteger(max) ||
    max < min
  ) {
    throw new RangeError("Invalid integer range.");
  }

  return min + secureRandomIndex(max - min + 1);
}

export function randomFloat(min = 0, max = 1) {
  if (
    !Number.isFinite(min) ||
    !Number.isFinite(max) ||
    max < min
  ) {
    throw new RangeError("Invalid number range.");
  }

  const values = new Uint32Array(1);
  crypto.getRandomValues(values);

  const fraction = values[0] / 0x100000000;

  return min + fraction * (max - min);
}

export function randomItem(items) {
  if (!Array.isArray(items) || items.length === 0) {
    return null;
  }

  return items[secureRandomIndex(items.length)];
}

export function shuffleArray(items) {
  if (!Array.isArray(items)) return [];

  const result = [...items];

  for (let i = result.length - 1; i > 0; i--) {
    const j = secureRandomIndex(i + 1);

    [result[i], result[j]] = [result[j], result[i]];
  }

  return result;
}

export function getRandomItems(items, count = 1) {
  if (!Array.isArray(items)) return [];

  const safeCount = Math.max(
    0,
    Math.min(Math.floor(count), items.length)
  );

  return shuffleArray(items).slice(0, safeCount);
}

export function randomBoolean() {
  return randomInteger(0, 1) === 1;
}

export function randomChoice(first, second) {
  return randomBoolean() ? first : second;
}

export function generateRandomNumber(min = 1, max = 100) {
  return randomInteger(min, max);
}

export function generateUniqueNumbers(count, min, max) {
  if (
    !Number.isInteger(count) ||
    !Number.isInteger(min) ||
    !Number.isInteger(max) ||
    count < 0 ||
    max < min ||
    count > max - min + 1
  ) {
    throw new RangeError("Invalid unique number configuration.");
  }

  const numbers = [];

  for (let value = min; value <= max; value++) {
    numbers.push(value);
  }

  return shuffleArray(numbers).slice(0, count);
}

export default {
  randomInteger,
  randomFloat,
  randomItem,
  shuffleArray,
  getRandomItems,
  randomBoolean,
  randomChoice,
  generateRandomNumber,
  generateUniqueNumbers,
};
