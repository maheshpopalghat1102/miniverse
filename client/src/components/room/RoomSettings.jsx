
import React from "react";
import Select from "../common/Select";
import Checkbox from "../common/Checkbox";
import Button from "../common/Button";

function RoomSettings({
  settings = {},
  onChange,
  onSave,
  saving = false,
  isHost = false,
  disabled = false,
  maxPlayersOptions = [2, 3, 4, 5, 6, 8, 10],
}) {
  const isDisabled = disabled || !isHost;

  function updateField(key, value) {
    onChange?.({
      ...settings,
      [key]: value,
    });
  }

  return (
    <section className="space-y-5 rounded-2xl border border-white/10 bg-slate-900 p-5">
      <div>
        <h3 className="font-bold text-white">
          ⚙️ Room Settings
        </h3>

        <p className="mt-1 text-xs text-slate-400">
          Configure room preferences.
        </p>
      </div>

      <Select
        label="Maximum Players"
        name="maxPlayers"
        value={String(settings.maxPlayers ?? 4)}
        disabled={isDisabled}
        onChange={(event) =>
          updateField("maxPlayers", Number(event.target.value))
        }
        options={maxPlayersOptions.map((count) => ({
          label: `${count} players`,
          value: String(count),
        }))}
      />

      <Checkbox
        label="Private room"
        checked={Boolean(settings.isPrivate)}
        disabled={isDisabled}
        onChange={(value) => updateField("isPrivate", value)}
      />

      <Checkbox
        label="Allow spectators"
        checked={Boolean(settings.allowSpectators)}
        disabled={isDisabled}
        onChange={(value) => updateField("allowSpectators", value)}
      />

      <Checkbox
        label="Allow players to join after game starts"
        checked={Boolean(settings.allowLateJoin)}
        disabled={isDisabled}
        onChange={(value) => updateField("allowLateJoin", value)}
      />

      {!isHost && (
        <p className="text-xs text-slate-500">
          Only the room host can change these settings.
        </p>
      )}

      {isHost && onSave && (
        <div className="border-t border-white/10 pt-4">
          <Button
            onClick={onSave}
            loading={saving}
            disabled={disabled}
            fullWidth
          >
            Save Room Settings
          </Button>
        </div>
      )}
    </section>
  );
}

export default RoomSettings;
