
import React from "react";

function ConnectFourCell({
  value,
  row,
  column,
  isWinningCell = false,
  onClick,
  disabled = false,
}) {
  return (
    <button
      type="button"
      className={[
        "c4-cell",
        value ? `c4-cell-${value}` : "c4-cell-empty",
        isWinningCell ? "c4-cell-winning" : "",
      ].filter(Boolean).join(" ")}
      onClick={() => onClick(column)}
      disabled={disabled}
      aria-label={
        `Row ${row + 1}, column ${column + 1}, ` +
        `${value || "empty"}`
      }
    >
      <span className="c4-disc" />
    </button>
  );
}

export default ConnectFourCell;
