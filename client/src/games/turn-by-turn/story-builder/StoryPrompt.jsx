
import React from "react";

function StoryPrompt({ prompt }) {
  if (!prompt) return null;

  return (
    <section className="sb-prompt-card">
      <div className="sb-prompt-icon">📖</div>

      <div className="sb-prompt-category">
        {prompt.category || "Creative Writing"}
      </div>

      <h2>{prompt.title}</h2>

      <p>{prompt.description}</p>

      {prompt.opening && (
        <div className="sb-opening">
          <span>Story begins...</span>
          <p>{prompt.opening}</p>
        </div>
      )}
    </section>
  );
}

export default StoryPrompt;
