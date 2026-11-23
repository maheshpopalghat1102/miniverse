
import React from "react";

function Select({
  label,
  name,
  value,
  onChange,
  options = [],
  placeholder = "Select an option",
  error,
  required = false,
  disabled = false,
  className = "",
}) {
  return (
    <div className={`w-full ${className}`}>
      {label && (
        <label
          htmlFor={name}
          className="mb-2 block text-sm font-medium text-slate-200"
        >
          {label}
          {required && <span className="ml-1 text-red-400">*</span>}
        </label>
      )}

      <select
        id={name}
        name={name}
        value={value ?? ""}
        onChange={onChange}
        required={required}
        disabled={disabled}
        aria-invalid={Boolean(error)}
        className={[
          "w-full rounded-xl border bg-slate-900 px-4 py-3 text-sm text-white",
          "outline-none transition focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20",
          "disabled:cursor-not-allowed disabled:opacity-50",
          error ? "border-red-500" : "border-slate-700",
        ].join(" ")}
      >
        <option value="" disabled>
          {placeholder}
        </option>

        {options.map((option) => {
          const item =
            typeof option === "string"
              ? { label: option, value: option }
              : option;

          return (
            <option
              key={item.value}
              value={item.value}
              disabled={item.disabled}
            >
              {item.label}
            </option>
          );
        })}
      </select>

      {error && (
        <p className="mt-1.5 text-xs text-red-400">
          {error}
        </p>
      )}
    </div>
  );
}

export default Select;
