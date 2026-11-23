
import React from "react";
import Select from "../common/Select";
import Checkbox from "../common/Checkbox";

function GameSettings({
  settings = {},
  onChange,
  maxPlayersOptions = [2, 3, 4, 5, 6, 8, 10],
  showDifficulty = true,
  showPrivacy = true,
  showTimer = true,
  disabled = false,
}) {
  const updateSetting = (key, value) => {
    onChange?.({
      ...settings,
      [key]: value,
    });
  };

  return (
    <section className="space-y-5 rounded-2xl border border-white/10 bg-slate-900 p-5">
      <div>
        <h3 className="font-bold text-white">
          ⚙️ Game Settings
        </h3>

        <p className="mt-1 text-xs text-slate-400">
          Customize your game before starting.
        </p>
      </div>

      <Select
        label="Maximum Players"
        name="maxPlayers"
        value={String(settings.maxPlayers ?? 4)}
        disabled={disabled}
        onChange={(event) =>
          updateSetting("maxPlayers", Number(event.target.value))
        }
        options={maxPlayersOptions.map((count) => ({
          label: `${count} players`,
          value: String(count),
        }))}
      />

      {showDifficulty && (
        <Select
          label="Difficulty"
          name="difficulty"
          value={settings.difficulty ?? "medium"}
          disabled={disabled}
          onChange={(event) =>
            updateSetting("difficulty", event.target.value)
          }
          options={[
            { label: "Easy", value: "easy" },
            { label: "Medium", value: "medium" },
            { label: "Hard", value: "hard" },
          ]}
        />
      )}

      {showTimer && (
        <Select
          label="Turn Duration"
          name="turnDuration"
          value={String(settings.turnDuration ?? 60)}
          disabled={disabled}
          onChange={(event) =>
            updateSetting("turnDuration", Number(event.target.value))
          }
          options={[
            { label: "30 seconds", value: "30" },
            { label: "60 seconds", value: "60" },
            { label: "90 seconds", value: "90" },
            { label: "120 seconds", value: "120" },
            { label: "No timer", value: "0" },
          ]}
        />
      )}

      {showPrivacy && (
        <div className="space-y-4 border-t border-white/10 pt-4">
          <Checkbox
            label="Private room (invite only)"
            checked={Boolean(settings.isPrivate)}
            disabled={disabled}
            onChange={(value) =>
              updateSetting("isPrivate", value)
            }
          />

          <Checkbox
            label="Allow spectators"
            checked={Boolean(settings.allowSpectators)}
            disabled={disabled}
            onChange={(value) =>
              updateSetting("allowSpectators", value)
            }
          />
        </div>
      )}
    </section>
  );
}

export default GameSettings;
