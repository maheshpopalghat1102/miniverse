
import React from "react";

const PromptPicker = ({
  onChoose,
  disabled = false,
  currentPlayerName = "Player",
}) => {
  return (
    <section className="td-prompt-picker">
      <div className="td-picker-heading">
        <span>🎯</span>
        <h2>{currentPlayerName}, make your choice!</h2>
        <p>Would you rather answer a question or complete a challenge?</p>
      </div>

      <div className="td-choice-grid">
        <button
          type="button"
          className="td-choice-card td-truth-choice"
          onClick={() => onChoose?.("truth")}
          disabled={disabled}
        >
          <span className="td-choice-icon">🤔</span>
          <strong>TRUTH</strong>
          <small>Answer honestly</small>
        </button>

        <button
          type="button"
          className="td-choice-card td-dare-choice"
          onClick={() => onChoose?.("dare")}
          disabled={disabled}
        >
          <span className="td-choice-icon">🔥</span>
          <strong>DARE</strong>
          <small>Accept the challenge</small>
        </button>
      </div>
    </section>
  );
};

export default PromptPicker;
