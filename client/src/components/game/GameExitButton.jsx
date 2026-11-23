
import React, { useState } from "react";
import Button from "../common/Button";
import ConfirmDialog from "../common/ConfirmDialog";

function GameExitButton({
  onExit,
  loading = false,
  disabled = false,
  exitType = "room",
  buttonText = "Leave Game",
  className = "",
}) {
  const [isOpen, setIsOpen] = useState(false);

  const isRoom = exitType === "room";

  function handleConfirm() {
    onExit?.();
  }

  return (
    <>
      <Button
        variant="danger"
        size="md"
        disabled={disabled || loading}
        onClick={() => setIsOpen(true)}
        className={className}
      >
        🚪 {buttonText}
      </Button>

      <ConfirmDialog
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        onConfirm={handleConfirm}
        loading={loading}
        title={isRoom ? "Leave Room?" : "Exit Game?"}
        message={
          isRoom
            ? "Are you sure you want to leave this room? You may need a new invitation to rejoin."
            : "Are you sure you want to exit this game? Your current progress may be lost."
        }
        confirmText={isRoom ? "Leave Room" : "Exit Game"}
        cancelText="Stay"
        variant="danger"
      />
    </>
  );
}

export default GameExitButton;
