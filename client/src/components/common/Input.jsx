
import React, { useState } from "react";

function Input({
  label,
  name,
  type = "text",
  value,
  onChange,
  placeholder = "",
  error,
  helperText,
  required = false,
  disabled = false,
  leftIcon,
  rightElement,
  className = "",
  inputClassName = "",
  ...props
}) {
  const [showPassword, setShowPassword] = useState(false);

  const isPassword = type === "password";
  const actualType =
    isPassword && showPassword ? "text" : type;

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

      <div className="relative">
        {leftIcon && (
          <span className="absolute inset-y-0 left-3 flex items-center text-slate-400">
            {leftIcon}
          </span>
        )}

        <input
          id={name}
          name={name}
          type={actualType}
          value={value ?? ""}
          onChange={onChange}
          placeholder={placeholder}
          required={required}
          disabled={disabled}
          aria-invalid={Boolean(error)}
          aria-describedby={
            error ? `${name}-error` : helperText ? `${name}-help` : undefined
          }
          className={[
            "w-full rounded-xl border bg-slate-900 px-4 py-3 text-sm text-white",
            "placeholder:text-slate-500 outline-none transition",
            "focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20",
            "disabled:cursor-not-allowed disabled:opacity-50",
            error ? "border-red-500" : "border-slate-700",
            leftIcon ? "pl-10" : "",
            isPassword || rightElement ? "pr-12" : "",
            inputClassName,
          ].join(" ")}
          {...props}
        />

        {isPassword ? (
          <button
            type="button"
            onClick={() => setShowPassword((previous) => !previous)}
            className="absolute inset-y-0 right-3 text-xs text-slate-400 hover:text-white"
            aria-label={showPassword ? "Hide password" : "Show password"}
          >
            {showPassword ? "Hide" : "Show"}
          </button>
        ) : rightElement ? (
          <span className="absolute inset-y-0 right-3 flex items-center">
            {rightElement}
          </span>
        ) : null}
      </div>

      {error && (
        <p id={`${name}-error`} className="mt-1.5 text-xs text-red-400">
          {error}
        </p>
      )}

      {!error && helperText && (
        <p id={`${name}-help`} className="mt-1.5 text-xs text-slate-400">
          {helperText}
        </p>
      )}
    </div>
  );
}

export default Input;
