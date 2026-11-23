
import React, { useState } from "react";

function StoryEditor({
  onSubmit,
  disabled = false,
  maxLength = 220,
}) {
  const [sentence, setSentence] = useState("");

  const handleSubmit = (event) => {
    event.preventDefault();

    if (!sentence.trim() || disabled) return;

    onSubmit?.(sentence.trim());
    setSentence("");
  };

  return (
    <form className="sb-editor" onSubmit={handleSubmit}>
      <label htmlFor="story-sentence">
        Add your next sentence
      </label>

      <textarea
        id="story-sentence"
        value={sentence}
        onChange={(event) => setSentence(event.target.value)}
        placeholder="Continue the story..."
        rows={4}
        maxLength={maxLength}
        disabled={disabled}
      />

      <div className="sb-editor-footer">
        <span>
          {sentence.length}/{maxLength} characters
        </span>

        <button
          type="submit"
          disabled={!sentence.trim() || disabled}
        >
          Add to Story →
        </button>
      </div>

      <p className="sb-editor-tip">
        Write one sentence and end it with a period, question
        mark, or exclamation mark.
      </p>
    </form>
  );
}

export default StoryEditor;
