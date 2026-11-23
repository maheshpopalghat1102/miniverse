
import React from "react";
import Button from "../common/Button";
import GameExitButton from "../game/GameExitButton";

function RoomControls({
  isHost = false,
  isReady = false,
  canStart = false,
  gameStatus = "waiting",
  onReady,
  onStart,
  onLeave,
  onCloseRoom,
  starting = false,
  leaving = false,
  disabled = false,
}) {
  const isWaiting = gameStatus === "waiting";
  const isPlaying = gameStatus === "playing";

  return (
    <section className="space-y-3 rounded-2xl border border-white/10 bg-slate-900 p-4">
      <h3 className="font-bold text-white">
        Room Controls
      </h3>

      {isWaiting && (
        <>
          {isHost ? (
            <Button
              fullWidth
              onClick={onStart}
              loading={starting}
              disabled={!canStart || disabled || !onStart}
            >
              🚀 Start Game
            </Button>
          ) : (
            <Button
              fullWidth
              variant={isReady ? "success" : "primary"}
              onClick={onReady}
              disabled={disabled || !onReady}
            >
              {isReady ? "✓ Ready" : "I'm Ready"}
            </Button>
          )}
        </>
      )}

      {isPlaying && (
        <div className="rounded-lg bg-emerald-500/10 p-3 text-center text-sm text-emerald-300">
          🎮 Game in progress
        </div>
      )}

      {isHost && onCloseRoom && (
        <Button
          variant="danger"
          fullWidth
          disabled={disabled || leaving}
          onClick={onCloseRoom}
        >
          Close Room
        </Button>
      )}

      {onLeave && (
        <GameExitButton
          onExit={onLeave}
          loading={leaving}
          disabled={disabled}
          buttonText="Leave Room"
          exitType="room"
          className="w-full"
        />
      )}
    </section>
  );
}

export default RoomControls;
