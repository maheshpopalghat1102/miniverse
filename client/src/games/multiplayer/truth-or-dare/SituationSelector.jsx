
import React from "react";
import {
  TRUTH_DARE_CATEGORIES,
} from "./truthOrDareLogic";

const SituationSelector = ({
  selectedCategory,
  onSelect,
  ageVerified = false,
  disabled = false,
}) => {
  const handleSelect = (category) => {
    if (disabled) return;

    if (category.adultOnly && !ageVerified) {
      return;
    }

    onSelect?.(category.id);
  };

  return (
    <section className="td-section">
      <div className="td-section-heading">
        <div>
          <h2>Choose Your Situation</h2>
          <p>Select the type of Truth or Dare you want to play.</p>
        </div>
      </div>

      <div className="td-category-grid">
        {TRUTH_DARE_CATEGORIES.map((category) => {
          const locked = category.adultOnly && !ageVerified;
          const selected = selectedCategory === category.id;

          return (
            <button
              key={category.id}
              type="button"
              disabled={disabled || locked}
              onClick={() => handleSelect(category)}
              className={[
                "td-category-card",
                selected ? "td-category-selected" : "",
                locked ? "td-category-locked" : "",
                `td-category-${category.color}`,
              ].join(" ")}
            >
              <span className="td-category-icon">
                {category.icon}
              </span>

              <span className="td-category-content">
                <strong>{category.name}</strong>
                <small>{category.description}</small>
              </span>

              {locked ? (
                <span className="td-lock-icon">🔒</span>
              ) : selected ? (
                <span className="td-selected-icon">✓</span>
              ) : null}
            </button>
          );
        })}
      </div>

      {!ageVerified && (
        <p className="td-age-notice">
          🔞 Adult 18+ content requires age verification.
        </p>
      )}
    </section>
  );
};

export default SituationSelector;
