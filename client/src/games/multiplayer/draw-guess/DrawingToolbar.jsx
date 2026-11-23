
import React from "react";
import ColorPicker from "./ColorPicker";
import BrushSize from "./BrushSize";

const DrawingToolbar = ({
  color,
  onColorChange,
  brushSize,
  onBrushSizeChange,
  isEraser,
  onEraserToggle,
  onUndo,
  onRedo,
  onClear,
  canUndo = false,
  canRedo = false,
  disabled = false,
}) => {
  return (
    <section className="dg-toolbar">
      <div className="dg-toolbar-top">
        <ColorPicker
          selectedColor={color}
          onChange={onColorChange}
          disabled={disabled || isEraser}
        />

        <BrushSize
          selectedSize={brushSize}
          onChange={onBrushSizeChange}
          disabled={disabled}
        />
      </div>

      <div className="dg-toolbar-actions">
        <button
          type="button"
          className={isEraser ? "dg-tool-active" : "dg-tool-button"}
          onClick={onEraserToggle}
          disabled={disabled}
        >
          🧽 Eraser
        </button>

        <button
          type="button"
          className="dg-tool-button"
          onClick={onUndo}
          disabled={disabled || !canUndo}
        >
          ↶ Undo
        </button>

        <button
          type="button"
          className="dg-tool-button"
          onClick={onRedo}
          disabled={disabled || !canRedo}
        >
          ↷ Redo
        </button>

        <button
          type="button"
          className="dg-tool-danger"
          onClick={onClear}
          disabled={disabled}
        >
          🗑 Clear
        </button>
      </div>
    </section>
  );
};

export default DrawingToolbar;
