
import React from "react";
import TicTacToeCell from "./TicTacToeCell";

function TicTacToeBoard({
  board,
  onCellClick,
  disabled,
  winningCombination = [],
}) {
  return (
    <div
      className="ttt-board"
      role="group"
      aria-label="Tic Tac Toe game board"
    >
      {board.map((value, index) => (
        <TicTacToeCell
          key={index}
          value={value}
          index={index}
          onClick={onCellClick}
          disabled={disabled}
          isWinningCell={winningCombination.includes(index)}
        />
      ))}
    </div>
  );
}

export default TicTacToeBoard;
