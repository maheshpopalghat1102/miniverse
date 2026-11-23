
import React from "react";

function NumberAnswer({
  options = [],
  selectedAnswer,
  onSelect,
  disabled = false,
  submitted = false,
  answerResult = null,
}) {
  return (
    <div className="nb-answer-section">
      <h3 className="nb-answer-heading">Choose your answer</h3>

      <div className="nb-options-grid">
        {options.map((option, index) => {
          const isSelected =
            String(selectedAnswer) === String(option);

          let resultClass = "";

          if (submitted && answerResult) {
            if (
              String(option) ===
              String(answerResult.correctAnswer)
            ) {
              resultClass = "nb-option-correct";
            } else if (isSelected && !answerResult.isCorrect) {
              resultClass = "nb-option-wrong";
            }
          }

          return (
            <button
              key={`${index}-${option}`}
              type="button"
              className={[
                "nb-option-button",
                isSelected ? "nb-option-selected" : "",
                resultClass,
              ]
                .filter(Boolean)
                .join(" ")}
              onClick={() => onSelect?.(option)}
              disabled={disabled || submitted}
            >
              <span className="nb-option-letter">
                {String.fromCharCode(65 + index)}
              </span>

              <span className="nb-option-value">{option}</span>

              {submitted &&
                answerResult &&
                String(option) ===
                  String(answerResult.correctAnswer) && (
                  <span className="nb-option-indicator">✓</span>
                )}

              {submitted &&
                answerResult &&
                isSelected &&
                !answerResult.isCorrect && (
                  <span className="nb-option-indicator">✕</span>
                )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export default NumberAnswer;
