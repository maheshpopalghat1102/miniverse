
import { useCallback, useEffect, useState } from "react";

export const MINIVERSE_THEMES = [
  "midnight",
  "amoled",
  "ocean",
  "sunset",
  "sakura",
  "emerald",
  "light",
  "cyberpunk",
];

const STORAGE_KEY = "miniverse-theme";

function getInitialTheme() {
  try {
    const savedTheme = localStorage.getItem(STORAGE_KEY);

    return MINIVERSE_THEMES.includes(savedTheme)
      ? savedTheme
      : "midnight";
  } catch {
    return "midnight";
  }
}

export default function useTheme() {
  const [theme, setThemeState] = useState(getInitialTheme);

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    document.documentElement.classList.remove(
      ...MINIVERSE_THEMES.map((item) => `theme-${item}`)
    );
    document.documentElement.classList.add(`theme-${theme}`);

    try {
      localStorage.setItem(STORAGE_KEY, theme);
    } catch {
      // Storage may be unavailable in private browsing.
    }
  }, [theme]);

  const setTheme = useCallback((newTheme) => {
    if (!MINIVERSE_THEMES.includes(newTheme)) {
      console.warn(`Unknown MiniVerse theme: ${newTheme}`);
      return;
    }

    setThemeState(newTheme);
  }, []);

  const toggleTheme = useCallback(() => {
    setThemeState((current) =>
      current === "light" ? "midnight" : "light"
    );
  }, []);

  return {
    theme,
    setTheme,
    toggleTheme,
    availableThemes: MINIVERSE_THEMES,
  };
}
