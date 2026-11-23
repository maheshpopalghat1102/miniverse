
import React from "react";

function QuizOptions({
  options = [],
  selectedIndex = null,
  onSelect,
  disabled = false,
  correctIndex = null,
  showCorrectAnswer = false,
}) {
  const letters = ["A", "B", "C", "D"];

  return (
    <div className="qb-options">
      {options.map((option, index) => {
        const selected = selectedIndex === index;
        const correct =
          showCorrectAnswer && correctIndex === index;
        const incorrect =
          showCorrectAnswer &&
          selected &&
          correctIndex !== index;

        return (
          <button
            key={index}
            type="button"
            className={[
              "qb-option",
              selected ? "qb-option-selected" : "",
              correct ? "qb-option-correct" : "",
              incorrect ? "qb-option-incorrect" : "",
            ].filter(Boolean).join(" ")}
            onClick={() => onSelect(index)}
            disabled={disabled || showCorrectAnswer}
            aria-pressed={selected}
          >
            <span className="qb-option-letter">
              {letters[index]}
            </span>

            <span className="qb-option-text">
              {option}
            </span>

            {correct && <span>✓</span>}
            {incorrect && <span>✕</span>}
          </button>
        );
      })}
    </div>
  );
}

export default QuizOptions;
