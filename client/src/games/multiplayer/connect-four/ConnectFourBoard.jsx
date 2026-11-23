
import React from "react";
import ConnectFourCell from "./ConnectFourCell";
import { COLUMNS } from "./connectFourLogic";

function ConnectFourBoard({
  board,
  onColumnClick,
  disabled = false,
  winningCells = [],
}) {
  const isWinningCell = (row, column) =>
    winningCells.some(
      ([winningRow, winningColumn]) =>
        winningRow === row && winningColumn === column
    );

  return (
    <div className="c4-board-wrapper">
      <div className="c4-column-controls">
        {Array.from({ length: COLUMNS }, (_, column) => (
          <button
            key={column}
            type="button"
            className="c4-column-button"
            onClick={() => onColumnClick(column)}
            disabled={disabled || board[0][column] !== null}
            aria-label={`Drop disc in column ${column + 1}`}
          >
            ↓
          </button>
        ))}
      </div>

      <div
        className="c4-board"
        role="group"
        aria-label="Connect Four board"
      >
        {board.map((row, rowIndex) =>
          row.map((value, columnIndex) => (
            <ConnectFourCell
              key={`${rowIndex}-${columnIndex}`}
              value={value}
              row={rowIndex}
              column={columnIndex}
              isWinningCell={isWinningCell(
                rowIndex,
                columnIndex
              )}
              onClick={onColumnClick}
              disabled={disabled}
            />
          ))
        )}
      </div>
    </div>
  );
}

export default ConnectFourBoard;
