
import React from "react";

const themes = [
  {
    id: "midnight",
    name: "Midnight",
    description: "Deep blue and violet",
    colors: ["#0B1020", "#6D5DFB"],
  },
  {
    id: "amoled",
    name: "AMOLED",
    description: "Pure black interface",
    colors: ["#000000", "#8B5CF6"],
  },
  {
    id: "ocean",
    name: "Ocean",
    description: "Cool blue tones",
    colors: ["#082F49", "#0EA5E9"],
  },
  {
    id: "sunset",
    name: "Sunset",
    description: "Warm orange and pink",
    colors: ["#431407", "#F97316"],
  },
  {
    id: "sakura",
    name: "Sakura",
    description: "Soft pink and rose",
    colors: ["#4A1937", "#F472B6"],
  },
  {
    id: "emerald",
    name: "Emerald",
    description: "Green and dark tones",
    colors: ["#022C22", "#10B981"],
  },
  {
    id: "light",
    name: "Light",
    description: "Bright and clean",
    colors: ["#F3F4F6", "#6366F1"],
  },
  {
    id: "cyberpunk",
    name: "Cyberpunk",
    description: "Neon and futuristic",
    colors: ["#18102E", "#E879F9"],
  },
];

export default function ThemeSelector({
  value = "midnight",
  onChange,
  className = "",
}) {
  return (
    <div className={`grid grid-cols-1 gap-3 sm:grid-cols-2 ${className}`}>
      {themes.map((theme) => {
        const selected = value === theme.id;

        return (
          <button
            key={theme.id}
            type="button"
            onClick={() => onChange?.(theme.id)}
            aria-pressed={selected}
            className={`flex items-center gap-3 rounded-xl border p-3 text-left transition ${
              selected
                ? "border-violet-500 bg-violet-500/10 ring-1 ring-violet-500/30"
                : "border-white/10 bg-gray-900/60 hover:border-white/30"
            }`}
          >
            <span
              className="flex h-12 w-12 shrink-0 overflow-hidden rounded-lg"
              aria-hidden="true"
            >
              <span
                className="h-full w-1/2"
                style={{ backgroundColor: theme.colors[0] }}
              />
              <span
                className="h-full w-1/2"
                style={{ backgroundColor: theme.colors[1] }}
              />
            </span>

            <span className="min-w-0 flex-1">
              <span className="block font-semibold text-white">
                {theme.name}
              </span>
              <span className="mt-1 block text-xs text-gray-400">
                {theme.description}
              </span>
            </span>

            {selected && (
              <span className="text-lg text-violet-300" aria-label="Selected">
                ✓
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
