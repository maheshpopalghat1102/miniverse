
import React from "react";

const IdentityCard = ({
  category = "Mystery",
  difficulty = "medium",
  round = 1,
  isRevealed = false,
  identityName = "",
  isCurrentPlayer = false,
}) => {
  return (
    <section className="wai-identity-card">
      <div className="wai-card-top">
        <div className="wai-identity-icon">
          {isRevealed ? "🎉" : "❓"}
        </div>

        <div className="wai-card-meta">
          <span className="wai-card-label">
            {isRevealed ? "IDENTITY REVEALED" : "MYSTERY IDENTITY"}
          </span>

          <h2>
            {isRevealed
              ? identityName
              : isCurrentPlayer
                ? "Who Am I?"
                : "Guess the Identity"}
          </h2>
        </div>
      </div>

      <div className="wai-card-footer">
        <span>📂 {category}</span>

        <span className={`wai-difficulty wai-${difficulty}`}>
          {difficulty}
        </span>

        <span>Round {round}</span>
      </div>
    </section>
  );
};

export default IdentityCard;
