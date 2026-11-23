
import React from "react";

function Game2048Tile({ value = 0 }) {
  const tileClass = value
    ? `g2048-tile g2048-tile-${Math.min(value, 2048)}`
    : "g2048-tile g2048-tile-empty";

  return (
    <div
      className={tileClass}
      aria-label={value ? `Tile ${value}` : "Empty tile"}
    >
      {value !== 0 ? value : ""}
    </div>
  );
}

export default Game2048Tile;
