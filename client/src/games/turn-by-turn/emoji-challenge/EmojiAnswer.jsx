
import React, { useState } from "react";

function EmojiAnswer({
  onSubmit,
  disabled = false,
}) {
  const [answer, setAnswer] = useState("");

  const handleSubmit = (event) => {
    event.preventDefault();

    if (!answer.trim() || disabled) return;

    onSubmit?.(answer.trim());
    setAnswer("");
  };

  return (
    <form className="ec-answer-form" onSubmit={handleSubmit}>
      <label htmlFor="emoji-challenge-answer">
        Your answer
      </label>

      <div className="ec-answer-row">
        <input
          id="emoji-challenge-answer"
          type="text"
          value={answer}
          onChange={(event) => setAnswer(event.target.value)}
          placeholder="Guess the word or phrase..."
          maxLength={60}
          autoComplete="off"
          disabled={disabled}
        />

        <button
          type="submit"
          disabled={!answer.trim() || disabled}
        >
          Submit
        </button>
      </div>
    </form>
  );
}

export default EmojiAnswer;
