
import React from "react";

function SnakeControls({
  onDirection,
  onStart,
  onPause,
  onResume,
  status,
}) {
  const isPlaying = status === "playing";
  const isPaused = status === "paused";

  return (
    <div className="snake-controls">
      <div className="snake-dpad">
        <button
          type="button"
          className="snake-direction up"
          onClick={() => onDirection("UP")}
          aria-label="Move up"
          disabled={!isPlaying}
        >
          ↑
        </button>

        <button
          type="button"
          className="snake-direction left"
          onClick={() => onDirection("LEFT")}
          aria-label="Move left"
          disabled={!isPlaying}
        >
          ←
        </button>

        <button
          type="button"
          className="snake-direction down"
          onClick={() => onDirection("DOWN")}
          aria-label="Move down"
          disabled={!isPlaying}
        >
          ↓
        </button>

        <button
          type="button"
          className="snake-direction right"
          onClick={() => onDirection("RIGHT")}
          aria-label="Move right"
          disabled={!isPlaying}
        >
          →
        </button>
      </div>

      <div className="snake-action-controls">
        {status === "ready" && (
          <button
            type="button"
            className="snake-action-button start"
            onClick={onStart}
          >
            Start Game
          </button>
        )}

        {isPlaying && (
          <button
            type="button"
            className="snake-action-button pause"
            onClick={onPause}
          >
            Pause
          </button>
        )}

        {isPaused && (
          <button
            type="button"
            className="snake-action-button start"
            onClick={onResume}
          >
            Resume
          </button>
        )}
      </div>

      <p className="snake-control-hint">
        Keyboard: Arrow keys or W, A, S, D
      </p>
    </div>
  );
}

export default SnakeControls;
