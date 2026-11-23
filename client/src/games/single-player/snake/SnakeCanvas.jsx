
import React from "react";

function SnakeCanvas({
  snake = [],
  food = null,
  status = "ready",
  gridSize = 20,
}) {
  const cells = [];

  for (let y = 0; y < gridSize; y += 1) {
    for (let x = 0; x < gridSize; x += 1) {
      const isHead =
        snake[0]?.x === x && snake[0]?.y === y;

      const isBody = snake.some(
        (segment, index) =>
          index > 0 && segment.x === x && segment.y === y
      );

      const isFood = food?.x === x && food?.y === y;

      let className = "snake-cell";

      if (isHead) className += " snake-head";
      else if (isBody) className += " snake-body";
      else if (isFood) className += " snake-food";

      cells.push(
        <div
          key={`${x}-${y}`}
          className={className}
          style={{
            gridColumn: x + 1,
            gridRow: y + 1,
          }}
        >
          {isHead && <span className="snake-eyes">••</span>}
          {isFood && <span className="snake-food-icon">●</span>}
        </div>
      );
    }
  }

  return (
    <div className="snake-board-wrapper">
      <div
        className="snake-board"
        style={{
          gridTemplateColumns: `repeat(${gridSize}, 1fr)`,
          gridTemplateRows: `repeat(${gridSize}, 1fr)`,
        }}
        role="img"
        aria-label="Snake game board"
      >
        {cells}
      </div>

      {status !== "playing" && (
        <div className="snake-board-overlay">
          {status === "ready" && (
            <>
              <strong>Ready to play?</strong>
              <span>Press Start to begin</span>
            </>
          )}

          {status === "paused" && (
            <>
              <strong>Game Paused</strong>
              <span>Resume when you're ready</span>
            </>
          )}

          {status === "game-over" && (
            <>
              <strong>Game Over!</strong>
              <span>Try again and beat your score</span>
            </>
          )}

          {status === "won" && (
            <>
              <strong>You Won!</strong>
              <span>You filled the entire board!</span>
            </>
          )}
        </div>
      )}
    </div>
  );
}

export default SnakeCanvas;
