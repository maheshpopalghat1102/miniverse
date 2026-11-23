
const HTML_ENTITIES = {
  "&": "&amp;",
  "<": "&lt;",
  ">": "&gt;",
  '"': "&quot;",
  "'": "&#x27;",
};

export const escapeHTML = (value) => {
  if (typeof value !== "string") {
    return "";
  }

  return value.replace(/[&<>"']/g, (character) => {
    return HTML_ENTITIES[character];
  });
};

export const sanitizeText = (value, maxLength = 500) => {
  if (typeof value !== "string") {
    return "";
  }

  if (!Number.isInteger(maxLength) || maxLength < 0) {
    throw new Error("Invalid maximum text length.");
  }

  return escapeHTML(
    value
      .normalize("NFC")
      .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, "")
      .trim()
      .slice(0, maxLength)
  );
};

export const sanitizeUsername = (value) => {
  if (typeof value !== "string") {
    return "";
  }

  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9_]/g, "")
    .slice(0, 20);
};

export const sanitizeEmail = (value) => {
  if (typeof value !== "string") {
    return "";
  }

  return value.trim().toLowerCase().slice(0, 254);
};

export const sanitizeSearchQuery = (value) => {
  if (typeof value !== "string") {
    return "";
  }

  return value
    .normalize("NFC")
    .replace(/[<>$]/g, "")
    .trim()
    .slice(0, 100);
};

export const sanitizeObject = (object, allowedFields = []) => {
  if (
    !object ||
    typeof object !== "object" ||
    Array.isArray(object) ||
    !Array.isArray(allowedFields)
  ) {
    return {};
  }

  const sanitized = {};

  for (const field of allowedFields) {
    if (
      Object.prototype.hasOwnProperty.call(object, field) &&
      typeof object[field] === "string"
    ) {
      sanitized[field] = sanitizeText(object[field]);
    }
  }

  return sanitized;
};
