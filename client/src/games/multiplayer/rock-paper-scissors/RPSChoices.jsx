
import React from "react";
import {
  RPS_CHOICES,
  RPS_LABELS,
  RPS_ICONS,
} from "./rpsLogic";

function RPSChoices({
  onSelect,
  disabled = false,
  selectedChoice = null,
  title = "Choose your move",
}) {
  return (
    <div className="rps-choices-container">
      <h3 className="rps-choices-title">{title}</h3>

      <div className="rps-choices">
        {RPS_CHOICES.map((choice) => {
          const selected = selectedChoice === choice;

          return (
            <button
              key={choice}
              type="button"
              className={`rps-choice ${
                selected ? "rps-choice-selected" : ""
              }`}
              onClick={() => onSelect(choice)}
              disabled={disabled}
              aria-label={`Choose ${RPS_LABELS[choice]}`}
              aria-pressed={selected}
            >
              <span className="rps-choice-icon">
                {RPS_ICONS[choice]}
              </span>

              <span className="rps-choice-label">
                {RPS_LABELS[choice]}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

export default RPSChoices;
