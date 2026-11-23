
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

const ThemeContext = createContext(null);

export const THEMES = [
  { id: "midnight", name: "Midnight" },
  { id: "amoled", name: "AMOLED" },
  { id: "ocean", name: "Ocean" },
  { id: "sunset", name: "Sunset" },
  { id: "sakura", name: "Sakura" },
  { id: "emerald", name: "Emerald" },
  { id: "light", name: "Light" },
  { id: "cyberpunk", name: "Cyberpunk" },
];

const STORAGE_KEY = "miniverse-theme";

function getSavedTheme() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);

    return THEMES.some((theme) => theme.id === saved)
      ? saved
      : "midnight";
  } catch {
    return "midnight";
  }
}

export function ThemeProvider({ children }) {
  const [theme, setThemeState] = useState(getSavedTheme);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;

    try {
      localStorage.setItem(STORAGE_KEY, theme);
    } catch {
      // Continue without local persistence.
    }
  }, [theme]);

  const setTheme = useCallback((themeId) => {
    const isValid = THEMES.some(
      (item) => item.id === themeId
    );

    if (!isValid) {
      console.warn(`Invalid MiniVerse theme: ${themeId}`);
      return;
    }

    setThemeState(themeId);
  }, []);

  const toggleLightDark = useCallback(() => {
    setThemeState((current) =>
      current === "light" ? "midnight" : "light"
    );
  }, []);

  const value = useMemo(() => ({
    theme,
    setTheme,
    toggleLightDark,
    themes: THEMES,
    isLight: theme === "light",
  }), [theme, setTheme, toggleLightDark]);

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useThemeContext() {
  const context = useContext(ThemeContext);

  if (!context) {
    throw new Error(
      "useThemeContext must be used inside ThemeProvider."
    );
  }

  return context;
}

export default ThemeContext;
