
import React, { useState } from "react";

const PictureDisplay = ({
  question,
  hintUsed = false,
  onUseHint,
  disabled = false,
}) => {
  const [imageError, setImageError] = useState(false);

  if (!question) return null;

  return (
    <section className="gp-picture-card">
      <div className="gp-picture-meta">
        <span className="gp-category">
          {question.category || "General"}
        </span>

        <span
          className={`gp-difficulty gp-difficulty-${String(
            question.difficulty || "easy"
          ).toLowerCase()}`}
        >
          {question.difficulty || "Easy"}
        </span>
      </div>

      <div className="gp-picture-frame">
        {!imageError ? (
          <img
            src={question.imageUrl}
            alt="Guess the picture"
            className="gp-picture-image"
            onError={() => setImageError(true)}
          />
        ) : (
          <div className="gp-image-error">
            <span>🖼️</span>
            <p>Unable to load this picture.</p>
          </div>
        )}
      </div>

      <div className="gp-question-text">
        <span className="gp-question-label">QUESTION</span>
        <h2>{question.question}</h2>
      </div>

      <div className="gp-hint-area">
        {hintUsed ? (
          <div className="gp-hint-content">
            <span>💡</span>
            <p>{question.hint || "No hint is available."}</p>
          </div>
        ) : (
          <button
            type="button"
            className="gp-hint-button"
            onClick={onUseHint}
            disabled={disabled || !question.hint}
          >
            💡 Use Hint
            <small>-2 points</small>
          </button>
        )}
      </div>
    </section>
  );
};

export default PictureDisplay;
