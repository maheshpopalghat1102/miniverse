
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  DEFAULT_THEME,
  THEMES,
  isValidTheme,
  isDarkTheme,
} from "./themes";

import {
  getSavedTheme,
  saveTheme,
} from "./themeStorage";

// Load all theme stylesheets.
import "./midnight.css";
import "./amoled.css";
import "./ocean.css";
import "./sunset.css";
import "./sakura.css";
import "./emerald.css";
import "./light.css";
import "./cyberpunk.css";

const ThemeContext = createContext(null);

export function ThemeProvider({ children }) {
  const [theme, setThemeState] = useState(getSavedTheme);

  useEffect(() => {
    const root = document.documentElement;

    root.setAttribute("data-theme", theme);
    root.setAttribute(
      "data-color-scheme",
      isDarkTheme(theme) ? "dark" : "light"
    );

    saveTheme(theme);
  }, [theme]);

  const setTheme = useCallback((themeId) => {
    if (!isValidTheme(themeId)) {
      console.warn(`Invalid MiniVerse theme: ${themeId}`);
      return;
    }

    setThemeState(themeId);
  }, []);

  const toggleLightDark = useCallback(() => {
    setThemeState((current) =>
      isDarkTheme(current) ? "light" : DEFAULT_THEME
    );
  }, []);

  const resetTheme = useCallback(() => {
    setThemeState(DEFAULT_THEME);
  }, []);

  const value = useMemo(() => ({
    theme,
    setTheme,
    toggleLightDark,
    resetTheme,
    themes: THEMES,
    isDark: isDarkTheme(theme),
    isLight: !isDarkTheme(theme),
  }), [theme, setTheme, toggleLightDark, resetTheme]);

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);

  if (!context) {
    throw new Error(
      "useTheme must be used inside ThemeProvider."
    );
  }

  return context;
}

export default ThemeContext;
