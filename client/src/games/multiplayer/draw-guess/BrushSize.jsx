
import React from "react";

export const BRUSH_SIZES = [
  { label: "Small", value: 3 },
  { label: "Medium", value: 7 },
  { label: "Large", value: 13 },
  { label: "XL", value: 21 },
];

const BrushSize = ({
  selectedSize = 7,
  onChange,
  disabled = false,
}) => {
  return (
    <div className="dg-brush-size">
      <span className="dg-toolbar-label">Brush Size</span>

      <div className="dg-brush-list">
        {BRUSH_SIZES.map((brush) => (
          <button
            key={brush.value}
            type="button"
            className={[
              "dg-brush-button",
              selectedSize === brush.value ? "dg-brush-selected" : "",
            ].join(" ")}
            onClick={() => onChange?.(brush.value)}
            disabled={disabled}
            title={brush.label}
          >
            <span
              className="dg-brush-dot"
              style={{
                width: Math.min(brush.value + 4, 25),
                height: Math.min(brush.value + 4, 25),
              }}
            />

            <small>{brush.label}</small>
          </button>
        ))}
      </div>
    </div>
  );
};

export default BrushSize;
