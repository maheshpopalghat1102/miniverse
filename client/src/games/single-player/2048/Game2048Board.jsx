
import React from "react";
import Game2048Tile from "./Game2048Tile";

function Game2048Board({ board }) {
  return (
    <div
      className="g2048-board"
      role="grid"
      aria-label="2048 game board"
    >
      {board.map((row, rowIndex) =>
        row.map((value, colIndex) => (
          <div
            className="g2048-cell"
            role="gridcell"
            key={`${rowIndex}-${colIndex}`}
          >
            <Game2048Tile value={value} />
          </div>
        ))
      )}
    </div>
  );
}

export default Game2048Board;
