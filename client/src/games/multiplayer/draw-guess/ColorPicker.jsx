
import React from "react";

export const DRAW_COLORS = [
  "#000000",
  "#FFFFFF",
  "#EF4444",
  "#F97316",
  "#FACC15",
  "#22C55E",
  "#14B8A6",
  "#3B82F6",
  "#6366F1",
  "#A855F7",
  "#EC4899",
  "#92400E",
];

const ColorPicker = ({
  selectedColor = "#000000",
  onChange,
  disabled = false,
}) => {
  return (
    <div className="dg-color-picker">
      <span className="dg-toolbar-label">Colors</span>

      <div className="dg-color-list">
        {DRAW_COLORS.map((color) => (
          <button
            key={color}
            type="button"
            className={[
              "dg-color-button",
              selectedColor === color ? "dg-color-selected" : "",
              color === "#FFFFFF" ? "dg-color-white" : "",
            ].join(" ")}
            style={{ "--brush-color": color }}
            onClick={() => onChange?.(color)}
            disabled={disabled}
            aria-label={`Select ${color}`}
            title={color}
          />
        ))}
      </div>
    </div>
  );
};

export default ColorPicker;
