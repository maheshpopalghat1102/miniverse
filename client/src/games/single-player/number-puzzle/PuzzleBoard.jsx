
import React from "react";
import PuzzleTile from "./PuzzleTile";

function PuzzleBoard({
  board = [],
  size = 4,
  onTileClick,
  disabled = false,
}) {
  return (
    <div
      className="puzzle-board"
      style={{
        "--puzzle-columns": size,
      }}
      role="group"
      aria-label={`${size} by ${size} number puzzle`}
    >
      {board.map((value, index) => (
        <PuzzleTile
          key={index}
          value={value}
          index={index}
          size={size}
          onClick={onTileClick}
          disabled={disabled}
        />
      ))}
    </div>
  );
}

export default PuzzleBoard;
