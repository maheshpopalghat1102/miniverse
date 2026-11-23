
import React from "react";

export default function Slider({
  label,
  value = 50,
  min = 0,
  max = 100,
  step = 1,
  onChange,
  showValue = true,
  disabled = false,
  suffix = "",
  className = "",
}) {
  const numericValue = Number(value);
  const safeValue = Math.min(max, Math.max(min, numericValue));

  const percentage =
    max === min ? 0 : ((safeValue - min) / (max - min)) * 100;

  return (
    <div className={className}>
      {(label || showValue) && (
        <div className="mb-3 flex items-center justify-between gap-3">
          {label && (
            <label className="text-sm font-medium text-gray-200">
              {label}
            </label>
          )}

          {showValue && (
            <span className="text-sm font-semibold text-violet-300">
              {safeValue}
              {suffix}
            </span>
          )}
        </div>
      )}

      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={safeValue}
        disabled={disabled}
        onChange={(event) => onChange?.(Number(event.target.value))}
        style={{
          background: `linear-gradient(to right, #8b5cf6 ${percentage}%, #374151 ${percentage}%)`,
        }}
        className="h-2 w-full cursor-pointer appearance-none rounded-full disabled:cursor-not-allowed disabled:opacity-40 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:shadow"
      />

      <div className="mt-2 flex justify-between text-xs text-gray-500">
        <span>{min}{suffix}</span>
        <span>{max}{suffix}</span>
      </div>
    </div>
  );
}
