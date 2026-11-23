
import React, { useState } from "react";

function WordAnswer({
  onSubmit,
  disabled = false,
  submitted = false,
}) {
  const [guess, setGuess] = useState("");

  const handleSubmit = (event) => {
    event.preventDefault();

    if (!guess.trim() || disabled || submitted) return;

    onSubmit?.(guess.trim());
    setGuess("");
  };

  return (
    <form className="gw-answer-form" onSubmit={handleSubmit}>
      <label htmlFor="guess-word-input">
        Enter your guess
      </label>

      <div className="gw-input-row">
        <input
          id="guess-word-input"
          type="text"
          value={guess}
          onChange={(event) => setGuess(event.target.value)}
          placeholder="Type your answer..."
          autoComplete="off"
          maxLength={40}
          disabled={disabled || submitted}
        />

        <button
          type="submit"
          disabled={!guess.trim() || disabled || submitted}
        >
          Submit
        </button>
      </div>
    </form>
  );
}

export default WordAnswer;
