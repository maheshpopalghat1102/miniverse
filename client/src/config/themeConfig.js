
export const DEFAULT_THEME = "midnight";

export const THEME_CONFIG = [
  {
    id: "midnight",
    name: "Midnight",
    type: "dark",
    description: "Deep navy gaming theme",
    cssFile: "midnight.css",
  },
  {
    id: "amoled",
    name: "AMOLED",
    type: "dark",
    description: "Pure black gaming theme",
    cssFile: "amoled.css",
  },
  {
    id: "ocean",
    name: "Ocean",
    type: "dark",
    description: "Blue and teal gaming theme",
    cssFile: "ocean.css",
  },
  {
    id: "sunset",
    name: "Sunset",
    type: "dark",
    description: "Warm sunset gaming theme",
    cssFile: "sunset.css",
  },
  {
    id: "sakura",
    name: "Sakura",
    type: "light",
    description: "Soft pink gaming theme",
    cssFile: "sakura.css",
  },
  {
    id: "emerald",
    name: "Emerald",
    type: "dark",
    description: "Green gaming theme",
    cssFile: "emerald.css",
  },
  {
    id: "light",
    name: "Light",
    type: "light",
    description: "Clean light gaming theme",
    cssFile: "light.css",
  },
  {
    id: "cyberpunk",
    name: "Cyberpunk",
    type: "dark",
    description: "Neon futuristic gaming theme",
    cssFile: "cyberpunk.css",
  },
];

export const THEME_IDS = THEME_CONFIG.map(
  (theme) => theme.id
);

export const DARK_THEMES = THEME_CONFIG.filter(
  (theme) => theme.type === "dark"
);

export const LIGHT_THEMES = THEME_CONFIG.filter(
  (theme) => theme.type === "light"
);

export const THEME_STORAGE_KEY = "miniverse-theme";

export const THEME_CSS_VARIABLES = [
  "--bg-primary",
  "--bg-secondary",
  "--bg-tertiary",
  "--bg-card",
  "--bg-card-hover",
  "--bg-elevated",

  "--text-primary",
  "--text-secondary",
  "--text-muted",
  "--text-inverse",

  "--accent-primary",
  "--accent-secondary",
  "--accent-hover",
  "--accent-soft",

  "--border-color",
  "--border-hover",
  "--input-bg",

  "--success",
  "--danger",
  "--warning",
  "--info",

  "--shadow",
  "--radius",
];

export function getThemeConfig(themeId) {
  return (
    THEME_CONFIG.find((theme) => theme.id === themeId) ||
    THEME_CONFIG[0]
  );
}

export function isValidTheme(themeId) {
  return THEME_IDS.includes(themeId);
}

export function getThemeType(themeId) {
  return getThemeConfig(themeId).type;
}

export default THEME_CONFIG;
