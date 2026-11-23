
import { DEFAULT_THEME, isValidTheme } from "./themes";

const STORAGE_KEY = "miniverse-theme";

export function getSavedTheme() {
  try {
    const theme = localStorage.getItem(STORAGE_KEY);

    return isValidTheme(theme) ? theme : DEFAULT_THEME;
  } catch {
    return DEFAULT_THEME;
  }
}

export function saveTheme(themeId) {
  if (!isValidTheme(themeId)) {
    return false;
  }

  try {
    localStorage.setItem(STORAGE_KEY, themeId);
    return true;
  } catch {
    return false;
  }
}

export function removeSavedTheme() {
  try {
    localStorage.removeItem(STORAGE_KEY);
    return true;
  } catch {
    return false;
  }
}

export function getThemeStorageKey() {
  return STORAGE_KEY;
}
