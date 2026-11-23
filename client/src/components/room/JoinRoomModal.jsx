
import React, { useState } from "react";

import Modal from "../common/Modal";
import Button from "../common/Button";
import Input from "../common/Input";
import ErrorMessage from "../common/ErrorMessage";

function JoinRoomModal({
  isOpen,
  onClose,
  onJoin,
  loading = false,
}) {
  const [roomCode, setRoomCode] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  async function handleSubmit(event) {
    event.preventDefault();

    const normalizedCode = roomCode.trim().toUpperCase();

    if (!normalizedCode) {
      setError("Please enter a room code.");
      return;
    }

    if (!/^[A-Z0-9]{4,12}$/.test(normalizedCode)) {
      setError("Enter a valid room code.");
      return;
    }

    try {
      await onJoin?.({
        roomCode: normalizedCode,
        password: password || undefined,
      });
    } catch (requestError) {
      setError(requestError.message || "Unable to join room.");
    }
  }

  function handleClose() {
    if (loading) return;

    setRoomCode("");
    setPassword("");
    setError("");
    onClose?.();
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Join Game Room"
      size="md"
      closeOnBackdrop={!loading}
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="text-center">
          <div className="mx-auto mb-3 flex h-16 w-16 items-center justify-center rounded-2xl bg-violet-500/15 text-3xl">
            🚪
          </div>

          <p className="text-sm text-slate-400">
            Enter the room code shared by your friend.
          </p>
        </div>

        <Input
          label="Room Code"
          name="roomCode"
          value={roomCode}
          onChange={(event) =>
            setRoomCode(
              event.target.value
                .toUpperCase()
                .replace(/[^A-Z0-9]/g, "")
            )
          }
          placeholder="Example: MV1234"
          maxLength={12}
          required
        />

        <Input
          label="Room Password (if required)"
          name="password"
          type="password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          placeholder="Enter room password"
          maxLength={64}
        />

        {error && (
          <ErrorMessage message={error} />
        )}

        <div className="flex justify-end gap-3 border-t border-white/10 pt-4">
          <Button
            variant="ghost"
            onClick={handleClose}
            disabled={loading}
          >
            Cancel
          </Button>

          <Button
            type="submit"
            loading={loading}
          >
            Join Room
          </Button>
        </div>
      </form>
    </Modal>
  );
}

export default JoinRoomModal;
