
import React, { useState } from "react";

function Checkbox({
  label,
  name,
  checked,
  defaultChecked = false,
  onChange,
  disabled = false,
  error,
  className = "",
}) {
  const [internalChecked, setInternalChecked] = useState(defaultChecked);

  const isControlled = checked !== undefined;
  const currentChecked = isControlled ? checked : internalChecked;

  function handleChange(event) {
    const nextValue = event.target.checked;

    if (!isControlled) {
      setInternalChecked(nextValue);
    }

    onChange?.(nextValue, event);
  }

  return (
    <div className={className}>
      <label
        className={[
          "flex items-start gap-3",
          disabled ? "cursor-not-allowed opacity-50" : "cursor-pointer",
        ].join(" ")}
      >
        <input
          type="checkbox"
          name={name}
          checked={currentChecked}
          onChange={handleChange}
          disabled={disabled}
          className="mt-0.5 h-4 w-4 rounded border-slate-600 bg-slate-900 text-violet-600 accent-violet-600 focus:ring-2 focus:ring-violet-500"
        />

        {label && (
          <span className="text-sm text-slate-300">
            {label}
          </span>
        )}
      </label>

      {error && (
        <p className="mt-1.5 text-xs text-red-400">
          {error}
        </p>
      )}
    </div>
  );
}

export default Checkbox;
