
function getStorage(type = "local") {
  try {
    if (typeof window === "undefined") return null;

    return type === "session"
      ? window.sessionStorage
      : window.localStorage;
  } catch {
    return null;
  }
}

export function setItem(key, value, type = "local") {
  const storage = getStorage(type);

  if (!storage) return false;

  try {
    const serialized =
      typeof value === "string"
        ? value
        : JSON.stringify(value);

    storage.setItem(key, serialized);
    return true;
  } catch {
    return false;
  }
}

export function getItem(key, defaultValue = null, type = "local") {
  const storage = getStorage(type);

  if (!storage) return defaultValue;

  try {
    const value = storage.getItem(key);

    if (value === null) return defaultValue;

    try {
      return JSON.parse(value);
    } catch {
      return value;
    }
  } catch {
    return defaultValue;
  }
}

export function removeItem(key, type = "local") {
  const storage = getStorage(type);

  if (!storage) return false;

  try {
    storage.removeItem(key);
    return true;
  } catch {
    return false;
  }
}

export function clearStorage(type = "local") {
  const storage = getStorage(type);

  if (!storage) return false;

  try {
    storage.clear();
    return true;
  } catch {
    return false;
  }
}

export function hasItem(key, type = "local") {
  const storage = getStorage(type);

  if (!storage) return false;

  try {
    return storage.getItem(key) !== null;
  } catch {
    return false;
  }
}

export function setLocalItem(key, value) {
  return setItem(key, value, "local");
}

export function getLocalItem(key, defaultValue = null) {
  return getItem(key, defaultValue, "local");
}

export function removeLocalItem(key) {
  return removeItem(key, "local");
}

export function setSessionItem(key, value) {
  return setItem(key, value, "session");
}

export function getSessionItem(key, defaultValue = null) {
  return getItem(key, defaultValue, "session");
}

export function removeSessionItem(key) {
  return removeItem(key, "session");
}

export const storage = {
  setItem,
  getItem,
  removeItem,
  clearStorage,
  hasItem,
  setLocalItem,
  getLocalItem,
  removeLocalItem,
  setSessionItem,
  getSessionItem,
  removeSessionItem,
};

export default storage;
