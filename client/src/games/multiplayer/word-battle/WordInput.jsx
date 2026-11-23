
import React, { useState } from "react";

function WordInput({
  onSubmit,
  requiredLetter = "",
  disabled = false,
}) {
  const [word, setWord] = useState("");

  const handleSubmit = (event) => {
    event.preventDefault();

    const value = word.trim();

    if (!value) return;

    onSubmit(value);
    setWord("");
  };

  return (
    <form className="wb-input-form" onSubmit={handleSubmit}>
      <label htmlFor="wb-word-input">
        Enter your word
      </label>

      {requiredLetter && (
        <div className="wb-required-letter">
          Your word must start with{" "}
          <strong>{requiredLetter.toUpperCase()}</strong>
        </div>
      )}

      <div className="wb-input-row">
        <input
          id="wb-word-input"
          type="text"
          value={word}
          onChange={(event) => setWord(event.target.value)}
          placeholder="Type a word..."
          maxLength={20}
          autoComplete="off"
          disabled={disabled}
        />

        <button
          type="submit"
          disabled={disabled || !word.trim()}
        >
          Submit
        </button>
      </div>

      <small>Use 2–20 English letters. No spaces or numbers.</small>
    </form>
  );
}

export default WordInput;
