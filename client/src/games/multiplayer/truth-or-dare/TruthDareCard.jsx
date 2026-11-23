
import React from "react";

const TruthDareCard = ({
  prompt,
  playerName = "Player",
  onComplete,
  onSkip,
  disabled = false,
}) => {
  if (!prompt) return null;

  const isTruth = prompt.type === "truth";

  return (
    <section className="td-prompt-card">
      <div
        className={[
          "td-prompt-type",
          isTruth ? "td-prompt-type-truth" : "td-prompt-type-dare",
        ].join(" ")}
      >
        <span>{isTruth ? "🤔" : "🔥"}</span>
        <strong>{isTruth ? "TRUTH" : "DARE"}</strong>
      </div>

      <div className="td-prompt-player">
        For <strong>{playerName}</strong>
      </div>

      <div className="td-prompt-content">
        <p>{prompt.content}</p>
      </div>

      {prompt.difficulty && (
        <span className="td-prompt-difficulty">
          {prompt.difficulty}
        </span>
      )}

      <div className="td-prompt-actions">
        <button
          type="button"
          className="td-skip-button"
          onClick={onSkip}
          disabled={disabled}
        >
          Skip Prompt
        </button>

        <button
          type="button"
          className="td-complete-button"
          onClick={onComplete}
          disabled={disabled}
        >
          ✓ Complete Turn
        </button>
      </div>

      <p className="td-prompt-note">
        Everyone can skip a prompt without pressure. Keep the game fun and respectful.
      </p>
    </section>
  );
};

export default TruthDareCard;
