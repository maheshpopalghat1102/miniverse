
import React, { useState } from "react";

import Modal from "../common/Modal";
import Button from "../common/Button";
import Input from "../common/Input";
import Select from "../common/Select";
import Checkbox from "../common/Checkbox";
import ErrorMessage from "../common/ErrorMessage";

const defaultGames = [
  { label: "Tic Tac Toe", value: "tic-tac-toe" },
  { label: "Rock Paper Scissors", value: "rock-paper-scissors" },
  { label: "Connect Four", value: "connect-four" },
  { label: "Guess the Number", value: "guess-the-number" },
  { label: "Word Battle", value: "word-battle" },
  { label: "Quiz Battle", value: "quiz-battle" },
  { label: "Emoji Guess", value: "emoji-guess" },
  { label: "Truth or Dare", value: "truth-or-dare" },
  { label: "Guess the Picture", value: "guess-the-picture" },
  { label: "Draw & Guess", value: "draw-guess" },
  { label: "Who Am I?", value: "who-am-i" },
  { label: "Number Battle", value: "number-battle" },
];

function CreateRoomModal({
  isOpen,
  onClose,
  onCreate,
  games = defaultGames,
  loading = false,
}) {
  const [form, setForm] = useState({
    gameId: "",
    roomType: "public",
    maxPlayers: 4,
    password: "",
    allowSpectators: false,
  });

  const [error, setError] = useState("");

  function updateField(key, value) {
    setForm((previous) => ({
      ...previous,
      [key]: value,
    }));

    setError("");
  }

  async function handleSubmit(event) {
    event.preventDefault();

    if (!form.gameId) {
      setError("Please select a game.");
      return;
    }

    if (
      form.roomType === "private" &&
      form.password.trim().length < 4
    ) {
      setError("Private room password must contain at least 4 characters.");
      return;
    }

    try {
      await onCreate?.({
        gameId: form.gameId,
        type: form.roomType,
        maxPlayers: Number(form.maxPlayers),
        password:
          form.roomType === "private"
            ? form.password
            : undefined,
        settings: {
          allowSpectators: form.allowSpectators,
        },
      });
    } catch (requestError) {
      setError(requestError.message || "Unable to create room.");
    }
  }

  function handleClose() {
    if (loading) return;

    setError("");
    onClose?.();
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Create Game Room"
      size="lg"
      closeOnBackdrop={!loading}
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        <Select
          label="Select Game"
          name="gameId"
          value={form.gameId}
          onChange={(event) => updateField("gameId", event.target.value)}
          options={games}
          placeholder="Choose a game"
          required
        />

        <Select
          label="Room Visibility"
          name="roomType"
          value={form.roomType}
          onChange={(event) => updateField("roomType", event.target.value)}
          options={[
            { label: "Public - Anyone can join", value: "public" },
            { label: "Private - Invitation/password required", value: "private" },
          ]}
        />

        <Select
          label="Maximum Players"
          name="maxPlayers"
          value={String(form.maxPlayers)}
          onChange={(event) => updateField("maxPlayers", Number(event.target.value))}
          options={[2, 3, 4, 5, 6, 8, 10].map((number) => ({
            label: `${number} players`,
            value: String(number),
          }))}
        />

        {form.roomType === "private" && (
          <Input
            label="Room Password"
            name="password"
            type="password"
            value={form.password}
            onChange={(event) => updateField("password", event.target.value)}
            placeholder="Create a room password"
            required
            minLength={4}
            maxLength={64}
          />
        )}

        <Checkbox
          label="Allow spectators to watch the game"
          checked={form.allowSpectators}
          onChange={(value) => updateField("allowSpectators", value)}
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
            Create Room
          </Button>
        </div>
      </form>
    </Modal>
  );
}

export default CreateRoomModal;
