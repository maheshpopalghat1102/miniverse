
import React, { useState } from "react";

function EmojiAnswer({
  options = [],
  onSubmit,
  disabled = false,
  selectedAnswer = null,
  showResult = false,
  correctAnswer = null,
}) {
  const [customAnswer, setCustomAnswer] = useState("");

  const handleSubmit = (event) => {
    event.preventDefault();

    if (!customAnswer.trim() || disabled) return;

    onSubmit(customAnswer.trim());
    setCustomAnswer("");
  };

  return (
    <div className="eg-answer-section">
      {options.length > 0 && (
        <div className="eg-options">
          {options.map((option, index) => {
            const selected = selectedAnswer === option;
            const correct = showResult && option === correctAnswer;
            const incorrect = showResult && selected && !correct;

            return (
              <button
                key={`${option}-${index}`}
                type="button"
                className={[
                  "eg-option",
                  selected ? "eg-option-selected" : "",
                  correct ? "eg-option-correct" : "",
                  incorrect ? "eg-option-incorrect" : "",
                ].filter(Boolean).join(" ")}
                onClick={() => onSubmit(option)}
                disabled={disabled || showResult}
              >
                <span>{String.fromCharCode(65 + index)}</span>
                {option}
                {correct && " ✓"}
                {incorrect && " ✕"}
              </button>
            );
          })}
        </div>
      )}

      <form className="eg-custom-form" onSubmit={handleSubmit}>
        <label htmlFor="eg-custom-answer">
          Or type your answer
        </label>

        <div className="eg-custom-row">
          <input
            id="eg-custom-answer"
            type="text"
            value={customAnswer}
            onChange={(event) => setCustomAnswer(event.target.value)}
            placeholder="Your answer..."
            maxLength={80}
            disabled={disabled || showResult}
          />

          <button
            type="submit"
            disabled={disabled || showResult || !customAnswer.trim()}
          >
            Submit
          </button>
        </div>
      </form>
    </div>
  );
}

export default EmojiAnswer;
