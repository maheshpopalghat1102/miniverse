
import React from "react";

function PuzzleTile({
  value,
  index,
  onClick,
  disabled = false,
  size = 4,
}) {
  const isEmpty = value === 0;

  return (
    <button
      type="button"
      className={[
        "puzzle-tile",
        isEmpty ? "puzzle-tile-empty" : "",
      ]
        .filter(Boolean)
        .join(" ")}
      onClick={() => onClick?.(index)}
      disabled={disabled || isEmpty}
      aria-label={
        isEmpty ? "Empty space" : `Move tile ${value}`
      }
      style={{
        "--puzzle-size": size,
      }}
    >
      {!isEmpty && value}
    </button>
  );
}

export default PuzzleTile;
