
export const DEFAULT_THEME = "midnight";

export const THEMES = [
  {
    id: "midnight",
    name: "Midnight",
    description: "Deep navy gaming interface",
    type: "dark",
    preview: ["#0B1020", "#151D35", "#8B5CF6"],
  },
  {
    id: "amoled",
    name: "AMOLED",
    description: "Pure black with vibrant accents",
    type: "dark",
    preview: ["#000000", "#111111", "#A855F7"],
  },
  {
    id: "ocean",
    name: "Ocean",
    description: "Cool blue and teal interface",
    type: "dark",
    preview: ["#071B2B", "#103B52", "#22D3EE"],
  },
  {
    id: "sunset",
    name: "Sunset",
    description: "Warm orange and purple colors",
    type: "dark",
    preview: ["#241329", "#54243D", "#FB923C"],
  },
  {
    id: "sakura",
    name: "Sakura",
    description: "Soft pink and rose interface",
    type: "light",
    preview: ["#FFF1F5", "#FBCFE8", "#DB2777"],
  },
  {
    id: "emerald",
    name: "Emerald",
    description: "Fresh green gaming interface",
    type: "dark",
    preview: ["#071C17", "#123D30", "#34D399"],
  },
  {
    id: "light",
    name: "Light",
    description: "Clean bright interface",
    type: "light",
    preview: ["#FFFFFF", "#F1F5F9", "#6366F1"],
  },
  {
    id: "cyberpunk",
    name: "Cyberpunk",
    description: "Neon futuristic gaming interface",
    type: "dark",
    preview: ["#10091F", "#24113B", "#F0ABFC"],
  },
];

export const THEME_IDS = THEMES.map((theme) => theme.id);

export function isValidTheme(themeId) {
  return THEME_IDS.includes(themeId);
}

export function getTheme(themeId) {
  return THEMES.find((theme) => theme.id === themeId) || THEMES[0];
}

export function getThemeName(themeId) {
  return getTheme(themeId).name;
}

export function isDarkTheme(themeId) {
  return getTheme(themeId).type === "dark";
}
