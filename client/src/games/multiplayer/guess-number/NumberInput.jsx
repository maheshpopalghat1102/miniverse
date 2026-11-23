
import React, { useState } from "react";

function NumberInput({
  min = 1,
  max = 100,
  onSubmit,
  disabled = false,
}) {
  const [value, setValue] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = (event) => {
    event.preventDefault();

    const number = Number(value);

    if (value.trim() === "" || !Number.isInteger(number)) {
      setError("Please enter a whole number.");
      return;
    }

    if (number < min || number > max) {
      setError(`Enter a number between ${min} and ${max}.`);
      return;
    }

    onSubmit(number);
    setValue("");
    setError("");
  };

  return (
    <form className="gn-input-form" onSubmit={handleSubmit}>
      <label htmlFor="guess-number-input">
        Enter your guess
      </label>

      <div className="gn-input-row">
        <input
          id="guess-number-input"
          type="number"
          min={min}
          max={max}
          step="1"
          value={value}
          onChange={(event) => {
            setValue(event.target.value);
            setError("");
          }}
          placeholder={`${min} - ${max}`}
          disabled={disabled}
        />

        <button type="submit" disabled={disabled || !value.trim()}>
          Guess
        </button>
      </div>

      {error && (
        <p className="gn-input-error" role="alert">
          {error}
        </p>
      )}

      <small>Choose a number between {min} and {max}.</small>
    </form>
  );
}

export default NumberInput;
