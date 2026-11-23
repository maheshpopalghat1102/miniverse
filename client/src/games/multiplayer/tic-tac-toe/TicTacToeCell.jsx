
import React from "react";

function TicTacToeCell({
  value,
  index,
  onClick,
  disabled,
  isWinningCell,
}) {
  return (
    <button
      type="button"
      className={[
        "ttt-cell",
        value === "X" ? "ttt-cell-x" : "",
        value === "O" ? "ttt-cell-o" : "",
        isWinningCell ? "ttt-cell-winning" : "",
      ]
        .filter(Boolean)
        .join(" ")}
      onClick={() => onClick(index)}
      disabled={disabled || Boolean(value)}
      aria-label={
        value
          ? `Cell ${index + 1}: ${value}`
          : `Empty cell ${index + 1}`
      }
    >
      {value || ""}
    </button>
  );
}

export default TicTacToeCell;
