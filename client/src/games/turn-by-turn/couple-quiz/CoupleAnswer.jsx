
import React from "react";

function CoupleAnswer({
  options = [],
  selectedAnswer,
  onSelect,
  disabled = false,
  submitted = false,
  result = null,
}) {
  return (
    <div className="cq-answer-section">
      <h3>Choose your answer</h3>

      <div className="cq-options">
        {options.map((option, index) => {
          const isSelected = selectedAnswer === index;

          let resultClass = "";

          if (submitted && result) {
            if (index === result.correctAnswer) {
              resultClass = "cq-answer-correct";
            } else if (isSelected && !result.isCorrect) {
              resultClass = "cq-answer-wrong";
            }
          }

          return (
            <button
              key={index}
              type="button"
              className={[
                "cq-option",
                isSelected ? "cq-option-selected" : "",
                resultClass,
              ]
                .filter(Boolean)
                .join(" ")}
              disabled={disabled || submitted}
              onClick={() => onSelect?.(index)}
            >
              <span className="cq-option-letter">
                {String.fromCharCode(65 + index)}
              </span>

              <span>{option}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

export default CoupleAnswer;
