
import React from "react";

const PictureOptions = ({
  options = [],
  selectedAnswer,
  correctAnswer,
  answered = false,
  onSelect,
  disabled = false,
}) => {
  const getOptionClass = (option) => {
    if (!answered) {
      return selectedAnswer === option
        ? "gp-option gp-option-selected"
        : "gp-option";
    }

    if (option === correctAnswer) {
      return "gp-option gp-option-correct";
    }

    if (option === selectedAnswer) {
      return "gp-option gp-option-wrong";
    }

    return "gp-option gp-option-disabled";
  };

  return (
    <section className="gp-options-section">
      <div className="gp-options-heading">
        <h3>Choose your answer</h3>
        <span>{options.length} options</span>
      </div>

      <div className="gp-options-grid">
        {options.map((option, index) => (
          <button
            key={`${index}-${option}`}
            type="button"
            className={getOptionClass(option)}
            onClick={() => onSelect?.(option)}
            disabled={disabled || answered}
          >
            <span className="gp-option-letter">
              {String.fromCharCode(65 + index)}
            </span>

            <span className="gp-option-text">{option}</span>

            {answered && option === correctAnswer && (
              <span className="gp-option-result">✓</span>
            )}

            {answered && option === selectedAnswer &&
              option !== correctAnswer && (
                <span className="gp-option-result">✕</span>
              )}
          </button>
        ))}
      </div>
    </section>
  );
};

export default PictureOptions;
