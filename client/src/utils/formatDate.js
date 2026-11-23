
const DEFAULT_LOCALE = "en-IN";

function toValidDate(value) {
  const date = value instanceof Date ? value : new Date(value);

  return Number.isNaN(date.getTime()) ? null : date;
}

export function formatDate(value, options = {}) {
  const date = toValidDate(value);

  if (!date) return "Invalid date";

  return new Intl.DateTimeFormat(
    options.locale || DEFAULT_LOCALE,
    {
      day: "2-digit",
      month: "short",
      year: "numeric",
      ...options,
    }
  ).format(date);
}

export function formatDateTime(value, options = {}) {
  const date = toValidDate(value);

  if (!date) return "Invalid date";

  return new Intl.DateTimeFormat(
    options.locale || DEFAULT_LOCALE,
    {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      ...options,
    }
  ).format(date);
}

export function formatTime(value, options = {}) {
  const date = toValidDate(value);

  if (!date) return "Invalid time";

  return new Intl.DateTimeFormat(
    options.locale || DEFAULT_LOCALE,
    {
      hour: "2-digit",
      minute: "2-digit",
      ...options,
    }
  ).format(date);
}

export function formatRelativeTime(value, locale = DEFAULT_LOCALE) {
  const date = toValidDate(value);

  if (!date) return "Unknown time";

  const seconds = Math.round((date.getTime() - Date.now()) / 1000);
  const absoluteSeconds = Math.abs(seconds);

  const units = [
    ["year", 31536000],
    ["month", 2592000],
    ["week", 604800],
    ["day", 86400],
    ["hour", 3600],
    ["minute", 60],
    ["second", 1],
  ];

  const formatter = new Intl.RelativeTimeFormat(locale, {
    numeric: "auto",
  });

  for (const [unit, duration] of units) {
    if (absoluteSeconds >= duration || unit === "second") {
      return formatter.format(
        Math.round(seconds / duration),
        unit
      );
    }
  }

  return "Just now";
}

export function formatDuration(totalSeconds) {
  const seconds = Math.max(0, Math.floor(Number(totalSeconds) || 0));

  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const remainingSeconds = seconds % 60;

  if (hours > 0) {
    return [
      hours,
      String(minutes).padStart(2, "0"),
      String(remainingSeconds).padStart(2, "0"),
    ].join(":");
  }

  return [
    String(minutes).padStart(2, "0"),
    String(remainingSeconds).padStart(2, "0"),
  ].join(":");
}

export function formatShortDate(value) {
  return formatDate(value, {
    day: "numeric",
    month: "short",
  });
}

export function isValidDate(value) {
  return toValidDate(value) !== null;
}

export function getDateDifference(start, end = new Date()) {
  const startDate = toValidDate(start);
  const endDate = toValidDate(end);

  if (!startDate || !endDate) return null;

  return Math.abs(endDate.getTime() - startDate.getTime());
}

export default {
  formatDate,
  formatDateTime,
  formatTime,
  formatRelativeTime,
  formatDuration,
  formatShortDate,
  isValidDate,
  getDateDifference,
};
