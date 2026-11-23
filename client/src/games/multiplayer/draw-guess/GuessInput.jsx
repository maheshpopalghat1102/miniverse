
import React, { useState } from "react";

const GuessInput = ({
  onSubmit,
  disabled = false,
  guesses = [],
  currentPlayerId,
  correctGuessers = [],
}) => {
  const [guess, setGuess] = useState("");

  const alreadyGuessed = correctGuessers.includes(
    String(currentPlayerId)
  );

  const handleSubmit = (event) => {
    event.preventDefault();

    const value = guess.trim();

    if (!value || disabled || alreadyGuessed) return;

    onSubmit?.(value);
    setGuess("");
  };

  return (
    <section className="dg-guess-section">
      <div className="dg-guess-heading">
        <h3>💭 Guess the word</h3>
        <p>What do you think the drawer is drawing?</p>
      </div>

      {alreadyGuessed ? (
        <div className="dg-correct-guess-message">
          🎉 You guessed correctly! Wait for the next round.
        </div>
      ) : (
        <form className="dg-guess-form" onSubmit={handleSubmit}>
          <input
            type="text"
            value={guess}
            onChange={(event) => setGuess(event.target.value)}
            placeholder="Type your guess..."
            maxLength={30}
            disabled={disabled}
            autoComplete="off"
          />

          <button
            type="submit"
            disabled={disabled || !guess.trim()}
          >
            Guess
          </button>
        </form>
      )}

      {guesses.length > 0 && (
        <div className="dg-guess-history">
          <h4>Recent guesses</h4>

          <div className="dg-guess-list">
            {guesses.slice(-8).reverse().map((item, index) => (
              <div
                key={`${item.playerId}-${index}`}
                className={[
                  "dg-guess-item",
                  item.isCorrect ? "dg-guess-correct" : "",
                ].join(" ")}
              >
                <span>{item.playerName || "Player"}</span>
                <strong>{item.guess}</strong>
                <span>{item.isCorrect ? "✓" : "…"}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </section>
  );
};

export default GuessInput;
